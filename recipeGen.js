const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const fs = require("node:fs");
  const mime = require("mime-types");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-03-25",
    systemInstruction: `
  You are an expert recipe recommender.
  
  Your job is to recommend 8 creative and practical recipes that:
  - Use as many of the user’s available ingredients as possible (minimize waste).
  - Stay within the specified cooking time.
  - Match the user’s cooking skill level (easy, mid, or hard).
  - Absolutely avoid all ingredients the user is allergic to.
  
  Each recipe must:
  - Be unique.
  - Fit the time limit.
  - Match the specified difficulty.
  - Only use the user's provided ingredients.
  - Never include allergens.
    `,
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        recipeId: { type: "integer" },
        recipeName: { type: "string" },
        ingredientsList: {
          type: "array",
          items: { type: "integer" }
        },
        instruction: { type: "string" },
        time: { type: "integer" },
        level: {
          type: "string",
          enum: ["easy", "mid", "hard"]
        },
        allergies: {
          type: "array",
          items: {
            type: "string",
            enum: ["Peanuts", "Dairy", "Gluten", "Shellfish", "Soy", "Eggs"]
          }
        }
      },
      required: [
        "recipeId",
        "recipeName",
        "ingredientsList",
        "instruction",
        "time",
        "level",
        "allergies"
      ]
    }
  };
  
  // Example dynamic user input
  const ingredientsList = ["peanuts", "milk", "bread", "tomato"];
  const time = "under 15 min";
  const level = "mid";
  const allergies = ["peanut"];
  
  // Create prompt string
  function buildPrompt({ ingredientsList, time, level, allergies }) {
    return `This user currently has the following ingredients: ${ingredientsList.join(", ")}.
  They have ${time} to cook and are looking for a ${level} difficulty meal.
  They are allergic to: ${allergies.join(", ")}.
  
  Please generate 8 diverse, allergy-safe recipe options that:
  - Use as many of the provided ingredients as possible.
  - Fit the specified time and difficulty.
  - Avoid any use of allergens listed above.
  Return only valid recipes in the structured JSON format.`;
  }
  
  async function run() {
    const chatSession = model.startChat({ generationConfig });
  
    const userPrompt = buildPrompt({ ingredientsList, time, level, allergies });
    const result = await chatSession.sendMessage(userPrompt);
  
    const candidates = result.response.candidates;
  
    for (let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      for (let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
        const part = candidates[candidate_index].content.parts[part_index];
        if (part.inlineData) {
          try {
            const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  
    console.log(result.response.text());
  }
  
  run();
  