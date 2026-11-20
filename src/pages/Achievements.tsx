import HeroAvatar from '../components/HeroAvatar';
import { Stat } from '../components/ui';
import { BADGES } from '../data/badges';
import { evolutionStage } from '../engine/avatarBody';
import { levelInfo } from '../engine/gamification';
import { useAppStore } from '../store/useAppStore';

const STAGES = [
  { level: 1, name: 'Rookie', perk: 'Your starting hero' },
  { level: 3, name: 'Headband', perk: 'Hero headband' },
  { level: 6, name: 'Class Pose', perk: 'Signature class pose + wristbands' },
  { level: 10, name: 'Aura', perk: 'Glowing aura' },
  { level: 15, name: 'Champion', perk: 'Crown + full transformation' },
];

export default function Achievements() {
  const profile = useAppStore((s) => s.profile)!;
  const progress = useAppStore((s) => s.progress);
  const { level } = levelInfo(progress.xp);
  const unlocked = Object.keys(progress.badges).length;
  const stage = evolutionStage(level);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Trophy Hall</h1>
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Level" value={level} />
        <Stat label="Total XP" value={progress.xp} />
        <Stat label="Best streak" value={progress.bestStreak} />
        <Stat label="Badges" value={`${unlocked}/${BADGES.length}`} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Workouts" value={progress.totals.workouts} />
        <Stat label="Push-ups" value={progress.totals.pushups} />
        <Stat label="Squats" value={progress.totals.squats} />
      </div>

      <section className="card">
        <h2 className="mb-2 text-lg font-bold">Evolution path</h2>
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
          {STAGES.map((s, i) => {
            const reached = stage > i;
            return (
              <div key={s.level} className={`flex min-w-[96px] snap-start flex-col items-center rounded-xl p-2 ${reached ? 'bg-slate-800' : 'bg-slate-900'}`}>
                <HeroAvatar profile={profile} level={s.level} size={70} ghost={!reached} />
                <div className="text-xs font-bold">{reached ? s.name : `🔒 Lv ${s.level}`}</div>
                <div className="text-center text-[10px] text-slate-400">{s.perk}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-bold">Badges</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {BADGES.map((b) => {
            const date = progress.badges[b.id];
            return (
              <div key={b.id} className={`flex flex-col items-center rounded-xl p-3 text-center ${date ? 'bg-gradient-to-b from-amber-500/20 to-slate-800' : 'bg-slate-800/40'}`} title={b.description}>
                <span className={`text-4xl ${date ? '' : 'opacity-25 grayscale'}`}>{b.emoji}</span>
                <span className="mt-1 text-xs font-bold">{b.name}</span>
                <span className="text-[10px] leading-tight text-slate-400">{date ? `Unlocked ${date}` : b.description}</span>
              </div>
            );
          })}
        </div>
      </section>

      {progress.history.length > 0 && (
        <section className="card">
          <h2 className="mb-2 text-lg font-bold">Battle log</h2>
          <ul className="space-y-1 text-sm">
            {[...progress.history].reverse().slice(0, 10).map((h, i) => (
              <li key={i} className="flex justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                <span>
                  {h.date} · <span className="capitalize">{h.focus}</span> · {h.exercisesDone}/{h.exercisesTotal}
                </span>
                <span className="font-bold text-amber-300">+{h.xpEarned} XP</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
