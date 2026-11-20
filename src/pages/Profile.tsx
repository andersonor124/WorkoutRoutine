import { useState } from 'react';
import HeroAvatar from '../components/HeroAvatar';
import { BUILDS } from '../data/builds';
import { bmi, bmiCategory, dailyCalories } from '../engine/metrics';
import { levelInfo } from '../engine/gamification';
import { useAppStore } from '../store/useAppStore';
import type { Profile as P } from '../types';
import { BodyFields, BuildPicker, LookFields, TrainingFields } from './Onboarding';

export default function Profile() {
  const saved = useAppStore((s) => s.profile)!;
  const xp = useAppStore((s) => s.progress.xp);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const reset = useAppStore((s) => s.reset);
  const [p, setP] = useState<P>(saved);
  const [msg, setMsg] = useState('');
  const set = (patch: Partial<P>) => {
    setP((prev) => ({ ...prev, ...patch }));
    setMsg('');
  };
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);
  const b = bmi(p.heightCm, p.weightKg);
  const { level } = levelInfo(xp);

  return (
    <div className="space-y-4 pb-20">
      <header className="card flex items-center gap-4">
        <HeroAvatar profile={p} level={level} size={90} />
        <div>
          <h1 className="font-display text-2xl font-bold">{p.name}</h1>
          <p className="text-sm font-bold" style={{ color: BUILDS[p.build].color }}>
            {BUILDS[p.build].emoji} {BUILDS[p.build].className}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            BMI {b} ({bmiCategory(b)}) · ~{dailyCalories(p)} kcal/day
          </p>
        </div>
      </header>

      <section className="card">
        <h2 className="mb-3 text-lg font-bold">Body stats</h2>
        <BodyFields p={p} set={set} />
        <p className="mt-2 text-xs text-slate-500">Update your weight as it changes. Your avatar will reflect the real you, too.</p>
      </section>
      <section className="card">
        <h2 className="mb-3 text-lg font-bold">Training</h2>
        <TrainingFields p={p} set={set} />
      </section>
      <section className="card">
        <h2 className="mb-3 text-lg font-bold">Goal build</h2>
        <BuildPicker p={p} set={set} />
      </section>
      <section className="card">
        <h2 className="mb-3 text-lg font-bold">Look</h2>
        <LookFields p={p} set={set} />
      </section>

      <section className="card">
        <h2 className="mb-2 text-lg font-bold text-rose-300">Danger zone</h2>
        <button
          className="btn-ghost w-full text-rose-300"
          onClick={() => {
            if (confirm('Erase your hero, XP and progress? This cannot be undone.')) reset();
          }}
        >
          Reset all progress
        </button>
        <p className="mt-3 text-xs text-slate-500">FitQuest gives general fitness guidance, not medical advice. All data stays on this device.</p>
      </section>

      {(dirty || msg) && (
        <div className="fixed inset-x-0 bottom-16 z-30 p-3">
          <div className="mx-auto max-w-2xl">
            {msg ? (
              <div className="rounded-xl bg-emerald-600 p-3 text-center font-bold">{msg}</div>
            ) : (
              <button
                className="btn-primary w-full"
                onClick={() => {
                  updateProfile(p);
                  setMsg('✅ Saved! Your weekly plan was rebuilt.');
                }}
              >
                Save & rebuild my plan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
