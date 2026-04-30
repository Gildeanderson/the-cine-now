export interface Recommendation {
  title: string;
  type: 'movie' | 'tv';
  reason: string;
}

const getApiKey = () => process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export const aiService = {
  getRecommendations: async (
    saved: string[],
  ): Promise<Recommendation[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [];

    const prompt = `
      Com base nos filmes salvos: ${saved.join(', ')}
      Sugira 5 filmes/séries.
      Retorne APENAS JSON: [{"title": "...", "type": "movie"|"tv", "reason": "..."}]
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return [];

      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Mobile AI Recommendations Error:", error);
      return [];
    }
  },

  searchSmart: async (query: string): Promise<Recommendation[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [];

    const prompt = `
      Atue como assistente inteligente de busca de cinema/TV.
      Busca do usuário: "${query}"

      1. Corrija erros de digitação mentalmente.
      2. Entenda se o usuário quer filmes, séries ou um tema específico.
      3. Sugira 5 títulos excelentes que correspondam à intenção.
      
      Retorne APENAS JSON: [{"title": "Título em PT-BR", "type": "movie"|"tv", "reason": "Motivo"}]
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return [];

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Mobile Smart Search Error:", error);
      return [];
    }
  }
};
