import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const aiService = {
  async generateProductDescription(productName: string, category: string) {
    if (!productName) return '';
    
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a short, compelling product description in Bengali (বাংলা) for a product named "${productName}" in the category "${category}". The description should be engaging and suitable for an e-commerce store. Keep it professional and concise (under 200 words).`,
      });
      
      return response.text?.trim() || '';
    } catch (error) {
      console.warn('Gemini description generation failed (using local graceful fallback):', error);
      
      // Beautiful local Bengali description generator fallback
      const templates = [
        `আমাদের এই ${productName} সম্পূর্ণ খাঁটি ও প্রাকৃতিকভাবে সংগৃহীত। এটি নিশ্চিত করে চমৎকার গুণমান ও অনন্য স্বাদ, যা আপনার পছন্দের তালিকায় যোগ করবে এক নতুন মাত্রা। ঐতিহ্যবাহী ও স্বাস্থ্যসম্মত উপায়ে এটি প্রস্তুত করা হয়েছে।`,
        `আহরোণ-এর বিশেষ কন্ট্রিবিউশন ${productName}। বিশুদ্ধতা ও মানের দিক থেকে এটি শতভাগ নির্ভরযোগ্য। প্রতিদিনের সুস্বাদু ও পুষ্টিকর খাদ্য তালিকায় এটি সংযুক্ত করতে পারেন নিশ্চিন্তে।`,
        `এটি মূলত ${category ? `আমাদের ${category}` : 'দেশীয় ঐতিহ্যবাহী'} ক্যাটাগরির অন্যতম একটি সেরা পরিবেশনা। স্বাস্থ্যসচেতন মানুষের জন্য ${productName} একটি উপযুক্ত পছন্দ। কোনো প্রকার কৃত্রিম রং বা ক্ষতিকর প্রিজারভেটিভ ছাড়াই এটি আপনার কাছে পৌঁছে দেওয়া হচ্ছে।`
      ];
      
      const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
      return selectedTemplate;
    }
  }
};
