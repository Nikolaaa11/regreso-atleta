import { animate, AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export const spring = { type: 'spring', stiffness: 380, damping: 32 } as const;

export function Ring({ value, size = 96, stroke = 12, color, track = 'rgba(0,0,0,0.08)', children }: { value: number; size?: number; stroke?: number; color: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.min(1, Math.max(0.001, value)) }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      {children}
    </div>
  );
}

export function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const reduce = useReducedMotion();
  const from = useRef(0);
  useEffect(() => {
    if (reduce) {
      setV(to);
      return;
    }
    const c = animate(from.current, to, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(x) });
    from.current = to;
    return () => c.stop();
  }, [to, reduce]);
  return <>{v.toFixed(decimals)}{suffix}</>;
}

export function Press({ children, className, onClick, disabled, style }: { children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  return (
    <motion.button className={className} onClick={onClick} disabled={disabled} style={style} whileTap={{ scale: 0.96 }} transition={spring}>
      {children}
    </motion.button>
  );
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const controls = useDragControls();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="sheet-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => {
              if (i.offset.y > 120 || i.velocity.y > 600) onClose();
            }}
          >
            <div className="grab-area" onPointerDown={(e) => controls.start(e)}>
              <div className="grab" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Stepper({ value, onChange, max = 99 }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="stepper">
      <Press onClick={() => onChange(Math.max(0, value - 1))}>−</Press>
      <b>
        <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring} style={{ display: 'inline-block' }}>
          {value}
        </motion.span>
      </b>
      <Press onClick={() => onChange(Math.min(max, value + 1))}>+</Press>
    </div>
  );
}

export function Spark({ data, color, height = 120, unit = '' }: { data: number[]; color: string; height?: number; unit?: string }) {
  if (data.length < 2) return <div className="small" style={{ padding: '18px 0' }}>Registra al menos 2 mediciones para ver la tendencia.</div>;
  const w = 600;
  const pad = 14;
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / (max - min)) * (height - pad * 2)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <motion.path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle cx={last[0]} cy={last[1]} r={7} fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, ...spring }} />
      <text x={last[0] - 6} y={last[1] - 14} textAnchor="end" fontSize="20" fontWeight="700" fill="#1d1d1f">
        {data[data.length - 1]}
        {unit}
      </text>
    </svg>
  );
}

export const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 260, damping: 28 } } as const;
