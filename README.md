# 📦 b3th-math-solver

> **b3th-math-solver** is an AI-powered image-based math tutor that solves or evaluates handwritten or printed math problems directly from images using Google Cloud Vision OCR and Google Gemini (Generative AI).

![npm](https://img.shields.io/npm/v/b3th-math-solver)
![license](https://img.shields.io/npm/l/b3th-math-solver)
![downloads](https://img.shields.io/npm/dw/b3th-math-solver)

---

## ✨ Features

- 🔍 OCR text extraction from math problem images using Google Vision API
- 🤖 Step-by-step math problem solving with Gemini AI (`QTAR` mode)
- ✅ Feedback and correction for student work using AI (`CTAR` mode)
- 🖼️ Generates annotated solution images using canvas
- 🛠️ Works with Node.js or React Native/Expo environments

---

## 📦 Installation

```bash
npm install b3th-math-solver
```

or with Yarn:

```bash
yarn install b3th-math-solver
```

---

## 🚀 Quick Start

### Solve a Math Problem from an Image

```ts
import { processImageQuestion } from "b3th-math-solver";
import Canvas from "react-native-canvas"; // or @napi-rs/canvas in Node.js

const imagePath = "path/to/your/image.png";
const apiKey = "your_google_vision_api_key";
const canvas = new Canvas();

const result = await processImageQuestion(imagePath, apiKey, canvas);
console.log(result.solution); // Human-readable steps
console.log(result.outputImagePath); // Path to the generated image
```

---

## 🧠 Supported Modes

### `QTAR` - **Question to Answer Resolver**

Write `QTAR` in the image to indicate a math question to solve.

**Example image text:**

```
QTAR x^2 + 5x + 6 = 0
```

Returns a **step-by-step** solution.

---

### `CTAR` - **Check the Answer Review**

Write `CTAR` in the image to indicate student work that needs evaluation.

**Example image text:**

```
CTAR
x^2 + 5x + 6 = 0
Student: I factored and found x = -2, x = -3
```

Returns a feedback image with annotations on correctness and improvement suggestions.

---

## 🧪 API Reference

```ts
processImageQuestion(imagePath: string, apiKey: string, canvas: Canvas): Promise<{
  solution: string;
  outputImagePath: string | null;
}>
```

- **`imagePath`**: Path to your image file (local path or URI)
- **`apiKey`**: Google Cloud Vision API key
- **`canvas`**: `react-native-canvas` instance (for mobile) or `@napi-rs/canvas` (for Node.js)

---

## 🧰 Built With

- [@google-cloud/vision](https://www.npmjs.com/package/@google-cloud/vision)
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- [sharp](https://www.npmjs.com/package/sharp)
- [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/image-manipulator/)
- [@napi-rs/canvas](https://www.npmjs.com/package/@napi-rs/canvas)
- [react-native-canvas](https://www.npmjs.com/package/react-native-canvas)

---

## 📝 Example Output

```json
{
  "solution": "To solve x^2 + 5x + 6 = 0...\n1. Factor the quadratic...\n2. Set each factor equal to 0...\n3. Solve for x.",
  "outputImagePath": "/your/path/x_solution.png"
}
```

---

## 🛡️ License

Licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## 👨‍💻 Author

Developed by [Bethvour Chke](mailto:bethvourc@gmail.com)

For issues, suggestions, or contributions, please open an issue or PR on the [GitHub repo](https://github.com/bethvourc/b3th-math-solver).

---

## 💡 Future Plans

- Support multiple equations in one image
- Add web interface demo
- Expand to word problems using Gemini reasoning
- Add LaTeX rendering for solutions
