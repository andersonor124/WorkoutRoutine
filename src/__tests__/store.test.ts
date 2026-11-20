import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { baseProfile } from './fixtures';

const monday = new Date(2026, 10, 16, 7, 30);

describe('store flow', () => {
  beforeEach(() => useAppStore.getState().reset());

  it('onboards, completes a workout and awards XP, streak, badges', () => {
    const s = useAppStore.getState();
    s.completeOnboarding(baseProfile, monday);
    const plan = useAppStore.getState().plan!;
    expect(plan.weekStart).toBe('2026-11-16');
    expect(useAppStore.getState().progress.quests.items).toHaveLength(3);

    const ids = plan.days[0].exercises.map((e) => e.exerciseId);
    const res = useAppStore.getState().finishWorkout({ dayIndex: 0, doneIds: ids, durationMin: 30, now: monday });
    expect(res.xpEarned).toBeGreaterThan(0);
    const p = useAppStore.getState().progress;
    expect(p.streak).toBe(1);
    expect(p.totals.workouts).toBe(1);
    expect(p.badges['first-workout']).toBeDefined();
    expect(p.badges['perfect']).toBeDefined();
    expect(p.badges['early-bird']).toBeDefined();

    // Can't farm XP by repeating the same day.
    const again = useAppStore.getState().finishWorkout({ dayIndex: 0, doneIds: ids, durationMin: 30, now: monday });
    expect(again.xpEarned).toBe(0);
  });

  it('awards full-week bonus and rolls to next week with overload', () => {
    useAppStore.getState().completeOnboarding(baseProfile, monday);
    const plan = useAppStore.getState().plan!;
    plan.days.forEach((d) => {
      if (d.focus === 'rest') return;
      const date = new Date(2026, 10, 16 + d.dayIndex, 18);
      useAppStore.getState().finishWorkout({ dayIndex: d.dayIndex, doneIds: d.exercises.map((e) => e.exerciseId), durationMin: 40, now: date });
    });
    const p = useAppStore.getState().progress;
    expect(p.badges['week-warrior']).toBeDefined();
    expect(p.streak).toBe(3);
    useAppStore.getState().ensureCurrentWeek(new Date(2026, 10, 23));
    expect(useAppStore.getState().plan!.weekNumber).toBe(2);
    expect(useAppStore.getState().plan!.weekStart).toBe('2026-11-23');
  });
});

describe('joining mid-week', () => {
  beforeEach(() => useAppStore.getState().reset());
  const friday = new Date(2026, 10, 20, 18); // Fri 2026-11-20

  it('does not count days before signup and can still earn the full-week bonus', () => {
    // 4 days/week schedule: Mon, Tue, Thu, Fri. Joining Friday leaves only Friday.
    useAppStore.getState().completeOnboarding({ ...baseProfile, daysPerWeek: 4 }, friday);
    expect(useAppStore.getState().progress.startDate).toBe('2026-11-20');
    const plan = useAppStore.getState().plan!;
    const fri = plan.days[4];
    expect(fri.focus).not.toBe('rest');
    const res = useAppStore.getState().finishWorkout({ dayIndex: 4, doneIds: fri.exercises.map((e) => e.exerciseId), durationMin: 30, now: friday });
    expect(res.celebrations.some((c) => c.kind === 'week')).toBe(true);
    expect(useAppStore.getState().progress.badges['week-warrior']).toBeDefined();
    // ...so the plan gets harder next week.
    useAppStore.getState().ensureCurrentWeek(new Date(2026, 10, 23));
    expect(useAppStore.getState().plan!.weekNumber).toBe(2);
  });
});
