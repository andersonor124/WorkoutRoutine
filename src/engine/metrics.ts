import type { Profile, Sex } from '../types';

export function bmi(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obese';

export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'healthy';
  if (value < 30) return 'overweight';
  return 'obese';
}

/** Basal metabolic rate (Mifflin–St Jeor). */
export function bmr(p: Pick<Profile, 'heightCm' | 'weightKg' | 'age' | 'sex'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  const offset: Record<Sex, number> = { male: 5, female: -161, other: -78 };
  return Math.round(base + offset[p.sex]);
}

/** Rough daily calorie estimate given training days per week. */
export function dailyCalories(p: Pick<Profile, 'heightCm' | 'weightKg' | 'age' | 'sex' | 'daysPerWeek'>): number {
  const factor = p.daysPerWeek <= 2 ? 1.375 : p.daysPerWeek <= 4 ? 1.55 : 1.725;
  return Math.round(bmr(p) * factor);
}

// ---------- units ----------
export const cmToFtIn = (cm: number) => {
  const totalIn = Math.round(cm / 2.54);
  return { ft: Math.floor(totalIn / 12), inch: totalIn % 12 };
};
export const ftInToCm = (ft: number, inch: number) => Math.round((ft * 12 + inch) * 2.54);
export const kgToLb = (kg: number) => Math.round(kg * 2.20462);
export const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;

// ---------- dates ----------
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday = 0 … Sunday = 6 */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function weekStartISO(d: Date): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - weekdayIndex(copy));
  return toISODate(copy);
}

export function addDaysISO(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(aIso: string, bIso: string): number {
  return Math.round((fromISODate(bIso).getTime() - fromISODate(aIso).getTime()) / 86_400_000);
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
