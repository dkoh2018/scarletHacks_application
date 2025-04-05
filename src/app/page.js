'use client';

import Image from "next/image";

import SpeedDialTooltipOpen from "../components/SpeedDialTooltipOpen"; // adjust path as needed


export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_1fr] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="relative flex flex-col items-center justify-center w-full border-2 border-solid border-gray-300 rounded-lg p-12">
        <h1 className="text-3xl font-bold mb-4">Photo Here</h1>
        <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Image Placeholder</span>
        </div>

        {/* Floating circular + button in bottom-right */}
        {/* <div className="absolute bottom-4 right-4 group flex items-center">
          <div className="mr-3 bg-black text-white text-sm rounded px-3 py-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
            Upload Image / Take Photo
          </div>
          <button
            className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl hover:bg-blue-700 transition-colors"
            aria-label="Upload Image or Take Photo"
          >
            +
          </button>
        </div> */}




    <div className="absolute bottom-4 right-4">
      <SpeedDialTooltipOpen />
    </div>

        

        
      </div>

      {/* Ingredients Section */}
      <div className="flex flex-col items-center justify-center w-full border-2 border-solid border-gray-300 rounded-lg p-12">
        <h1 className="text-3xl font-bold mb-4">Ingredients</h1>
        <ul className="grid grid-cols-3 gap-x-8 list-disc list-inside text-gray-700 text-lg">
          <li>Apples</li>
          <li>Chicken</li>
          <li>Broccoli</li>
          <li>Tomatoes</li>
          <li>Carrots</li>
          <li>Flour</li>
          <li>Ketchup</li>
          <li>Lettuce</li>
          <li>White Bread</li>
          <li>Steak</li>
          <li>Butter</li>
          <li>2% Milk</li>
        </ul>
      </div>




      {/* Recipes Section */}
      <div className="flex flex-col w-full border-2 border-solid border-gray-300 rounded-lg p-12 gap-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Recipes</h1>

        {/* Recipe Entry 1 */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch h-48 w-full">
          {/* Recipe Image - fixed square */}
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500 text-center text-sm">Recipe Img Placeholder</span>
          </div>

          {/* Description - fills rest of row, matches height */}
          <div className="flex-1 h-full bg-gray-100 rounded p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Recipe Title</h2>
            <p className="text-gray-700">
              This is where your recipe description goes. Everything here is constrained to match the height of the image.
            </p>
          </div>
        </div>

        {/* Recipe Entry 2 */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch h-48 w-full">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500 text-center text-sm">Recipe Img Placeholder</span>
          </div>
          <div className="flex-1 h-full bg-gray-100 rounded p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Another Recipe</h2>
            <p className="text-gray-700">
              Same layout here. The description box won’t get taller than the image, and will scroll if the text is too long.
            </p>
          </div>
        </div>
        {/* Recipe Entry 3 */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch h-48 w-full">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500 text-center text-sm">Recipe Img Placeholder</span>
          </div>
          <div className="flex-1 h-full bg-gray-100 rounded p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Another Recipe</h2>
            <p className="text-gray-700">
              Same layout here. The description box won’t get taller than the image, and will scroll if the text is too long.
            </p>
          </div>
        </div>
        {/* Recipe Entry 4 */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch h-48 w-full">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500 text-center text-sm">Recipe Img Placeholder</span>
          </div>
          <div className="flex-1 h-full bg-gray-100 rounded p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Another Recipe</h2>
            <p className="text-gray-700">
              Same layout here. The description box won’t get taller than the image, and will scroll if the text is too long.
            </p>
          </div>
        </div>
        
          {/* Recipe Entry 5 */}
          <div className="flex flex-col sm:flex-row gap-6 items-stretch h-48 w-full">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500 text-center text-sm">Recipe Img Placeholder</span>
          </div>
          <div className="flex-1 h-full bg-gray-100 rounded p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Another Recipe</h2>
            <p className="text-gray-700">
              Same layout here. The description box won’t get taller than the image, and will scroll if the text is too long.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}