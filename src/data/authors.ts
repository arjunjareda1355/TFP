import { Author } from '../types';

export const AUTHORS: Record<string, Author> = {
  editorial: {
    id: 'editorial-team',
    name: 'The Folded Page Editorial Board',
    role: 'Editorial Staff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    bio: 'A collective of writers, visual researchers, and cultural anthropologists seeking out what is truly worth knowing.',
    location: 'London & Kyoto',
    twitter: '@thefoldedpage'
  },
  elena: {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    role: 'Senior Cultural Critic',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
    bio: 'Investigates internet subcultures, digital philosophy, and modern cognitive rituals.',
    location: 'Vienna',
    twitter: '@elena_rostova'
  },
  julian: {
    id: 'julian-vane',
    name: 'Julian Vane',
    role: 'Architecture & Design Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    bio: 'Writes about spatial psychology, acoustic design, and contemporary craft movements.',
    location: 'Copenhagen',
    twitter: '@julianvane'
  },
  amara: {
    id: 'amara-chen',
    name: 'Amara Chen',
    role: 'Technology & AI Correspondent',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
    bio: 'Covering human-centered AI, bio-engineering discoveries, and decentralized knowledge networks.',
    location: 'Taipei',
    twitter: '@amarachen_tech'
  },
  marcus: {
    id: 'marcus-lindqvist',
    name: 'Marcus Lindqvist',
    role: 'Special Projects & Natural Sciences',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
    bio: 'Explorer and naturalist tracking rare ecosystems, deep-sea research, and alpine botany.',
    location: 'Stockholm',
    twitter: '@lindqvist_m'
  }
};
