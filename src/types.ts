export type Sex = 'male' | 'female' | 'other';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbells' | 'gym';
export type BuildId = 'ninja' | 'titan' | 'warrior' | 'ranger' | 'phoenix' | 'nomad';
export type Units = 'metric' | 'imperial';

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'glutes' | 'core' | 'cardio' | 'fullbody';

/** What kind of session a day is. */
export type Focus = 'full' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'cardio' | 'core' | 'rest';

export interface AvatarLook {
  skin: string;
  hair: string;
  outfit: string;
  hairStyle: 'short' | 'long' | 'bun' | 'ponytail' | 'bald';
  /** Optional for profiles saved before these options existed. */
  top?: 'tank' | 'crop';
  shorts?: string;
}

export interface Profile {
  name: string;
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  level: FitnessLevel;
  daysPerWeek: number; // 2..6
  minutesPerSession: number; // 15..90
  equipment: Equipment;
  build: BuildId;
  avatar: AvatarLook;
  units: Units;
}

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  muscles: MuscleGroup[];
  /** Minimum equipment tier required. none < dumbbells < gym */
  equipment: Equipment;
  difficulty: 1 | 2 | 3;
  /** Jumping / high joint-impact movement. */
  highImpact?: boolean;
  /** Compound multi-joint lift (strength builds favour these). */
  compound?: boolean;
  /** Timed instead of counted reps. */
  timed?: boolean;
  /** Counts toward this tracked stat (e.g. push-ups for quests/badges). */
  tracks?: 'pushups' | 'squats';
  cue: string;
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  /** Rep target, e.g. "10-12", or seconds for timed moves like "30s". */
  reps: string;
  restSec: number;
  xp: number;
}

export interface WorkoutDay {
  dayIndex: number; // 0 = Monday
  focus: Focus;
  title: string;
  warmupMin: number;
  cooldownMin: number;
  exercises: PlannedExercise[];
  estMinutes: number;
}

export interface WeeklyPlan {
  weekStart: string; // ISO date (Monday)
  weekNumber: number; // 1-based, used for progressive overload
  days: WorkoutDay[];
  tips: string[];
}

export interface CompletedWorkout {
  date: string; // ISO date yyyy-mm-dd
  dayIndex: number;
  focus: Focus;
  exercisesDone: number;
  exercisesTotal: number;
  xpEarned: number;
  durationMin: number;
  startedHour: number;
  reps: { pushups: number; squats: number };
}

export interface QuestState {
  id: string;
  progress: number;
  claimed: boolean;
}

export interface Progress {
  /** ISO date the user joined; days before it never count as missed. */
  startDate?: string;
  xp: number;
  streak: number;
  bestStreak: number;
  lastWorkoutDate: string | null;
  history: CompletedWorkout[];
  badges: Record<string, string>; // badgeId -> unlocked ISO date
  quests: { weekStart: string; items: QuestState[] };
  totals: { pushups: number; squats: number; workouts: number };
}
