import { describe, expect, it } from 'vitest';
import { addDaysISO, bmi, bmiCategory, bmr, cmToFtIn, ftInToCm, weekStartISO } from '../engine/metrics';

describe('metrics', () => {
  it('computes BMI and category', () => {
    expect(bmi(180, 81)).toBe(25);
    expect(bmiCategory(17)).toBe('underweight');
    expect(bmiCategory(22)).toBe('healthy');
    expect(bmiCategory(27)).toBe('overweight');
    expect(bmiCategory(32)).toBe('obese');
  });
  it('computes BMR with Mifflin-St Jeor', () => {
    expect(bmr({ heightCm: 180, weightKg: 80, age: 30, sex: 'male' })).toBe(1780);
  });
  it('converts units', () => {
    expect(cmToFtIn(180)).toEqual({ ft: 5, inch: 11 });
    expect(ftInToCm(6, 0)).toBe(183);
  });
  it('finds Monday as week start', () => {
    expect(weekStartISO(new Date(2026, 10, 20))).toBe('2026-11-16'); // Friday -> Monday
    expect(weekStartISO(new Date(2026, 10, 22))).toBe('2026-11-16'); // Sunday
    expect(addDaysISO('2026-11-30', 1)).toBe('2026-12-01');
  });
});
