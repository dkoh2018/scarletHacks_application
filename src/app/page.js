"use client";

import { useEffect, useState } from "react";
import PhotoCapture from "../components/PhotoCapture";
import IngredientsList from "../components/IngredientsList";
import RecipeList from "../components/RecipeList";

export default function Home() {
  const [userId, setUserId] = useState(1);
  const [ingredientMap, setIngredientMap] = useState({});
  const [userIngredients, setUserIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [allergies, setAllergies] = useState([]);
  const [time, setTime] = useState("<= 10 min");
  const [level, setLevel] = useState("easy");

  const allergyOptions = ["peanuts", "dairy", "gluten", "shellfish", "soy", "eggs"];
  const timeOptions = ["<= 10 min", "10-20 min", "20-30 min", "<= 30 min"];
  const levelOptions = ["easy", "mid", "hard"];

  useEffect(() => {
    fetch("http://localhost:4000/api/ingredientsMap")
      .then((res) => res.json())
      .then((map) => setIngredientMap(map));
  }, []);

  useEffect(() => {
    if (Object.keys(ingredientMap).length > 0) {
      fetchUserIngredients();
    }
  }, [ingredientMap]);

  const fetchUserIngredients = async () => {
    if (!ingredientMap || Object.keys(ingredientMap).length === 0) return;
    const res = await fetch(`http://localhost:4000/api/users/${userId}`);
    const data = await res.json();
    const names = data.ingredients.map((id) => ingredientMap[id]).filter(Boolean);
    setUserIngredients(names);
  };

  const handleUploadComplete = () => {
    fetchUserIngredients();
    setHasAnalyzed(true);
  };

  const handleGenerateRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/recommend/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, level, allergies }),
      });

      const data = await res.json();

      if (data.recipe) {
        setRecipes([
          {
            id: data.recipe.recipeId,
            title: data.recipe.recipeName,
            description: `A ${data.recipe.level} recipe using your ingredients.`,
            imagePlaceholder: true,
            ingredientsList: data.recipe.ingredientsList,
            instruction: data.recipe.instruction,
            time: data.recipe.time,
            level: data.recipe.level,
            allergies: data.recipe.allergies,
          },
        ]);
        setShowRecipes(true);
      }
    } catch (err) {
      console.error("Recipe API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 p-6 sm:p-10 max-w-6xl mx-auto text-white">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">🍽️ Recipe Analyzer</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Upload or capture an image to analyze your ingredients. Filter your preferences to generate personalized recipes.
        </p>
      </header>

      <div className="flex justify-center gap-4 mb-6">
        <label className="text-white">User:
          <select
            className="ml-2 px-3 py-2 rounded border border-gray-400 bg-gray-900 text-white"
            value={userId}
            onChange={(e) => {
              setUserId(Number(e.target.value));
              setUserIngredients([]);
              setRecipes([]);
              setShowRecipes(false);
              setHasAnalyzed(false);
            }}
          >
            <option value={1}>Alice (1)</option>
            <option value={2}>Bob (2)</option>
            <option value={3}>Clara (3)</option>
          </select>
        </label>
      </div>

      <div className="mb-8">
        <PhotoCapture onUploadComplete={handleUploadComplete} />
      </div>

      {hasAnalyzed && userIngredients.length > 0 && (
        <div className="mb-8 space-y-6">
          <IngredientsList ingredients={userIngredients} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span>Allergies</span>
              <select
                multiple
                value={allergies}
                onChange={(e) =>
                  setAllergies(Array.from(e.target.selectedOptions, (opt) => opt.value))
                }
                className="border rounded p-2 bg-gray-900 border-gray-600 text-white"
              >
                {allergyOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span>Preferred Cooking Time</span>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border rounded p-2 bg-gray-900 border-gray-600 text-white"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span>Difficulty Level</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="border rounded p-2 bg-gray-900 border-gray-600 text-white"
              >
                {levelOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerateRecipes}
              className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded text-white font-semibold shadow-md"
            >
              {loading ? "Generating..." : "🍳 Generate Recipes"}
            </button>
          </div>
        </div>
      )}

      {showRecipes && (
        <div className="slide-in-right flex flex-col">
          <RecipeList recipes={recipes} />
        </div>
      )}
    </div>
  );
}
