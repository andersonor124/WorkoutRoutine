import type { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // ---------- Chest / push (bodyweight) ----------
  { id: 'knee-pushup', name: 'Knee Push-ups', emoji: '🙇', muscles: ['chest', 'arms'], equipment: 'none', difficulty: 1, tracks: 'pushups', cue: 'Knees down, body straight from knees to head, chest to the floor.' },
  { id: 'incline-pushup', name: 'Incline Push-ups', emoji: '🪑', muscles: ['chest', 'arms', 'shoulders'], equipment: 'none', difficulty: 1, tracks: 'pushups', cue: 'Hands on a bench or couch. Lower your chest to the edge.' },
  { id: 'pushup', name: 'Push-ups', emoji: '💪', muscles: ['chest', 'arms', 'shoulders'], equipment: 'none', difficulty: 2, compound: true, tracks: 'pushups', cue: 'Hands under shoulders, squeeze glutes, elbows at 45°.' },
  { id: 'diamond-pushup', name: 'Diamond Push-ups', emoji: '💎', muscles: ['arms', 'chest'], equipment: 'none', difficulty: 3, tracks: 'pushups', cue: 'Hands together in a diamond under your chest. Elbows tight.' },
  { id: 'pike-pushup', name: 'Pike Push-ups', emoji: '🔺', muscles: ['shoulders', 'arms'], equipment: 'none', difficulty: 2, cue: 'Hips high in an upside-down V. Lower your head toward the floor.' },
  { id: 'chair-dip', name: 'Chair Dips', emoji: '🪑', muscles: ['arms', 'chest'], equipment: 'none', difficulty: 2, cue: 'Hands on chair edge, lower until elbows reach 90°.' },
  // ---------- Back / pull (bodyweight) ----------
  { id: 'superman', name: 'Superman Hold', emoji: '🦸', muscles: ['back', 'glutes'], equipment: 'none', difficulty: 1, timed: true, cue: 'Lie face down, lift arms and legs, squeeze your back.' },
  { id: 'reverse-snow-angel', name: 'Reverse Snow Angels', emoji: '👼', muscles: ['back', 'shoulders'], equipment: 'none', difficulty: 1, cue: 'Face down, sweep arms from hips to overhead with chest lifted.' },
  { id: 'towel-row', name: 'Door Towel Rows', emoji: '🚪', muscles: ['back', 'arms'], equipment: 'none', difficulty: 2, compound: true, cue: 'Loop a towel around a sturdy door handle, lean back and row.' },
  { id: 'table-row', name: 'Table Inverted Rows', emoji: '🛋️', muscles: ['back', 'arms'], equipment: 'none', difficulty: 3, compound: true, cue: 'Under a sturdy table, pull your chest up to the edge.' },
  // ---------- Legs (bodyweight) ----------
  { id: 'chair-squat', name: 'Sit-to-Stand Squats', emoji: '🪑', muscles: ['legs', 'glutes'], equipment: 'none', difficulty: 1, tracks: 'squats', cue: 'Sit back to a chair, tap lightly and stand tall.' },
  { id: 'squat', name: 'Bodyweight Squats', emoji: '🦵', muscles: ['legs', 'glutes'], equipment: 'none', difficulty: 1, compound: true, tracks: 'squats', cue: 'Feet shoulder-width, hips back, chest proud.' },
  { id: 'reverse-lunge', name: 'Reverse Lunges', emoji: '🚶', muscles: ['legs', 'glutes'], equipment: 'none', difficulty: 2, compound: true, cue: 'Step back, both knees to 90°, drive through the front heel.' },
  { id: 'glute-bridge', name: 'Glute Bridges', emoji: '🌉', muscles: ['glutes', 'legs'], equipment: 'none', difficulty: 1, cue: 'Feet flat, drive hips up and squeeze at the top.' },
  { id: 'wall-sit', name: 'Wall Sit', emoji: '🧱', muscles: ['legs'], equipment: 'none', difficulty: 1, timed: true, cue: 'Back against wall, thighs parallel to the floor.' },
  { id: 'bulgarian-split', name: 'Bulgarian Split Squats', emoji: '🇧🇬', muscles: ['legs', 'glutes'], equipment: 'none', difficulty: 3, compound: true, cue: 'Rear foot on a bench, drop straight down.' },
  { id: 'jump-squat', name: 'Jump Squats', emoji: '🐸', muscles: ['legs', 'cardio'], equipment: 'none', difficulty: 2, highImpact: true, tracks: 'squats', cue: 'Squat down, explode up, land softly.' },
  { id: 'calf-raise', name: 'Calf Raises', emoji: '🦶', muscles: ['legs'], equipment: 'none', difficulty: 1, cue: 'Rise onto your toes, pause, lower slowly.' },
  // ---------- Core ----------
  { id: 'plank', name: 'Plank', emoji: '🪵', muscles: ['core'], equipment: 'none', difficulty: 1, timed: true, cue: 'Forearms down, body in one straight line. Breathe.' },
  { id: 'dead-bug', name: 'Dead Bugs', emoji: '🪲', muscles: ['core'], equipment: 'none', difficulty: 1, cue: 'Lower back pressed down, extend opposite arm and leg.' },
  { id: 'bicycle-crunch', name: 'Bicycle Crunches', emoji: '🚲', muscles: ['core'], equipment: 'none', difficulty: 2, cue: 'Elbow to opposite knee, slow and controlled.' },
  { id: 'side-plank', name: 'Side Plank', emoji: '📐', muscles: ['core'], equipment: 'none', difficulty: 2, timed: true, cue: 'Stack your feet, lift hips high. Switch sides halfway.' },
  { id: 'leg-raise', name: 'Lying Leg Raises', emoji: '🦿', muscles: ['core'], equipment: 'none', difficulty: 2, cue: 'Lower back flat, raise straight legs to vertical.' },
  { id: 'hollow-hold', name: 'Hollow Body Hold', emoji: '🍌', muscles: ['core'], equipment: 'none', difficulty: 3, timed: true, cue: 'Arms overhead, shoulders and legs off the floor.' },
  // ---------- Cardio (bodyweight) ----------
  { id: 'march', name: 'High-Knee March', emoji: '🥁', muscles: ['cardio'], equipment: 'none', difficulty: 1, timed: true, cue: 'March in place driving knees up, pump your arms.' },
  { id: 'step-jack', name: 'Step Jacks', emoji: '⭐', muscles: ['cardio'], equipment: 'none', difficulty: 1, timed: true, cue: 'Step side to side while raising your arms overhead.' },
  { id: 'brisk-walk', name: 'Brisk Walk', emoji: '🚶‍♂️', muscles: ['cardio'], equipment: 'none', difficulty: 1, timed: true, cue: 'Walk fast enough that talking is a little hard.' },
  { id: 'jumping-jack', name: 'Jumping Jacks', emoji: '🤸', muscles: ['cardio', 'fullbody'], equipment: 'none', difficulty: 1, highImpact: true, timed: true, cue: 'Light on your feet, full arm swing.' },
  { id: 'mountain-climber', name: 'Mountain Climbers', emoji: '⛰️', muscles: ['cardio', 'core'], equipment: 'none', difficulty: 2, timed: true, cue: 'Plank position, drive knees to chest quickly.' },
  { id: 'high-knees', name: 'High Knees', emoji: '🏃', muscles: ['cardio'], equipment: 'none', difficulty: 2, highImpact: true, timed: true, cue: 'Run in place, knees to hip height.' },
  { id: 'skater', name: 'Skater Hops', emoji: '⛸️', muscles: ['cardio', 'legs'], equipment: 'none', difficulty: 2, highImpact: true, timed: true, cue: 'Leap side to side, land on one foot.' },
  { id: 'burpee', name: 'Burpees', emoji: '💥', muscles: ['cardio', 'fullbody'], equipment: 'none', difficulty: 3, highImpact: true, compound: true, cue: 'Squat, kick back, push-up, jump. Repeat!' },
  { id: 'shadow-box', name: 'Shadow Boxing', emoji: '🥊', muscles: ['cardio', 'shoulders'], equipment: 'none', difficulty: 1, timed: true, cue: 'Jab, cross, hook. Stay on your toes.' },

  // ---------- Dumbbells ----------
  { id: 'db-press', name: 'Dumbbell Floor/Bench Press', emoji: '🏋️', muscles: ['chest', 'arms'], equipment: 'dumbbells', difficulty: 2, compound: true, cue: 'Lower with control to chest level, press up.' },
  { id: 'db-fly', name: 'Dumbbell Flyes', emoji: '🦅', muscles: ['chest'], equipment: 'dumbbells', difficulty: 2, cue: 'Soft elbows, open wide, hug a tree on the way up.' },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', emoji: '🙌', muscles: ['shoulders', 'arms'], equipment: 'dumbbells', difficulty: 2, compound: true, cue: 'Press overhead, ribs down, no arching.' },
  { id: 'db-lateral', name: 'Lateral Raises', emoji: '🕊️', muscles: ['shoulders'], equipment: 'dumbbells', difficulty: 1, cue: 'Raise to shoulder height, pinkies slightly up.' },
  { id: 'db-row', name: 'One-Arm Dumbbell Row', emoji: '🚣', muscles: ['back', 'arms'], equipment: 'dumbbells', difficulty: 1, compound: true, cue: 'Flat back, pull elbow to your hip.' },
  { id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', emoji: '🧲', muscles: ['legs', 'glutes', 'back'], equipment: 'dumbbells', difficulty: 2, compound: true, cue: 'Hinge at hips, weights slide down thighs, flat back.' },
  { id: 'goblet-squat', name: 'Goblet Squats', emoji: '🏆', muscles: ['legs', 'glutes'], equipment: 'dumbbells', difficulty: 1, compound: true, tracks: 'squats', cue: 'Hold a dumbbell at your chest, sit down between your heels.' },
  { id: 'db-lunge', name: 'Dumbbell Walking Lunges', emoji: '🚶‍♀️', muscles: ['legs', 'glutes'], equipment: 'dumbbells', difficulty: 2, compound: true, cue: 'Long steps, back knee kisses the floor.' },
  { id: 'db-curl', name: 'Biceps Curls', emoji: '💪', muscles: ['arms'], equipment: 'dumbbells', difficulty: 1, cue: 'Elbows pinned, curl up, lower slowly.' },
  { id: 'db-tricep-ext', name: 'Overhead Triceps Extension', emoji: '🔧', muscles: ['arms'], equipment: 'dumbbells', difficulty: 1, cue: 'Elbows point forward, lower behind head.' },
  { id: 'db-thruster', name: 'Dumbbell Thrusters', emoji: '🚀', muscles: ['fullbody', 'cardio'], equipment: 'dumbbells', difficulty: 3, compound: true, cue: 'Front squat into an overhead press in one motion.' },
  { id: 'db-swing', name: 'Dumbbell Swings', emoji: '🔔', muscles: ['glutes', 'cardio'], equipment: 'dumbbells', difficulty: 2, compound: true, cue: 'Hinge and snap hips forward. Arms just guide.' },
  { id: 'db-renegade', name: 'Renegade Rows', emoji: '🏴‍☠️', muscles: ['back', 'core'], equipment: 'dumbbells', difficulty: 3, compound: true, cue: 'Plank on dumbbells, row one side at a time without twisting.' },
  { id: 'db-russian-twist', name: 'Weighted Russian Twists', emoji: '🌀', muscles: ['core'], equipment: 'dumbbells', difficulty: 2, cue: 'Lean back, rotate the weight side to side.' },

  // ---------- Gym ----------
  { id: 'bb-squat', name: 'Barbell Back Squat', emoji: '🏋️‍♂️', muscles: ['legs', 'glutes'], equipment: 'gym', difficulty: 3, compound: true, tracks: 'squats', cue: 'Bar on upper back, brace, break at hips and knees.' },
  { id: 'deadlift', name: 'Barbell Deadlift', emoji: '🪨', muscles: ['back', 'legs', 'glutes'], equipment: 'gym', difficulty: 3, compound: true, cue: 'Bar over mid-foot, flat back, push the floor away.' },
  { id: 'bench-press', name: 'Barbell Bench Press', emoji: '🛏️', muscles: ['chest', 'arms', 'shoulders'], equipment: 'gym', difficulty: 2, compound: true, cue: 'Shoulder blades pinched, bar to lower chest.' },
  { id: 'ohp', name: 'Overhead Press', emoji: '⬆️', muscles: ['shoulders', 'arms'], equipment: 'gym', difficulty: 3, compound: true, cue: 'Squeeze glutes, press bar straight up past your face.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', emoji: '⬇️', muscles: ['back', 'arms'], equipment: 'gym', difficulty: 1, compound: true, cue: 'Pull bar to upper chest, elbows down and back.' },
  { id: 'pullup', name: 'Pull-ups (assisted ok)', emoji: '🧗', muscles: ['back', 'arms'], equipment: 'gym', difficulty: 3, compound: true, cue: 'Full hang, pull chin over the bar.' },
  { id: 'cable-row', name: 'Seated Cable Row', emoji: '🚣‍♀️', muscles: ['back'], equipment: 'gym', difficulty: 1, compound: true, cue: 'Tall chest, pull handle to your belly.' },
  { id: 'leg-press', name: 'Leg Press', emoji: '🦵', muscles: ['legs', 'glutes'], equipment: 'gym', difficulty: 1, compound: true, tracks: 'squats', cue: 'Feet mid-platform, lower until knees hit 90°.' },
  { id: 'leg-curl', name: 'Leg Curl Machine', emoji: '🔄', muscles: ['legs'], equipment: 'gym', difficulty: 1, cue: 'Curl heels toward glutes, slow return.' },
  { id: 'hip-thrust', name: 'Barbell Hip Thrust', emoji: '🍑', muscles: ['glutes'], equipment: 'gym', difficulty: 2, compound: true, cue: 'Upper back on bench, drive hips to the ceiling.' },
  { id: 'cable-fly', name: 'Cable Crossover', emoji: '✖️', muscles: ['chest'], equipment: 'gym', difficulty: 2, cue: 'Step forward, bring handles together in a hug.' },
  { id: 'tricep-pushdown', name: 'Triceps Pushdown', emoji: '👇', muscles: ['arms'], equipment: 'gym', difficulty: 1, cue: 'Elbows glued to your sides, push the rope down.' },
  { id: 'cable-crunch', name: 'Cable Crunch', emoji: '🙏', muscles: ['core'], equipment: 'gym', difficulty: 2, cue: 'Kneel, crunch your ribs toward your hips.' },
  { id: 'rower', name: 'Rowing Machine', emoji: '🛶', muscles: ['cardio', 'back'], equipment: 'gym', difficulty: 2, timed: true, cue: 'Legs, then body, then arms. Reverse on the way back.' },
  { id: 'bike', name: 'Stationary Bike', emoji: '🚴', muscles: ['cardio', 'legs'], equipment: 'gym', difficulty: 1, timed: true, cue: 'Steady cadence, resistance you can feel.' },
  { id: 'treadmill-incline', name: 'Incline Treadmill Walk', emoji: '⛰️', muscles: ['cardio'], equipment: 'gym', difficulty: 1, timed: true, cue: 'Hands off the rails, steady incline walk.' },
];

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise {
  const e = EXERCISE_MAP[id];
  if (!e) throw new Error(`Unknown exercise ${id}`);
  return e;
}
