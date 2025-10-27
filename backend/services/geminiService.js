import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const processMultimodalInput = async ({ mode, message, imageUrl, audioUrl }) => {
  try {
    let input;

    if (mode === "text") {
      input = [message];
    } else if (mode === "image") {
      const image = fs.readFileSync(imageUrl);
      input = [
        message || "Describe this image",
        { inlineData: { data: image.toString("base64"), mimeType: "image/jpeg" } }
      ];
    } else if (mode === "audio") {
      const audio = fs.readFileSync(audioUrl);
      input = [
        message || "Analyze this audio",
        { inlineData: { data: audio.toString("base64"), mimeType: "audio/wav" } }
      ];
    }

    const result = await model.generateContent(input);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.error("Gemini error:", error);
    return " Error processing your input.";
  }
};
