'use client';

import { useState } from 'react';
import {
  MinimalCard,
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
  MinimalCardContent
} from "@/components/ui/minimal-card";

export default function RecipeList({ recipes = [] }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe.id === selectedRecipe ? null : recipe.id);
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Suggested Recipes</h2>
        <span className="text-accent font-medium">{recipes.length} found</span>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No recipes available based on your ingredients.</p>
          <p className="text-sm mt-2">Try adding more ingredients or taking a photo!</p>
        </div>
      ) : (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <MinimalCard 
              key={recipe.id}
              className={selectedRecipe === recipe.id ? 'ring-2 ring-primary' : ''}
              onClick={() => handleRecipeClick(recipe)}
            >
              <MinimalCardImage 
                src={recipe.imagePlaceholder ? null : recipe.image} 
                alt={recipe.title} 
              />
              <MinimalCardTitle>{recipe.title}</MinimalCardTitle>
              <MinimalCardDescription>{recipe.description}</MinimalCardDescription>
              
              {/* Expanded view */}
              {selectedRecipe === recipe.id && (
                <MinimalCardContent>
                  <div className="mt-2 pt-4 border-t border-border fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted mb-2">
                          Prep Time
                        </h4>
                        <p>15 mins</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted mb-2">
                          Cook Time
                        </h4>
                        <p>25 mins</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted mb-2">
                          Servings
                        </h4>
                        <p>4</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted mb-2">
                          Difficulty
                        </h4>
                        <p>Medium</p>
                      </div>
                    </div>
                    
                    <button className="btn btn-primary w-full mt-4">
                      View Full Recipe
                    </button>
                  </div>
                </MinimalCardContent>
              )}
            </MinimalCard>
          ))}
        </div>
      )}
    </div>
  );
}