import type { ReactNode } from 'react';
import { levelInfo } from '../engine/gamification';

export function XPBar({ xp, color = '#d946ef' }: { xp: number; color?: string }) {
  const info = levelInfo(xp);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold text-slate-400">
        <span>LV {info.level}</span>
        <span>
          {info.current} / {info.needed} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(3, info.pct * 100)}%`, background: `linear-gradient(90deg, ${color}, #fb923c)` }}
        />
      </div>
    </div>
  );
}

export function StreakFlame({ streak }: { streak: number }) {
  const size = streak === 0 ? 'text-2xl grayscale opacity-50' : streak < 3 ? 'text-3xl' : streak < 7 ? 'text-4xl' : 'text-5xl';
  return (
    <div className="flex items-center gap-2">
      <span className={`${size} ${streak > 0 ? 'animate-flicker' : ''} inline-block`}>🔥</span>
      <div>
        <div className="font-display text-2xl font-bold leading-none">{streak}</div>
        <div className="text-xs font-bold uppercase text-slate-400">streak</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, color = '#22d3ee' }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl bg-slate-800/60 p-3 text-center">
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}
