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
  };
}

/** How the goal build bends the body. Deltas are intentionally exaggerated. */
const BUILD_TARGET: Record<BuildId, (s: BodyShape, female: boolean) => Partial<BodyShape>> = {
  titan: (s, f) => ({ shoulder: s.shoulder + (f ? 8 : 12), arm: Math.max(s.arm, 6) + (f ? 4 : 6.5), waist: Math.min(s.waist, 15), hip: Math.min(s.hip, f ? 19 : 17), thigh: Math.max(s.thigh, 8.5) + 4, belly: 0, definition: 0.85 }),
  warrior: (s, f) => ({ shoulder: s.shoulder + (f ? 7 : 10), arm: Math.max(s.arm, 6) + (f ? 3.5 : 5), waist: Math.min(s.waist, 16.5), hip: Math.min(s.hip, f ? 20 : 18), thigh: Math.max(s.thigh, 8.5) + 5.5, belly: 0, definition: 0.65 }),
  ninja: (s, f) => ({ shoulder: s.shoulder + (f ? 3 : 5), arm: 6.5 + (f ? 0.5 : 1.5), waist: f ? 12.5 : 13.5, hip: f ? 18 : 16, thigh: 9, belly: 0, definition: 1 }),
  ranger: (s, f) => ({ shoulder: s.shoulder + (f ? 5 : 7), arm: 7 + (f ? 1 : 2.5), waist: f ? 13 : 14, hip: f ? 18.5 : 16.5, thigh: 11, belly: 0, definition: 0.85 }),
  phoenix: (s, f) => ({ shoulder: s.shoulder + (f ? 2 : 4), arm: 6.5, waist: f ? 12 : 13, hip: f ? 18 : 16, thigh: 8.5, belly: 0, definition: 0.75 }),
  nomad: (s, f) => ({ shoulder: s.shoulder + (f ? 2 : 3), arm: 6, waist: f ? 12.5 : 13.5, hip: f ? 17.5 : 15.5, thigh: 9, belly: 0, definition: 0.6 }),
};

export function targetShape(p: Pick<Profile, 'heightCm' | 'weightKg' | 'sex' | 'build'>): BodyShape {
  const s = startShape(p);
  return { ...s, ...BUILD_TARGET[p.build](s, p.sex === 'female'), glow: 1 };
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
