import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini with User-Agent telemetry headers
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const geminiService = {
  async getRecommendations(allProducts: Product[], userHistory?: string[]): Promise<string[]> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const productContext = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description?.substring(0, 50) + "..."
      }));

      const prompt = `Based on the following products available in our store and the user's view history, recommend 4 most relevant product IDs for this user.
      
      User history (ids viewed): ${userHistory?.join(", ") || "None (new user)"}
      
      Available products:
      ${JSON.stringify(productContext, null, 2)}
      
      Return ONLY a JSON array of the 4 recommended product IDs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const result = JSON.parse(response.text || "[]");
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn("Gemini recommendation failed (using random product fallbacks smoothly):", error);
      // Fallback: random 4 products if AI fails or quota is exhausted
      return allProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(p => p.id);
    }
  }
};
