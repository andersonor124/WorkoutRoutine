import type { CompletedWorkout, Profile, Progress } from '../types';
import { levelInfo } from '../engine/gamification';

export interface BadgeCtx {
  progress: Progress;
  profile: Profile;
  last?: CompletedWorkout;
  weekComplete: boolean;
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (c: BadgeCtx) => boolean;
}

const lvl = (c: BadgeCtx) => levelInfo(c.progress.xp).level;

export const BADGES: BadgeDef[] = [
  { id: 'first-workout', name: 'First Step', emoji: '👟', description: 'Finish your very first workout.', check: (c) => c.progress.totals.workouts >= 1 },
  { id: 'streak-3', name: 'On Fire', emoji: '🔥', description: 'Reach a 3-workout streak.', check: (c) => c.progress.streak >= 3 },
  { id: 'streak-7', name: 'Unstoppable', emoji: '🚂', description: 'Reach a 7-workout streak.', check: (c) => c.progress.streak >= 7 },
  { id: 'streak-30', name: 'Iron Will', emoji: '🛡️', description: 'Reach a 30-workout streak.', check: (c) => c.progress.streak >= 30 },
  { id: 'week-warrior', name: 'Week Warrior', emoji: '🗓️', description: 'Complete every workout in a week.', check: (c) => c.weekComplete },
  { id: 'perfect', name: 'Flawless', emoji: '✨', description: 'Finish every exercise in a workout.', check: (c) => !!c.last && c.last.exercisesDone >= c.last.exercisesTotal },
  { id: 'leg-day', name: 'Leg Day Legend', emoji: '🦵', description: 'Complete 3 leg-focused workouts.', check: (c) => c.progress.history.filter((h) => ['lower', 'legs'].includes(h.focus)).length >= 3 },
  { id: 'early-bird', name: 'Early Bird', emoji: '🐦', description: 'Start a workout before 8 am.', check: (c) => !!c.last && c.last.startedHour < 8 },
  { id: 'night-owl', name: 'Night Owl', emoji: '🦉', description: 'Start a workout after 9 pm.', check: (c) => !!c.last && c.last.startedHour >= 21 },
  { id: 'century-pushups', name: 'Century Club', emoji: '💯', description: 'Log 100 total push-ups.', check: (c) => c.progress.totals.pushups >= 100 },
  { id: 'squat-500', name: 'Squat Squad', emoji: '🏰', description: 'Log 500 total squats.', check: (c) => c.progress.totals.squats >= 500 },
  { id: 'ten-workouts', name: 'Dedicated', emoji: '🎯', description: 'Complete 10 workouts.', check: (c) => c.progress.totals.workouts >= 10 },
  { id: 'fifty-workouts', name: 'Lifer', emoji: '🏅', description: 'Complete 50 workouts.', check: (c) => c.progress.totals.workouts >= 50 },
  { id: 'level-5', name: 'Apprentice', emoji: '⭐', description: 'Reach level 5.', check: (c) => lvl(c) >= 5 },
  { id: 'level-10', name: 'Champion', emoji: '🌟', description: 'Reach level 10.', check: (c) => lvl(c) >= 10 },
  { id: 'level-20', name: 'Legend', emoji: '👑', description: 'Reach level 20.', check: (c) => lvl(c) >= 20 },
];

export function newlyUnlocked(c: BadgeCtx): BadgeDef[] {
  return BADGES.filter((b) => !c.progress.badges[b.id] && b.check(c));
}
