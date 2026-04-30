export interface Recommendation {
  title: string;
  type: 'movie' | 'tv';
  reason: string;
}

const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || "";

export const aiService = {
  getRecommendations: async (
    likes: string[],
    saved: string[],
    followingActors: string[],
    continueWatching: string[]
  ): Promise<Recommendation[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [];

    const prompt = `
      Sugira 5 filmes/séries baseados em: ${likes.slice(0, 5).join(', ')}.
      Retorne apenas JSON: [{"title": "...", "type": "movie"|"tv", "reason": "..."}]
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
      console.error("AI Recommendations Error:", error);
      return [];
    }
  },

  searchSmart: async (query: string): Promise<Recommendation[]> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("AI Smart Search: API Key missing.");
      return [];
    }

    console.log("AI Smart Search: Initializing fetch for query:", query);

    const prompt = `
      Atue como um motor de busca inteligente e especialista em entretenimento.
      O usuário buscou por: "${query}"

      SUA MISSÃO:
      1. INTERPRETE A INTENÇÃO: Mesmo que existam erros de digitação (ex: "zunbi" -> "zumbi", "vingadoris" -> "vingadores"), entenda o que o usuário quer.
      2. ENTENDA O CONTEXTO: Se o usuário digitar um nome de ator, diretor, tema, clima ou gênero, sugira as melhores obras relacionadas.
      3. MIX DE CONTEÚDO: Sugira tanto filmes quanto séries que façam sentido para o pedido.
      
      Não se limite a buscas literais. Use sua base de conhecimento para encontrar obras por tema, estilo similar ou clima.
      
      IMPORTANTE: Retorne os títulos em PORTUGUÊS (Brasil) sempre que possível.
      
      Retorne APENAS um array JSON válido:
      [
        { "title": "Título em PT-BR", "type": "movie" ou "tv", "reason": "Motivo curto" }
      ]
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("AI Smart Search: API returned error:", errorData);
        return [];
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.warn("AI Smart Search: No text in AI response.");
        return [];
      }

      console.log("AI Smart Search: AI responded, cleaning JSON...");
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, '').trim();
      
      const parsed = JSON.parse(cleanJson);
      console.log("AI Smart Search: Success! Found", parsed.length, "titles.");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("AI Smart Search: Fetch error:", error);
      return [];
    }
  }
};
