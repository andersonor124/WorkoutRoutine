import { useMemo } from 'react';
import { BADGES } from '../data/badges';
import { QUEST_MAP } from '../data/quests';
import { rankTitle } from '../engine/gamification';
import { useAppStore } from '../store/useAppStore';
import HeroAvatar from './HeroAvatar';

const CONFETTI_COLORS = ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#a78bfa'];

export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2 + Math.random() * 1.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 6 + Math.random() * 6,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block animate-fall rounded-sm"
          style={{ left: `${p.left}%`, width: p.w, height: p.w * 0.45, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  );
}

/** Shows queued level-ups, badges, quest completions one at a time. */
export default function CelebrationOverlay() {
  const current = useAppStore((s) => s.celebrations[0]);
  const pop = useAppStore((s) => s.popCelebration);
  const profile = useAppStore((s) => s.profile);
  if (!current || !profile) return null;

  let icon: React.ReactNode = '🎉';
  let title = '';
  let body = '';
  switch (current.kind) {
    case 'levelup':
      icon = <HeroAvatar profile={profile} level={current.level} size={120} />;
      title = `Level ${current.level}!`;
      body =
        rankTitle(current.level) !== rankTitle(current.level - 1)
          ? `New rank: ${rankTitle(current.level)}! Your hero just got stronger. Look at that transformation!`
          : 'Your hero just got stronger. Look at that transformation!';
      break;
    case 'badge': {
      const b = BADGES.find((x) => x.id === current.badgeId)!;
      icon = <span className="text-7xl">{b.emoji}</span>;
      title = `Badge unlocked: ${b.name}`;
      body = b.description;
      break;
    }
    case 'quest': {
      const q = QUEST_MAP[current.questId];
      icon = <span className="text-7xl">{q.emoji}</span>;
      title = 'Quest complete!';
      body = `${q.title(q.target(profile))} · +${current.xp} XP`;
      break;
    }
    case 'week':
      icon = <span className="text-7xl">🗓️</span>;
      title = 'Perfect week!';
      body = `Every workout this week done. +${current.xp} bonus XP and a tougher plan next week.`;
      break;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" role="dialog" aria-modal>
      <Confetti />
      <div key={JSON.stringify(current)} className="card relative z-50 w-full max-w-sm animate-pop text-center">
        <div className="flex justify-center">{icon}</div>
        <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-slate-300">{body}</p>
        <button className="btn-primary mt-5 w-full" onClick={pop}>
          Awesome!
        </button>
      </div>
    </div>
  );
}
