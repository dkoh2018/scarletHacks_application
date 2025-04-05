import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_1fr] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header section with "Photo Here" */}
      <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-12">
        <h1 className="text-3xl font-bold mb-4">Photo Here</h1>
        <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Image Placeholder</span>
        </div>
      </div>

      {/* Bottom section with command button and file upload */}
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <button 
          className="rounded-full bg-blue-600 text-white font-medium text-lg py-3 px-8 hover:bg-blue-700 transition-colors"
        >
          Execute Command
        </button>
        
        <div className="w-full max-w-md">
          <label className="block text-lg font-medium mb-2">Add Files</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
