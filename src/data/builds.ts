import type { BuildId, Focus } from '../types';

export interface BuildDef {
  id: BuildId;
  className: string;
  title: string;
  emoji: string;
  tagline: string;
  color: string; // tailwind-friendly hex for accents
  sets: number;
  repRange: [number, number];
  restSec: number;
  /** Seconds of work for timed moves. */
  timedSec: number;
  /** 0..3 how much cardio to mix in. */
  cardio: number;
  /** Prefer compound lifts. */
  compoundBias: boolean;
  /** Splits for 5–6 training days (cycled). */
  longSplit: Focus[];
}

export const BUILDS: Record<BuildId, BuildDef> = {
  ninja: {
    id: 'ninja', className: 'The Ninja', title: 'Lean & Toned', emoji: '🥷',
    tagline: 'Quick, defined and agile. Higher reps, full-body flow.',
    color: '#22d3ee', sets: 3, repRange: [12, 15], restSec: 45, timedSec: 40, cardio: 2, compoundBias: false,
    longSplit: ['upper', 'lower', 'core', 'upper', 'lower', 'cardio'],
  },
  titan: {
    id: 'titan', className: 'The Titan', title: 'Muscular / Bulk', emoji: '🦍',
    tagline: 'Pack on size. Classic hypertrophy splits.',
    color: '#f97316', sets: 4, repRange: [8, 12], restSec: 75, timedSec: 45, cardio: 0, compoundBias: true,
    longSplit: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
  },
  warrior: {
    id: 'warrior', className: 'The Warrior', title: 'Strong / Powerlifter', emoji: '⚔️',
    tagline: 'Raw strength. Heavy compound lifts, low reps.',
    color: '#ef4444', sets: 5, repRange: [3, 6], restSec: 120, timedSec: 45, cardio: 0, compoundBias: true,
    longSplit: ['lower', 'upper', 'core', 'lower', 'upper', 'full'],
  },
  ranger: {
    id: 'ranger', className: 'The Ranger', title: 'Athletic', emoji: '🏹',
    tagline: 'Power, speed and conditioning for any sport.',
    color: '#84cc16', sets: 3, repRange: [8, 10], restSec: 60, timedSec: 30, cardio: 2, compoundBias: true,
    longSplit: ['full', 'cardio', 'upper', 'lower', 'cardio', 'full'],
  },
  phoenix: {
    id: 'phoenix', className: 'The Phoenix', title: 'Fat Loss / Shred', emoji: '🔥',
    tagline: 'Burn it down and rise lean. Circuits and HIIT.',
    color: '#f43f5e', sets: 3, repRange: [15, 20], restSec: 30, timedSec: 40, cardio: 3, compoundBias: false,
    longSplit: ['full', 'cardio', 'full', 'cardio', 'full', 'cardio'],
  },
  nomad: {
    id: 'nomad', className: 'The Nomad', title: 'Endurance', emoji: '🧭',
    tagline: 'Go the distance. Cardio and muscular endurance.',
    color: '#a78bfa', sets: 2, repRange: [15, 20], restSec: 30, timedSec: 60, cardio: 3, compoundBias: false,
    longSplit: ['cardio', 'full', 'cardio', 'core', 'cardio', 'full'],
  },
};

export const BUILD_LIST = Object.values(BUILDS);
