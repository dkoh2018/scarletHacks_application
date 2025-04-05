const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GoogleGenerativeAIFetchError // 
  } = require("@google/generative-ai");


  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  const fs = require("node:fs");
  const path = require("path"); // path is needed for joining filenames
  const sharp = require("sharp");
  
  // --- Configuration ---
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
  }
  const INPUT_IMAGE_PATH = "image.png"; // Define input image path
  const TEMP_DIR = "./temp_quadrants"; // Directory to store temporary quadrants
  // --- End Configuration ---
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  /**
   * Uploads a file to Google Generative AI File Manager.
   * Ensures the file exists before uploading.
   * @param {string} filePath - Path to the file to upload.
   * @returns {Promise<Object>} - Uploaded file object.
   */
  async function uploadToGemini(filePath) {
    try {
      // Check if file exists before upload attempt
      await fs.promises.access(filePath, fs.constants.F_OK);
      const stats = await fs.promises.stat(filePath);
      if (stats.size === 0) {
          throw new Error(`File is empty: ${filePath}`);
      }
  
      // Mime type is determined by the library, no need to pass it explicitly here
      // unless you have a very specific need or non-standard extension.
      const uploadResult = await fileManager.uploadFile(filePath, {
        // Mime type detection is usually automatic, but explicit is safer for PNG
        mimeType: "image/png",
        displayName: path.basename(filePath), // Use just the filename as display name
      });
      const file = uploadResult.file;
      console.log(
        `Uploaded file ${file.displayName} as ${file.name} with URI: ${file.uri}` // Log the URI too
      );
      // Add a small delay AFTER upload confirms, sometimes the API needs a moment
      // for the file to be fully available for inference. Adjust if needed.
      await new Promise(resolve => setTimeout(resolve, 1500));
      return file;
    } catch (error) {
      console.error(`Error uploading file ${filePath}:`, error);
      throw error; // Re-throw to stop the process if upload fails
    }
  }
  
  /**
   * Splits an image into four quadrants and saves them as separate PNG files
   * in a specified directory.
   * @param {string} imagePath - Path to the input image.
   * @param {string} outputDir - Directory to save quadrant files.
   * @returns {Promise<string[]>} - Array of absolute paths to quadrant files.
   */
  async function splitImageIntoQuadrants(imagePath, outputDir) {
    try {
      // Ensure output directory exists
      await fs.promises.mkdir(outputDir, { recursive: true });
  
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const fullWidth = metadata.width;
      const fullHeight = metadata.height;
  
      // Use Math.ceil for width/height to ensure coverage on odd dimensions
      const halfWidth = Math.ceil(fullWidth / 2);
      const halfHeight = Math.ceil(fullHeight / 2);
  
      const quadrants = [
        { name: "quadrant_top_left.png", left: 0, top: 0 },
        { name: "quadrant_top_right.png", left: fullWidth - halfWidth, top: 0 }, // Adjust right/bottom start points
        { name: "quadrant_bottom_left.png", left: 0, top: fullHeight - halfHeight },
        { name: "quadrant_bottom_right.png", left: fullWidth - halfWidth, top: fullHeight - halfHeight },
      ];
  
      const quadrantFilePaths = [];
  
      for (const q of quadrants) {
        const outputPath = path.join(outputDir, q.name);
        const cropBox = {
          left: q.left,
          top: q.top,
          // Ensure crop doesn't exceed original bounds
          width: Math.min(halfWidth, fullWidth - q.left),
          height: Math.min(halfHeight, fullHeight - q.top),
        };
  
        // Basic validation
        if (cropBox.width <= 0 || cropBox.height <= 0) {
          console.warn(`Skipping invalid crop area for ${q.name}:`, cropBox);
          continue;
        }
  
        try {
          console.log(`Extracting ${q.name} with box:`, cropBox);
          await image
            .clone()
            .extract(cropBox)
            .toFile(outputPath);
          quadrantFilePaths.push(outputPath); // Store the full path
          console.log(`Saved ${outputPath}`);
        } catch (err) {
          console.error(`Error extracting ${q.name} to ${outputPath}:`, err);
          // Decide if you want to continue or stop if one quadrant fails
        }
      }
  
      return quadrantFilePaths;
    } catch (error) {
      console.error(`Error splitting image ${imagePath}:`, error);
      throw error; // Stop if splitting fails
    }
  }
  
  // Configure the Generative AI model
  // Using gemini-1.5-flash-latest as it's generally recommended for File API
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", // Recommended model for File API
    systemInstruction:
      "You are a detail-oriented ingredient recognition assistant. Given a photo of a pantry or refrigerator, your goal is to return a highly accurate, deduplicated list of raw food ingredients suitable for cooking or recipes. Your output must be precise, structured, and formatted for code/database use.\n\n⸻\n\n🔹 Output Format:\n\n{\n  \"ingredients\": [\n    {\"name\": \"banana\"},\n    {\"name\": \"carrot\"},\n    {\"name\": \"egg\"},\n    {\"name\": \"cheese\"}\n  ]\n}\n\n⸻\n\n🔹 Extraction Rules:\n\t1.\tOnly Include Raw Ingredients:\n\t•\t✅ YES: Fruits, vegetables, cheese, eggs, raw meats, herbs, raw grains.\n\t•\t❌ NO: Pre-made meals, leftovers, mixed dishes (e.g., pizza, salad), or liquids of any kind.\n\t2.\tItem Name Rules:\n\t•\tLowercase only.\n\t•\tSingular nouns (e.g., “tomato” not “tomatoes”).\n\t•\tSpecific food names (e.g., “bell pepper” not “vegetable”).\n\t•\tNo brand names, special characters, or vague categories.\n\t3.\tClarity Threshold:\n\t•\tOnly include ingredients you can identify with high confidence.\n\t•\tIf uncertain or partially obscured, leave it out.\n\t4.\tDuplicates:\n\t•\tIngredient list must contain only unique names. No repetition allowed.\n",
  });
  
  const generationConfig = {
    temperature: 0.5, // Lower temp for more deterministic JSON output
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json", // Request JSON directly
    // responseSchema is good, keep it
    responseSchema: {
      type: "object",
      properties: {
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
        },
      },
      required: ["ingredients"],
    },
  };
  
  /**
   * Cleans up temporary files.
   * @param {string[]} filePaths - Array of file paths to delete.
   * @param {string} dirPath - Directory path to delete.
   */
  async function cleanupTempFiles(filePaths, dirPath) {
      console.log("Cleaning up temporary files...");
      for (const filePath of filePaths) {
          try {
              await fs.promises.unlink(filePath);
              console.log(`Deleted ${filePath}`);
          } catch (err) {
              // Log error but continue cleanup
              console.error(`Failed to delete temp file ${filePath}:`, err);
          }
      }
      try {
        // Attempt to remove the directory if it's empty
        await fs.promises.rmdir(dirPath);
        console.log(`Deleted directory ${dirPath}`);
      } catch (err) {
          // Ignore errors if directory is not empty or other issues
          console.warn(`Could not remove directory ${dirPath} (might not be empty or other error):`, err.message);
      }
  }
  
  /**
   * Main function to process the image and extract ingredients.
   */
  async function run() {
    let quadrantFiles = []; // Keep track of created files for cleanup
    try {
      // 1. Split the image into quadrants
      quadrantFiles = await splitImageIntoQuadrants(INPUT_IMAGE_PATH, TEMP_DIR);
      if (quadrantFiles.length === 0) {
          console.error("No quadrant files were created. Exiting.");
          return;
      }
      console.log("Quadrant files created:", quadrantFiles);
  
      // 2. Upload all quadrant files sequentially (can be parallelized with Promise.all if preferred)
      const uploadedFileObjects = [];
      for (const filePath of quadrantFiles) {
          // Make sure the file exists and isn't empty before trying to upload
          try {
              const stats = await fs.promises.stat(filePath);
              if (stats.size > 0) {
                  const fileObject = await uploadToGemini(filePath);
                  uploadedFileObjects.push(fileObject);
              } else {
                  console.warn(`Skipping empty file: ${filePath}`);
              }
          } catch (uploadError) {
              console.error(`Failed to upload ${filePath}, skipping analysis for this quadrant. Error:`, uploadError);
              // Decide if you want to stop the whole process or just skip this quadrant
              // continue; // To skip this quadrant and proceed
              // throw uploadError; // To stop everything
          }
      }
  
  
      if (uploadedFileObjects.length === 0) {
          console.error("No files were successfully uploaded. Cannot proceed with analysis.");
          return; // Exit if no files were uploaded
      }
  
      // 3. Analyze each quadrant
      const ingredientSet = new Set();
  
      // You can create a new chat session for each analysis or reuse one.
      // Reusing might build context, but for independent quadrant analysis,
      // separate calls might be cleaner. Let's use generateContent for simplicity.
      // (Using chatSession like before is also fine, just ensure correct file object is passed each time)
  
      console.log("\n--- Analyzing Quadrants ---");
      for (const file of uploadedFileObjects) {
        console.log(`\nAnalyzing ${file.displayName}...`);
        try {
          // *** THE KEY FIX IS HERE: Use file.uri and file.mimeType ***
          const result = await model.generateContent([
            { text: "Analyze this image quadrant for ingredients based on the rules." },
            {
              fileData: {
                // Use the URI provided by the File API
                fileUri: file.uri,
                // Use the mimeType confirmed by the File API
                mimeType: file.mimeType,
              },
            },
          ], generationConfig); // Pass generationConfig here for generateContent
  
          const response = result.response; // Easier access
          console.log("API Response Status:", response.promptFeedback || 'OK'); // Log safety ratings etc.
  
          const candidate = response.candidates?.[0];
          let parsed = null; // Initialize parsed to null
  
          if (candidate && candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              const part = candidate.content.parts[0];
              const rawText = part.text; // Get the raw text content
  
              if (rawText) {
                  console.log("Raw text response for", file.displayName, ":\n", rawText); // Log the raw text first
  
                  // Regex to extract JSON content from potential markdown code blocks
                  // It looks for ```json ... ``` or just starts with { or [
                  const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```|^\s*({[\s\S]*}|\[[\s\S]*\])\s*$/m;
                  const match = rawText.match(jsonRegex);
                  let jsonToParse = null;
  
                  if (match) {
                      // If match[1] exists, it's from the ```json block
                      // If match[2] exists, it's a standalone JSON object/array
                      jsonToParse = match[1] || match[2];
                      console.log("Extracted JSON string for parsing:\n", jsonToParse);
                  } else {
                      // If regex doesn't match, maybe it's plain JSON without fences?
                      // Or maybe it's just invalid text. Let's assume it *might* be JSON.
                      jsonToParse = rawText.trim(); // Trim whitespace just in case
                       console.log("Could not extract with regex, attempting to parse raw trimmed text:\n", jsonToParse);
                  }
  
  
                  if (jsonToParse) {
                      try {
                          parsed = JSON.parse(jsonToParse); // Try parsing the extracted/trimmed string
                           console.log("Successfully parsed JSON for", file.displayName);
                      } catch (parseError) {
                          console.error(`Failed to parse JSON for ${file.displayName} after extraction:`, parseError);
                          console.error("String that failed parsing:", jsonToParse); // Log the exact string that failed
                          parsed = null; // Ensure parsed is null if parsing fails
                      }
                  } else {
                       console.warn(`No JSON content could be extracted or identified for ${file.displayName}`);
                  }
  
              } else if (part.object) {
                   // If the SDK *did* manage to pre-parse it (less likely now, but possible)
                   parsed = part.object;
                   console.log("SDK provided pre-parsed object for", file.displayName, ":", JSON.stringify(parsed, null, 2));
              } else {
                   console.warn("No text or parsable object found in response part for", file.displayName);
              }
          } else {
              console.warn("No valid candidates or parts found in response for", file.displayName);
          }
  
          // Now 'parsed' will be the JavaScript object if successful, or null otherwise
          // The rest of the logic using 'parsed' can continue...
          // console.log("Final Parsed Object for", file.displayName, ":", JSON.stringify(parsed, null, 2)); // You can uncomment this for debugging
  
          if (parsed && Array.isArray(parsed.ingredients)) {
            parsed.ingredients.forEach((ing) => {
              if (ing.name && typeof ing.name === 'string') {
                  // Basic validation/cleaning
                  const cleanedName = ing.name.trim().toLowerCase();
                  if (cleanedName) { // Ensure not empty after trimming
                      ingredientSet.add(cleanedName);
                      console.log(`  -> Added: ${cleanedName}`);
                  } else {
                      console.warn(`  -> Skipped empty ingredient name from ${file.displayName}`);
                  }
              } else {
                   console.warn(`  -> Skipped invalid ingredient format from ${file.displayName}:`, ing);
              }
            });
          } else {
              console.warn("No valid ingredients array found in response for", file.displayName);
          }
        } catch (error) {
          // Log the specific error from the API call
          if (error instanceof GoogleGenerativeAIFetchError) {
              console.error(
                  `API Error processing ${file.displayName} (URI: ${file.uri}):`,
                  `Status: ${error.status}, Message: ${error.message}`,
                  error.errorDetails ? `\nDetails: ${JSON.stringify(error.errorDetails)}` : ""
              );
          } else {
              console.error(`Generic Error processing ${file.displayName} (URI: ${file.uri}):`, error);
          }
          // Decide whether to continue with other quadrants or stop
        }
         // Optional small delay between API calls to avoid rate limits
         await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
  
      // 4. Combine and Log Results
      const combinedList = Array.from(ingredientSet).map((name) => ({ name })); // Convert Set back to array of objects
      console.log("\n--- Combined Ingredient List ---");
      console.log(JSON.stringify({ ingredients: combinedList }, null, 2)); // Pretty print final JSON
  
    } catch (error) {
        console.error("\n--- An error occurred during the run ---");
        console.error(error);
    } finally {
        // 5. Cleanup temporary quadrant files and directory
        await cleanupTempFiles(quadrantFiles, TEMP_DIR);
    }
  }
  
  // Execute the main function
  run();