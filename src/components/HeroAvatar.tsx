import { evolutionStage, shapeAtLevel } from '../engine/avatarBody';
import { levelInfo } from '../engine/gamification';
import type { Profile } from '../types';
import Avatar from './Avatar';

/** The user's avatar at a given level (defaults to their current level). */
export default function HeroAvatar({ profile, xp, level, size, ghost }: { profile: Profile; xp?: number; level?: number; size?: number; ghost?: boolean }) {
  const lvl = level ?? levelInfo(xp ?? 0).level;
  return <Avatar shape={shapeAtLevel(profile, lvl)} look={profile.avatar} build={profile.build} stage={evolutionStage(lvl)} size={size} ghost={ghost} />;
}
