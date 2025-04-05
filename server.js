// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipeDB');

// ✅ Define Schemas & Models
const ingredientSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
});
const Ingredient = mongoose.model('Ingredient', ingredientSchema);

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  userName: { type: String, required: true },
  ingredients: [Number],
  recommandedRecipeList: [Number],
});
const User = mongoose.model('User', userSchema);

const recipeSchema = new mongoose.Schema({
  recipeId: { type: Number, required: true, unique: true },
  recipeName: { type: String, required: true },
  ingredientsList: [Number],
  instruction: String,
  time: Number,
  level: { type: String, enum: ['easy', 'mid', 'hard'] },
});
const Recipe = mongoose.model('Recipe', recipeSchema);

// ✅ Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Recipe API');
});

app.get('/api/ping', (req, res) => {
  res.send('pong from EXPRESS server!');
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId });
  user ? res.send(user) : res.status(404).send({ error: 'User not found' });
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).send(recipe);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/recipes/:recipeId', async (req, res) => {
  const recipe = await Recipe.findOne({ recipeId: req.params.recipeId });
  recipe ? res.send(recipe) : res.status(404).send({ error: 'Recipe not found' });
});

app.post('/api/ingredients', async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).send(ingredient);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/ingredients', async (req, res) => {
  const ingredients = await Ingredient.find();
  res.send(ingredients);
});

// ✅ Seed Route
app.post('/api/seed', async (req, res) => {
  try {
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    await User.deleteMany({});

    await Ingredient.insertMany([
      { id: 1, name: 'Tomato' },
      { id: 2, name: 'Cheese' },
      { id: 3, name: 'Pasta' },
    ]);

    await Recipe.insertMany([
      {
        recipeId: 101,
        recipeName: 'Tomato Pasta',
        ingredientsList: [1, 3],
        instruction: 'Boil pasta. Add tomato sauce.',
        time: 20,
        level: 'easy',
      },
      {
        recipeId: 102,
        recipeName: 'Cheese Tomato Pasta',
        ingredientsList: [1, 2, 3],
        instruction: 'Cook pasta. Add tomato and cheese.',
        time: 25,
        level: 'mid',
      },
    ]);

    await User.create({
      userId: 1,
      userName: 'Alice',
      ingredients: [1, 2],
      recommandedRecipeList: [101],
    });

    res.send({ message: 'Seed data inserted' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
