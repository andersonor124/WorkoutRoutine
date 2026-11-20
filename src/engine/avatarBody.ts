import type { BuildId, Profile } from '../types';
import { bmi } from './metrics';

/**
 * Body proportions (in SVG units) used to draw the avatar.
 * The avatar starts as a cartoon of the user's real body (height, BMI, sex)
 * and morphs toward an *exaggerated* version of their goal build as they level up,
 * so progress is easy to see and feels rewarding.
 */
export interface BodyShape {
  heightScale: number;
  shoulder: number; // half-width at shoulders
  waist: number; // half-width at waist
  hip: number; // half-width at hips
  arm: number; // arm thickness
  thigh: number; // leg thickness
  belly: number; // forward/side bulge of the belly
  definition: number; // 0..1 muscle lines
  glow: number; // 0..1 aura strength
  neck: number; // neck width (thick for power builds)
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function startShape(p: Pick<Profile, 'heightCm' | 'weightKg' | 'sex'>): BodyShape {
  const b = bmi(p.heightCm, p.weightKg);
  // -0.4 (very slim) … 1 (very heavy). Slightly exaggerated so the user recognises themselves.
  const f = clamp((b - 22) / 11, -0.4, 1);
  const male = p.sex === 'male';
  const female = p.sex === 'female';
  return {
    heightScale: clamp(p.heightCm / 175, 0.86, 1.1),
    shoulder: 21 + (male ? 3 : 0) + f * 4,
    waist: 15 + (female ? -1 : 0) + f * 9,
    hip: 17 + (female ? 3 : 0) + f * 6,
    arm: 6 + f * 3,
    thigh: 8.5 + f * 4,
    belly: Math.max(0, f) * 9,
    definition: 0,
    glow: 0,
    neck: 12 + Math.max(0, f) * 2,
  };
}

type Archetype = Omit<BodyShape, 'heightScale' | 'glow'>;

/**
 * Fixed goal body for each class (male proportions), deliberately exaggerated so
 * every class has an unmistakable silhouette for every user.
 */
export const ARCHETYPES: Record<BuildId, Archetype> = {
  titan: { shoulder: 38, waist: 15.5, hip: 17, arm: 13, thigh: 13, belly: 0, definition: 0.9, neck: 16 }, // huge V-taper
  warrior: { shoulder: 34, waist: 21, hip: 21, arm: 11.5, thigh: 15, belly: 3, definition: 0.45, neck: 17 }, // thick & blocky
  ranger: { shoulder: 31, waist: 15, hip: 17, arm: 9.5, thigh: 12.5, belly: 0, definition: 0.85, neck: 13 }, // athletic
  ninja: { shoulder: 28, waist: 13, hip: 15, arm: 8, thigh: 9.5, belly: 0, definition: 1, neck: 12 }, // lean & shredded
  phoenix: { shoulder: 25.5, waist: 12, hip: 17, arm: 6.8, thigh: 9.5, belly: 0, definition: 0.7, neck: 11.5 }, // slim & toned
  nomad: { shoulder: 22.5, waist: 12.5, hip: 14, arm: 5.2, thigh: 7.5, belly: 0, definition: 0.55, neck: 11 }, // wiry runner
};

export function targetShape(p: Pick<Profile, 'heightCm' | 'weightKg' | 'sex' | 'build'>): BodyShape {
  const s = startShape(p);
  const a = ARCHETYPES[p.build];
  const female = p.sex === 'female';
  return {
    ...a,
    shoulder: female ? a.shoulder * 0.85 : a.shoulder,
    arm: female ? a.arm * 0.85 : a.arm,
    neck: female ? a.neck * 0.85 : a.neck,
    hip: female ? a.hip + 3 : a.hip,
    waist: female ? a.waist - 1 : a.waist,
    heightScale: s.heightScale,
    glow: 1,
  };
}

/** Progress 0..1 toward the goal body. Eased so early levels already show visible change. */
export function transformation(level: number, maxLevel = 15): number {
  const p = clamp((level - 1) / (maxLevel - 1), 0, 1);
  return 1 - Math.pow(1 - p, 1.7);
}

/** 1..5 — unlocks gear (headband, wristbands, aura, crown). */
export function evolutionStage(level: number): number {
  if (level >= 15) return 5;
  if (level >= 10) return 4;
  if (level >= 6) return 3;
  if (level >= 3) return 2;
  return 1;
}

export function shapeAtLevel(p: Pick<Profile, 'heightCm' | 'weightKg' | 'sex' | 'build'>, level: number): BodyShape {
  const a = startShape(p);
  const b = targetShape(p);
  const t = transformation(level);
  const out = {} as BodyShape;
  (Object.keys(a) as (keyof BodyShape)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
}
