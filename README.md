# FitQuest 🏋️⚔️

A gamified weekly workout planner. Tell it your height, weight, age, fitness level, schedule and equipment, pick the **build** you want, and FitQuest generates a personalized weekly routine. Then it turns training into a game.

## Features
- **Personalized weekly plan**: adapts to BMI, age, sex, fitness level, days/week, minutes per session and equipment (bodyweight / dumbbells / gym). Low-impact swaps for higher BMI or 50+ users, and progressive overload each week you complete ≥80% of your workouts.
- **6 builds (classes)**: 🥷 Ninja (lean), 🦍 Titan (bulk), ⚔️ Warrior (strength), 🏹 Ranger (athletic), 🔥 Phoenix (fat loss), 🧭 Nomad (endurance).
- **Avatar that looks like you and transforms**: starts with your real proportions (height, BMI, sex), then morphs toward an exaggerated version of your goal build as you level up. Includes Day 1 vs Now vs Goal comparison and gear unlocks (headband, power pose, aura, crown).
- **XP, levels, streaks**: XP per exercise + completion bonuses. Rest days never break your streak.
- **Badges** and **weekly quests** with bonus XP, plus celebrations with confetti.
- All data is stored on-device (localStorage). No account needed.

## Getting started
👉 **New here? Follow the step-by-step guide: [HOW_TO_RUN.md](HOW_TO_RUN.md)**

```bash
npm install
npm run dev      # start the app
npm test         # run unit tests
npm run build    # type-check + production build
```

## Project layout
- `src/engine/`: pure logic: `planGenerator.ts`, `gamification.ts`, `avatarBody.ts`, `metrics.ts`
- `src/data/`: exercise library, builds, badges, quests
- `src/store/useAppStore.ts`: persisted Zustand store
- `src/pages/`, `src/components/`: React UI

> FitQuest provides general fitness guidance, not medical advice.
