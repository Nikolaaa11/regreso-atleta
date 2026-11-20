import { useReducedMotion } from 'motion/react';
import { useSyncExternalStore } from 'react';
import { ANIM, samplePose, skeleton, type V } from '../lib/anim';

/* Un solo reloj compartido para todas las figuras visibles. */
const subs = new Set<() => void>();
let now = 0;
let raf = 0;
function loop(ts: number) {
  now = ts / 1000;
  subs.forEach((f) => f());
  raf = requestAnimationFrame(loop);
}
function subscribe(cb: () => void) {
  subs.add(cb);
  if (subs.size === 1) raf = requestAnimationFrame(loop);
  return () => {
    subs.delete(cb);
    if (subs.size === 0) cancelAnimationFrame(raf);
  };
}
const useClock = () => useSyncExternalStore(subscribe, () => now);

const pts = (...p: V[]) => p.map((v) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(' ');
const INK = '#1d1d1f';
const FAR = '#b4b4ba';
const ACCENT = '#ff375f';

export function ExerciseAnim({ name, className, label }: { name: string; className?: string; label?: string }) {
  const t = useClock();
  const reduce = useReducedMotion();
  const def = ANIM[name] ?? ANIM.Descanso;
  const p = samplePose(def, reduce ? def.dur * 0.5 / def.seq.length : t);
  const s = skeleton(p, def.front);
  const torso = p.arch ? `M${s.hip[0]} ${s.hip[1]} Q${s.ctrl[0]} ${s.ctrl[1]} ${s.neck[0]} ${s.neck[1]}` : `M${s.hip[0]} ${s.hip[1]} L${s.neck[0]} ${s.neck[1]}`;
  const line = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

  return (
    <div className={className} role="img" aria-label={label ?? `Demostración: ${name}`}>
      <svg viewBox="0 -12 240 156" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <line x1="10" y1="139.5" x2="230" y2="139.5" stroke="#d2d2d7" strokeWidth="2" strokeLinecap="round" />
        {def.prop === 'chair' && (
          <g stroke="#c7c7cc" strokeWidth="5" strokeLinecap="round">
            <line x1="28" y1="104" x2="100" y2="104" />
            <line x1="34" y1="104" x2="34" y2="138" />
            <line x1="94" y1="104" x2="94" y2="138" />
            <line x1="28" y1="104" x2="28" y2="66" />
          </g>
        )}
        {def.prop === 'bench' && (
          <g stroke="#c7c7cc" strokeWidth="5" strokeLinecap="round">
            <line x1="46" y1="97" x2="96" y2="97" />
            <line x1="52" y1="97" x2="52" y2="138" />
            <line x1="90" y1="97" x2="90" y2="138" />
          </g>
        )}
        {/* extremidades lejanas */}
        <g {...line} stroke={FAR} strokeWidth="7">
          <polyline points={pts(s.neck, s.eB, s.hB)} />
          <polyline points={pts(s.hip, s.kB, s.fB, s.tB)} />
        </g>
        {/* torso */}
        <path d={torso} {...line} stroke={INK} strokeWidth="9" />
        {/* extremidades cercanas */}
        <g {...line} stroke={INK} strokeWidth="7">
          <polyline points={pts(s.neck, s.eA, s.hA)} />
          <polyline points={pts(s.hip, s.kA, s.fA, s.tA)} />
        </g>
        <circle cx={s.head[0]} cy={s.head[1]} r="9.5" fill={INK} />
        <circle cx={s.hip[0]} cy={s.hip[1]} r="3.4" fill={ACCENT} />
      </svg>
    </div>
  );
}
