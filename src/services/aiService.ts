import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface Recommendation {
  title: string;
  type: 'movie' | 'tv';
  reason: string;
}

export const aiService = {
  getRecommendations: async (
    likes: string[],
    saved: string[],
    followingActors: string[],
    continueWatching: string[]
  ): Promise<Recommendation[]> => {
    // Create a new instance right before the call to ensure the latest key is used
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing.");
      return [];
    }

    const ai = new GoogleGenAI({ apiKey });

    // Limit data to prevent token limit issues
    const limitedLikes = likes.slice(0, 15);
    const limitedSaved = saved.slice(0, 15);
    const limitedActors = followingActors.slice(0, 10);
    const limitedContinue = continueWatching.slice(0, 5);

    const prompt = `
      Você é um especialista em cinema e TV. 
      Com base nos seguintes dados do usuário:
      - Filmes curtidos (IDs TMDB): ${limitedLikes.join(', ')}
      - Filmes salvos (IDs TMDB): ${limitedSaved.join(', ')}
      - Atores seguidos (IDs TMDB): ${limitedActors.join(', ')}
      - Assistindo agora (IDs TMDB): ${limitedContinue.join(', ')}

      Sugira 10 filmes ou séries que este usuário provavelmente gostaria.
      Para cada sugestão, forneça o título, o tipo (movie ou tv) e um motivo curto (máximo 15 palavras).
      Retorne APENAS um array JSON válido.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["movie", "tv"] },
                reason: { type: Type.STRING }
              },
              required: ["title", "type", "reason"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);
    } catch (error: any) {
      console.error("Error fetching AI recommendations:", error);
      throw error;
    }
  }
};
