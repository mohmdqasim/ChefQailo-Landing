
import { GoogleGenAI } from "@google/genai";

// Always initialize GoogleGenAI inside the function to ensure the latest API key is used
// and follow the strict named parameter requirement { apiKey: process.env.API_KEY }.
export const chatWithChef = async (message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: "You are Chef Qailo, an expert AI personal chef. You are friendly, helpful, and provide high-quality culinary advice, recipe ideas, and kitchen tips.",
      },
    });
    return response.text || "I'm sorry, I couldn't cook up a response right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Chef is currently taking a break. Please try again in a moment.";
  }
};

export const analyzeFoodImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Analyze this food image. Provide: 1. Name of the dish 2. Estimated calories 3. Key ingredients. Format as a brief professional summary." }
        ]
      },
    });
    return response.text || "I couldn't recognize this dish.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error analyzing the image.";
  }
};
