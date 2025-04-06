'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export default function PhotoCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/png');
    setCaptured(imageData);
    
    if (onCapture) {
      onCapture(imageData);
    }
    
    // Stop camera after capturing
    stopCamera();
  };

  const resetPhoto = () => {
    setCaptured(null);
    startCamera();
  };

  return (
    <div className="card p-6 flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold mb-4">Ingredient Photo</h2>
      
      <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!captured ? (
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`} 
          />
        ) : (
          <div className="w-full h-full">
            <img 
              src={captured} 
              alt="Captured ingredients" 
              className="w-full h-full object-cover fade-in"
            />
          </div>
        )}
        
        {!cameraActive && !captured && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p className="text-center">Camera is not active</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {!cameraActive && !captured ? (
          <button onClick={startCamera} className="btn btn-primary">
            Turn Camera On
          </button>
        ) : !captured ? (
          <>
            <button onClick={takePhoto} className="btn btn-accent">
              Take Photo
            </button>
            <button onClick={stopCamera} className="btn btn-secondary">
              Turn Camera Off
            </button>
          </>
        ) : (
          <>
            <a href={captured} download="ingredients.png" className="btn btn-primary">
              Download
            </a>
            <button onClick={resetPhoto} className="btn btn-secondary">
              Try Again
            </button>
          </>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}