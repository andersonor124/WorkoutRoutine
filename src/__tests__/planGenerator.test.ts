import { describe, expect, it } from 'vitest';
import { BUILD_LIST } from '../data/builds';
import { getExercise } from '../data/exercises';
import { generatePlan } from '../engine/planGenerator';
import type { Equipment, FitnessLevel } from '../types';
import { baseProfile } from './fixtures';

const TIER = { none: 0, dumbbells: 1, gym: 2 };
const weekStart = '2026-11-16';

describe('generatePlan', () => {
  for (const build of BUILD_LIST) {
    for (const equipment of ['none', 'dumbbells', 'gym'] as Equipment[]) {
      for (const daysPerWeek of [2, 3, 4, 5, 6]) {
        for (const level of ['beginner', 'advanced'] as FitnessLevel[]) {
          it(`${build.id} / ${equipment} / ${daysPerWeek}d / ${level}`, () => {
            const p = { ...baseProfile, build: build.id, equipment, daysPerWeek, level };
            const plan = generatePlan(p, { weekStart });
            expect(plan.days).toHaveLength(7);
            const training = plan.days.filter((d) => d.focus !== 'rest');
            expect(training).toHaveLength(daysPerWeek);
            for (const d of training) {
              expect(d.exercises.length).toBeGreaterThanOrEqual(3);
              expect(new Set(d.exercises.map((e) => e.exerciseId)).size).toBe(d.exercises.length);
              for (const pe of d.exercises) {
                const ex = getExercise(pe.exerciseId);
                expect(TIER[ex.equipment]).toBeLessThanOrEqual(TIER[equipment]);
                expect(pe.sets).toBeGreaterThanOrEqual(2);
              }
            }
          });
        }
      }
    }
  }

  it('respects the time budget once 3+ exercises are planned', () => {
    for (const minutesPerSession of [20, 30, 45, 60, 90]) {
      const plan = generatePlan({ ...baseProfile, minutesPerSession, build: 'titan', equipment: 'gym' }, { weekStart });
      for (const d of plan.days.filter((d) => d.exercises.length > 3)) {
        expect(d.estMinutes).toBeLessThanOrEqual(minutesPerSession);
      }
    }
  });

  it('removes high-impact moves for higher BMI and older users', () => {
    for (const p of [
      { ...baseProfile, weightKg: 110, build: 'phoenix' as const },
      { ...baseProfile, age: 60, build: 'ranger' as const, level: 'advanced' as const },
    ]) {
      const plan = generatePlan(p, { weekStart });
      const ids = plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
      expect(ids.some((id) => getExercise(id).highImpact)).toBe(false);
    }
  });

  it('gives different builds different training styles', () => {
    const titan = generatePlan({ ...baseProfile, build: 'titan', equipment: 'gym' }, { weekStart });
    const phoenix = generatePlan({ ...baseProfile, build: 'phoenix', equipment: 'gym' }, { weekStart });
    expect(titan.days[0].exercises[0].sets).toBeGreaterThan(phoenix.days[0].exercises[0].sets);
    expect(titan.days[0].exercises[0].restSec).toBeGreaterThan(phoenix.days[0].exercises[0].restSec);
  });

  it('applies progressive overload in later weeks', () => {
    const w1 = generatePlan(baseProfile, { weekStart, weekNumber: 1 });
    const w4 = generatePlan(baseProfile, { weekStart, weekNumber: 4 });
    const reps = (r: string) => parseInt(r.split('-').pop()!, 10);
    const firstReps = (plan: typeof w1) => plan.days.find((d) => d.exercises.length)!.exercises.find((e) => !e.reps.endsWith('s'))!;
    expect(reps(firstReps(w4).reps)).toBeGreaterThan(reps(firstReps(w1).reps));
  });

  it('is deterministic', () => {
    expect(generatePlan(baseProfile, { weekStart })).toEqual(generatePlan(baseProfile, { weekStart }));
  });
});
