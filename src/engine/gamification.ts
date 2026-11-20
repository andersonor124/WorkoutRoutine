import type { CompletedWorkout, Profile, Progress, WeeklyPlan } from '../types';
import { addDaysISO, daysBetween, fromISODate, weekdayIndex, weekStartISO } from './metrics';
import { SCHEDULES } from './planGenerator';

// ---------- Levels ----------
/** XP needed to go from level n to n+1. */
export const xpToNext = (level: number) => Math.round(100 * Math.pow(level, 1.5));

/** Total XP needed to *reach* a level (level 1 = 0 XP). */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToNext(l);
  return total;
}

export function levelInfo(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  const needed = xpToNext(level);
  return { level, current: remaining, needed, pct: remaining / needed };
}

export function rankTitle(level: number): string {
  if (level >= 20) return 'Legend';
  if (level >= 15) return 'Master';
  if (level >= 10) return 'Champion';
  if (level >= 5) return 'Apprentice';
  return 'Rookie';
}

// ---------- Streaks ----------
export function isTrainingDay(profile: Pick<Profile, 'daysPerWeek'>, iso: string): boolean {
  return SCHEDULES[profile.daysPerWeek]?.includes(weekdayIndex(fromISODate(iso))) ?? false;
}

/**
 * Streak counts completed workouts in a row. Rest days never break it —
 * only skipping a *scheduled* training day does.
 */
export function nextStreak(prev: Pick<Progress, 'streak' | 'lastWorkoutDate'>, todayIso: string, profile: Pick<Profile, 'daysPerWeek'>): number {
  if (!prev.lastWorkoutDate) return 1;
  const gap = daysBetween(prev.lastWorkoutDate, todayIso);
  if (gap <= 0) return Math.max(1, prev.streak); // already trained today
  for (let i = 1; i < gap; i++) {
    if (isTrainingDay(profile, addDaysISO(prev.lastWorkoutDate, i))) return 1;
  }
  return prev.streak + 1;
}

/** Streak as shown on screen today: drops to 0 if a training day was missed. */
export function liveStreak(progress: Pick<Progress, 'streak' | 'lastWorkoutDate'>, todayIso: string, profile: Pick<Profile, 'daysPerWeek'>): number {
  if (!progress.lastWorkoutDate) return 0;
  const gap = daysBetween(progress.lastWorkoutDate, todayIso);
  for (let i = 1; i < gap; i++) {
    if (isTrainingDay(profile, addDaysISO(progress.lastWorkoutDate, i))) return 0;
  }
  return progress.streak;
}

// ---------- XP for a workout ----------
export const WORKOUT_COMPLETE_BONUS = 25;
export const FULL_WEEK_BONUS = 100;

export function workoutXp(plan: WeeklyPlan, dayIndex: number, doneIds: string[]): number {
  const day = plan.days[dayIndex];
  const base = day.exercises.filter((e) => doneIds.includes(e.exerciseId)).reduce((s, e) => s + e.xp, 0);
  const allDone = day.exercises.length > 0 && doneIds.length >= day.exercises.length;
  return base + (allDone ? WORKOUT_COMPLETE_BONUS : 0);
}

/** True if every training day of this week has a recorded workout. */
export function weekComplete(history: CompletedWorkout[], plan: WeeklyPlan): boolean {
  const trainingDays = plan.days.filter((d) => d.focus !== 'rest').map((d) => d.dayIndex);
  const done = new Set(history.filter((h) => weekStartISO(fromISODate(h.date)) === plan.weekStart).map((h) => h.dayIndex));
  return trainingDays.length > 0 && trainingDays.every((d) => done.has(d));
}

/** Share of last week's training days that were completed (0..1). */
export function weekCompletion(history: CompletedWorkout[], plan: WeeklyPlan): number {
  const trainingDays = plan.days.filter((d) => d.focus !== 'rest').map((d) => d.dayIndex);
  if (!trainingDays.length) return 0;
  const done = new Set(history.filter((h) => weekStartISO(fromISODate(h.date)) === plan.weekStart).map((h) => h.dayIndex));
  return trainingDays.filter((d) => done.has(d)).length / trainingDays.length;
}

export function emptyProgress(weekStart: string): Progress {
  return {
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastWorkoutDate: null,
    history: [],
    badges: {},
    quests: { weekStart, items: [] },
    totals: { pushups: 0, squats: 0, workouts: 0 },
  };
}
