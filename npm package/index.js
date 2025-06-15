"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleVisionClient = createGoogleVisionClient;
exports.createGeminiClient = createGeminiClient;
exports.preprocessImage = preprocessImage;
exports.extractTextFromImage = extractTextFromImage;
exports.solveEquation = solveEquation;
exports.generateSolutionImage = generateSolutionImage;
exports.processImageQuestion = processImageQuestion;
const axios_1 = __importDefault(require("axios"));
const generative_ai_1 = require("@google/generative-ai");
const FileSystem = __importStar(require("expo-file-system"));
const ImageManipulator = __importStar(require("expo-image-manipulator"));
function createGoogleVisionClient(apiKey) {
    return apiKey;
}
// Function to initialize Gemini AI Client
function createGeminiClient(apiKey) {
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}
// Function to preprocess an image using Expo Image Manipulator
function preprocessImage(imageUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const manipulatedImage = yield ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: 1200 } }], // Resize the image
        { format: ImageManipulator.SaveFormat.PNG } // Convert to PNG
        );
        return manipulatedImage.uri; // Return new image path
    });
}
// Function to convert image to Base64 for Google Vision API
function convertImageToBase64(imageUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const base64 = yield FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
        return base64;
    });
}
// Function to extract text from an image using Google Vision API
function extractTextFromImage(apiKey, imageUri) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const imageBase64 = yield convertImageToBase64(imageUri);
            const response = yield axios_1.default.post(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
                requests: [
                    {
                        image: { content: imageBase64 },
                        features: [{ type: "TEXT_DETECTION" }],
                    },
                ],
            });
            const detections = (_a = response.data.responses[0]) === null || _a === void 0 ? void 0 : _a.textAnnotations;
            return (detections === null || detections === void 0 ? void 0 : detections.length) ? (_b = detections[0].description) !== null && _b !== void 0 ? _b : "" : "No text detected";
        }
        catch (error) {
            console.error("Google Vision API Error:", error);
            return "Error processing image";
        }
    });
}
// Function to solve an equation using Gemini AI
function solveEquation(model, equation) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const prompt = `Solve the following math problem and provide step-by-step explanations in plain text (no LaTeX or special formatting):\n\n${equation}`;
        const result = yield model.generateContent(prompt);
        return (_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.response) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.replace(/\$\$?/g, "").replace(/\\boxed{([^}]*)}/g, "$1")) !== null && _c !== void 0 ? _c : "Solution unavailable.";
    });
}
// Function to generate a solution image using react-native-canvas
function generateSolutionImage(canvas, equation, solution) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const base64 = yield canvas.toDataURL("image/png");
        // Save file in Expo's document directory
        const outputPath = FileSystem.documentDirectory + "solution.png";
        yield FileSystem.writeAsStringAsync(outputPath, base64.replace(/^data:image\/png;base64,/, ""), {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log(`Solution image created: ${outputPath}`);
        return outputPath;
    });
}
// Main function to process an image question
function processImageQuestion(imageUri, apiKey, canvas) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Processing image:", imageUri);
            const extractedText = yield extractTextFromImage(apiKey, imageUri);
            console.log("Extracted Text:", extractedText);
            if (extractedText.includes("QTAR")) {
                const equation = extractedText.replace("QTAR", "").trim();
                console.log("Solving equation...");
                const model = createGeminiClient(apiKey);
                const solution = yield solveEquation(model, equation);
                console.log("\nFinal Solution:\n", solution);
                const outputImagePath = yield generateSolutionImage(canvas, equation, solution);
                return { solution, outputImagePath };
            }
            else {
                console.log("No 'QTAR' detected in the image.");
                return { solution: "No equation found", outputImagePath: null };
            }
        }
        catch (error) {
            console.error("Error processing the image:", error);
            throw error;
        }
    });
}
