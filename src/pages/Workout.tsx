import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HeroAvatar from '../components/HeroAvatar';
import { XPBar } from '../components/ui';
import { BUILDS } from '../data/builds';
import { getExercise } from '../data/exercises';
import { WORKOUT_COMPLETE_BONUS, levelInfo } from '../engine/gamification';
import { DAY_NAMES, fromISODate, weekStartISO } from '../engine/metrics';
import { useAppStore } from '../store/useAppStore';

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  const pct = (left / seconds) * 100;
  return (
    <div className="fixed inset-x-0 bottom-20 z-30 mx-auto w-[calc(100%-2rem)] max-w-md animate-pop rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="font-bold text-cyan-300">😮‍💨 Rest</span>
        <span className="font-display text-2xl font-bold tabular-nums">{left}s</span>
        <button className="rounded-lg bg-slate-800 px-3 py-1 text-sm font-bold" onClick={onDone}>
          Skip
        </button>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-cyan-400 transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Workout() {
  const { day } = useParams();
  const dayIndex = Number(day);
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile)!;
  const plan = useAppStore((s) => s.plan)!;
  const progress = useAppStore((s) => s.progress);
  const finishWorkout = useAppStore((s) => s.finishWorkout);
  const workout = plan.days[dayIndex];

  const [setsDone, setSetsDone] = useState<Record<string, number>>({});
  const [rest, setRest] = useState<{ key: number; seconds: number } | null>(null);
  const [floater, setFloater] = useState<{ key: number; text: string } | null>(null);
  const [result, setResult] = useState<{ xp: number; levelBefore: number } | null>(null);
  const started = useRef(Date.now());

  if (!workout || workout.focus === 'rest') {
    return (
      <div className="card text-center">
        <p>No mission here. It's a rest day!</p>
        <Link to="/" className="btn-ghost mt-3">
          Back to base
        </Link>
      </div>
    );
  }

  const alreadyDone = progress.history.some((h) => h.dayIndex === dayIndex && weekStartISO(fromISODate(h.date)) === plan.weekStart);
  const doneIds = workout.exercises.filter((e) => (setsDone[e.exerciseId] ?? 0) >= e.sets).map((e) => e.exerciseId);
  const earned = workout.exercises.filter((e) => doneIds.includes(e.exerciseId)).reduce((s, e) => s + e.xp, 0);
  const allDone = doneIds.length === workout.exercises.length;
  const build = BUILDS[profile.build];

  const tapSet = (id: string, sets: number, restSec: number, xp: number) => {
    const n = setsDone[id] ?? 0;
    if (n >= sets) return;
    setSetsDone({ ...setsDone, [id]: n + 1 });
    if (n + 1 === sets) setFloater({ key: Date.now(), text: `+${xp} XP` });
    else setRest({ key: Date.now(), seconds: restSec });
  };

  const finish = () => {
    const levelBefore = levelInfo(progress.xp).level;
    const durationMin = Math.max(1, Math.round((Date.now() - started.current) / 60000));
    const r = finishWorkout({ dayIndex, doneIds, durationMin });
    setRest(null);
    setResult({ xp: r.xpEarned, levelBefore });
  };

  if (result) {
    const { level } = levelInfo(progress.xp);
    return (
      <div className="animate-pop space-y-4 text-center">
        <h1 className="font-display text-4xl font-bold">Mission complete!</h1>
        <div className="flex justify-center">
          <HeroAvatar profile={profile} level={level} size={150} />
        </div>
        <div className="font-display text-5xl font-bold text-amber-300">+{result.xp} XP</div>
        {level > result.levelBefore && <p className="font-bold text-fuchsia-300">LEVEL UP! Your hero evolved 💪</p>}
        <div className="card text-left">
          <XPBar xp={progress.xp} color={build.color} />
          <p className="mt-2 text-sm text-slate-400">Every workout pushes your hero closer to {build.className}. Keep the streak alive!</p>
        </div>
        <button className="btn-primary w-full" onClick={() => navigate('/')}>
          Back to base
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      <header className="flex items-center gap-3">
        <Link to="/" className="rounded-xl bg-slate-800 px-3 py-2 font-bold" aria-label="Back">
          ←
        </Link>
        <div className="flex-1">
          <div className="label">{DAY_NAMES[dayIndex]} mission</div>
          <h1 className="font-display text-2xl font-bold leading-tight">{workout.title}</h1>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold text-amber-300">{earned}</div>
          <div className="text-[10px] font-bold uppercase text-slate-500">XP earned</div>
        </div>
      </header>

      {alreadyDone && <div className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">You already cleared this mission this week. Feel free to train again, but no extra XP.</div>}

      <div className="rounded-xl bg-orange-500/10 p-3 text-sm">
        🔥 <b>Warm-up ({workout.warmupMin} min):</b> arm circles, leg swings, hip circles and 1 minute of easy marching.
      </div>

      {workout.exercises.map((pe, i) => {
        const ex = getExercise(pe.exerciseId);
        const n = setsDone[pe.exerciseId] ?? 0;
        const complete = n >= pe.sets;
        return (
          <div key={pe.exerciseId} className={`card transition ${complete ? 'border-emerald-500/50 bg-emerald-950/40' : ''}`}>
            <div className="flex items-start gap-3">
              <span className="text-4xl">{ex.emoji}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500">
                  #{i + 1} · {ex.muscles.join(' · ')}
                </div>
                <h3 className="text-lg font-bold leading-tight">{ex.name}</h3>
                <p className="text-sm text-slate-400">{ex.cue}</p>
              </div>
              <span className="text-sm font-bold text-amber-300">+{pe.xp}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="mr-1 text-sm font-bold text-slate-300">
                {pe.sets} × {pe.reps}
              </span>
              <div className="flex flex-1 flex-wrap justify-end gap-2">
                {Array.from({ length: pe.sets }, (_, s) => (
                  <button
                    key={s}
                    aria-label={`${ex.name} set ${s + 1}`}
                    disabled={alreadyDone}
                    onClick={() => tapSet(pe.exerciseId, pe.sets, pe.restSec, pe.xp)}
                    className={`h-10 w-10 rounded-full border-2 font-bold transition active:scale-90 ${s < n ? 'border-emerald-400 bg-emerald-500 text-white' : s === n ? 'border-fuchsia-400 text-fuchsia-200' : 'border-slate-700 text-slate-500'}`}
                  >
                    {s < n ? '✓' : s + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-xl bg-sky-500/10 p-3 text-sm">
        🧊 <b>Cool-down ({workout.cooldownMin} min):</b> slow walk, then stretch quads, hamstrings, chest and shoulders for 30s each.
      </div>

      {!alreadyDone && (
        <button className="btn-primary w-full text-lg" disabled={doneIds.length === 0} onClick={finish}>
          {allDone ? `🏁 Finish mission (+${WORKOUT_COMPLETE_BONUS} bonus XP)` : `Finish early (${doneIds.length}/${workout.exercises.length} done)`}
        </button>
      )}

      {rest && <RestTimer key={rest.key} seconds={rest.seconds} onDone={() => setRest(null)} />}
      {floater && (
        <div key={floater.key} className="pointer-events-none fixed inset-x-0 top-1/3 z-40 animate-pop text-center font-display text-5xl font-bold text-amber-300 drop-shadow-lg" onAnimationEnd={() => setTimeout(() => setFloater(null), 600)}>
          {floater.text}
        </div>
      )}
    </div>
  );
}
