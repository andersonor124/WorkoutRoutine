import { describe, expect, it } from 'vitest';
import { levelInfo, liveStreak, nextStreak, rankTitle, totalXpForLevel, xpToNext } from '../engine/gamification';
import { evolutionStage, shapeAtLevel, startShape, transformation } from '../engine/avatarBody';
import { pickQuests } from '../data/quests';
import { baseProfile } from './fixtures';

describe('levels', () => {
  it('follows 100 * n^1.5 curve', () => {
    expect(xpToNext(1)).toBe(100);
    expect(xpToNext(4)).toBe(800);
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(totalXpForLevel(5)).level).toBe(5);
    expect(rankTitle(12)).toBe('Champion');
  });
});

describe('streaks (Mon/Wed/Fri schedule)', () => {
  const p = { daysPerWeek: 3 };
  it('starts at 1', () => expect(nextStreak({ streak: 0, lastWorkoutDate: null }, '2026-11-16', p)).toBe(1));
  it('continues across rest days', () => {
    // Mon -> Wed (Tue is rest)
    expect(nextStreak({ streak: 1, lastWorkoutDate: '2026-11-16' }, '2026-11-18', p)).toBe(2);
    // Fri -> Mon (weekend is rest)
    expect(nextStreak({ streak: 3, lastWorkoutDate: '2026-11-20' }, '2026-11-23', p)).toBe(4);
  });
  it('resets when a training day is skipped', () => {
    // Mon -> Fri skips Wed
    expect(nextStreak({ streak: 5, lastWorkoutDate: '2026-11-16' }, '2026-11-20', p)).toBe(1);
    expect(liveStreak({ streak: 5, lastWorkoutDate: '2026-11-16' }, '2026-11-19', p)).toBe(0);
    expect(liveStreak({ streak: 5, lastWorkoutDate: '2026-11-16' }, '2026-11-18', p)).toBe(5);
  });
  it('same-day workout does not double count', () => {
    expect(nextStreak({ streak: 2, lastWorkoutDate: '2026-11-16' }, '2026-11-16', p)).toBe(2);
  });
});

describe('avatar transformation', () => {
  it('reflects body size at the start', () => {
    const slim = startShape({ ...baseProfile, weightKg: 55 });
    const heavy = startShape({ ...baseProfile, weightKg: 115 });
    expect(heavy.waist).toBeGreaterThan(slim.waist);
    expect(heavy.belly).toBeGreaterThan(0);
    expect(startShape({ ...baseProfile, heightCm: 195 }).heightScale).toBeGreaterThan(startShape({ ...baseProfile, heightCm: 155 }).heightScale);
  });
  it('morphs toward the goal build as level rises', () => {
    const p = { ...baseProfile, weightKg: 100, build: 'titan' as const };
    const l1 = shapeAtLevel(p, 1);
    const l8 = shapeAtLevel(p, 8);
    const l15 = shapeAtLevel(p, 15);
    expect(l8.shoulder).toBeGreaterThan(l1.shoulder);
    expect(l15.shoulder).toBeGreaterThan(l8.shoulder);
    expect(l15.belly).toBeLessThan(l1.belly);
    expect(l15.definition).toBeGreaterThan(0.8);
    expect(transformation(1)).toBe(0);
    expect(transformation(30)).toBe(1);
    expect(evolutionStage(1)).toBe(1);
    expect(evolutionStage(15)).toBe(5);
  });
});

describe('quests', () => {
  it('picks 3 unique quests per week deterministically', () => {
    const q = pickQuests('2026-11-16');
    expect(new Set(q).size).toBe(3);
    expect(pickQuests('2026-11-16')).toEqual(q);
  });
});
