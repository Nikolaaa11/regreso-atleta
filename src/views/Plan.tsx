import { motion } from 'motion/react';
import { useState } from 'react';
import { dkey, setState, useStore, weekOf, type Workout } from '../lib/store';
import { DAYS_LONG, PHASES, RUN, phaseOf, workoutFor, workoutMinutes } from '../lib/plan';
import { fadeUp, Press } from '../components/ui';

const PHASE_TEXT = [
  'Semanas 1–3 · Reactivar. Despertar el motor con trote–caminata y fuerza ligera. El objetivo es llegar con ganas a la siguiente semana, no cansarte.',
  'Semanas 4–8 · Construir. Intervalos más largos, 3 series de fuerza y core con más tiempo bajo tensión.',
  'Semanas 9–12 · Afilar. Carreras continuas, 4 series y la prueba de 5K en la semana 12.',
];

export function Plan({ onPreview }: { onPreview: (w: Workout) => void }) {
  const s = useStore();
  const cur = weekOf(s.startDate);
  const [week, setWeek] = useState(cur);
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const doneIds = new Set(s.sessions.map((x) => x.workout.id));
  const [r, wk] = RUN[week - 1];

  return (
    <div>
      <motion.div {...fadeUp}>
        <div className="eyebrow">12 semanas · sin gimnasio</div>
        <h1 className="h1">El plan.</h1>
      </motion.div>

      <div className="pills">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <Press key={n} className={`pill ${n === week ? 'on' : ''}`} onClick={() => setWeek(n)}>
            {n === cur ? `Semana ${n} · hoy` : `Semana ${n}`}
          </Press>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="eyebrow">{PHASES[phaseOf(week)]}</div>
        <p className="sub" style={{ marginTop: 6 }}>{PHASE_TEXT[phaseOf(week)]}</p>
        <p className="small" style={{ marginTop: 10 }}>
          Esta semana corres {week === 12 ? '30 min continuos (prueba 5K)' : `${Math.round(r / 60 * 10) / 10} min de trote${wk ? ` con ${wk}s de caminata` : ''}`} por intervalo.
        </p>
      </div>

      <div className="list">
        {DAYS_LONG.map((name, d) => {
          const w = workoutFor(week, d);
          const isToday = week === cur && d === dow;
          const done = doneIds.has(w.id);
          return (
            <motion.div key={d} {...fadeUp} transition={{ ...fadeUp.transition, delay: d * 0.04 }}>
              <Press className="item" onClick={() => onPreview(w)} style={isToday ? { borderColor: '#1d1d1f', borderWidth: 2 } : undefined}>
                <div style={{ width: 52 }}>
                  <div className="small" style={{ fontWeight: 600 }}>{name.slice(0, 3).toUpperCase()}</div>
                </div>
                <div className="grow">
                  <div className="t">{w.title}</div>
                  <div className="s">{w.tag} · {workoutMinutes(w)} min</div>
                </div>
                {done ? <span className="badge g">Hecho</span> : isToday ? <span className="badge" style={{ background: '#1d1d1f', color: '#fff' }}>Hoy</span> : null}
              </Press>
            </motion.div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="row between wrap">
          <div>
            <div style={{ fontWeight: 600 }}>¿Reiniciar el plan?</div>
            <div className="small">Vuelve a la semana 1 desde hoy. Tu historial se conserva.</div>
          </div>
          <Press className="btn small ghost" onClick={() => { setState((st) => ({ ...st, startDate: dkey(new Date()) })); setWeek(1); }}>Reiniciar</Press>
        </div>
      </div>
    </div>
  );
}
