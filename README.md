# Recipe Analyzer App

A modern web application for recipe analysis based on your ingredients. Take a photo of your ingredients or add them manually to discover recipes you can make.

## Features

- **Photo Capture**: Use your device camera to capture ingredients
- **Ingredients Management**: Add, remove, and manage your ingredients list
- **Recipe Suggestions**: View suggested recipes based on available ingredients
- **Modern UI**: Clean, responsive interface with smooth interactions

## Tech Stack

- **Frontend**: Next.js, React
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components for a consistent design language

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app`: Main Next.js app router structure
  - `layout.js`: Root layout with fonts and base styles
  - `page.js`: Main application page
  - `globals.css`: Global styles and design system
- `src/components`: Reusable UI components
  - `PhotoCapture.js`: Camera and photo capture functionality
  - `IngredientsList.js`: Ingredient management interface
  - `RecipeList.js`: Recipe display and interaction

## Future Enhancements

- Connect to a recipe API for dynamic recipe suggestions
- Image recognition for automatic ingredient detection
- Recipe filtering and sorting options
- User accounts for saving favorite recipes
