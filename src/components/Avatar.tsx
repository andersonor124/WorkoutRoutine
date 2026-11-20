import { useId } from 'react';
import { BUILDS } from '../data/builds';
import type { BodyShape } from '../engine/avatarBody';
import type { AvatarLook, BuildId } from '../types';

interface Props {
  shape: BodyShape;
  look: AvatarLook;
  build: BuildId;
  stage: number; // 1..5
  size?: number;
  ghost?: boolean; // translucent "future you" silhouette
  className?: string;
}

/**
 * Cartoon avatar drawn from body proportions. Torso, arms, legs and belly
 * all come from `shape`, so the same character visibly transforms over time.
 */
export default function Avatar({ shape, look, build, stage, size = 180, ghost = false, className = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const accent = BUILDS[build].color;
  const { shoulder: S, waist: W, hip: H, arm: A, thigh: T, belly: B, definition: D, glow, heightScale } = shape;
  const cx = 60;
  const shoulderY = 58;
  const waistY = 100;
  const hipY = 118;
  const footY = 186;
  const bellyX = B * 0.55;
  const flex = stage >= 3;
  const skin = look.skin;
  const shade = 'rgba(0,0,0,0.22)';

  const torso = `M ${cx - S} ${shoulderY}
    C ${cx - S - 1} ${shoulderY + 16}, ${cx - W - B} ${waistY - 14}, ${cx - W - bellyX} ${waistY}
    L ${cx - H} ${hipY}
    L ${cx + H} ${hipY}
    L ${cx + W + bellyX} ${waistY}
    C ${cx + W + B} ${waistY - 14}, ${cx + S + 1} ${shoulderY + 16}, ${cx + S} ${shoulderY}
    Q ${cx} ${shoulderY - 8} ${cx - S} ${shoulderY} Z`;

  const legHalf = T * 0.95;
  const legX = (side: -1 | 1) => cx + side * (H - legHalf + 0.5);
  const leg = (side: -1 | 1) => {
    const x = legX(side);
    return `M ${x - legHalf} ${hipY - 4} L ${x - legHalf * 0.55} ${footY - 4} L ${x + legHalf * 0.55} ${footY - 4} L ${x + legHalf} ${hipY - 4} Z`;
  };

  // Arms: hanging at first, double-biceps flex once the hero has evolved a bit.
  const arm = (side: -1 | 1) => {
    const sx = cx + side * (S - A * 0.4);
    const sy = shoulderY + 3;
    if (flex) {
      const ex = sx + side * (16 + A);
      const ey = sy + 4;
      const hx = ex - side * 2;
      const hy = sy - 22;
      return { sx, sy, ex, ey, hx, hy };
    }
    const ex = sx + side * (3 + B * 0.35 + A * 0.2);
    const ey = sy + 26;
    const hx = ex + side * 1;
    const hy = sy + 50;
    return { sx, sy, ex, ey, hx, hy };
  };

  const renderArm = (side: -1 | 1) => {
    const a = arm(side);
    const bicepX = (a.sx + a.ex) / 2;
    const bicepY = (a.sy + a.ey) / 2 - (flex ? A * 0.45 : 0);
    return (
      <g key={side}>
        <line x1={a.sx} y1={a.sy} x2={a.ex} y2={a.ey} stroke={skin} strokeWidth={A * 2} strokeLinecap="round" />
        <line x1={a.ex} y1={a.ey} x2={a.hx} y2={a.hy} stroke={skin} strokeWidth={A * 1.7} strokeLinecap="round" />
        {/* biceps bulge grows with definition */}
        <ellipse cx={bicepX} cy={bicepY} rx={flex ? 6 + A * 0.5 : A * 0.9} ry={A * (0.9 + D * 0.45)} fill={skin} />
        {D > 0.15 && (
          <path
            d={flex ? `M ${bicepX - 4} ${bicepY + 2} Q ${bicepX} ${bicepY - A * 0.8} ${bicepX + 4} ${bicepY + 2}` : `M ${bicepX - side * 2} ${bicepY - 4} Q ${bicepX + side * 2} ${bicepY} ${bicepX - side * 2} ${bicepY + 5}`}
            stroke={shade}
            strokeWidth={1.2}
            fill="none"
            opacity={D}
          />
        )}
        <circle cx={a.hx} cy={a.hy} r={A * 0.95 + 1} fill={skin} />
        {stage >= 3 && <rect x={a.hx - A - 1} y={a.hy + (flex ? 3 : -6)} width={(A + 1) * 2} height={3.5} rx={1.5} fill={accent} />}
      </g>
    );
  };

  const hair = () => {
    const c = look.hair;
    switch (look.hairStyle) {
      case 'bald':
        return null;
      case 'long':
        return (
          <>
            <path d={`M ${cx - 15} 34 Q ${cx - 17} 52 ${cx - 12} 60 L ${cx - 9} 34 Z`} fill={c} />
            <path d={`M ${cx + 15} 34 Q ${cx + 17} 52 ${cx + 12} 60 L ${cx + 9} 34 Z`} fill={c} />
            <path d={`M ${cx - 15} 32 Q ${cx} 8 ${cx + 15} 32 Q ${cx + 4} 24 ${cx - 15} 32 Z`} fill={c} />
          </>
        );
      case 'bun':
        return (
          <>
            <circle cx={cx} cy={14} r={6.5} fill={c} />
            <path d={`M ${cx - 15} 32 Q ${cx} 10 ${cx + 15} 32 Q ${cx} 22 ${cx - 15} 32 Z`} fill={c} />
          </>
        );
      default:
        return <path d={`M ${cx - 14.5} 31 Q ${cx - 4} 10 ${cx + 14.5} 29 Q ${cx + 10} 22 ${cx} 24 Q ${cx - 8} 24 ${cx - 14.5} 31 Z`} fill={c} />;
    }
  };

  const smile = 2 + stage * 0.9;

  return (
    <svg
      viewBox="-15 -18 150 216"
      width={size}
      height={(size * 216) / 150}
      className={className}
      style={ghost ? { opacity: 0.35, filter: 'grayscale(0.3)' } : undefined}
      role="img"
      aria-label="Your hero avatar"
    >
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity={0.55} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx={cx} cy={190} rx={30} ry={5} fill="rgba(0,0,0,0.35)" />

      {stage >= 4 && !ghost && <ellipse cx={cx} cy={100} rx={58} ry={100} fill={`url(#aura-${uid})`} opacity={0.5 + glow * 0.5} />}

      <g transform={`translate(${cx} 190) scale(${heightScale}) translate(${-cx} -190)`}>
        {/* legs */}
        {([-1, 1] as const).map((side) => (
          <g key={side}>
            <path d={leg(side)} fill={skin} />
            {D > 0.3 && <path d={`M ${legX(side) - side * 2} ${hipY + 18} Q ${legX(side) + side * 3} ${hipY + 30} ${legX(side)} ${hipY + 44}`} stroke={shade} strokeWidth={1.2} fill="none" opacity={D} />}
            <ellipse cx={legX(side) + side * 1.5} cy={footY - 1} rx={legHalf * 0.75 + 3} ry={4.5} fill="#1f2937" />
            <rect x={legX(side) - legHalf * 0.6} y={footY - 6} width={legHalf * 1.2} height={2} fill={accent} opacity={0.9} />
          </g>
        ))}

        {/* shorts */}
        <path
          d={`M ${cx - W - bellyX - 0.5} ${waistY + 2} L ${cx + W + bellyX + 0.5} ${waistY + 2} L ${cx + H + 1.5} ${hipY + 18} L ${cx + 2} ${hipY + 18} L ${cx} ${hipY + 6} L ${cx - 2} ${hipY + 18} L ${cx - H - 1.5} ${hipY + 18} Z`}
          fill="#1e293b"
        />
        <path d={`M ${cx - H - 1.2} ${hipY + 14} L ${cx - H + 0.5} ${hipY + 4}`} stroke={accent} strokeWidth={2} />
        <path d={`M ${cx + H + 1.2} ${hipY + 14} L ${cx + H - 0.5} ${hipY + 4}`} stroke={accent} strokeWidth={2} />

        {/* neck */}
        <rect x={cx - 5} y={42} width={10} height={16} rx={3} fill={skin} />

        {/* torso / shirt */}
        <path d={torso} fill={look.outfit} />
        {/* muscle definition lines */}
        <g stroke={shade} strokeWidth={1.3} fill="none" opacity={D}>
          <path d={`M ${cx - S * 0.7} ${shoulderY + 14} Q ${cx - S * 0.35} ${shoulderY + 22} ${cx} ${shoulderY + 16} Q ${cx + S * 0.35} ${shoulderY + 22} ${cx + S * 0.7} ${shoulderY + 14}`} />
          <line x1={cx} y1={shoulderY + 18} x2={cx} y2={waistY + 1} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <line x1={cx - 7} y1={shoulderY + 27 + i * 6} x2={cx - 1.5} y2={shoulderY + 28 + i * 6} />
              <line x1={cx + 1.5} y1={shoulderY + 28 + i * 6} x2={cx + 7} y2={shoulderY + 27 + i * 6} />
            </g>
          ))}
        </g>
        {/* belt line */}
        <rect x={cx - W - bellyX} y={waistY} width={(W + bellyX) * 2} height={3} fill={accent} opacity={0.85} />
        {/* build emblem */}
        <text x={cx} y={shoulderY + 12} textAnchor="middle" fontSize={8}>
          {BUILDS[build].emoji}
        </text>

        {/* arms */}
        {renderArm(-1)}
        {renderArm(1)}

        {/* head */}
        <circle cx={cx} cy={32} r={14.5} fill={skin} />
        {hair()}
        {stage >= 2 && <rect x={cx - 15} y={23} width={30} height={4} rx={2} fill={accent} />}
        {stage >= 2 && <path d={`M ${cx + 14} 25 l 7 -3 l -2 5 l 5 2 z`} fill={accent} />}
        {/* face */}
        {stage >= 3 && (
          <g stroke="#1f2937" strokeWidth={1.3} strokeLinecap="round">
            <line x1={cx - 8} y1={29} x2={cx - 3} y2={30.5} />
            <line x1={cx + 8} y1={29} x2={cx + 3} y2={30.5} />
          </g>
        )}
        <circle cx={cx - 5} cy={33} r={1.7} fill="#1f2937" />
        <circle cx={cx + 5} cy={33} r={1.7} fill="#1f2937" />
        <circle cx={cx - 9} cy={37} r={2} fill="#f87171" opacity={0.35} />
        <circle cx={cx + 9} cy={37} r={2} fill="#f87171" opacity={0.35} />
        <path d={`M ${cx - 4.5} 38.5 Q ${cx} ${38.5 + smile} ${cx + 4.5} 38.5`} stroke="#1f2937" strokeWidth={1.4} fill={stage >= 4 ? '#fff' : 'none'} strokeLinecap="round" />

        {/* crown */}
        {stage >= 5 && !ghost && (
          <path d={`M ${cx - 10} 12 L ${cx - 10} 2 L ${cx - 5} 7 L ${cx} -2 L ${cx + 5} 7 L ${cx + 10} 2 L ${cx + 10} 12 Z`} fill="#facc15" stroke="#a16207" strokeWidth={0.8} />
        )}
      </g>

      {/* sparkles */}
      {stage >= 4 && !ghost && (
        <g fill="#fde68a">
          {[
            [14, 40],
            [104, 60],
            [20, 140],
            [100, 150],
          ].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y - 4} L ${x + 1.2} ${y - 1.2} L ${x + 4} ${y} L ${x + 1.2} ${y + 1.2} L ${x} ${y + 4} L ${x - 1.2} ${y + 1.2} L ${x - 4} ${y} L ${x - 1.2} ${y - 1.2} Z`} className="animate-pulse" />
          ))}
        </g>
      )}
    </svg>
  );
}
