import { BUILDS } from '../data/builds';
import { transformation } from '../engine/avatarBody';
import { levelInfo } from '../engine/gamification';
import type { Profile } from '../types';
import HeroAvatar from './HeroAvatar';
import { ProgressBar } from './ui';

const MILESTONES = [3, 6, 10, 15];

/** Day 1 vs Now vs Goal — shows the (exaggerated) transformation to keep users motivated. */
export default function TransformationCard({ profile, startProfile, xp }: { profile: Profile; startProfile: Profile; xp: number }) {
  const { level } = levelInfo(xp);
  const pct = Math.round(transformation(level) * 100);
  const nextMilestone = MILESTONES.find((m) => m > level);
  const build = BUILDS[profile.build];
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold">Your Transformation</h3>
        <span className="text-sm font-bold" style={{ color: build.color }}>
          {pct}% to {build.className}
        </span>
      </div>
      <div className="grid grid-cols-3 items-end gap-1 text-center">
        <figure>
          <HeroAvatar profile={{ ...startProfile, build: profile.build, avatar: profile.avatar }} level={1} size={104} />
          <figcaption className="text-xs font-bold text-slate-400">Day 1</figcaption>
        </figure>
        <figure>
          <HeroAvatar profile={profile} level={level} size={128} />
          <figcaption className="text-xs font-bold text-white">Now · Lv {level}</figcaption>
        </figure>
        <figure>
          <HeroAvatar profile={profile} level={15} size={104} ghost />
          <figcaption className="text-xs font-bold text-slate-500">Goal</figcaption>
        </figure>
      </div>
      <div className="mt-3">
        <ProgressBar value={pct} max={100} color={build.color} />
        <p className="mt-2 text-xs text-slate-400">
          {nextMilestone
            ? `Next evolution at level ${nextMilestone}: ${{ 3: 'hero headband', 6: 'power pose + wristbands', 10: 'glowing aura', 15: 'champion crown' }[nextMilestone]} unlocked!`
            : 'Fully evolved. You are a legend! 👑'}
        </p>
      </div>
    </div>
  );
}
