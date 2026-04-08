export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  year: string;
  genre: string;
  duration?: string;
  rating?: string;
  progress?: number; // 0 to 100
  type: 'movie' | 'series';
  episodeInfo?: string;
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  image: string;
}
