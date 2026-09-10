import { MagazineIssue } from '../types';

export const MAGAZINE_ISSUES: MagazineIssue[] = [
  {
    id: 'issue-01',
    number: 'ISSUE 01',
    title: 'The Beginning',
    theme: 'Origin Stories, Tactility, and First Principles',
    date: 'Spring 2026',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    description: 'Our inaugural print and digital issue celebrating the tangible world, deliberate curiosity, and the art of unhurried discovery in an over-accelerated age.',
    curatorNote: 'We set out to create a publication that treats the readers attention as a sacred reservoir. In Issue 01, we examine physical workshops, ancient sourdough genetics, and the return of handmade machinery.',
    featuredStorySlugs: [
      'the-internets-new-obsession-isnt-what-you-think',
      'why-everyone-is-suddenly-talking-about-this-tiny-place',
      'the-last-watchmaker-who-still-hand-cuts-every-gear',
      'the-300-year-old-sourdough-starter-hidden-in-a-basque-monastery'
    ]
  },
  {
    id: 'issue-02',
    number: 'ISSUE 02',
    title: 'The Internet Issue',
    theme: 'Subcultures, Digital Solitude, and Post-Algorithmic Spaces',
    date: 'Summer 2026',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    description: 'An expansive investigation into the human desire for quiet digital sanctuaries, decentralized personal wikis, and the strange folklore of niche online subcultures.',
    curatorNote: 'As the algorithmic monoculture tightens, the most fascinating human ideas are moving underground into password-protected message boards and bespoke personal archives.',
    featuredStorySlugs: [
      'the-anthropology-of-digital-solitude',
      'the-quiet-architects-of-ambient-intelligence',
      'the-acoustic-camera-that-makes-echoes-visible',
      'the-geometry-of-rest-scandinavian-sanctuaries'
    ]
  },
  {
    id: 'issue-03',
    number: 'ISSUE 03',
    title: 'The Things We Love',
    theme: 'Singular Craft, Rare Objects, and Enduring Beauty',
    date: 'Autumn 2026',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    description: 'A tribute to singular devotions: master botanists, century-old loom masters, forgotten film soundstages, and the things that refuse to become disposable.',
    curatorNote: 'What makes an object or an idea worth preserving across centuries? We travel from Kyoto loom mills to Swiss mountaintops to ask those who dedicate their lives to a single craft.',
    featuredStorySlugs: [
      'the-return-of-hand-loomed-japanese-denim',
      'the-lost-1974-soundstage-recording',
      'the-octogenarian-botanical-painter',
      'the-fog-draped-tea-valleys-of-alishan'
    ]
  },
  {
    id: 'issue-04',
    number: 'ISSUE 04',
    title: 'The Solitude Project',
    theme: 'Subterranean Vaults, Arctic Silences, and Slow Attention',
    date: 'Winter 2026',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    description: 'Exploring the planets quietest latitudes, deep ocean trenches, and the psychological necessity of uninterrupted contemplation.',
    curatorNote: 'In our most cinematic edition yet, we document spaces where human voices fall silent and deep-time geological processes take precedence.',
    featuredStorySlugs: [
      'the-secret-underground-seed-vault',
      'the-deep-ocean-bioluminescent-forests',
      'the-art-of-slow-attention-status-symbol',
      'the-hidden-monastery-archives-of-mount-athos'
    ]
  }
];
