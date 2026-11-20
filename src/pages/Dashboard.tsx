import { Link } from 'react-router-dom';
import HeroAvatar from '../components/HeroAvatar';
import QuestCard from '../components/QuestCard';
import TransformationCard from '../components/TransformationCard';
import { StreakFlame, XPBar } from '../components/ui';
import { BUILDS } from '../data/builds';
import { levelInfo, liveStreak, rankTitle } from '../engine/gamification';
import { DAY_NAMES, fromISODate, toISODate, weekStartISO, weekdayIndex } from '../engine/metrics';
import { useAppStore } from '../store/useAppStore';

const REST_TIPS = [
  'Recovery day! Go for an easy walk or stretch for 10 minutes.',
  'Muscles grow while you rest. Hydrate and get good sleep tonight.',
  'Try 5 minutes of deep breathing or yoga to recharge your hero.',
];

export default function Dashboard() {
  const profile = useAppStore((s) => s.profile)!;
  const startProfile = useAppStore((s) => s.startProfile) ?? profile;
  const plan = useAppStore((s) => s.plan)!;
  const progress = useAppStore((s) => s.progress);

  const now = new Date();
  const todayIdx = weekdayIndex(now);
  const today = plan.days[todayIdx];
  const build = BUILDS[profile.build];
  const { level } = levelInfo(progress.xp);
  const streak = liveStreak(progress, toISODate(now), profile);
  const doneThisWeek = new Set(progress.history.filter((h) => weekStartISO(fromISODate(h.date)) === plan.weekStart).map((h) => h.dayIndex));
  const todayDone = doneThisWeek.has(todayIdx);
  const missed = plan.days.filter((d) => d.focus !== 'rest' && d.dayIndex < todayIdx && !doneThisWeek.has(d.dayIndex));
  const nextDay = plan.days.find((d) => d.focus !== 'rest' && d.dayIndex > todayIdx);

  return (
    <div className="space-y-4">
      <header className="card relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl" style={{ background: build.color }} />
        <div className="flex items-center gap-3">
          <HeroAvatar profile={profile} level={level} size={96} />
          <div className="flex-1">
            <p className="text-sm text-slate-400">Welcome back,</p>
            <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm font-bold" style={{ color: build.color }}>
              {build.emoji} {build.className.replace('The ', '')} · {rankTitle(level)}
            </p>
            <div className="mt-2">
              <XPBar xp={progress.xp} color={build.color} />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          <StreakFlame streak={streak} />
          <div className="text-right text-xs text-slate-400">
            <div>
              <b className="text-white">{progress.totals.workouts}</b> workouts
            </div>
            <div>
              Week <b className="text-white">{plan.weekNumber}</b> of your journey
            </div>
          </div>
        </div>
      </header>

      <section className="card">
        <div className="label">Today's mission · {DAY_NAMES[todayIdx]}</div>
        {today.focus === 'rest' ? (
          <>
            <h2 className="text-xl font-bold">🏕️ {today.title}</h2>
            <p className="mt-1 text-slate-300">{REST_TIPS[now.getDate() % REST_TIPS.length]}</p>
            {nextDay && <p className="mt-2 text-sm text-slate-400">Next mission: {DAY_NAMES[nextDay.dayIndex]}: {nextDay.title}</p>}
          </>
        ) : todayDone ? (
          <>
            <h2 className="text-xl font-bold text-emerald-300">✅ {today.title}: complete!</h2>
            <p className="mt-1 text-slate-300">Great work. Your hero is growing stronger.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">⚔️ {today.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {today.exercises.length} exercises · ~{today.estMinutes} min · up to {today.exercises.reduce((s, e) => s + e.xp, 0) + 25} XP
            </p>
            <Link to={`/workout/${todayIdx}`} className="btn-primary mt-3 w-full text-lg">
              Start mission
            </Link>
          </>
        )}
        {missed.length > 0 && (
          <div className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm">
            <span className="font-bold text-amber-300">Catch up:</span>{' '}
            {missed.map((d, i) => (
              <span key={d.dayIndex}>
                {i > 0 && ', '}
                <Link className="underline" to={`/workout/${d.dayIndex}`}>
                  {DAY_NAMES[d.dayIndex]}: {d.title}
                </Link>
              </span>
            ))}
          </div>
        )}
      </section>

      <TransformationCard profile={profile} startProfile={startProfile} xp={progress.xp} />

      <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">Weekly Quests</h3>
          <span className="text-xs text-slate-500">reset Monday</span>
        </div>
        <div className="space-y-2">
          {progress.quests.items.map((q) => (
            <QuestCard key={q.id} quest={q} profile={profile} />
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-2 text-lg font-bold">Coach tips</h3>
        <ul className="space-y-1.5 text-sm text-slate-300">
          {plan.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
