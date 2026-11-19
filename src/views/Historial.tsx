import { AnimatePresence, motion } from 'motion/react';
import { bestStreak, fmt, parseDay, setState, streakOf, useStore, type Workout } from '../lib/store';
import { workoutMinutes } from '../lib/plan';
import { CountUp, fadeUp, Press } from '../components/ui';

const RPE = ['', 'Fácil', 'Bien', 'Duro', 'Brutal'];

export function Historial({ onPlay, onPreview }: { onPlay: (w: Workout) => void; onPreview: (w: Workout) => void }) {
  const s = useStore();
  const totalMin = Math.round(s.sessions.reduce((a, x) => a + x.durationSec, 0) / 60);
  const totalKcal = s.sessions.reduce((a, x) => a + x.kcal, 0);

  const toggleFav = (w: Workout) =>
    setState((st) => ({ ...st, saved: st.saved.some((x) => x.id === w.id) ? st.saved.filter((x) => x.id !== w.id) : [w, ...st.saved] }));
  const isFav = (w: Workout) => s.saved.some((x) => x.id === w.id);

  return (
    <div>
      <motion.div {...fadeUp}>
        <div className="eyebrow">Todo lo que has hecho</div>
        <h1 className="h1">Historial.</h1>
      </motion.div>

      <div className="stats">
        <div className="stat"><div className="v"><CountUp to={s.sessions.length} /></div><div className="l">Entrenamientos</div></div>
        <div className="stat"><div className="v"><CountUp to={totalMin} /></div><div className="l">Minutos activos</div></div>
        <div className="stat"><div className="v"><CountUp to={totalKcal} /></div><div className="l">kcal estimadas</div></div>
        <div className="stat"><div className="v"><CountUp to={streakOf(s.sessions)} /> / <CountUp to={bestStreak(s.sessions)} /></div><div className="l">Racha actual / mejor</div></div>
      </div>

      <h2 className="h2">Favoritos</h2>
      {s.saved.length === 0 ? (
        <div className="card empty">Marca “Guardar como favorito” al terminar una sesión y quedará aquí para repetirla cuando quieras.</div>
      ) : (
        <div className="list">
          <AnimatePresence initial={false}>
            {s.saved.map((w) => (
              <motion.div key={w.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="item">
                <div className="grow" onClick={() => onPreview(w)} style={{ cursor: 'pointer' }}>
                  <div className="t">{w.title}</div>
                  <div className="s">{w.tag} · {workoutMinutes(w)} min</div>
                </div>
                <Press className="btn small" onClick={() => onPlay(w)}>Empezar</Press>
                <Press className="btn small ghost" onClick={() => toggleFav(w)}>Quitar</Press>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <h2 className="h2">Sesiones</h2>
      {s.sessions.length === 0 ? (
        <div className="card empty">Aún no hay sesiones. Termina tu primer entrenamiento y aparecerá aquí.</div>
      ) : (
        <div className="list">
          <AnimatePresence initial={false}>
            {s.sessions.map((x) => (
              <motion.div key={x.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} className="card" style={{ padding: 18 }}>
                <div className="row between wrap">
                  <div>
                    <div className="small">{parseDay(x.day).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{x.workout.title}</div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge">{fmt(x.durationSec)}</span>
                    <span className="badge">{x.kcal} kcal</span>
                    {x.rpe && <span className="badge">{RPE[x.rpe]}</span>}
                    {x.stepsDone < x.stepsTotal && <span className="badge">Parcial</span>}
                  </div>
                </div>
                {x.note && <p className="small" style={{ marginTop: 8 }}>“{x.note}”</p>}
                <div className="row wrap" style={{ marginTop: 12 }}>
                  <Press className="btn small" onClick={() => onPlay(x.workout)}>Repetir</Press>
                  <Press className="btn small ghost" onClick={() => toggleFav(x.workout)}>{isFav(x.workout) ? '★ Favorito' : '☆ Favorito'}</Press>
                  <Press className="btn small ghost" onClick={() => setState((st) => ({ ...st, sessions: st.sessions.filter((y) => y.id !== x.id) }))}>Borrar</Press>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
