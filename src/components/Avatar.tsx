import { useId } from 'react';
import { BUILDS, type Pose } from '../data/builds';
import type { BodyShape } from '../engine/avatarBody';
import type { AvatarLook, BuildId } from '../types';

interface Props {
  shape: BodyShape;
  look: AvatarLook;
  build: BuildId;
  stage: number; // 1..5
  size?: number;
  ghost?: boolean; // translucent "future you" silhouette
  lashes?: boolean;
  className?: string;
}

// ---------- color helpers ----------
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Mix a color toward white (t > 0) or black (t < 0). */
export function tint(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  const f = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/**
 * Chibi-style hero: big head and eyes, compact body, soft shading.
 * Body proportions come from `shape`, so the same character visibly
 * transforms toward the user's goal build as they level up.
 */
export default function Avatar({ shape, look, build, stage, size = 180, ghost = false, lashes = false, className = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  const accent = BUILDS[build].color;
  const k = 0.84; // chibi bodies are a little narrower relative to the big head
  const S = shape.shoulder * k;
  const W = shape.waist * k;
  const H = shape.hip * k;
  const B = shape.belly * k;
  const A = shape.arm * 1.05;
  const T = shape.thigh * 0.92;
  const D = shape.definition;
  const { glow, heightScale } = shape;

  const cx = 60;
  const headY = 42;
  const headR = 26;
  const shoulderY = 76;
  const waistY = 107;
  const hipY = 120;
  const footY = 180;
  const bellyX = B * 0.55;
  // Everyone starts relaxed; the class's signature pose unlocks with evolution stage 3.
  const pose: Pose | 'relaxed' = stage >= 3 ? BUILDS[build].pose : 'relaxed';
  const neckW = (shape.neck ?? 12) * 0.95;
  const traps = Math.max(0, (shape.neck ?? 12) - 12) * 1.4;
  const crop = look.top === 'crop';
  const shortsColor = look.shorts ?? '#1e293b';
  const skin = look.skin;
  const skinDark = tint(skin, -0.18);
  const line = 'rgba(40,20,10,0.28)';
  const hair = look.hair;

  // ---------- body paths ----------
  const torso = `M ${cx - S} ${shoulderY}
    C ${cx - S - 1} ${shoulderY + 13}, ${cx - W - B} ${waistY - 12}, ${cx - W - bellyX} ${waistY}
    L ${cx - H} ${hipY}
    L ${cx + H} ${hipY}
    L ${cx + W + bellyX} ${waistY}
    C ${cx + W + B} ${waistY - 12}, ${cx + S + 1} ${shoulderY + 13}, ${cx + S} ${shoulderY}
    Q ${cx} ${shoulderY - 7 - traps} ${cx - S} ${shoulderY} Z`;

  const legHalf = T * 0.95;
  const legX = (side: -1 | 1) => cx + side * (H - legHalf + 0.5);
  /** Per-pose leg tweaks: outward foot shift and how far the foot is lifted. */
  const legPose = (side: -1 | 1): { dx: number; lift: number } => {
    switch (pose) {
      case 'arms-crossed':
        return { dx: side * 5, lift: 0 }; // wide power stance
      case 'double-biceps':
        return { dx: side * 3, lift: 0 };
      case 'fighting-stance':
        return { dx: side * 6, lift: 0 };
      case 'running':
        return side === -1 ? { dx: 3, lift: 20 } : { dx: 2, lift: 0 }; // knee drive
      default:
        return { dx: 0, lift: 0 };
    }
  };
  const leg = (side: -1 | 1) => {
    const x = legX(side);
    const { dx, lift } = legPose(side);
    const fx = x + dx;
    const fy = footY - 8 - lift;
    const kneeX = x + dx * 0.5 + (lift ? -side * 4 : 0);
    return `M ${x - legHalf} ${hipY - 4} Q ${kneeX - legHalf * 0.95} ${hipY + 26 - lift * 0.6} ${fx - legHalf * 0.6} ${fy} L ${fx + legHalf * 0.6} ${fy} Q ${kneeX + legHalf * 0.95} ${hipY + 26 - lift * 0.6} ${x + legHalf} ${hipY - 4} Z`;
  };

  type ArmPts = { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number; flexed: boolean };
  /** Shoulder → elbow → fist for each pose. side -1 is the viewer's left. */
  const armPoints = (side: -1 | 1): ArmPts => {
    const sx = cx + side * (S - A * 0.45);
    const sy = shoulderY + 4;
    const flexArm = (): ArmPts => {
      const ex = sx + side * (14 + A);
      const ey = sy + 7;
      return { sx, sy, ex, ey, hx: ex - side * 1, hy: sy - 18, flexed: true };
    };
    const onHip = (): ArmPts => {
      const ex = sx + side * (11 + A * 0.5);
      const ey = sy + 15;
      return { sx, sy, ex, ey, hx: cx + side * (W + bellyX + 1), hy: waistY - 3, flexed: false };
    };
    switch (pose) {
      case 'double-biceps':
        return flexArm();
      case 'one-arm-flex':
        return side === -1 ? flexArm() : onHip();
      case 'hands-on-hips':
        return onHip();
      case 'arms-crossed': {
        const ex = sx + side * (2 + A * 0.3);
        const ey = sy + 21 + side * 1.5;
        return { sx, sy, ex, ey, hx: cx - side * (S * 0.78), hy: ey - 3, flexed: false };
      }
      case 'fighting-stance':
        if (side === -1) {
          // lead guard: fist up and out
          return { sx, sy, ex: sx - 11 - A * 0.3, ey: sy + 12, hx: sx - 7, hy: sy - 10, flexed: false };
        }
        // rear hand protecting the chin
        return { sx, sy, ex: sx + 5 + A * 0.3, ey: sy + 17, hx: cx + 9, hy: headY + 24, flexed: false };
      case 'running':
        if (side === -1) return { sx, sy, ex: sx - 7, ey: sy + 17, hx: sx + 1, hy: sy + 4, flexed: false }; // pumping forward
        return { sx, sy, ex: sx + 9, ey: sy + 15, hx: sx + 15, hy: sy + 31, flexed: false }; // swinging back
      default: {
        const ex = sx + side * (3 + B * 0.35 + A * 0.25);
        const ey = sy + 20;
        return { sx, sy, ex, ey, hx: ex + side * 1, hy: sy + 39, flexed: false };
      }
    }
  };

  const renderArm = (side: -1 | 1) => {
    const a = armPoints(side);
    const Aw = 4.6 + (A - 5) * 0.6; // limb thickness grows slower; the biceps bulge shows the muscle
    const fistR = Math.min(4.2 + A * 0.4, 8.5);
    const bandW = Aw * 1.75 + 1.5;
    const deg = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;
    const upperAngle = deg(a.ex - a.sx, a.ey - a.sy);
    const foreAngle = deg(a.hx - a.ex, a.hy - a.ey);
    const upperLen = Math.hypot(a.ex - a.sx, a.ey - a.sy);
    const foreLen = Math.hypot(a.hx - a.ex, a.hy - a.ey) || 1;
    const bx = (a.sx + a.ex) / 2;
    const by = (a.sy + a.ey) / 2 - (a.flexed ? A * 0.5 : 0);
    // wristband sits just before the fist, across the forearm
    const wt = Math.max(0, 1 - (fistR + 2.5) / foreLen);
    const wx = a.ex + (a.hx - a.ex) * wt;
    const wy = a.ey + (a.hy - a.ey) * wt;
    return (
      <g key={`arm${side}`}>
        <line x1={a.sx} y1={a.sy} x2={a.ex} y2={a.ey} stroke={url('skin')} strokeWidth={Aw * 2.1} strokeLinecap="round" />
        <line x1={a.ex} y1={a.ey} x2={a.hx} y2={a.hy} stroke={url('skin')} strokeWidth={Aw * 1.75} strokeLinecap="round" />
        {/* biceps bulge grows with definition */}
        {a.flexed ? (
          <ellipse cx={bx} cy={by} rx={5 + A * 0.45} ry={Aw * (0.95 + D * 0.55)} fill={url('skin')} />
        ) : (
          <ellipse cx={bx} cy={by} rx={Math.max(Aw, upperLen * 0.4)} ry={Aw * (0.95 + D * 0.4)} fill={url('skin')} transform={`rotate(${upperAngle} ${bx} ${by})`} />
        )}
        {D > 0.15 && (
          <path
            d={a.flexed ? `M ${bx - 4.5} ${by + 2.5} Q ${bx} ${by - A * 0.9} ${bx + 4.5} ${by + 2.5}` : `M ${bx - 3} ${by - Aw * 0.5} Q ${bx} ${by - Aw * 1.1} ${bx + 3} ${by - Aw * 0.5}`}
            stroke={line}
            strokeWidth={1.1}
            fill="none"
            opacity={D}
            transform={a.flexed ? undefined : `rotate(${upperAngle} ${bx} ${by})`}
          />
        )}
        {/* fist */}
        <circle cx={a.hx} cy={a.hy} r={fistR} fill={url('skin')} />
        <path d={`M ${a.hx - fistR * 0.6} ${a.hy - fistR * 0.25} q ${fistR * 0.6} ${-fistR * 0.35} ${fistR * 1.2} 0`} stroke={line} strokeWidth={0.9} fill="none" />
        {/* sweatband */}
        {stage >= 3 && (
          <rect
            x={wx - bandW / 2}
            y={wy - 2.25}
            width={bandW}
            height={4.5}
            rx={2}
            fill={tint(accent, 0.25)}
            stroke={tint(accent, -0.2)}
            strokeWidth={0.5}
            transform={`rotate(${foreAngle - 90} ${wx} ${wy})`}
          />
        )}
      </g>
    );
  };

  // ---------- hair ----------
  const capPath = `M ${cx - headR} ${headY + 2}
    Q ${cx - headR - 2} ${headY - headR - 4} ${cx} ${headY - headR - 1}
    Q ${cx + headR + 2} ${headY - headR - 4} ${cx + headR} ${headY + 2}
    Q ${cx + headR - 4} ${headY - 12} ${cx + 8} ${headY - 15}
    Q ${cx + 2} ${headY - 9} ${cx - 6} ${headY - 13}
    Q ${cx - 14} ${headY - 9} ${cx - headR} ${headY + 2} Z`;

  const hairBack = () => {
    switch (look.hairStyle) {
      case 'long':
        return <path d={`M ${cx - headR - 2} ${headY - 4} Q ${cx - headR - 6} ${headY + 30} ${cx - 20} ${shoulderY + 10} L ${cx + 20} ${shoulderY + 10} Q ${cx + headR + 6} ${headY + 30} ${cx + headR + 2} ${headY - 4} Z`} fill={url('hair')} />;
      case 'bun':
        return (
          <>
            <circle cx={cx - 19} cy={headY - headR + 1} r={10.5} fill={url('hair')} />
            <circle cx={cx + 19} cy={headY - headR + 1} r={10.5} fill={url('hair')} />
            <path d={`M ${cx - 25} ${headY - headR + 1} q 6 -6 12 0`} stroke={tint(hair, 0.35)} strokeWidth={1.2} fill="none" opacity={0.7} />
            <path d={`M ${cx + 13} ${headY - headR + 1} q 6 -6 12 0`} stroke={tint(hair, 0.35)} strokeWidth={1.2} fill="none" opacity={0.7} />
          </>
        );
      case 'ponytail':
        return <path d={`M ${cx + 14} ${headY - headR + 4} Q ${cx + headR + 22} ${headY - 10} ${cx + headR + 8} ${headY + 34} Q ${cx + headR + 4} ${headY + 10} ${cx + 10} ${headY - headR + 10} Z`} fill={url('hair')} />;
      default:
        return null;
    }
  };

  const hairFront = () => {
    if (look.hairStyle === 'bald') {
      return <ellipse cx={cx - 9} cy={headY - 17} rx={7} ry={3.5} fill="#fff" opacity={0.3} transform={`rotate(-25 ${cx - 9} ${headY - 17})`} />;
    }
    return (
      <>
        <path d={capPath} fill={url('hair')} />
        <path d={`M ${cx - 16} ${headY - 19} Q ${cx - 6} ${headY - 25} ${cx + 4} ${headY - 23}`} stroke={tint(hair, 0.4)} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
        {look.hairStyle === 'long' && (
          <>
            <path d={`M ${cx - headR} ${headY + 1} Q ${cx - headR - 1} ${headY + 16} ${cx - headR + 4} ${headY + 22} L ${cx - headR + 5} ${headY + 2} Z`} fill={url('hair')} />
            <path d={`M ${cx + headR} ${headY + 1} Q ${cx + headR + 1} ${headY + 16} ${cx + headR - 4} ${headY + 22} L ${cx + headR - 5} ${headY + 2} Z`} fill={url('hair')} />
          </>
        )}
      </>
    );
  };

  // ---------- face ----------
  // Brows go from soft & raised (unsure rookie) to angled & bold (determined hero).
  const browIn = headY - 9 + (stage - 1) * 0.9;
  const browOut = headY - 11 - (stage - 1) * 0.2;
  const browW = 2 + stage * 0.35;
  const eye = (side: -1 | 1) => {
    const ex = cx + side * 10.5;
    const ey = headY + 3;
    return (
      <g key={`eye${side}`}>
        <ellipse cx={ex} cy={ey} rx={6.4} ry={7.4} fill="#fff" />
        <ellipse cx={ex + side * -0.4} cy={ey + 0.8} rx={4.8} ry={5.9} fill={url('iris')} />
        <circle cx={ex + side * -0.4} cy={ey + 1.2} r={2.5} fill="#120a05" />
        <circle cx={ex + 1.6} cy={ey - 1.6} r={1.7} fill="#fff" />
        <circle cx={ex - 1.6} cy={ey + 3} r={0.8} fill="#fff" />
        {/* upper lid */}
        <path d={`M ${ex - 6.8} ${ey - 1} Q ${ex} ${ey - 9.5} ${ex + 6.8} ${ey - 1}`} stroke="#1f130b" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {lashes && <path d={`M ${ex + side * 6.4} ${ey - 2} l ${side * 2.6} -2.2`} stroke="#1f130b" strokeWidth={1.4} strokeLinecap="round" />}
      </g>
    );
  };

  const mouth = () => {
    const my = headY + 15;
    if (stage >= 4)
      return (
        <g>
          <path d={`M ${cx - 6} ${my} Q ${cx} ${my + 8} ${cx + 6} ${my} Z`} fill="#7f1d1d" />
          <path d={`M ${cx - 5} ${my + 0.4} L ${cx + 5} ${my + 0.4} L ${cx + 4} ${my + 2.2} L ${cx - 4} ${my + 2.2} Z`} fill="#fff" />
          <path d={`M ${cx - 6} ${my} Q ${cx} ${my + 8} ${cx + 6} ${my}`} stroke="#5b1a10" strokeWidth={1.2} fill="none" strokeLinejoin="round" />
        </g>
      );
    if (stage === 3) return <path d={`M ${cx - 4.5} ${my + 0.5} Q ${cx + 0.5} ${my + 4} ${cx + 5} ${my - 1.2}`} stroke="#5b1a10" strokeWidth={1.5} fill="none" strokeLinecap="round" />;
    return <path d={`M ${cx - 3.5} ${my} Q ${cx} ${my + 3} ${cx + 3.5} ${my}`} stroke="#5b1a10" strokeWidth={1.5} fill="none" strokeLinecap="round" />;
  };

  // ---------- sneakers ----------
  const sneaker = (side: -1 | 1) => {
    const { dx, lift } = legPose(side);
    const x = legX(side) + side * 1.5 + dx;
    const y = footY - lift;
    return (
      <g key={`shoe${side}`}>
        <rect x={x - legHalf * 0.62} y={y - 11} width={legHalf * 1.24} height={4} rx={1.5} fill="#f8fafc" />
        <path d={`M ${x - 9} ${y - 1} Q ${x - 10} ${y - 9} ${x - 4} ${y - 8} L ${x + 3} ${y - 8} Q ${x + 10} ${y - 7} ${x + 10.5} ${y - 1} Z`} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={0.6} />
        <rect x={x - 10} y={y - 2.2} width={21} height={3.6} rx={1.8} fill="#cbd5e1" />
        <path d={`M ${x - 3} ${y - 7} l 4 0 M ${x - 2.5} ${y - 5.2} l 4 0`} stroke={tint(accent, -0.1)} strokeWidth={0.9} strokeLinecap="round" />
        <path d={`M ${x + 3} ${y - 4} q 3 -1 6 1`} stroke={accent} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </g>
    );
  };

  const outfitBottom = crop ? shoulderY + 19 : waistY + 3;

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
        <radialGradient id={id('aura')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity={0.55} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={id('skin')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint(skin, 0.18)} />
          <stop offset="55%" stopColor={skin} />
          <stop offset="100%" stopColor={skinDark} />
        </linearGradient>
        <radialGradient id={id('face')} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={tint(skin, 0.22)} />
          <stop offset="70%" stopColor={skin} />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        <linearGradient id={id('hair')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={tint(hair, 0.22)} />
          <stop offset="100%" stopColor={tint(hair, -0.25)} />
        </linearGradient>
        <linearGradient id={id('outfit')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint(look.outfit, 0.25)} />
          <stop offset="100%" stopColor={tint(look.outfit, -0.15)} />
        </linearGradient>
        <linearGradient id={id('shorts')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint(shortsColor, 0.15)} />
          <stop offset="100%" stopColor={tint(shortsColor, -0.2)} />
        </linearGradient>
        <radialGradient id={id('iris')} cx="50%" cy="65%" r="60%">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#3b1f0e" />
        </radialGradient>
        <clipPath id={id('torso')}>
          <path d={torso} />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx={cx} cy={186} rx={32} ry={5} fill="rgba(0,0,0,0.35)" />

      {stage >= 4 && !ghost && <ellipse cx={cx} cy={98} rx={60} ry={100} fill={url('aura')} opacity={0.5 + glow * 0.5} />}

      <g transform={`translate(${cx} 186) scale(${heightScale}) translate(${-cx} -186)`}>
        {hairBack()}

        {/* legs */}
        {([-1, 1] as const).map((side) => (
          <g key={`leg${side}`}>
            <path d={leg(side)} fill={url('skin')} />
            {D > 0.3 && <path d={`M ${legX(side) - side * 2} ${hipY + 16} Q ${legX(side) + side * 3} ${hipY + 26} ${legX(side)} ${hipY + 38}`} stroke={line} strokeWidth={1.1} fill="none" opacity={D} />}
          </g>
        ))}
        {sneaker(-1)}
        {sneaker(1)}

        {/* shorts */}
        <path
          d={`M ${cx - W - bellyX - 0.5} ${waistY + 1} L ${cx + W + bellyX + 0.5} ${waistY + 1} L ${cx + H + 2} ${hipY + 15} Q ${cx + H / 2} ${hipY + 17} ${cx + 1.5} ${hipY + 14} L ${cx} ${hipY + 6} L ${cx - 1.5} ${hipY + 14} Q ${cx - H / 2} ${hipY + 17} ${cx - H - 2} ${hipY + 15} Z`}
          fill={url('shorts')}
        />
        <rect x={cx - W - bellyX - 0.5} y={waistY} width={(W + bellyX) * 2 + 1} height={3.4} rx={1.5} fill={tint(shortsColor, 0.35)} />

        {/* neck */}
        <rect x={cx - neckW / 2} y={headY + 18} width={neckW} height={shoulderY - headY - 14} rx={4} fill={skinDark} />

        {/* torso: skin, then the top clipped to the torso shape */}
        <path d={torso} fill={url('skin')} />
        <g clipPath={url('torso')}>
          <rect x={cx - 60} y={shoulderY - 12} width={120} height={outfitBottom - shoulderY + 12} fill={url('outfit')} />
          {/* neckline */}
          <ellipse cx={cx} cy={shoulderY - 3} rx={crop ? 8.5 : 7.5} ry={crop ? 9 : 6} fill={url('skin')} />
          {crop && <rect x={cx - 60} y={outfitBottom - 3} width={120} height={3} fill={tint(look.outfit, -0.25)} />}
          {/* soft shadow under the big head */}
          <ellipse cx={cx} cy={shoulderY - 4} rx={S * 0.7} ry={5} fill="rgba(0,0,0,0.14)" />
        </g>
        {/* muscle definition */}
        <g stroke={line} strokeWidth={1.2} fill="none" opacity={D}>
          <path d={`M ${cx - S * 0.7} ${shoulderY + 12} Q ${cx - S * 0.35} ${shoulderY + 19} ${cx} ${shoulderY + 14} Q ${cx + S * 0.35} ${shoulderY + 19} ${cx + S * 0.7} ${shoulderY + 12}`} />
          <line x1={cx} y1={shoulderY + 21} x2={cx} y2={waistY - 1} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <line x1={cx - 6.5} y1={shoulderY + 23 + i * 5} x2={cx - 1.5} y2={shoulderY + 24 + i * 5} />
              <line x1={cx + 1.5} y1={shoulderY + 24 + i * 5} x2={cx + 6.5} y2={shoulderY + 23 + i * 5} />
            </g>
          ))}
        </g>
        {B > 2 && <path d={`M ${cx - 4} ${waistY - 4} q 4 2 8 0`} stroke={line} strokeWidth={1} fill="none" opacity={Math.min(1, B / 6)} />}
        {/* build emblem */}
        <text x={cx} y={shoulderY + 11} textAnchor="middle" fontSize={7}>
          {BUILDS[build].emoji}
        </text>

        {renderArm(-1)}
        {renderArm(1)}

        {/* head */}
        <circle cx={cx - headR + 1} cy={headY + 5} r={4.5} fill={skinDark} />
        <circle cx={cx + headR - 1} cy={headY + 5} r={4.5} fill={skinDark} />
        <ellipse cx={cx} cy={headY} rx={headR} ry={headR - 1} fill={url('face')} />
        {hairFront()}
        {stage >= 2 && (
          <g>
            <path d={`M ${cx - headR - 0.5} ${headY - 8} Q ${cx} ${headY - 18} ${cx + headR + 0.5} ${headY - 8} L ${cx + headR} ${headY - 1.5} Q ${cx} ${headY - 11} ${cx - headR} ${headY - 1.5} Z`} fill={tint(accent, 0.15)} stroke={tint(accent, -0.25)} strokeWidth={0.6} />
            <path d={`M ${cx - 12} ${headY - 10} Q ${cx} ${headY - 15} ${cx + 12} ${headY - 10}`} stroke="#fff" strokeWidth={0.9} opacity={0.5} fill="none" />
          </g>
        )}

        {/* brows */}
        <path d={`M ${cx - 16} ${browOut} Q ${cx - 11} ${browOut - 1.5} ${cx - 5.5} ${browIn}`} stroke={tint(hair, -0.2)} strokeWidth={browW} strokeLinecap="round" fill="none" />
        <path d={`M ${cx + 16} ${browOut} Q ${cx + 11} ${browOut - 1.5} ${cx + 5.5} ${browIn}`} stroke={tint(hair, -0.2)} strokeWidth={browW} strokeLinecap="round" fill="none" />
        {eye(-1)}
        {eye(1)}
        <path d={`M ${cx - 1.5} ${headY + 11} q 1.5 1.2 3 0`} stroke={skinDark} strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <ellipse cx={cx - 16} cy={headY + 12} rx={4} ry={2.4} fill="#fb7185" opacity={0.35} />
        <ellipse cx={cx + 16} cy={headY + 12} rx={4} ry={2.4} fill="#fb7185" opacity={0.35} />
        {mouth()}

        {/* crown */}
        {stage >= 5 && !ghost && (
          <g transform={`translate(0 ${headY - headR - 10})`}>
            <path d={`M ${cx - 11} 10 L ${cx - 11} 0 L ${cx - 5.5} 5 L ${cx} -3 L ${cx + 5.5} 5 L ${cx + 11} 0 L ${cx + 11} 10 Z`} fill="#facc15" stroke="#a16207" strokeWidth={0.8} />
            <circle cx={cx} cy={6} r={1.8} fill="#ef4444" />
          </g>
        )}
      </g>

      {/* sparkles */}
      {stage >= 4 && !ghost && (
        <g fill="#fde68a">
          {[
            [6, 40],
            [114, 60],
            [8, 140],
            [112, 150],
          ].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y - 4} L ${x + 1.2} ${y - 1.2} L ${x + 4} ${y} L ${x + 1.2} ${y + 1.2} L ${x} ${y + 4} L ${x - 1.2} ${y + 1.2} L ${x - 4} ${y} L ${x - 1.2} ${y - 1.2} Z`} className="animate-pulse" />
          ))}
        </g>
      )}
    </svg>
  );
}
