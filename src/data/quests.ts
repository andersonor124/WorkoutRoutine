import type { CompletedWorkout, Profile } from '../types';

export interface QuestDef {
  id: string;
  title: (target: number) => string;
  emoji: string;
  xp: number;
  target: (p: Profile) => number;
  /** Measure progress from this week's workouts. */
  measure: (week: CompletedWorkout[]) => number;
}

export const QUESTS: QuestDef[] = [
  { id: 'workouts', emoji: '🗡️', xp: 60, title: (t) => `Complete ${t} workouts`, target: (p) => Math.min(3, p.daysPerWeek), measure: (w) => w.length },
  { id: 'squats', emoji: '🦵', xp: 50, title: (t) => `Log ${t} squats`, target: () => 60, measure: (w) => w.reduce((s, h) => s + h.reps.squats, 0) },
  { id: 'pushups', emoji: '💪', xp: 50, title: (t) => `Log ${t} push-ups`, target: (p) => (p.level === 'beginner' ? 30 : 60), measure: (w) => w.reduce((s, h) => s + h.reps.pushups, 0) },
  { id: 'perfect', emoji: '✨', xp: 70, title: (t) => `Finish ${t} workouts with every exercise done`, target: (p) => Math.min(2, p.daysPerWeek), measure: (w) => w.filter((h) => h.exercisesDone >= h.exercisesTotal).length },
  { id: 'xp', emoji: '⚡', xp: 40, title: (t) => `Earn ${t} XP from workouts`, target: (p) => 60 * Math.min(3, p.daysPerWeek), measure: (w) => w.reduce((s, h) => s + h.xpEarned, 0) },
  { id: 'minutes', emoji: '⏱️', xp: 50, title: (t) => `Train for ${t} minutes`, target: (p) => Math.round((p.minutesPerSession * Math.min(3, p.daysPerWeek)) / 10) * 10, measure: (w) => w.reduce((s, h) => s + h.durationMin, 0) },
  { id: 'morning', emoji: '🌅', xp: 40, title: () => 'Work out before 10 am', target: () => 1, measure: (w) => w.filter((h) => h.startedHour < 10).length },
  { id: 'legs', emoji: '🏔️', xp: 40, title: () => 'Survive a leg or full-body day', target: () => 1, measure: (w) => w.filter((h) => ['lower', 'legs', 'full'].includes(h.focus)).length },
];

export const QUEST_MAP: Record<string, QuestDef> = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

/** Pick 3 quests for a week, deterministic per week. */
export function pickQuests(weekStart: string): string[] {
  let seed = 0;
  for (const ch of weekStart) seed = (Math.imul(seed, 31) + ch.charCodeAt(0)) >>> 0;
  const ids = QUESTS.map((q) => q.id);
  const out: string[] = [];
  while (out.length < 3) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const id = ids[(seed >>> 16) % ids.length];
    if (!out.includes(id)) out.push(id);
  }
  return out;
}
