'use client';

import { useRef, useState } from 'react';
import PhotoCapture from '../components/PhotoCapture';
import IngredientsList from '../components/IngredientsList';
import RecipeList from '../components/RecipeList';
import ActionButton from '../components/ActionButton';

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
    {
      id: 3,
      title: 'Steak Sandwich',
      description: 'Juicy steak on toasted bread with fresh lettuce and tomato.',
      imagePlaceholder: true
    },
    {
      id: 4,
      title: 'Garden Salad',
      description: 'Fresh vegetables tossed together for a healthy side dish.',
      imagePlaceholder: true
    },
    {
      id: 5,
      title: 'Pasta Primavera',
      description: 'Light pasta dish with seasonal vegetables in a creamy sauce.',
      imagePlaceholder: true
    }
  ]);

  const onPhotoCapture = (photoData) => {
    console.log('Photo captured:', photoData);
    // In the future, this would call your API to analyze the photo
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Recipe Analyzer</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Capture your ingredients or upload a photo to discover recipes you can make.
        </p>
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-8">
          <PhotoCapture onCapture={onPhotoCapture} />
          <IngredientsList ingredients={ingredients} />
        </div>
        
        {/* Right column */}
        <div>
          <RecipeList recipes={recipes} />
        </div>
      </div>
      
      {/* Floating action button */}
      <ActionButton />
    </div>
  );
}