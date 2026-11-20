import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BADGES, newlyUnlocked } from '../data/badges';
import { getExercise } from '../data/exercises';
import { QUEST_MAP, pickQuests } from '../data/quests';
import { FULL_WEEK_BONUS, emptyProgress, levelInfo, nextStreak, weekComplete, weekCompletion, workoutXp } from '../engine/gamification';
import { fromISODate, toISODate, weekStartISO } from '../engine/metrics';
import { generatePlan } from '../engine/planGenerator';
import type { CompletedWorkout, Profile, Progress, QuestState, WeeklyPlan } from '../types';

export type Celebration =
  | { kind: 'levelup'; level: number }
  | { kind: 'badge'; badgeId: string }
  | { kind: 'quest'; questId: string; xp: number }
  | { kind: 'week'; xp: number };

export interface FinishInput {
  dayIndex: number;
  doneIds: string[];
  durationMin: number;
  now?: Date;
}

export interface FinishResult {
  xpEarned: number;
  celebrations: Celebration[];
}

interface State {
  profile: Profile | null;
  /** Body stats on day one, so the avatar can show "before vs now". */
  startProfile: Profile | null;
  plan: WeeklyPlan | null;
  progress: Progress;
  celebrations: Celebration[];
  completeOnboarding: (p: Profile, now?: Date) => void;
  updateProfile: (p: Profile) => void;
  ensureCurrentWeek: (now?: Date) => void;
  finishWorkout: (input: FinishInput) => FinishResult;
  popCelebration: () => void;
  reset: () => void;
}

function questsFor(weekStart: string): { weekStart: string; items: QuestState[] } {
  return { weekStart, items: pickQuests(weekStart).map((id) => ({ id, progress: 0, claimed: false })) };
}

/** Recompute quest progress from history; returns updated items and any newly-completed quests. */
export function evaluateQuests(progress: Progress, profile: Profile) {
  const week = progress.history.filter((h) => weekStartISO(fromISODate(h.date)) === progress.quests.weekStart);
  const completed: { id: string; xp: number }[] = [];
  const items = progress.quests.items.map((q) => {
    const def = QUEST_MAP[q.id];
    const target = def.target(profile);
    const value = def.measure(week);
    const done = value >= target;
    if (done && !q.claimed) completed.push({ id: q.id, xp: def.xp });
    return { ...q, progress: Math.min(value, target), claimed: q.claimed || done };
  });
  return { items, completed };
}

/** Reps logged for tracked stats (push-ups / squats), counted at the low end of the rep range. */
function trackedReps(plan: WeeklyPlan, dayIndex: number, doneIds: string[]) {
  const out = { pushups: 0, squats: 0 };
  for (const pe of plan.days[dayIndex].exercises) {
    if (!doneIds.includes(pe.exerciseId)) continue;
    const ex = getExercise(pe.exerciseId);
    if (!ex.tracks || pe.reps.endsWith('s')) continue;
    out[ex.tracks] += parseInt(pe.reps, 10) * pe.sets;
  }
  return out;
}

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      profile: null,
      startProfile: null,
      plan: null,
      progress: emptyProgress(weekStartISO(new Date())),
      celebrations: [],

      completeOnboarding: (p, now = new Date()) => {
        const weekStart = weekStartISO(now);
        set({
          profile: p,
          startProfile: p,
          plan: generatePlan(p, { weekStart, weekNumber: 1 }),
          progress: { ...emptyProgress(weekStart), startDate: toISODate(now), quests: questsFor(weekStart) },
          celebrations: [],
        });
      },

      updateProfile: (p) => {
        const { plan } = get();
        const weekStart = plan?.weekStart ?? weekStartISO(new Date());
        set({ profile: p, plan: generatePlan(p, { weekStart, weekNumber: plan?.weekNumber ?? 1 }) });
      },

      ensureCurrentWeek: (now = new Date()) => {
        const { plan, profile, progress } = get();
        if (!plan || !profile) return;
        const weekStart = weekStartISO(now);
        if (plan.weekStart === weekStart) return;
        // Progressive overload: level the plan up only if they did ≥80% last week.
        const nextWeek = weekCompletion(progress.history, plan, progress.startDate) >= 0.8 ? plan.weekNumber + 1 : plan.weekNumber;
        set({
          plan: generatePlan(profile, { weekStart, weekNumber: nextWeek }),
          progress: { ...progress, quests: questsFor(weekStart) },
        });
      },

      finishWorkout: ({ dayIndex, doneIds, durationMin, now = new Date() }) => {
        const { plan, profile, progress } = get();
        if (!plan || !profile) return { xpEarned: 0, celebrations: [] };
        const today = toISODate(now);
        const already = progress.history.some((h) => h.dayIndex === dayIndex && weekStartISO(fromISODate(h.date)) === plan.weekStart);
        if (already || doneIds.length === 0) return { xpEarned: 0, celebrations: [] };

        const day = plan.days[dayIndex];
        const xpEarned = workoutXp(plan, dayIndex, doneIds);
        const reps = trackedReps(plan, dayIndex, doneIds);
        const record: CompletedWorkout = {
          date: today,
          dayIndex,
          focus: day.focus,
          exercisesDone: doneIds.length,
          exercisesTotal: day.exercises.length,
          xpEarned,
          durationMin,
          startedHour: new Date(now.getTime() - durationMin * 60_000).getHours(),
          reps,
        };

        const startLevel = levelInfo(progress.xp).level;
        const streak = nextStreak(progress, today, profile);
        let next: Progress = {
          ...progress,
          xp: progress.xp + xpEarned,
          streak,
          bestStreak: Math.max(progress.bestStreak, streak),
          lastWorkoutDate: today,
          history: [...progress.history, record],
          totals: {
            pushups: progress.totals.pushups + reps.pushups,
            squats: progress.totals.squats + reps.squats,
            workouts: progress.totals.workouts + 1,
          },
        };
        const celebrations: Celebration[] = [];

        const isWeekComplete = weekComplete(next.history, plan, progress.startDate);
        if (isWeekComplete) {
          next.xp += FULL_WEEK_BONUS;
          celebrations.push({ kind: 'week', xp: FULL_WEEK_BONUS });
        }

        const q = evaluateQuests(next, profile);
        next = { ...next, quests: { ...next.quests, items: q.items } };
        for (const c of q.completed) {
          next.xp += c.xp;
          celebrations.push({ kind: 'quest', questId: c.id, xp: c.xp });
        }

        const badges = newlyUnlocked({ progress: next, profile, last: record, weekComplete: isWeekComplete });
        if (badges.length) {
          next = { ...next, badges: { ...next.badges, ...Object.fromEntries(badges.map((b) => [b.id, today])) } };
          // Level badges might unlock after quest XP; that's handled because check reads next.xp.
          celebrations.push(...badges.map((b) => ({ kind: 'badge' as const, badgeId: b.id })));
        }

        const endLevel = levelInfo(next.xp).level;
        if (endLevel > startLevel) celebrations.unshift({ kind: 'levelup', level: endLevel });

        set({ progress: next, celebrations: [...get().celebrations, ...celebrations] });
        return { xpEarned, celebrations };
      },

      popCelebration: () => set({ celebrations: get().celebrations.slice(1) }),

      reset: () =>
        set({ profile: null, startProfile: null, plan: null, progress: emptyProgress(weekStartISO(new Date())), celebrations: [] }),
    }),
    {
      name: 'fitquest-v1',
      partialize: (s) => ({ profile: s.profile, startProfile: s.startProfile, plan: s.plan, progress: s.progress }),
    },
  ),
);

export const BADGE_COUNT = BADGES.length;
