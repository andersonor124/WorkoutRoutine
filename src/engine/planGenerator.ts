import { BUILDS } from '../data/builds';
import { EXERCISES } from '../data/exercises';
import type { Equipment, Exercise, Focus, MuscleGroup, PlannedExercise, Profile, WeeklyPlan, WorkoutDay } from '../types';
import { bmi, bmiCategory } from './metrics';

const EQUIP_TIER: Record<Equipment, number> = { none: 0, dumbbells: 1, gym: 2 };

/** Which weekdays (0 = Mon) are training days for N days/week. */
export const SCHEDULES: Record<number, number[]> = {
  1: [2],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export const FOCUS_TITLES: Record<Focus, string> = {
  full: 'Full-Body Blitz',
  upper: 'Upper-Body Siege',
  lower: 'Leg Day Legend',
  push: 'Push Power',
  pull: 'Pull Rampage',
  legs: 'Leg Day Legend',
  cardio: 'Cardio Quest',
  core: 'Core Crusher',
  rest: 'Recovery Camp',
};

const SLOTS: Record<Exclude<Focus, 'rest'>, MuscleGroup[]> = {
  full: ['legs', 'chest', 'back', 'glutes', 'shoulders', 'core', 'legs', 'arms', 'back'],
  upper: ['chest', 'back', 'shoulders', 'arms', 'chest', 'back', 'arms', 'core'],
  lower: ['legs', 'glutes', 'legs', 'core', 'legs', 'glutes', 'core'],
  push: ['chest', 'shoulders', 'arms', 'chest', 'shoulders', 'arms', 'core'],
  pull: ['back', 'arms', 'back', 'core', 'back', 'arms', 'core'],
  legs: ['legs', 'glutes', 'legs', 'legs', 'core', 'glutes', 'legs'],
  cardio: ['cardio', 'core', 'cardio', 'legs', 'cardio', 'core', 'cardio'],
  core: ['core', 'core', 'glutes', 'core', 'back', 'core', 'cardio'],
};

export interface GenerateOptions {
  weekStart: string;
  weekNumber?: number;
}

/** Small deterministic PRNG so the same inputs yield the same plan. */
function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10_000) / 10_000;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function focusesFor(profile: Profile): Focus[] {
  const n = Math.max(1, Math.min(7, profile.daysPerWeek));
  const build = BUILDS[profile.build];
  const cardioHeavy = build.cardio >= 3;
  if (n <= 3) {
    if (cardioHeavy && n === 3) return ['full', 'cardio', 'full'];
    return Array(n).fill('full');
  }
  if (n === 4) return cardioHeavy ? ['full', 'cardio', 'full', 'cardio'] : ['upper', 'lower', 'upper', 'lower'];
  const split = [...build.longSplit, 'cardio' as Focus];
  return split.slice(0, n);
}

interface Context {
  profile: Profile;
  maxDifficulty: number;
  avoidImpact: boolean;
  tier: number;
  rand: () => number;
}

function candidates(ctx: Context): Exercise[] {
  return EXERCISES.filter(
    (e) => EQUIP_TIER[e.equipment] <= ctx.tier && e.difficulty <= ctx.maxDifficulty && !(ctx.avoidImpact && e.highImpact),
  );
}

function score(e: Exercise, muscle: MuscleGroup, ctx: Context, used: Set<string>): number {
  if (!e.muscles.includes(muscle)) return -Infinity;
  if (used.has(e.id)) return -Infinity;
  const build = BUILDS[ctx.profile.build];
  let s = 0;
  s += e.muscles[0] === muscle ? 6 : 2;
  // Prefer moves that use the best equipment the user has.
  s += EQUIP_TIER[e.equipment] * 2;
  // Prefer moves near the user's top difficulty.
  s -= Math.abs(ctx.maxDifficulty - e.difficulty) * 1.5;
  if (build.compoundBias && e.compound) s += 3;
  if (!build.compoundBias && (e.timed || e.muscles.includes('cardio'))) s += 1;
  // A bit of variety between weeks/days.
  s += ctx.rand() * 2.5;
  return s;
}

function workSeconds(e: Exercise, repsHigh: number, timedSec: number): number {
  return e.timed || e.muscles[0] === 'cardio' ? timedSec : repsHigh * 3;
}

export function generatePlan(profile: Profile, opts: GenerateOptions): WeeklyPlan {
  const weekNumber = opts.weekNumber ?? 1;
  const build = BUILDS[profile.build];
  const bmiValue = bmi(profile.heightCm, profile.weightKg);
  const cat = bmiCategory(bmiValue);
  const older = profile.age >= 50;

  const maxDifficulty = profile.level === 'beginner' ? 1 : profile.level === 'intermediate' ? 2 : 3;
  const ctx: Context = {
    profile,
    maxDifficulty,
    avoidImpact: cat === 'obese' || older || profile.level === 'beginner' && cat === 'overweight',
    tier: EQUIP_TIER[profile.equipment],
    rand: seeded(hash(`${profile.build}|${profile.equipment}|${weekNumber}|${profile.name}`)),
  };
  const pool = candidates(ctx);
  // Beginners still need something for each muscle — fall back to difficulty 2 where needed.
  const fallbackPool = EXERCISES.filter(
    (e) => EQUIP_TIER[e.equipment] <= ctx.tier && e.difficulty <= Math.max(2, maxDifficulty) && !(ctx.avoidImpact && e.highImpact),
  );

  // ----- volume & progression -----
  const levelSetAdj = profile.level === 'beginner' ? -1 : profile.level === 'advanced' ? 1 : 0;
  const progressionSets = Math.floor((weekNumber - 1) / 3); // +1 set every 3 weeks
  const baseSets = Math.max(2, Math.min(6, build.sets + levelSetAdj + progressionSets));
  const repBump = Math.min(4, weekNumber - 1);
  const [lo, hi] = build.repRange;
  const repsLow = lo + repBump;
  const repsHigh = hi + repBump;
  const timedSec = Math.max(20, build.timedSec + (profile.level === 'beginner' ? -10 : 0) + Math.min(20, (weekNumber - 1) * 5));
  const cardioLevel = Math.max(0, build.cardio - (cat === 'underweight' ? 1 : 0) + (cat === 'obese' || cat === 'overweight' ? 1 : 0));

  const warmupMin = older ? 8 : 5;
  const cooldownMin = 5;
  const budget = Math.max(15, profile.minutesPerSession);

  const trainingDays = SCHEDULES[Math.max(1, Math.min(7, profile.daysPerWeek))];
  const focuses = focusesFor(profile);

  const days: WorkoutDay[] = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const slotIdx = trainingDays.indexOf(dayIndex);
    if (slotIdx === -1) {
      days.push({ dayIndex, focus: 'rest', title: FOCUS_TITLES.rest, warmupMin: 0, cooldownMin: 0, exercises: [], estMinutes: 0 });
      continue;
    }
    const focus = focuses[slotIdx] as Exclude<Focus, 'rest'>;
    let slots = [...SLOTS[focus]];
    // Mix cardio finishers into non-cardio days for cardio-loving builds.
    if (focus !== 'cardio' && cardioLevel >= 2) {
      const extra = cardioLevel - 1;
      for (let i = 0; i < extra; i++) slots.splice(2 + i * 3, 0, 'cardio');
    }

    const used = new Set<string>();
    const exercises: PlannedExercise[] = [];
    let minutes = warmupMin + cooldownMin;

    for (const muscle of slots) {
      const pick = bestFor(muscle, pool, ctx, used) ?? bestFor(muscle, fallbackPool, ctx, used);
      if (!pick) continue;
      const isTimed = pick.timed || pick.muscles[0] === 'cardio';
      const sets = isTimed && focus !== 'cardio' ? Math.max(2, baseSets - 1) : baseSets;
      const exMinutes = (sets * (workSeconds(pick, repsHigh, timedSec) + build.restSec)) / 60;
      if (exercises.length >= 3 && minutes + exMinutes > budget) break;
      minutes += exMinutes;
      used.add(pick.id);
      exercises.push({
        exerciseId: pick.id,
        sets,
        reps: isTimed ? `${timedSec}s` : `${repsLow}-${repsHigh}`,
        restSec: build.restSec,
        xp: pick.difficulty * 10 + sets * 2,
      });
    }

    days.push({
      dayIndex,
      focus,
      title: FOCUS_TITLES[focus],
      warmupMin,
      cooldownMin,
      exercises,
      estMinutes: Math.round(minutes),
    });
  }

  return { weekStart: opts.weekStart, weekNumber, days, tips: buildTips(profile, cat, older) };
}

function bestFor(muscle: MuscleGroup, pool: Exercise[], ctx: Context, used: Set<string>): Exercise | undefined {
  let best: Exercise | undefined;
  let bestScore = -Infinity;
  for (const e of pool) {
    const s = score(e, muscle, ctx, used);
    if (s > bestScore) {
      bestScore = s;
      best = e;
    }
  }
  return bestScore === -Infinity ? undefined : best;
}

function buildTips(profile: Profile, cat: ReturnType<typeof bmiCategory>, older: boolean): string[] {
  const build = BUILDS[profile.build];
  const tips: string[] = [];
  if (cat === 'underweight') tips.push('🍳 Fuel up! Eat a protein-rich snack after each session to help your body grow.');
  if (cat === 'obese' || cat === 'overweight') tips.push('🦶 We swapped jumping moves for low-impact ones to protect your joints. Same XP, less stress!');
  if (older) tips.push('🧘 Extra-long warm-ups are baked in. Move gently until you feel loose.');
  if (profile.level === 'beginner') tips.push('🌱 Form first. If the last reps get sloppy, stop the set there.');
  const byBuild: Record<string, string> = {
    ninja: '🥷 Keep rests short and moves smooth. Flow is your superpower.',
    titan: '🦍 Eat in a slight calorie surplus with plenty of protein to grow.',
    warrior: '⚔️ Rest fully between heavy sets. Strength loves recovery.',
    ranger: '🏹 Move fast on the way up. Power is speed × strength.',
    phoenix: '🔥 A small calorie deficit + these circuits = steady fat loss.',
    nomad: '🧭 Keep cardio at a pace where you could still talk in short sentences.',
  };
  tips.push(byBuild[build.id]);
  tips.push('💧 Drink water and sleep 7–9 hours. That is when the gains happen.');
  return tips;
}
