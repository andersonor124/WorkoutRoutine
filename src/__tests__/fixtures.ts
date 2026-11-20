import type { Profile } from '../types';

export const baseProfile: Profile = {
  name: 'Alex',
  heightCm: 175,
  weightKg: 72,
  age: 28,
  sex: 'male',
  level: 'intermediate',
  daysPerWeek: 3,
  minutesPerSession: 45,
  equipment: 'none',
  build: 'ninja',
  avatar: { skin: '#e0ac69', hair: '#2b1b10', outfit: '#22d3ee', hairStyle: 'short' },
  units: 'metric',
};
