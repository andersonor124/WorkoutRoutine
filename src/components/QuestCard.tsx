import { QUEST_MAP } from '../data/quests';
import type { Profile, QuestState } from '../types';
import { ProgressBar } from './ui';

export default function QuestCard({ quest, profile }: { quest: QuestState; profile: Profile }) {
  const def = QUEST_MAP[quest.id];
  if (!def) return null;
  const target = def.target(profile);
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 ${quest.claimed ? 'bg-emerald-500/10' : 'bg-slate-800/60'}`}>
      <span className="text-2xl">{quest.claimed ? '✅' : def.emoji}</span>
      <div className="flex-1">
        <div className={`text-sm font-bold ${quest.claimed ? 'text-emerald-300 line-through decoration-2' : ''}`}>{def.title(target)}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar value={quest.progress} max={target} color={quest.claimed ? '#34d399' : '#facc15'} />
          </div>
          <span className="text-xs font-bold text-slate-400">
            {quest.progress}/{target}
          </span>
        </div>
      </div>
      <span className="rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-bold text-amber-300">+{def.xp}</span>
    </div>
  );
}
