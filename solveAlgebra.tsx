import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import vision from "@google-cloud/vision";
import sharp from "sharp";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFile } from "fs/promises";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Google Vision API Setup
const googleClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");
const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to preprocess the image (resize, grayscale, sharpen)
async function preprocessImage(imagePath: string): Promise<string> {
  const processedPath = `${imagePath.split(".").slice(0, -1).join(".")}_processed.png`;
  await sharp(imagePath).resize(1200).grayscale().sharpen().toFile(processedPath);
  return processedPath;
}

// Function to extract text from an image using Google Vision API
async function extractTextFromImage(imagePath: string): Promise<string> {
  const [result] = await googleClient.textDetection(imagePath);
  const detections = result.textAnnotations;
  if (detections && detections.length > 0) {
    return detections[0].description ?? "";
  } else {
    throw new Error("No text detected in the image.");
  }
}

// Function to solve an equation using Gemini AI
async function solveEquation(equation: string): Promise<string> {
  const prompt = `Solve the following math problem and provide step-by-step explanations:\n\n${equation}`;
  const result = await model.generateContent(prompt);
  return result?.response?.text() ?? "Solution unavailable.";
}

// Function to check student work using Gemini AI
async function checkStudentWork(studentWork: string, problem: string): Promise<string> {
  const prompt = `The student attempted to solve this equation: ${problem}.
  Here is their work: ${studentWork}
  Analyze their solution and provide feedback on errors and how to fix them.`;

  const result = await model.generateContent(prompt);
  return result?.response?.text() ?? "No feedback available.";
}

// Function to generate an image with the equation and solution
async function generateSolutionImage(equation: string, solution: string, outputPath: string) {
    const width = 800;
    const lineHeight = 30;
    
    // Count the number of lines needed
    const lines = solution.split("\n");
    const estimatedHeight = 200 + lines.length * lineHeight; // Adjust dynamically
  
    const height = estimatedHeight < 600 ? 600 : estimatedHeight; // Minimum height 600px
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
  
    // Background color
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  
    // Set text styles
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
  
    // Wrap text properly
    for (const line of lines) {
      const words = line.split(" ");
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 100) {
          ctx.fillText(currentLine, 50, y);
          y += lineHeight;
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      }
      ctx.fillText(currentLine, 50, y);
      y += lineHeight;
    }
  
    // Save as image file
    const buffer = canvas.toBuffer("image/png");
    await writeFile(outputPath, buffer);
    console.log(`Solution image created: ${outputPath}`);
  }
  

// Function to generate an image with student work feedback
async function generateFeedbackImage(problem: string, studentWork: string, feedback: string, outputPath: string) {
  const width = 800;
  const height = 700;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background color
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Set text styles
  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Math Work Evaluation", 50, 50);

  ctx.font = "bold 20px Arial";
  ctx.fillText("Problem Given:", 50, 100);
  ctx.font = "18px Arial";
  ctx.fillText(problem, 50, 130);

  ctx.font = "bold 20px Arial";
  ctx.fillText("Student's Work:", 50, 180);
  ctx.font = "18px Arial";

  // Break student work into lines
  const studentWorkLines = studentWork.split("\n");
  let y = 210;
  for (const line of studentWorkLines) {
    ctx.fillText(line, 50, y);
    y += 30;
  }

  ctx.font = "bold 20px Arial";
  ctx.fillText("Feedback & Corrections:", 50, y + 20);
  ctx.font = "18px Arial";

  // Break feedback into lines
  const feedbackLines = feedback.split("\n");
  y += 50;
  for (const line of feedbackLines) {
    ctx.fillText(line, 50, y);
    y += 30;
  }

  // Save as image file
  const buffer = canvas.toBuffer("image/png");
  await writeFile(outputPath, buffer);
  console.log(`Feedback image created: ${outputPath}`);
}

// Main function to process the image, extract text, and either solve the equation or check student work
async function processImageQuestion(imagePath: string): Promise<void> {
  try {
    console.log("Preprocessing the image...");
    const processedImagePath = await preprocessImage(imagePath);

    console.log("Extracting text using Google Vision...");
    const extractedText = await extractTextFromImage(processedImagePath);

    if (extractedText.includes("QTAR")) {
      console.log("Detected 'QTAR': Solving the equation.");
      const equation = extractedText.replace("QTAR", "").trim();

      console.log("Solving equation using Gemini AI...");
      const solution = await solveEquation(equation);

      console.log("\nFinal Solution:");
      console.log(solution);

      const outputImagePath = `${imagePath.split(".").slice(0, -1).join(".")}_solution.png`;
      await generateSolutionImage(equation, solution, outputImagePath);
      
    } else if (extractedText.includes("CTAR")) {
      console.log("Detected 'CTAR': Checking student work.");
      const parts = extractedText.split("CTAR");
      const problem = parts[0]?.trim() ?? "";
      const studentWork = parts[1]?.trim() ?? "";

      console.log("Checking work using Gemini AI...");
      const feedback = await checkStudentWork(studentWork, problem);

      console.log("\nFeedback:");
      console.log(feedback);

      const outputImagePath = `${imagePath.split(".").slice(0, -1).join(".")}_feedback.png`;
      await generateFeedbackImage(problem, studentWork, feedback, outputImagePath);
      
    } else {
      console.log("No 'QTAR' or 'CTAR' detected in the image.");
    }
  } catch (error) {
    console.error("Error processing the image:", error);
  }
}

// Run the program
processImageQuestion("path/to/your/image.jpg");
