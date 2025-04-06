'use client';
import { useState } from 'react';

export default function IngredientsList({ ingredients = [], onGenerateClick }) {
  const [localIngredients, setLocalIngredients] = useState(ingredients);

  const handleRemoveIngredient = (index) => {
    setLocalIngredients(localIngredients.filter((_, i) => i !== index));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Your Ingredients</h2>
        <span className="bg-primary-light text-white text-sm py-1 px-2 rounded-full">
          {localIngredients.length} items
        </span>
      </div>

      <p className="text-muted mb-4">
        These ingredients were detected from your photo or loaded from your profile.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {localIngredients.map((ingredient, index) => (
          <div 
            key={`${ingredient}-${index}`}
            className="group flex items-center gap-2 bg-card-hover p-2 rounded-md transition-all hover:bg-primary hover:bg-opacity-10"
          >
            <span className="flex-1 truncate">{ingredient}</span>
            <button 
              onClick={() => handleRemoveIngredient(index)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
              aria-label={`Remove ${ingredient}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {localIngredients.length === 0 && (
        <p className="text-muted text-center py-4">
          No ingredients added yet. Add some or take a photo!
        </p>
      )}

      {localIngredients.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            className="btn btn-primary"
            onClick={onGenerateClick}
          >
            Apply Preferences
          </button>
        </div>
      )}
    </div>
  );
}
