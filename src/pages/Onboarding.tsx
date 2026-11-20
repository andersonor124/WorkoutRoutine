import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroAvatar from '../components/HeroAvatar';
import { BUILD_LIST, BUILDS } from '../data/builds';
import { bmi, bmiCategory, cmToFtIn, dailyCalories, ftInToCm, kgToLb, lbToKg } from '../engine/metrics';
import { useAppStore } from '../store/useAppStore';
import type { AvatarLook, Equipment, FitnessLevel, Profile, Sex } from '../types';

export const SKINS = ['#f9d7b9', '#eac096', '#d29b6c', '#a86b42', '#7a4a2a', '#4b2e1c'];
export const HAIRS = ['#1f1611', '#4a2f1b', '#8b5a2b', '#d6a756', '#c2410c', '#9ca3af', '#7c3aed'];
export const OUTFITS = ['#22d3ee', '#f97316', '#ef4444', '#84cc16', '#f43f5e', '#a78bfa', '#facc15', '#3b82f6'];
export const HAIR_STYLES: AvatarLook['hairStyle'][] = ['short', 'long', 'bun', 'ponytail', 'bald'];
export const SHORTS = ['#1e293b', '#6ee7b7', '#f9a8d4', '#93c5fd', '#fde68a', '#e5e7eb'];

const DEFAULT: Profile = {
  name: '',
  heightCm: 170,
  weightKg: 70,
  age: 25,
  sex: 'male',
  level: 'beginner',
  daysPerWeek: 3,
  minutesPerSession: 30,
  equipment: 'none',
  build: 'ninja',
  avatar: { skin: SKINS[1], hair: HAIRS[0], outfit: OUTFITS[0], hairStyle: 'short', top: 'tank', shorts: SHORTS[0] },
  units: 'metric',
};

const STEPS = ['Hero', 'Body', 'Training', 'Build', 'Look', 'Ready'];

export function Choice<T extends string | number>({ value, options, onChange, render }: { value: T; options: readonly T[]; onChange: (v: T) => void; render?: (v: T) => React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={String(o)} type="button" onClick={() => onChange(o)} className={`chip ${value === o ? 'chip-on' : ''}`}>
          {render ? render(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

export function BodyFields({ p, set }: { p: Profile; set: (patch: Partial<Profile>) => void }) {
  const imperial = p.units === 'imperial';
  const { ft, inch } = cmToFtIn(p.heightCm);
  return (
    <div className="space-y-4">
      <div>
        <span className="label">Units</span>
        <Choice value={p.units} options={['metric', 'imperial'] as const} onChange={(units) => set({ units })} render={(u) => (u === 'metric' ? 'cm / kg' : 'ft / lb')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {imperial ? (
          <div>
            <span className="label">Height</span>
            <div className="flex gap-2">
              <input aria-label="feet" className="input" type="number" min={3} max={8} value={ft} onChange={(e) => set({ heightCm: ftInToCm(+e.target.value, inch) })} />
              <input aria-label="inches" className="input" type="number" min={0} max={11} value={inch} onChange={(e) => set({ heightCm: ftInToCm(ft, +e.target.value) })} />
            </div>
            <span className="text-xs text-slate-500">ft · in</span>
          </div>
        ) : (
          <label>
            <span className="label">Height (cm)</span>
            <input className="input" type="number" min={100} max={230} value={p.heightCm} onChange={(e) => set({ heightCm: +e.target.value })} />
          </label>
        )}
        <label>
          <span className="label">Weight ({imperial ? 'lb' : 'kg'})</span>
          <input
            className="input"
            type="number"
            min={30}
            max={500}
            value={imperial ? kgToLb(p.weightKg) : p.weightKg}
            onChange={(e) => set({ weightKg: imperial ? lbToKg(+e.target.value) : +e.target.value })}
          />
        </label>
        <label>
          <span className="label">Age</span>
          <input className="input" type="number" min={13} max={100} value={p.age} onChange={(e) => set({ age: +e.target.value })} />
        </label>
        <div>
          <span className="label">Sex</span>
          <Choice value={p.sex} options={['male', 'female', 'other'] as Sex[]} onChange={(sex) => set({ sex, avatar: { ...p.avatar, top: sex === 'female' ? 'crop' : 'tank', hairStyle: sex === 'female' && p.avatar.hairStyle === 'short' ? 'bun' : p.avatar.hairStyle } })} render={(s) => s[0].toUpperCase() + s.slice(1)} />
        </div>
      </div>
    </div>
  );
}

export function TrainingFields({ p, set }: { p: Profile; set: (patch: Partial<Profile>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <span className="label">Fitness level</span>
        <Choice
          value={p.level}
          options={['beginner', 'intermediate', 'advanced'] as FitnessLevel[]}
          onChange={(level) => set({ level })}
          render={(l) => ({ beginner: '🌱 Beginner', intermediate: '🌿 Intermediate', advanced: '🌳 Advanced' })[l]}
        />
      </div>
      <div>
        <span className="label">Workout days per week</span>
        <Choice value={p.daysPerWeek} options={[2, 3, 4, 5, 6]} onChange={(daysPerWeek) => set({ daysPerWeek })} render={(d) => `${d} days`} />
      </div>
      <div>
        <span className="label">Minutes per workout</span>
        <Choice value={p.minutesPerSession} options={[20, 30, 45, 60, 90]} onChange={(minutesPerSession) => set({ minutesPerSession })} render={(m) => `${m} min`} />
      </div>
      <div>
        <span className="label">Equipment</span>
        <Choice
          value={p.equipment}
          options={['none', 'dumbbells', 'gym'] as Equipment[]}
          onChange={(equipment) => set({ equipment })}
          render={(e) => ({ none: '🏠 Bodyweight', dumbbells: '🏋️ Dumbbells', gym: '🏟️ Full gym' })[e]}
        />
      </div>
    </div>
  );
}

export function BuildPicker({ p, set }: { p: Profile; set: (patch: Partial<Profile>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {BUILD_LIST.map((b) => {
        const on = p.build === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => set({ build: b.id, avatar: { ...p.avatar, outfit: b.color } })}
            className={`rounded-2xl border-2 p-3 text-left transition ${on ? 'scale-[1.02] bg-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}
            style={on ? { borderColor: b.color, boxShadow: `0 0 24px ${b.color}55` } : undefined}
          >
            <div className="flex justify-center">
              <HeroAvatar profile={{ ...p, build: b.id, avatar: { ...p.avatar, outfit: b.color } }} level={15} size={96} />
            </div>
            <div className="mt-1 font-display text-base font-bold" style={{ color: b.color }}>
              {b.emoji} {b.className}
            </div>
            <div className="text-xs font-bold text-slate-300">{b.title}</div>
            <div className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold" style={{ background: `${b.color}22`, color: b.color }}>
              💪 {b.physique}
            </div>
            <div className="mt-1 text-[11px] leading-snug text-slate-400">{b.tagline}</div>
          </button>
        );
      })}
    </div>
  );
}

export function LookFields({ p, set }: { p: Profile; set: (patch: Partial<Profile>) => void }) {
  const setLook = (patch: Partial<AvatarLook>) => set({ avatar: { ...p.avatar, ...patch } });
  const swatch = (colors: string[], key: 'skin' | 'hair' | 'outfit' | 'shorts') => (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`${key} ${c}`}
          onClick={() => setLook({ [key]: c })}
          className={`h-9 w-9 rounded-full border-4 transition ${p.avatar[key] === c ? 'scale-110 border-white' : 'border-slate-800'}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
  return (
    <div className="space-y-4">
      <div>
        <span className="label">Skin</span>
        {swatch(SKINS, 'skin')}
      </div>
      <div>
        <span className="label">Hair style</span>
        <Choice value={p.avatar.hairStyle} options={HAIR_STYLES} onChange={(hairStyle) => setLook({ hairStyle })} render={(h) => ({ short: 'Short', long: 'Long', bun: 'Space buns', ponytail: 'Ponytail', bald: 'Bald' })[h]} />
      </div>
      <div>
        <span className="label">Hair color</span>
        {swatch(HAIRS, 'hair')}
      </div>
      <div>
        <span className="label">Top</span>
        <Choice value={p.avatar.top ?? 'tank'} options={['tank', 'crop'] as const} onChange={(top) => setLook({ top })} render={(t) => (t === 'tank' ? '👕 Tank top' : '🎽 Sports top')} />
      </div>
      <div>
        <span className="label">Top color</span>
        {swatch(OUTFITS, 'outfit')}
      </div>
      <div>
        <span className="label">Shorts</span>
        {swatch(SHORTS, 'shorts')}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(DEFAULT);
  const [previewLevel, setPreviewLevel] = useState(1);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const navigate = useNavigate();
  const set = (patch: Partial<Profile>) => setP((prev) => ({ ...prev, ...patch }));

  const b = bmi(p.heightCm, p.weightKg);
  const valid = [p.name.trim().length > 0, p.heightCm >= 100 && p.weightKg >= 30 && p.age >= 13, true, true, true, true][step];

  const finish = () => {
    completeOnboarding({ ...p, name: p.name.trim() });
    navigate('/');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-2 flex-1 rounded-full transition ${i <= step ? 'bg-gradient-to-r from-fuchsia-500 to-orange-400' : 'bg-slate-800'}`} />
        ))}
      </div>

      {step === 0 && (
        <section className="animate-pop text-center">
          <div className="mx-auto flex justify-center">
            <HeroAvatar profile={p} level={1} size={130} />
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">
            Fit<span className="bg-gradient-to-r from-fuchsia-400 to-orange-300 bg-clip-text text-transparent">Quest</span>
          </h1>
          <p className="mt-2 text-slate-300">Turn your weekly workouts into an adventure. Level up your hero by leveling up yourself.</p>
          <label className="mt-6 block text-left">
            <span className="label">What should we call you, hero?</span>
            <input className="input" autoFocus placeholder="Your name" value={p.name} maxLength={20} onChange={(e) => set({ name: e.target.value })} />
          </label>
        </section>
      )}

      {step === 1 && (
        <section className="animate-pop">
          <h2 className="text-2xl font-bold">Your stats</h2>
          <p className="mb-4 text-sm text-slate-400">Your avatar starts out looking like you. Watch it transform as you train.</p>
          <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:items-start">
            <div className="w-full flex-1">
              <BodyFields p={p} set={set} />
            </div>
            <HeroAvatar profile={p} level={1} size={110} />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="animate-pop">
          <h2 className="text-2xl font-bold">Your training</h2>
          <p className="mb-4 text-sm text-slate-400">We'll fit the plan to your schedule and your gear.</p>
          <TrainingFields p={p} set={set} />
        </section>
      )}

      {step === 3 && (
        <section className="animate-pop">
          <h2 className="text-2xl font-bold">Choose your class</h2>
          <p className="mb-4 text-sm text-slate-400">What build are you aiming for? Each card shows the future you.</p>
          <BuildPicker p={p} set={set} />
        </section>
      )}

      {step === 4 && (
        <section className="animate-pop">
          <h2 className="text-2xl font-bold">Customize your hero</h2>
          <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center rounded-2xl bg-slate-900 p-3">
              <HeroAvatar profile={p} level={previewLevel} size={140} />
              <label className="mt-2 w-full text-center text-xs font-bold text-slate-400">
                Preview level {previewLevel}
                <input className="mt-1 w-full accent-fuchsia-500" type="range" min={1} max={15} value={previewLevel} onChange={(e) => setPreviewLevel(+e.target.value)} />
              </label>
            </div>
            <div className="w-full flex-1">
              <LookFields p={p} set={set} />
            </div>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="animate-pop text-center">
          <h2 className="text-3xl font-bold">Your quest begins, {p.name}!</h2>
          <div className="my-4 flex items-end justify-center gap-2">
            <HeroAvatar profile={p} level={1} size={100} />
            <span className="mb-16 text-3xl">➡️</span>
            <HeroAvatar profile={p} level={15} size={120} />
          </div>
          <p className="text-slate-300">
            Class: <b style={{ color: BUILDS[p.build].color }}>{BUILDS[p.build].className}</b> · {p.daysPerWeek} days/week · {p.minutesPerSession} min
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-left">
            <div className="card">
              <div className="label">BMI</div>
              <div className="font-display text-2xl font-bold">{b}</div>
              <div className="text-xs capitalize text-slate-400">{bmiCategory(b)}</div>
            </div>
            <div className="card">
              <div className="label">Daily energy</div>
              <div className="font-display text-2xl font-bold">~{dailyCalories(p)}</div>
              <div className="text-xs text-slate-400">kcal estimate</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            FitQuest gives general fitness guidance, not medical advice. Check with a doctor before starting a new program, especially if you have health conditions.
          </p>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          {step > 0 && (
            <button className="btn-ghost flex-1" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn-primary flex-[2]" disabled={!valid} onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn-primary flex-[2] text-lg" onClick={finish}>
              ⚔️ Start my quest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
