import { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'trending',
    name: 'Trending',
    slug: 'trending',
    tagline: "What everyone's talking about right now.",
    description: 'Viral phenomena, breakout ideas, emergent cultural waves, and the conversations reshaping the world today.',
    accentColor: '#C2410C', // Terracotta
    iconName: 'Flame',
  },
  {
    id: 'popular',
    name: 'Popular',
    slug: 'popular',
    tagline: 'Stories capturing broad attention across fields.',
    description: 'The most-read, most-shared, and most impactful dispatches on people, places, and movements.',
    accentColor: '#B45309', // Amber
    iconName: 'TrendingUp',
  },
  {
    id: 'unique',
    name: 'Unique',
    slug: 'unique',
    tagline: "Things you probably haven't seen before.",
    description: 'Curious anomalies, unusual inventions, hidden subcultures, rare artifacts, and strange occurrences.',
    accentColor: '#0F766E', // Teal
    iconName: 'Sparkles',
  },
  {
    id: 'special',
    name: 'Special',
    slug: 'special',
    tagline: 'People, places and ideas worth remembering.',
    description: 'Slow, cinematic portraits of extraordinary individuals, enduring craft, historical moments, and philosophical insights.',
    accentColor: '#4338CA', // Indigo
    iconName: 'Bookmark',
  },
  {
    id: 'culture',
    name: 'Culture',
    slug: 'culture',
    tagline: 'The rituals, artifacts, and shifts defining contemporary life.',
    description: 'Exploring how we gather, create, express, and interpret our collective human moment.',
    accentColor: '#BE185D', // Pink/Rose
    iconName: 'Globe',
  },
  {
    id: 'technology',
    name: 'Technology',
    slug: 'technology',
    tagline: 'The tools, machines, and algorithms altering reality.',
    description: 'From ambient computing and generative biology to the ethics of artificial minds.',
    accentColor: '#1D4ED8', // Blue
    iconName: 'Cpu',
  },
  {
    id: 'places',
    name: 'Places',
    slug: 'places',
    tagline: 'Geographies of quiet wonder and unexpected beauty.',
    description: 'Remote valleys, architectural marvels, hidden corners, and forgotten sanctuaries.',
    accentColor: '#15803D', // Green
    iconName: 'Compass',
  },
  {
    id: 'design',
    name: 'Design',
    slug: 'design',
    tagline: 'Form, function, and intentional aesthetics.',
    description: 'The physical and visual structures that quiet the mind and elevate everyday life.',
    accentColor: '#7C2D12', // Warm Brown
    iconName: 'Layers',
  },
  {
    id: 'science',
    name: 'Science',
    slug: 'science',
    tagline: 'The frontier of discovery, from deep ocean trenches to cosmic quiet.',
    description: 'Rigorous investigations into how the universe works and what remains unexplained.',
    accentColor: '#0369A1', // Sky
    iconName: 'Atom',
  },
  {
    id: 'food',
    name: 'Food',
    slug: 'food',
    tagline: 'Ancient techniques, heirloom seeds, and culinary alchemy.',
    description: 'The stories behind the flavors that anchor communities and preserve living heritage.',
    accentColor: '#9A3412', // Rust
    iconName: 'Coffee',
  },
  {
    id: 'ideas',
    name: 'Ideas',
    slug: 'ideas',
    tagline: 'Mental models and essays for a clearer outlook.',
    description: 'Philosophical considerations, cognitive frameworks, and perspectives on living well.',
    accentColor: '#4C1D95', // Deep Purple
    iconName: 'Lightbulb',
  },
  {
    id: 'people',
    name: 'People',
    slug: 'people',
    tagline: 'Portraits of remarkable creators, thinkers, and explorers.',
    description: 'Individuals whose quiet persistence and singular visions change their worlds.',
    accentColor: '#374151', // Slate
    iconName: 'User',
  }
];
