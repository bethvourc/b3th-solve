import axios from "axios";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import Canvas from "react-native-canvas";

export function createGoogleVisionClient(apiKey: string) {
  return apiKey;
}

// Function to initialize Gemini AI Client
export function createGeminiClient(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Function to preprocess an image using Expo Image Manipulator
export async function preprocessImage(imageUri: string): Promise<string> {
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1200 } }], // Resize the image
    { format: ImageManipulator.SaveFormat.PNG } // Convert to PNG
  );
  return manipulatedImage.uri; // Return new image path
}

// Function to convert image to Base64 for Google Vision API
async function convertImageToBase64(imageUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
  return base64;
}

// Function to extract text from an image using Google Vision API
export async function extractTextFromImage(apiKey: string, imageUri: string): Promise<string> {
  try {
    const imageBase64 = await convertImageToBase64(imageUri);

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }
    );

    const detections = response.data.responses[0]?.textAnnotations;
    return detections?.length ? detections[0].description ?? "" : "No text detected";
  } catch (error) {
    console.error("Google Vision API Error:", error);
    return "Error processing image";
  }
}

// Function to solve an equation using Gemini AI
export async function solveEquation(model: GenerativeModel, equation: string): Promise<string> {
  const prompt = `Solve the following math problem and provide step-by-step explanations in plain text (no LaTeX or special formatting):\n\n${equation}`;
  const result = await model.generateContent(prompt);
  return result?.response?.text()?.replace(/\$\$?/g, "").replace(/\\boxed{([^}]*)}/g, "$1") ?? "Solution unavailable.";
}

// Function to generate a solution image using react-native-canvas
export async function generateSolutionImage(canvas: Canvas, equation: string, solution: string): Promise<string> {
  const width = 800;
  const lineHeight = 30;
  const lines = solution.split("\n");
  const height = Math.max(600, 200 + lines.length * lineHeight);

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Math Equation Solution", 50, 50);
  ctx.font = "bold 20px Arial";
  ctx.fillText("Equation:", 50, 100);
  ctx.font = "18px Arial";
  ctx.fillText(equation, 50, 130);
  ctx.font = "bold 20px Arial";
  ctx.fillText("Solution:", 50, 180);
  ctx.font = "18px Arial";

  let y = 210;
  for (const line of lines) {
    ctx.fillText(line, 50, y);
    y += lineHeight;
  }

  // Convert canvas to Base64
  const base64 = await canvas.toDataURL("image/png");

  // Save file in Expo's document directory
  const outputPath = FileSystem.documentDirectory + "solution.png";
  await FileSystem.writeAsStringAsync(outputPath, base64.replace(/^data:image\/png;base64,/, ""), {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log(`Solution image created: ${outputPath}`);
  return outputPath;
}

// Main function to process an image question
export async function processImageQuestion(imageUri: string, apiKey: string, canvas: Canvas) {
  try {
    console.log("Processing image:", imageUri);
    const extractedText = await extractTextFromImage(apiKey, imageUri);
    console.log("Extracted Text:", extractedText);

    if (extractedText.includes("QTAR")) {
      const equation = extractedText.replace("QTAR", "").trim();
      console.log("Solving equation...");
      const model = createGeminiClient(apiKey);
      const solution = await solveEquation(model, equation);
      console.log("\nFinal Solution:\n", solution);

      const outputImagePath = await generateSolutionImage(canvas, equation, solution);
      return { solution, outputImagePath };
    } else {
      console.log("No 'QTAR' detected in the image.");
      return { solution: "No equation found", outputImagePath: null };
    }
  } catch (error) {
    console.error("Error processing the image:", error);
    throw error;
  }
}
