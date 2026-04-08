const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API Key is missing. Please add EXPO_PUBLIC_TMDB_API_KEY to your .env file in the mobile directory.');
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
    ...params
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TMDB API error: ${response.status} ${response.statusText} ${errorData.status_message || ''}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching from TMDB');
  }
}

export const tmdbService = {
  getTrending: () => fetchTMDB('/trending/movie/day'),
  getTrendingTV: () => fetchTMDB('/trending/tv/day'),
  getNowPlaying: () => fetchTMDB('/movie/now_playing'),
  getPopular: () => fetchTMDB('/movie/popular'),
  getPopularTV: () => fetchTMDB('/tv/popular'),
  getMovieDetails: (id: string, language: string = 'pt-BR') => fetchTMDB(`/movie/${id}`, { append_to_response: 'credits,similar,videos', language }),
  getTVDetails: (id: string, language: string = 'pt-BR') => fetchTMDB(`/tv/${id}`, { append_to_response: 'credits,similar,videos', language }),
  getMovieVideos: (id: string) => fetchTMDB(`/movie/${id}/videos`),
  getTVVideos: (id: string) => fetchTMDB(`/tv/${id}/videos`),
  searchMovies: (query: string) => fetchTMDB('/search/movie', { query }),
  searchTV: (query: string) => fetchTMDB('/search/tv', { query }),
  searchMulti: (query: string) => fetchTMDB('/search/multi', { query }),
  getGenres: () => fetchTMDB('/genre/movie/list'),
  getTVGenres: () => fetchTMDB('/genre/tv/list'),
  getMoviesByGenre: (genreId: number) => fetchTMDB('/discover/movie', { with_genres: genreId.toString() }),
  getTVByGenre: (genreId: number) => fetchTMDB('/discover/tv', { with_genres: genreId.toString() }),
  getPersonDetails: (id: string) => fetchTMDB(`/person/${id}`, { append_to_response: 'combined_credits,images' }),
  getPersonCredits: (id: string) => fetchTMDB(`/person/${id}/combined_credits`),
};
