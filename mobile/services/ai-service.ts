import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface Recommendation {
  title: string;
  type: 'movie' | 'tv';
  reason: string;
}

export const aiService = {
  getRecommendations: async (
    saved: string[],
  ): Promise<Recommendation[]> => {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("EXPO_PUBLIC_GEMINI_API_KEY is missing or is a placeholder.");
      return [];
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é um especialista em cinema e TV. 
      Com base nos seguintes filmes salvos pelo usuário (IDs TMDB): ${saved.join(', ')}

      Sugira 5 filmes ou séries que este usuário provavelmente gostaria.
      Retorne APENAS um array JSON com objetos contendo: title, type (movie ou tv) e reason (motivo curto em português).
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean text to ensure it's valid JSON
      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.error("Error fetching AI recommendations:", error);
      return [];
    }
  }
};
