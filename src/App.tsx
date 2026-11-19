import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { dkey, setState, useStore, type Workout } from './lib/store';
import { Player, type Result } from './components/Player';
import { Preview } from './components/Preview';
import { Hoy } from './views/Hoy';
import { Plan } from './views/Plan';
import { Historial } from './views/Historial';
import { Progreso } from './views/Progreso';
import { Expediente } from './views/Expediente';

const TABS = ['Hoy', 'Plan', 'Historial', 'Progreso', 'Expediente'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>('Hoy');
  const [playing, setPlaying] = useState<Workout | null>(null);
  const [preview, setPreview] = useState<Workout | null>(null);

  const play = (w: Workout) => {
    setPreview(null);
    setPlaying(w);
  };

  const finish = (r: Result | null) => {
    const w = playing;
    setPlaying(null);
    if (!r || !w) return;
    setState((st) => ({
      ...st,
      sessions: [
        { id: `${Date.now()}`, day: dkey(new Date()), ts: Date.now(), durationSec: r.durationSec, kcal: r.kcal, stepsDone: r.stepsDone, stepsTotal: r.stepsTotal, rpe: r.rpe, note: r.note, workout: w },
        ...st.sessions,
      ],
      saved: r.fav && !st.saved.some((x) => x.id === w.id) ? [w, ...st.saved] : st.saved,
    }));
    setTab('Historial');
  };

  return (
    <>
      <main className="app">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
            {tab === 'Hoy' && <Hoy onPlay={play} onPreview={setPreview} />}
            {tab === 'Plan' && <Plan onPreview={setPreview} />}
            {tab === 'Historial' && <Historial onPlay={play} onPreview={setPreview} />}
            {tab === 'Progreso' && <Progreso />}
            {tab === 'Expediente' && <Expediente />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => { setTab(t); window.scrollTo({ top: 0 }); }}>
            {tab === t && <motion.span layoutId="tabbg" className="bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            {t}
          </button>
        ))}
      </nav>

      <Preview workout={preview} onClose={() => setPreview(null)} onStart={play} weightKg={s.profile.weightKg} />
      <AnimatePresence>
        {playing && (
          <motion.div key="player" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', stiffness: 300, damping: 34 }} style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#fff' }}>
            <Player workout={playing} weightKg={s.profile.weightKg} onExit={finish} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
