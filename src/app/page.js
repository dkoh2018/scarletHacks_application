'use client';

import { useRef, useState } from 'react';
import PhotoCapture from '../components/PhotoCapture';
import IngredientsList from '../components/IngredientsList';
import RecipeList from '../components/RecipeList';

export default function Home() {
  const [ingredients, setIngredients] = useState([
    'Apples', 'Chicken', 'Broccoli', 'Tomatoes', 'Carrots', 
    'Flour', 'Ketchup', 'Lettuce', 'White Bread', 'Steak', 
    'Butter', '2% Milk'
  ]);
  
  const [showRecipes, setShowRecipes] = useState(false);
  
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: 'Chicken Stir Fry',
      description: 'A quick and healthy stir fry with chicken and vegetables.',
      imagePlaceholder: true,
      ingredientsList: [1, 2, 4, 5],
      instruction: 'Heat oil in a pan. Add chicken and cook until browned. Add vegetables and stir-fry until tender. Season with soy sauce and serve hot.',
      time: 25,
      level: 'easy',
      allergies: ['None']
    },
    {
      id: 2,
      title: 'Apple Pie',
      description: 'Classic apple pie with a buttery crust and cinnamon filling.',
      imagePlaceholder: true,
      ingredientsList: [0, 11, 10],
      instruction: 'Prepare pie crust. Mix sliced apples with sugar and cinnamon. Fill pie crust, add top crust, and bake at 375°F for 45 minutes.',
      time: 60,
      level: 'mid',
      allergies: ['Gluten']
    },
    {
      id: 3,
      title: 'Steak Sandwich',
      description: 'Juicy steak on toasted bread with fresh lettuce and tomato.',
      imagePlaceholder: true,
      ingredientsList: [9, 8, 6, 3],
      instruction: 'Grill steak to desired doneness. Toast bread. Layer with lettuce, tomato, and sliced steak. Add ketchup if desired.',
      time: 20,
      level: 'easy',
      allergies: ['Gluten']
    },
    {
      id: 4,
      title: 'Garden Salad',
      description: 'Fresh vegetables tossed together for a healthy side dish.',
      imagePlaceholder: true,
      ingredientsList: [3, 5, 7],
      instruction: 'Wash and chop vegetables. Toss together in a bowl. Add your favorite dressing and serve.',
      time: 10,
      level: 'easy',
      allergies: ['None']
    },
    {
      id: 5,
      title: 'Pasta Primavera',
      description: 'Light pasta dish with seasonal vegetables in a creamy sauce.',
      imagePlaceholder: true,
      ingredientsList: [5, 2, 11, 10],
      instruction: 'Cook pasta according to package directions. Sauté vegetables. Mix with pasta and a light cream sauce.',
      time: 30,
      level: 'mid',
      allergies: ['Dairy']
    },
    {
      id: 6,
      title: 'Chicken and Broccoli Bake',
      description: 'A hearty baked dish with chicken, broccoli, and creamy sauce.',
      imagePlaceholder: true,
      ingredientsList: [1, 2, 11, 10],
      instruction: 'Arrange chicken and broccoli in a baking dish. Pour cream sauce over top. Bake at 350°F for 25 minutes.',
      time: 40,
      level: 'mid',
      allergies: ['Dairy']
    },
    {
      id: 7,
      title: 'Apple Carrot Muffins',
      description: 'Healthy muffins with apples and carrots, perfect for breakfast.',
      imagePlaceholder: true,
      ingredientsList: [0, 5, 10, 11],
      instruction: 'Mix dry ingredients. Add grated apples and carrots with wet ingredients. Bake in muffin tins at 350°F for 20 minutes.',
      time: 35,
      level: 'easy',
      allergies: ['Gluten', 'Eggs']
    },
    {
      id: 8,
      title: 'Steak with Buttered Vegetables',
      description: 'Pan-seared steak with butter-sautéed vegetables.',
      imagePlaceholder: true,
      ingredientsList: [9, 5, 2, 10],
      instruction: 'Season and cook steak to preferred doneness. In another pan, sauté vegetables with butter. Serve together.',
      time: 25,
      level: 'mid',
      allergies: ['Dairy']
    }
  ]);

  const onPhotoCapture = (photoData) => {
    console.log('Photo captured:', photoData);
    // In the future, this would call your API to analyze the photo
  };
  
  const handleGenerateRecipes = () => {
    setShowRecipes(true);
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

      {/* Main content area */}
      <div className="max-w-6xl mx-auto">
        {!showRecipes ? (
          /* Initial vertical layout - 1 column with 2 rows */
          <div className="flex flex-col items-center gap-8 mx-auto max-w-lg">
            {/* Photo Capture - centered in a single column */}
            <div className="w-full">
              <PhotoCapture onCapture={onPhotoCapture} />
            </div>
            
            {/* Ingredients List - below photo capture */}
            <div className="w-full">
              <IngredientsList 
                ingredients={ingredients} 
                onGenerateRecipes={handleGenerateRecipes} 
              />
            </div>
          </div>
        ) : (
          /* After recipe generation - 2 columns layout with equal heights */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* On mobile, this will stack vertically */}
            {/* Left side - stacked photo and ingredients */}
            <div className="flex flex-col gap-8 h-[800px]">
              <div className="mx-auto w-full max-w-lg">
                <PhotoCapture onCapture={onPhotoCapture} />
              </div>
              <div className="mx-auto w-full max-w-lg">
                <IngredientsList 
                  ingredients={ingredients} 
                  onGenerateRecipes={handleGenerateRecipes} 
                />
              </div>
            </div>
            
            {/* Right side - recipes */}
            <div className="slide-in-right h-[855px] flex flex-col">
              <RecipeList recipes={recipes} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}