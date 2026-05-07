import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export const aiService = {
  async generateProductDescription(productName: string, category: string) {
    if (!productName) return '';
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a short, compelling product description in Bengali (বাংলা) for a product named "${productName}" in the category "${category}". The description should be engaging and suitable for an e-commerce store. Keep it professional and concise (under 200 words).`,
      });
      
      return response.text || '';
    } catch (error) {
      console.error('Error generating description:', error);
      throw error;
    }
  }
};
