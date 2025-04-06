'use client';

import { useRef, useState } from 'react';

export default function PhotoCapture({ onUploadComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [captured, setCaptured] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showCameraArea, setShowCameraArea] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  const startCamera = async () => {
    try {
      setShowCameraArea(true);
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
    }
    setCameraActive(false);
    setShowCameraArea(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-image.png', { type: 'image/png' });
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      setCaptured(URL.createObjectURL(file));
    }, 'image/png');

    stopCamera();
  };

  const resetPhoto = () => {
    setCaptured(null);
    setUploadFile(null);
    setUploadPreview(null);
    startCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('image', uploadFile);

    try {
      setUploading(true);
      const res = await fetch('http://localhost:4000/api/analyze/1', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('✅ Analyze result:', data);

      if (data.ingredients) {
        alert('✅ Image analyzed. Ingredients updated.');
        if (onUploadComplete) onUploadComplete();
      } else {
        alert('❌ Failed to analyze image.');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('❌ Failed to analyze image.');
    } finally {
      setUploading(false);
      setUploadFile(null);
      setUploadPreview(null);
      setCaptured(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  return (
    <div className="card p-6 flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold mb-4">Ingredient Photo</h2>

      {showCameraArea && (
        <div className="relative w-full max-w-lg bg-gray-800 rounded-lg overflow-hidden mb-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {!captured ? (
            <video
              ref={videoRef}
              className={`w-full h-auto object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : null}

          {!cameraActive && !captured && !loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p className="text-center">Camera is not active</p>
            </div>
          )}
        </div>
      )}

      {uploadPreview && (
        <div className="w-full max-w-md mb-4">
          <img src={uploadPreview} alt="Preview" className="rounded shadow-md" />
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {!cameraActive && !captured ? (
          <button onClick={startCamera} className="btn bg-indigo-600 text-white">
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
            <button onClick={resetPhoto} className="btn btn-secondary">
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Upload Section */}
      <div className="flex flex-col gap-2 w-full items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="uploadInput"
        />

        <label
          htmlFor="uploadInput"
          className="btn btn-outline w-full cursor-pointer text-white border-white"
        >
          Choose File
        </label>

        <button
          onClick={handleUpload}
          disabled={!uploadFile || uploading}
          className="btn bg-orange-500 text-white w-full"
        >
          {uploading ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}