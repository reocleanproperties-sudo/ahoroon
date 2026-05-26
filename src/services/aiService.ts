export const aiService = {
  async generateProductDescription(productName: string, category: string) {
    if (!productName) return '';
    
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, category }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description");
      }
      
      return data.description.trim() || '';
    } catch (error) {
      console.warn('AI description generation failed (using local graceful fallback):', error);
      
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
