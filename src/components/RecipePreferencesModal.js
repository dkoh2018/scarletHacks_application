'use client';

import { useState } from 'react';

export default function RecipePreferencesModal({ recipe, onClose }) {
  const [formData, setFormData] = useState({
    allergies: [],
    time: '',
    dietary: [],
    level: '', 
  });

  const toggleCheckbox = (category, value) => {
    setFormData((prev) => {
      const current = new Set(prev[category]);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [category]: Array.from(current) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User preferences:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-background rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary">
            Personalize Your Meals
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Allergies */}
          <div>
            <label className="block font-medium mb-2">Food Allergies</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allergies.includes(item)}
                    onChange={() => toggleCheckbox('allergies', item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* Time Available to Cook */}
          <div>
            <label className="block font-medium mb-2">Preferred Cooking Time</label>
            <select
              className="w-full border border-border rounded-lg p-2 bg-background"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            >
              <option value="">Select time</option>
              <option value="under-15">Under 15 minutes</option>
              <option value="15-30">15–30 minutes</option>
              <option value="30-45">30–45 minutes</option>
              <option value="60-plus">1 hour or more</option>
            </select>
          </div>

          {/* Dietary Preferences */}
          <div>
            <label className="block font-medium mb-2">Dietary Restrictions</label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['Vegetarian', 'Vegan', 'Low Carb', 'Halal', 'Kosher'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.dietary.includes(item)}
                    onChange={() => toggleCheckbox('dietary', item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block font-medium mb-2">Difficulty Level</label>
            <select
              className="w-full border border-border rounded-lg p-2 bg-background"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="mid">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Recipes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
