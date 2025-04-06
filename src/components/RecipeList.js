'use client';

import { useState } from 'react';

export default function RecipeList({ recipes = [] }) {
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const handleRecipeClick = (recipe) => {
    if (expandedRecipe && expandedRecipe.id === recipe.id) {
      setExpandedRecipe(null); // collapse if already expanded
    } else {
      setExpandedRecipe(recipe); // expand clicked recipe
    }
  };

  // Function to map ingredient index to name for display
  const getIngredientName = (index) => {
    const ingredientMap = [
      'Apples', 'Chicken', 'Broccoli', 'Tomatoes', 'Carrots', 
      'Flour', 'Ketchup', 'Lettuce', 'White Bread', 'Steak', 
      'Butter', '2% Milk'
    ];
    return ingredientMap[index] || 'Unknown';
  };

  return (
    <div className="card p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Recommended Recipes</h2>
        <span className="bg-primary-light text-white text-sm py-1 px-2 rounded-full">
          {recipes.length} recipes
        </span>
      </div>

      <p className="text-muted mb-4">
        Recipes you can make with your ingredients. Click for details.
      </p>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="transition-all duration-300">
            {/* Recipe Card - Minimal Card Design */}
            <div
              onClick={() => handleRecipeClick(recipe)}
              className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200"
            >
              {/* Image Placeholder */}
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-light">{recipe.title}</span>
              </div>
              
              {/* Card Content */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-primary group-hover:text-primary-dark">
                  {recipe.title}
                </h3>
                <p className="text-muted text-sm mt-1 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{recipe.time} min</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">{recipe.level}</span>
                </div>
              </div>
            </div>
            
            {/* Expanded Recipe Details */}
            {expandedRecipe && expandedRecipe.id === recipe.id && (
              <div className="mt-2 p-6 bg-white rounded-lg border border-gray-200 shadow-sm animate-fadeIn relative">
                {/* Modern X Close Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedRecipe(null);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  aria-label="Close details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-primary text-lg">Recipe Details</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2 text-sm">
                        <span className="font-medium text-gray-700">Time:</span>
                        <span>{recipe.time} minutes</span>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <span className="font-medium text-gray-700">Difficulty:</span>
                        <span className="capitalize">{recipe.level}</span>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <span className="font-medium text-gray-700">Allergies:</span>
                        <span>{recipe.allergies.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-primary text-lg">Ingredients Needed</h4>
                    <ul className="text-sm space-y-1">
                      {recipe.ingredientsList.map((ingredientId) => (
                        <li key={ingredientId} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                          {getIngredientName(ingredientId)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3 text-primary text-lg">Instructions</h4>
                  <p className="text-sm leading-relaxed">{recipe.instruction}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {recipes.length === 0 && (
        <p className="text-muted text-center py-8">
          No recipes found. Try adding more ingredients!
        </p>
      )}
    </div>
  );
}