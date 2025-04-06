const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
require("dotenv").config();
const stringSimilarity = require("string-similarity");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/recipeDB");

// --- MongoDB Schemas ---
const ingredientSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
});
const Ingredient = mongoose.model("Ingredient", ingredientSchema);

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  userName: { type: String, required: true },
  ingredients: [Number],
  recommandedRecipeList: [Number],
});
const User = mongoose.model("User", userSchema);

const recipeSchema = new mongoose.Schema({
  recipeId: { type: Number, required: true, unique: true },
  recipeName: { type: String, required: true },
  ingredientsList: [Number],
  instruction: String,
  time: Number,
  level: { type: String, enum: ["easy", "mid", "hard"] },
});
const Recipe = mongoose.model("Recipe", recipeSchema);

// --- Gemini Setup ---
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "You are a detail-oriented ingredient recognition assistant. Given a photo of a pantry or refrigerator, your goal is to return a highly accurate, deduplicated list of raw food ingredients suitable for cooking or recipes. Your output must be precise, structured, and formatted for code/database use.\n\nOutput format:\n{\n  \"ingredients\": [\n    {\"name\": \"banana\"},\n    {\"name\": \"carrot\"},\n    {\"name\": \"egg\"}\n  ]\n}",
});
const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        },
      },
    },
    required: ["ingredients"],
  },
};

// --- Image Helpers ---
async function splitImageIntoQuadrants(imagePath, outputDir) {
  await fs.promises.mkdir(outputDir, { recursive: true });
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const halfWidth = Math.ceil(metadata.width / 2);
  const halfHeight = Math.ceil(metadata.height / 2);

  const quadrants = [
    { name: "top_left.png", left: 0, top: 0 },
    { name: "top_right.png", left: halfWidth, top: 0 },
    { name: "bottom_left.png", left: 0, top: halfHeight },
    { name: "bottom_right.png", left: halfWidth, top: halfHeight },
  ];

  const paths = [];
  for (const q of quadrants) {
    const outputPath = path.join(outputDir, q.name);
    await image
      .clone()
      .extract({ left: q.left, top: q.top, width: halfWidth, height: halfHeight })
      .toFile(outputPath);
    paths.push(outputPath);
  }
  return paths;
}

async function analyzeQuadrant(filePath) {
  const upload = await fileManager.uploadFile(filePath, {
    mimeType: "image/png",
    displayName: path.basename(filePath),
  });

  const result = await model.generateContent(
    [
      { text: "Analyze this image quadrant for ingredients." },
      { fileData: { fileUri: upload.file.uri, mimeType: "image/png" } },
    ],
    generationConfig
  );

  const raw = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```|({[\s\S]*})/);
  if (!match) return [];

  try {
    const parsed = JSON.parse(match[1] || match[2]);
    return Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
  } catch (e) {
    console.warn("JSON parse error:", e.message);
    return [];
  }
}

// --- Fuzzy Ingredient Matching ---
async function findSimilarIngredientName(name) {
  const allIngredients = await Ingredient.find();
  const names = allIngredients.map(i => i.name);
  const match = stringSimilarity.findBestMatch(name, names);
  if (match.bestMatch.rating > 0.85) {
    return await Ingredient.findOne({ name: match.bestMatch.target });
  }
  return null;
}

// --- Gemini Analyze Route ---
app.post("/api/analyze/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const INPUT_IMAGE_PATH = "image.png";
  const TEMP_DIR = "./temp_quadrants";

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).send({ error: "User not found" });

    const quadrants = await splitImageIntoQuadrants(INPUT_IMAGE_PATH, TEMP_DIR);
    const ingredientSet = new Set();

    for (const q of quadrants) {
      const ingredients = await analyzeQuadrant(q);
      ingredients.forEach((ing) => {
        const cleaned = ing.name?.toLowerCase().trim();
        if (cleaned && cleaned.length >= 2) ingredientSet.add(cleaned);
      });
    }

    const finalIngredientList = Array.from(ingredientSet).map((name) => ({ name }));
    const resultIds = [];

    for (const ing of finalIngredientList) {
      let existing = await Ingredient.findOne({ name: ing.name });

      if (!existing) {
        existing = await findSimilarIngredientName(ing.name);
      }

      if (!existing) {
        const last = await Ingredient.findOne().sort({ id: -1 });
        const nextId = last ? last.id + 1 : 1;
        try {
          existing = await new Ingredient({ id: nextId, name: ing.name }).save();
        } catch (e) {
          if (e.code === 11000) {
            existing = await Ingredient.findOne({ name: ing.name });
          } else {
            throw e;
          }
        }
      }

      resultIds.push(Number(existing.id));
    }

    const existingIds = new Set(user.ingredients || []);
    resultIds.forEach((id) => existingIds.add(id));
    user.ingredients = Array.from(existingIds);
    await user.save();

    res.send({
      message: "✅ Gemini ingredients analyzed and user updated.",
      ingredients: finalIngredientList,
      userIngredientIds: user.ingredients,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal error", details: err.message });
  }
});

// --- Other Routes ---
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId });
  user ? res.send(user) : res.status(404).send({ error: "User not found" });
});

app.post("/api/recipes", async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).send(recipe);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get("/api/recipes/:recipeId", async (req, res) => {
  const recipe = await Recipe.findOne({ recipeId: req.params.recipeId });
  recipe ? res.send(recipe) : res.status(404).send({ error: "Recipe not found" });
});

app.post("/api/ingredients", async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).send(ingredient);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get("/api/ingredients", async (req, res) => {
  const ingredients = await Ingredient.find();
  res.send(ingredients);
});

app.post("/api/seed", async (req, res) => {
  try {
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    await User.deleteMany({});

    await Ingredient.insertMany([
      { id: 1, name: "tomato" },
      { id: 2, name: "cheese" },
      { id: 3, name: "pasta" },
    ]);

    await Recipe.insertMany([
      {
        recipeId: 101,
        recipeName: "Tomato Pasta",
        ingredientsList: [1, 3],
        instruction: "Boil pasta. Add tomato sauce.",
        time: 20,
        level: "easy",
      },
      {
        recipeId: 102,
        recipeName: "Cheese Tomato Pasta",
        ingredientsList: [1, 2, 3],
        instruction: "Cook pasta. Add tomato and cheese.",
        time: 25,
        level: "mid",
      },
    ]);

    await User.create({
      userId: 1,
      userName: "Alice",
      ingredients: [1, 2],
      recommandedRecipeList: [101],
    });

    res.send({ message: "Seed data inserted" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// --- 404 Catch-all ---
app.use((req, res) => {
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});