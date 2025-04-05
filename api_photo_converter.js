const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GoogleGenerativeAIFetchError // Correctly imported
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("node:fs");
const path = require("path");
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

// --- Model Configuration --- (Moved up for clarity)
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", // Recommended model for File API
    systemInstruction:
      "You are a detail-oriented ingredient recognition assistant. Given a photo of a pantry or refrigerator, your goal is to return a highly accurate, deduplicated list of raw food ingredients suitable for cooking or recipes. Your output must be precise, structured, and formatted for code/database use.\n\n⸻\n\n🔹 Output Format:\n\n{\n  \"ingredients\": [\n    {\"name\": \"banana\"},\n    {\"name\": \"carrot\"},\n    {\"name\": \"egg\"},\n    {\"name\": \"cheese\"}\n  ]\n}\n\n⸻\n\n🔹 Extraction Rules:\n\t1.\tOnly Include Raw Ingredients:\n\t•\t✅ YES: Fruits, vegetables, cheese, eggs, raw meats, herbs, raw grains.\n\t•\t❌ NO: Pre-made meals, leftovers, mixed dishes (e.g., pizza, salad), or liquids of any kind.\n\t2.\tItem Name Rules:\n\t•\tLowercase only.\n\t•\tSingular nouns (e.g., “tomato” not “tomatoes”).\n\t•\tSpecific food names (e.g., “bell pepper” not “vegetable”).\n\t•\tNo brand names, special characters, or vague categories.\n\t3.\tClarity Threshold:\n\t•\tOnly include ingredients you can identify with high confidence.\n\t•\tIf uncertain or partially obscured, leave it out.\n\t4.\tDuplicates:\n\t•\tIngredient list must contain only unique names. No repetition allowed.\n",
});

const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
          },
        },
      },
      required: ["ingredients"],
    },
};

// --- Helper Functions ---

/**
 * Uploads a file to Gemini, ensuring it exists and isn't empty.
 * Includes a delay after upload confirmation.
 * @param {string} filePath - Path to the file.
 * @returns {Promise<Object|null>} Uploaded file object or null on error.
 */
async function uploadToGemini(filePath) {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        const stats = await fs.promises.stat(filePath);
        if (stats.size === 0) {
            console.warn(`Skipping empty file: ${filePath}`);
            return null;
        }

        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: "image/png",
            displayName: path.basename(filePath),
        });
        const file = uploadResult.file;
        console.log(`Uploaded ${file.displayName} (URI: ${file.uri})`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Post-upload delay
        return file;
    } catch (error) {
        console.error(`Error uploading ${filePath}:`, error);
        return null; // Return null to indicate failure
    }
}

/**
 * Splits an image into four quadrants.
 * @param {string} imagePath - Path to the input image.
 * @param {string} outputDir - Directory to save quadrant files.
 * @returns {Promise<string[]>} Array of absolute paths to quadrant files.
 */
async function splitImageIntoQuadrants(imagePath, outputDir) {
    // (Keep the implementation from the previous version - it's good)
    try {
        await fs.promises.mkdir(outputDir, { recursive: true });
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const fullWidth = metadata.width;
        const fullHeight = metadata.height;
        const halfWidth = Math.ceil(fullWidth / 2);
        const halfHeight = Math.ceil(fullHeight / 2);

        const quadrants = [
          { name: "quadrant_top_left.png", left: 0, top: 0 },
          { name: "quadrant_top_right.png", left: fullWidth - halfWidth, top: 0 },
          { name: "quadrant_bottom_left.png", left: 0, top: fullHeight - halfHeight },
          { name: "quadrant_bottom_right.png", left: fullWidth - halfWidth, top: fullHeight - halfHeight },
        ];
        const quadrantFilePaths = [];
        for (const q of quadrants) {
          const outputPath = path.join(outputDir, q.name);
          const cropBox = {
            left: q.left, top: q.top,
            width: Math.min(halfWidth, fullWidth - q.left),
            height: Math.min(halfHeight, fullHeight - q.top),
          };
          if (cropBox.width > 0 && cropBox.height > 0) {
            try {
              console.log(`Extracting ${q.name}...`);
              await image.clone().extract(cropBox).toFile(outputPath);
              quadrantFilePaths.push(outputPath);
              console.log(`Saved ${outputPath}`);
            } catch (err) {
              console.error(`Error extracting ${q.name}:`, err);
            }
          } else {
            console.warn(`Skipping invalid crop area for ${q.name}`);
          }
        }
        return quadrantFilePaths;
    } catch (error) {
        console.error(`Error splitting image ${imagePath}:`, error);
        throw error;
    }
}

/**
 * Analyzes a single uploaded image quadrant using the Gemini API.
 * Handles JSON parsing and extraction from potential Markdown fences.
 * @param {Object} file - The uploaded file object from GoogleAIFileManager.
 * @param {GenerativeModel} model - The configured Gemini model instance.
 * @param {Object} generationConfig - The generation configuration object.
 * @returns {Promise<Array<{name: string}>>} - An array of ingredient objects found, or empty array on error/no ingredients.
 */
async function analyzeQuadrant(file, model, generationConfig) {
    console.log(`\nAnalyzing ${file.displayName}...`);
    try {
        const result = await model.generateContent([
            { text: "Analyze this image quadrant for ingredients based on the rules." },
            { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
        ], generationConfig);

        const response = result.response;
        const candidate = response?.candidates?.[0];

        if (!candidate?.content?.parts?.length) {
            console.warn("No valid candidates or parts found in response for", file.displayName, response.promptFeedback ? `Feedback: ${JSON.stringify(response.promptFeedback)}` : '');
            return [];
        }

        const part = candidate.content.parts[0];
        const rawText = part.text;
        let parsed = null;

        if (rawText) {
            // console.log("Raw text response for", file.displayName, ":\n", rawText); // Optional: Log raw text

            // Try extracting JSON from potential markdown ```json ... ``` blocks or standalone JSON
            const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```|^\s*({[\s\S]*}|\[[\s\S]*\])\s*$/m;
            const match = rawText.match(jsonRegex);
            const jsonToParse = match ? (match[1] || match[2]) : rawText.trim(); // Use extracted or trimmed raw text

            if (jsonToParse) {
                try {
                    parsed = JSON.parse(jsonToParse);
                    // console.log("Successfully parsed JSON for", file.displayName); // Optional: Log parse success
                } catch (parseError) {
                    console.error(`Failed to parse JSON for ${file.displayName}:`, parseError.message);
                    // console.error("String that failed parsing:", jsonToParse); // Optional: Log failing string
                    return []; // Return empty on parse error
                }
            } else {
                 console.warn(`No JSON content could be extracted or identified for ${file.displayName}`);
                 return [];
            }
        } else {
             console.warn("No text found in response part for", file.displayName);
             return [];
        }

        // Validate the parsed structure and return the ingredients array
        if (parsed && Array.isArray(parsed.ingredients)) {
            // Optional: Further validation of each ingredient object if needed
             return parsed.ingredients.filter(ing => ing && typeof ing.name === 'string' && ing.name.trim()); // Return only valid ingredients
        } else {
            console.warn("Parsed data does not contain a valid 'ingredients' array for", file.displayName);
            return [];
        }

    } catch (error) {
        if (error instanceof GoogleGenerativeAIFetchError) {
            console.error(`API Error processing ${file.displayName} (URI: ${file.uri}): Status ${error.status}, Message: ${error.message}`, error.errorDetails || '');
        } else {
            console.error(`Generic Error processing ${file.displayName} (URI: ${file.uri}):`, error);
        }
        return []; // Return empty array on any processing error for this quadrant
    }
}


/**
 * Cleans up temporary files and directory.
 * @param {string[]} filePaths - Array of file paths to delete.
 * @param {string} dirPath - Directory path to delete.
 */
async function cleanupTempFiles(filePaths, dirPath) {
    console.log("\nCleaning up temporary files...");
    for (const filePath of filePaths) {
        try {
            await fs.promises.unlink(filePath);
            // console.log(`Deleted ${filePath}`); // Optional: Verbose logging
        } catch (err) {
            console.warn(`Failed to delete temp file ${filePath}:`, err.message);
        }
    }
    try {
        await fs.promises.rmdir(dirPath);
        console.log(`Deleted directory ${dirPath}`);
    } catch (err) {
        // Ignore errors (e.g., dir not empty if file deletion failed)
        console.warn(`Could not remove directory ${dirPath}:`, err.message);
    }
}

/**
 * Main function to process the image, analyze quadrants, and combine ingredients.
 * @returns {Promise<Array<{name: string}>>} - The final deduplicated list of ingredient objects.
 */
async function run() {
    let quadrantFiles = [];
    const ingredientSet = new Set(); // Use Set for automatic deduplication of names

    try {
        // 1. Split Image
        console.log("--- Splitting Image ---");
        quadrantFiles = await splitImageIntoQuadrants(INPUT_IMAGE_PATH, TEMP_DIR);
        if (quadrantFiles.length === 0) {
            console.error("No quadrant files were created. Exiting.");
            return []; // Return empty list
        }
        console.log(`Created ${quadrantFiles.length} quadrant files.`);

        // 2. Upload Quadrants (in parallel)
        console.log("\n--- Uploading Quadrants ---");
        const uploadPromises = quadrantFiles.map(filePath => uploadToGemini(filePath));
        const uploadResults = await Promise.all(uploadPromises);
        const uploadedFileObjects = uploadResults.filter(file => file !== null); // Filter out failed uploads

        if (uploadedFileObjects.length === 0) {
            console.error("No files were successfully uploaded. Cannot proceed with analysis.");
            return []; // Return empty list
        }
        console.log(`Successfully uploaded ${uploadedFileObjects.length} files.`);

        // 3. Analyze Each Quadrant (sequentially to manage rate limits)
        console.log("\n--- Analyzing Quadrants ---");
        for (const file of uploadedFileObjects) {
            const ingredientsFound = await analyzeQuadrant(file, model, generationConfig);

            // Add valid, cleaned names to the Set
            ingredientsFound.forEach(ing => {
                const cleanedName = ing.name.trim().toLowerCase();
                if (cleanedName) { // Ensure not empty after cleaning
                     if (!ingredientSet.has(cleanedName)) { // Log only when adding a *new* item
                        console.log(`  -> Found: ${cleanedName}`);
                        ingredientSet.add(cleanedName);
                    }
                }
            });
             // Optional delay between API calls
             await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        // 4. Combine Results
        const combinedList = Array.from(ingredientSet).map(name => ({ name })); // Convert Set<string> to Array<{name: string}>

        console.log("\n--- Combined Ingredient List ---");
        console.log(JSON.stringify({ ingredients: combinedList }, null, 2));

        return combinedList; // Return the final list

    } catch (error) {
        console.error("\n--- An unhandled error occurred during the run ---");
        console.error(error);
        return []; // Return empty list on major error
    } finally {
        // 5. Cleanup
        if (quadrantFiles.length > 0) {
            await cleanupTempFiles(quadrantFiles, TEMP_DIR);
        }
    }
}

// --- Execute ---
run()
    .then(finalIngredientList => {
        console.log("\n--- Script Finished ---");
        if (finalIngredientList.length > 0) {
            console.log(`Processing complete. Found ${finalIngredientList.length} unique ingredients.`);

            // --- DATABASE INTEGRATION POINT ---
            // You can now use the 'finalIngredientList' array here
            // Example:
            // await saveIngredientsToDatabase(finalIngredientList);
            console.log("\nDB Integration Placeholder:");
            console.log("Ingredients ready for database:", finalIngredientList.map(ing => ing.name).join(', '));
            // --- End DB Integration ---

        } else {
            console.log("Processing complete. No ingredients were identified.");
        }
    })
    .catch(err => {
        console.error("\n--- Fatal Error ---");
        console.error("Script execution failed:", err);
        process.exitCode = 1; // Indicate failure
    });

// Example placeholder for DB function
// async function saveIngredientsToDatabase(ingredients) {
//     console.log(`Simulating save of ${ingredients.length} ingredients to DB...`);
//     // Replace with your actual database logic (e.g., using Prisma, Sequelize, node-postgres, mongodb driver etc.)
//     // for (const ingredient of ingredients) {
//     //     await db.collection('ingredients').insertOne(ingredient);
//     // }
//     console.log("DB simulation complete.");
// }