// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/recipeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  userName: { type: String, required: true },
  photoId: Number,
  recommandedRecipeList: [Number],
});
const User = mongoose.model('User', userSchema);

// Recipe model
const recipeSchema = new mongoose.Schema({
  recipeId: { type: Number, required: true, unique: true },
  recipeName: { type: String, required: true },
  ingredientsList: [Number],
  instruction: String,
  time: Number,
  level: { type: String, enum: ['easy', 'mid', 'hard'] },
});
const Recipe = mongoose.model('Recipe', recipeSchema);

// API routes

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Recipe API');
});

// User endpoints
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

// Recipe endpoints
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

// Recommanded recipes by user
app.get('/api/users/:userId/recommanded-recipes', async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId });
  if (!user) return res.status(404).send({ error: 'User not found' });
  const recipes = await Recipe.find({ recipeId: { $in: user.recommandedRecipeList } });
  res.send(recipes);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});