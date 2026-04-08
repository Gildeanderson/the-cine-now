import { Movie, CastMember } from './types';

export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Neon Drift',
    description: 'In a decaying metropolis where memories are traded as currency, a rogue data hunter discovers a fractured sequence that could rewrite the history of the last standing city.',
    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1000',
    year: '2024',
    genre: 'Sci-Fi Thriller',
    duration: '2h 45m',
    rating: '4.9',
    type: 'movie'
  },
  {
    id: '2',
    title: 'The Last Frontier',
    description: 'A deep space exploration mission goes wrong.',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
    year: '2024',
    genre: 'Sci-Fi',
    progress: 65,
    type: 'series',
    episodeInfo: 'S2 : E4 • 15m remaining'
  },
  {
    id: '3',
    title: 'Midnight Jazz',
    description: 'The story of a jazz musician in the 1950s.',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=1000',
    year: '2023',
    genre: 'Drama',
    progress: 25,
    type: 'movie',
    episodeInfo: 'Movie • 1h 42m left'
  },
  {
    id: '4',
    title: 'Echo Chamber',
    description: 'A psychological thriller about a man trapped in his own mind.',
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    year: '2024',
    genre: 'Thriller',
    type: 'movie'
  },
  {
    id: '5',
    title: 'Elder\'s Grace',
    description: 'An epic fantasy journey.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
    year: '2023',
    genre: 'Fantasy',
    type: 'movie'
  },
  {
    id: '6',
    title: 'Horizonte Gelado',
    description: 'Survival in the frozen mountains.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    year: '2024',
    genre: 'Adventure',
    type: 'movie'
  }
];

export const CAST: CastMember[] = [
  {
    id: '1',
    name: 'Julian Vane',
    role: 'The Hunter',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '2',
    name: 'Elena Kloss',
    role: 'Memory Weaver',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  }
];
