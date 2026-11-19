import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fmt, type Phase, type Workout } from '../lib/store';
import { kcalFor, workoutMinutes } from '../lib/plan';
import { Press, Ring, Sheet, spring } from './ui';

export interface Result {
  durationSec: number;
  stepsDone: number;
  stepsTotal: number;
  kcal: number;
  rpe?: number;
  note?: string;
  fav: boolean;
}

const PHASE: Record<Phase, { label: string; color: string; bg: string }> = {
  warm: { label: 'Calentamiento', color: '#ff9f0a', bg: '#fff9f0' },
  work: { label: 'Trabajo', color: '#ff375f', bg: '#ffffff' },
  rest: { label: 'Descanso', color: '#0a84ff', bg: '#f2f7ff' },
  cool: { label: 'Enfriamiento', color: '#32ade6', bg: '#f0fafe' },
};

let ctx: AudioContext | null = null;
function beep(freq = 880, dur = 0.12) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.value = 0.07;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* sin audio */
  }
}
const vib = (p: number | number[]) => {
  try {
    navigator.vibrate?.(p);
  } catch {
    /* sin vibración */
  }
};

export function Player({ workout, weightKg, onExit }: { workout: Workout; weightKg: number; onExit: (r: Result | null) => void }) {
  const steps = workout.steps;
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [total, setTotal] = useState(0);
  const [paused, setPaused] = useState(false);
  const [count, setCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [early, setEarly] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sound, setSound] = useState(true);
  const [rpe, setRpe] = useState<number | undefined>();
  const [note, setNote] = useState('');
  const [fav, setFav] = useState(false);
  const last = useRef(performance.now());
  const beeped = useRef(-1);
  const lock = useRef(false);
  const step = steps[idx];
  const running = !paused && !finished && !confirm;

  useEffect(() => {
    last.current = performance.now();
    const id = setInterval(() => {
      const n = performance.now();
      const dt = Math.min((n - last.current) / 1000, 1);
      last.current = n;
      if (!running) return;
      setT((x) => x + dt);
      setTotal((x) => x + dt);
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    let lockObj: { release: () => Promise<void> } | null = null;
    (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock
      ?.request('screen')
      .then((l) => (lockObj = l))
      .catch(() => {});
    return () => {
      lockObj?.release().catch(() => {});
    };
  }, []);

  const next = useCallback(() => {
    if (lock.current) return;
    lock.current = true;
    if (idx + 1 >= steps.length) {
      setFinished(true);
      if (sound) beep(1046, 0.35);
      vib([40, 60, 40]);
    } else {
      setIdx(idx + 1);
      setT(0);
      setCount(0);
      beeped.current = -1;
      if (sound) beep(steps[idx + 1].phase === 'rest' ? 740 : 988, 0.16);
      vib(25);
    }
  }, [idx, steps, sound]);

  useEffect(() => {
    lock.current = false;
  }, [idx]);

  useEffect(() => {
    if (finished || step.kind !== 'time') return;
    const rem = (step.seconds ?? 0) - t;
    const sec = Math.ceil(rem);
    if (sec <= 3 && sec >= 1 && beeped.current !== sec) {
      beeped.current = sec;
      if (sound) beep(660, 0.08);
    }
    if (rem <= 0) next();
  }, [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const prev = () => {
    if (idx === 0) return;
    setIdx(idx - 1);
    setT(0);
    setCount(0);
    beeped.current = -1;
  };

  const finishEarly = () => {
    setEarly(true);
    setConfirm(false);
    setFinished(true);
  };

  const tap = () => {
    if (step.kind !== 'reps') return;
    const c = count + 1;
    setCount(c);
    vib(12);
    if (sound) beep(520 + c * 12, 0.05);
  };

  const ph = PHASE[step.phase];
  const stepsDone = early ? idx : steps.length;
  const kcal = kcalFor(workout.met, weightKg, total);

  const save = () => onExit({ durationSec: Math.round(total), stepsDone, stepsTotal: steps.length, kcal, rpe, note: note.trim() || undefined, fav });

  if (finished) {
    return (
      <motion.div className="player" style={{ background: '#fff', overflowY: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ maxWidth: 520, margin: 'auto', width: '100%', padding: '20px 0' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
            <Ring value={1} size={120} stroke={12} color="#30b350">
              <svg width="54" height="54" viewBox="0 0 54 54">
                <motion.path d="M13 28 L23 38 L42 16" fill="none" stroke="#30b350" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
              </svg>
            </Ring>
          </div>
          <motion.h1 className="h1" style={{ textAlign: 'center', margin: '8px 0' }} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, ...spring }}>
            {early ? 'Sesión parcial' : '¡Sesión completa!'}
          </motion.h1>
          <p className="sub" style={{ textAlign: 'center', marginBottom: 22 }}>{workout.title}</p>
          <div className="stats" style={{ marginBottom: 20 }}>
            <div className="stat"><div className="v">{fmt(total)}</div><div className="l">Tiempo activo</div></div>
            <div className="stat"><div className="v">{kcal}</div><div className="l">kcal estimadas</div></div>
            <div className="stat"><div className="v">{stepsDone}/{steps.length}</div><div className="l">Pasos</div></div>
          </div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>¿Qué tan duro estuvo?</div>
          <div className="rpe" style={{ marginBottom: 16 }}>
            {['Fácil', 'Bien', 'Duro', 'Brutal'].map((l, i) => (
              <Press key={l} className={rpe === i + 1 ? 'on' : ''} onClick={() => setRpe(i + 1)}>{l}</Press>
            ))}
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nota (opcional)</label>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cómo te sentiste, el clima, qué mejorar…" />
          </div>
          <label className="row" style={{ marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={fav} onChange={(e) => setFav(e.target.checked)} style={{ width: 20, height: 20 }} />
            <span style={{ fontWeight: 600 }}>Guardar como favorito para repetirlo</span>
          </label>
          <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
            <Press className="btn ghost" onClick={() => onExit(null)}>Descartar</Press>
            <Press className="btn" onClick={save}>Guardar entrenamiento</Press>
          </div>
        </div>
      </motion.div>
    );
  }

  const timeStep = step.kind === 'time';
  const remaining = Math.max(0, Math.ceil((step.seconds ?? 0) - t));
  const progress = timeStep ? t / (step.seconds ?? 1) : count / (step.reps ?? 1);
  const nextStep = steps[idx + 1];

  return (
    <motion.div className="player" animate={{ backgroundColor: ph.bg }} initial={{ backgroundColor: ph.bg }} transition={{ duration: 0.5 }}>
      <div className="top">
        <Press className="circle-btn" onClick={() => setConfirm(true)}>✕</Press>
        <div className="segs">
          {steps.map((_, i) => (
            <i key={i} className={i < idx ? 'done' : ''}>
              {i === idx && <motion.div style={{ position: 'absolute', inset: 0, background: ph.color, transformOrigin: 'left' }} animate={{ scaleX: Math.min(1, progress) }} transition={{ duration: 0.1 }} />}
            </i>
          ))}
        </div>
        <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 14, minWidth: 44, textAlign: 'right' }}>{fmt(total)}</div>
        <Press className="circle-btn" onClick={() => setSound(!sound)}>{sound ? '♪' : '∅'}</Press>
      </div>

      <div className="stage">
        <div className="phase" style={{ color: ph.color }}>{ph.label}{step.set ? ` · ${step.set}` : ''}</div>
        <AnimatePresence mode="wait">
          <motion.h2 key={idx} className="pname" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 34 }}>
            {step.name}
          </motion.h2>
        </AnimatePresence>

        <motion.div className={`dial ${timeStep ? '' : 'tap'}`} onClick={tap} whileTap={timeStep ? undefined : { scale: 0.95 }} transition={spring}>
          <svg viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="138" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="16" />
            <circle cx="150" cy="150" r="138" fill="none" stroke={ph.color} strokeWidth="16" strokeLinecap="round" strokeDasharray={2 * Math.PI * 138} strokeDashoffset={2 * Math.PI * 138 * (1 - Math.min(1, progress))} style={{ transition: 'stroke-dashoffset 0.12s linear' }} />
          </svg>
          <div>
            {timeStep ? (
              <div className="num">{remaining}</div>
            ) : (
              <>
                <motion.div key={count} className="num" initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={spring}>{count}</motion.div>
                <div className="of">de {step.reps} · toca para contar</div>
              </>
            )}
          </div>
        </motion.div>

        <p className="pcue">{step.cue}</p>
      </div>

      <div className="controls">
        <Press className="ctl" onClick={prev}>⏮</Press>
        {!timeStep && count >= (step.reps ?? 0) ? (
          <Press className="ctl big" onClick={next} style={{ background: '#30b350' }}>✓</Press>
        ) : (
          <Press className="ctl big" onClick={() => setPaused(!paused)}>{paused ? '▶' : '❚❚'}</Press>
        )}
        <Press className="ctl" onClick={next}>⏭</Press>
      </div>
      {!timeStep && count < (step.reps ?? 0) && (
        <div className="row" style={{ justifyContent: 'center', paddingTop: 12 }}>
          <Press className="btn small ghost" onClick={next}>Hecho ✓</Press>
        </div>
      )}
      <div className="nextup">{nextStep ? `Siguiente: ${nextStep.name}${nextStep.kind === 'reps' ? ` · ${nextStep.reps} reps` : ''}` : 'Último paso'}</div>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <h2 className="h2" style={{ margin: '0 0 6px' }}>¿Qué quieres hacer?</h2>
        <p className="sub" style={{ marginBottom: 18 }}>Llevas {fmt(total)} de {workoutMinutes(workout)} min aprox.</p>
        <div className="grid">
          <Press className="btn" onClick={() => setConfirm(false)}>Seguir entrenando</Press>
          {idx > 0 && <Press className="btn ghost" onClick={finishEarly}>Terminar y guardar</Press>}
          <Press className="btn ghost" onClick={() => onExit(null)}>Descartar sesión</Press>
        </div>
      </Sheet>
    </motion.div>
  );
}
