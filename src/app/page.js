'use client';

import { useState } from 'react';
import PhotoCapture from '../components/PhotoCapture';
import IngredientsList from '../components/IngredientsList';
import RecipeList from '../components/RecipeList';
import ActionButton from '../components/ActionButton';
import RecipePreferencesModal from '../components/RecipePreferencesModal';

export default function Home() {
  const [ingredients, setIngredients] = useState([
    'Apples', 'Chicken', 'Broccoli', 'Tomatoes', 'Carrots', 
    'Flour', 'Ketchup', 'Lettuce', 'White Bread', 'Steak', 
    'Butter', '2% Milk'
  ]);

  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: 'Chicken Stir Fry',
      description: 'A quick and healthy stir fry with chicken and vegetables.',
      imagePlaceholder: true
    },
    {
      id: 2,
      title: 'Apple Pie',
      description: 'Classic apple pie with a buttery crust and cinnamon filling.',
      imagePlaceholder: true
    },
    // ... other recipes
  ]);

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const onGenerateClick = () => {
    setShowPreferencesModal(true);
  };

  const onPhotoCapture = (photoData) => {
    console.log('Photo captured:', photoData);
    // Later: analyze photo and update ingredients
  };

  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Recipe Analyzer</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Capture your ingredients or upload a photo to discover recipes you can make.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <PhotoCapture onCapture={onPhotoCapture} />
          <IngredientsList ingredients={ingredients} onGenerateClick={onGenerateClick} />
        </div>

        <div>
          <RecipeList recipes={recipes} />
        </div>
      </div>

      <ActionButton />

      {showPreferencesModal && (
        <RecipePreferencesModal 
          recipe={{ title: "Custom Recipe Preferences" }}
          onClose={() => setShowPreferencesModal(false)}
        />
      )}
    </div>
  );
}
