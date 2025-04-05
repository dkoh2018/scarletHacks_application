'use client';

import { useState, useRef } from 'react';

export default function ActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (e) => {
    if (isOpen) setIsOpen(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Backdrop when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={handleClickOutside}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-card-bg rounded-lg shadow-md overflow-hidden border border-border w-48 fade-in">
            <div className="p-2 space-y-1">
              <button 
                className="w-full text-left p-2 rounded hover:bg-primary hover:text-white flex items-center gap-2 transition-colors"
                onClick={handleFileUpload}
              >
                <span className="text-lg">📁</span>
                <span>Upload Image</span>
              </button>
              
              <button 
                className="w-full text-left p-2 rounded hover:bg-primary hover:text-white flex items-center gap-2 transition-colors"
              >
                <span className="text-lg">📷</span>
                <span>Take Photo</span>
              </button>
              
              <button 
                className="w-full text-left p-2 rounded hover:bg-primary hover:text-white flex items-center gap-2 transition-colors"
              >
                <span className="text-lg">🔄</span>
                <span>Generate Recipes</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Main action button */}
        <button 
          className="rounded-full w-14 h-14 bg-accent text-white shadow-md flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95"
          onClick={toggleMenu}
        >
          <span className="text-2xl">{isOpen ? '×' : '+'}</span>
        </button>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
      />
    </>
  );
}