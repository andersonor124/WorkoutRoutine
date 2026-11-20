import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getExercise } from '../data/exercises';
import { beforeStart } from '../engine/gamification';
import { DAY_NAMES, addDaysISO, fromISODate, weekStartISO, weekdayIndex } from '../engine/metrics';
import { useAppStore } from '../store/useAppStore';

const FOCUS_COLOR: Record<string, string> = {
  full: '#d946ef', upper: '#3b82f6', lower: '#22c55e', push: '#f97316', pull: '#06b6d4', legs: '#22c55e', cardio: '#f43f5e', core: '#eab308', rest: '#475569',
};

export default function WeekPlan() {
  const plan = useAppStore((s) => s.plan)!;
  const history = useAppStore((s) => s.progress.history);
  const startDate = useAppStore((s) => s.progress.startDate);
  const todayIdx = weekdayIndex(new Date());
  const [open, setOpen] = useState<number>(todayIdx);
  const done = new Set(history.filter((h) => weekStartISO(fromISODate(h.date)) === plan.weekStart).map((h) => h.dayIndex));
  const training = plan.days.filter((d) => d.focus !== 'rest' && !beforeStart(plan, d.dayIndex, startDate));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-bold">Week {plan.weekNumber} Map</h1>
        <p className="text-sm text-slate-400">
          {done.size}/{training.length} missions cleared · week of {fromISODate(plan.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      </header>

      {/* quest path */}
      <div className="grid grid-cols-7 gap-1.5">
        {plan.days.map((d) => {
          const isDone = done.has(d.dayIndex);
          const isToday = d.dayIndex === todayIdx;
          const preStart = beforeStart(plan, d.dayIndex, startDate);
          return (
            <button
              key={d.dayIndex}
              onClick={() => setOpen(d.dayIndex)}
              className={`flex flex-col items-center rounded-xl border-2 py-2 transition ${open === d.dayIndex ? 'border-white' : 'border-transparent'} ${isToday ? 'ring-2 ring-fuchsia-400/60' : ''}`}
              style={{ background: `${FOCUS_COLOR[d.focus]}${isDone ? '55' : '22'}` }}
            >
              <span className="text-[11px] font-bold text-slate-300">{DAY_NAMES[d.dayIndex]}</span>
              <span className={`text-xl ${preStart && !isDone ? 'opacity-30 grayscale' : ''}`}>{isDone ? '✅' : d.focus === 'rest' ? '🏕️' : '⚔️'}</span>
              <span className="text-[10px] text-slate-400">{fromISODate(addDaysISO(plan.weekStart, d.dayIndex)).getDate()}</span>
            </button>
          );
        })}
      </div>

      {plan.days
        .filter((d) => d.dayIndex === open)
        .map((d) => (
          <section key={d.dayIndex} className="card animate-pop">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="label" style={{ color: FOCUS_COLOR[d.focus] }}>
                  {DAY_NAMES[d.dayIndex]} · {d.focus}
                </div>
                <h2 className="text-xl font-bold">{d.title}</h2>
                {d.focus !== 'rest' && (
                  <p className="text-sm text-slate-400">
                    ~{d.estMinutes} min · {d.warmupMin} min warm-up · {d.cooldownMin} min cool-down
                  </p>
                )}
              </div>
              {done.has(d.dayIndex) && <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-300">CLEARED</span>}
            </div>
            {d.focus === 'rest' ? (
              <p className="mt-2 text-slate-300">Rest and recover. Light walking, stretching or foam rolling are great. Your streak is safe today.</p>
            ) : (
              <>
                <ol className="mt-3 space-y-2">
                  {d.exercises.map((pe, i) => {
                    const ex = getExercise(pe.exerciseId);
                    return (
                      <li key={pe.exerciseId} className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-2.5">
                        <span className="w-5 text-center text-xs font-bold text-slate-500">{i + 1}</span>
                        <span className="text-2xl">{ex.emoji}</span>
                        <div className="flex-1">
                          <div className="font-bold leading-tight">{ex.name}</div>
                          <div className="text-xs text-slate-400">
                            {pe.sets} × {pe.reps} · rest {pe.restSec}s
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-300">+{pe.xp}</span>
                      </li>
                    );
                  })}
                </ol>
                {beforeStart(plan, d.dayIndex, startDate) && !done.has(d.dayIndex) && (
                  <p className="mt-3 rounded-xl bg-slate-800/60 p-3 text-sm text-slate-400">This was before you joined, so it doesn't count against you. Your quest starts from day one!</p>
                )}
                {!done.has(d.dayIndex) && d.dayIndex <= todayIdx && !beforeStart(plan, d.dayIndex, startDate) && (
                  <Link to={`/workout/${d.dayIndex}`} className="btn-primary mt-3 w-full">
                    {d.dayIndex === todayIdx ? 'Start mission' : 'Catch up on this mission'}
                  </Link>
                )}
              </>
            )}
          </section>
        ))}
    </div>
  );
}
