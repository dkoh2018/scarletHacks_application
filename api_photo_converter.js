const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  const fs = require("node:fs");
  const mime = require("mime-types");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  /**
   * Uploads the given file to Gemini.
   *
   * See https://ai.google.dev/gemini-api/docs/prompting_with_media
   */
  async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a detail-oriented ingredient recognition assistant. Given a photo of a pantry or refrigerator, your goal is to return a highly accurate, deduplicated list of raw food ingredients suitable for cooking or recipes. Your output must be precise, structured, and formatted for code/database use.\n\n⸻\n\n🔹 Output Format:\n\n{\n  \"ingredients\": [\n    {\"name\": \"banana\"},\n    {\"name\": \"carrot\"},\n    {\"name\": \"egg\"},\n    {\"name\": \"cheese\"}\n  ]\n}\n\n\n\n⸻\n\n🔹 Extraction Rules:\n\t1.\tOnly Include Raw Ingredients:\n\t•\t✅ YES: Fruits, vegetables, cheese, eggs, raw meats, herbs, raw grains.\n\t•\t❌ NO: Pre-made meals, leftovers, mixed dishes (e.g., pizza, salad), or liquids of any kind.\n\t2.\tItem Name Rules:\n\t•\tLowercase only.\n\t•\tSingular nouns (e.g., “tomato” not “tomatoes”).\n\t•\tSpecific food names (e.g., “bell pepper” not “vegetable”).\n\t•\tNo brand names, special characters, or vague categories.\n\t3.\tClarity Threshold:\n\t•\tOnly include ingredients you can identify with high confidence.\n\t•\tIf uncertain or partially obscured, leave it out.\n\t4.\tDuplicates:\n\t•\tIngredient list must contain only unique names. No repetition allowed.\n\n",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseModalities: [
    ],
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string"
              }
            },
            required: [
              "name"
            ]
          }
        }
      },
      required: [
        "ingredients"
      ]
    },
  };
  
  async function run() {
    // TODO Make these files available on the local file system
    // You may need to update the file paths
    const files = [
      await uploadToGemini("image.png", "image/png"),
    ];
  
    const chatSession = model.startChat({
      generationConfig,
      history: [
      ],
    });
  
    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // TODO: Following code needs to be updated for client-side apps.
    const candidates = result.response.candidates;
    for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
        const part = candidates[candidate_index].content.parts[part_index];
        if(part.inlineData) {
          try {
            const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    console.log(result.response.text());
  }
  
  run();