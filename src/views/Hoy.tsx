import { motion } from 'motion/react';
import { useState } from 'react';
import { addDays, dkey, mondayOf, setState, streakOf, useStore, weekOf, type Workout } from '../lib/store';
import { DAYS, PHASES, QUICK, phaseOf, workoutFor, workoutMinutes } from '../lib/plan';
import { CountUp, fadeUp, Press, Ring, Sheet, Stepper } from '../components/ui';

export function Hoy({ onPlay, onPreview }: { onPlay: (w: Workout) => void; onPreview: (w: Workout) => void }) {
  const s = useStore();
  const now = new Date();
  const week = weekOf(s.startDate, now);
  const dow = (now.getDay() + 6) % 7;
  const w = workoutFor(week, dow);
  const mon = mondayOf(now);
  const today = dkey(now);
  const doneToday = s.sessions.some((x) => x.day === today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  const weekKeys = weekDays.map(dkey);
  const weekSessions = s.sessions.filter((x) => weekKeys.includes(x.day));
  const mins = Math.round(weekSessions.reduce((a, x) => a + x.durationSec, 0) / 60);
  const streak = streakOf(s.sessions, now);
  const hab = s.habits[today] ?? { cigs: 0, drinks: 0, water: 0 };
  const setHab = (k: 'cigs' | 'drinks' | 'water', v: number) => setState((st) => ({ ...st, habits: { ...st.habits, [today]: { ...hab, [k]: v } } }));
  const hour = now.getHours();
  const greet = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const last7 = Array.from({ length: 7 }, (_, i) => s.habits[dkey(addDays(now, i - 6))]?.cigs ?? 0);
  const maxC = Math.max(1, ...last7);
  const kcal = Math.round(w.met * s.profile.weightKg * (w.steps.reduce((a, x) => a + (x.kind === 'time' ? x.seconds ?? 0 : 40), 0) / 3600));

  return (
    <div>
      <motion.div {...fadeUp}>
        <div className="eyebrow">{now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 className="h1">{greet}.<br />Vuelve el atleta.</h1>
      </motion.div>

      <motion.div className="hero" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
        <div className="glow" />
        <span className="chip">Semana {week} · {PHASES[phaseOf(week)]}</span>
        <h2>{doneToday ? 'Hoy ya cumpliste.' : w.title}</h2>
        <p>{doneToday ? 'Sesión guardada. Puedes sumar una rápida o descansar: el progreso también se construye recuperando.' : w.subtitle}</p>
        <div className="row wrap" style={{ marginTop: 20 }}>
          <Press className="btn" onClick={() => onPlay(w)}>{doneToday ? 'Repetir sesión' : 'Empezar'}</Press>
          <Press className="btn white" onClick={() => onPreview(w)}>Ver detalle</Press>
          <span className="chip">{workoutMinutes(w)} min · ~{kcal} kcal</span>
        </div>
      </motion.div>

      <h2 className="h2">Tu semana</h2>
      <div className="card">
        <div className="rings">
          <div className="ringbox">
            <Ring value={weekSessions.length / 6} size={104} color="#ff375f"><b style={{ fontSize: 24 }}><CountUp to={weekSessions.length} /></b></Ring>
            <div className="v" style={{ fontSize: 15 }}>Entrenos</div>
            <div className="l">meta 6</div>
          </div>
          <div className="ringbox">
            <Ring value={mins / 180} size={104} color="#30b350"><b style={{ fontSize: 24 }}><CountUp to={mins} /></b></Ring>
            <div className="v" style={{ fontSize: 15 }}>Minutos</div>
            <div className="l">meta 180</div>
          </div>
          <div className="ringbox">
            <Ring value={streak / 7} size={104} color="#32ade6"><b style={{ fontSize: 24 }}><CountUp to={streak} /></b></Ring>
            <div className="v" style={{ fontSize: 15 }}>Racha</div>
            <div className="l">días seguidos</div>
          </div>
        </div>
        <div className="week" style={{ marginTop: 22 }}>
          {weekDays.map((d, i) => (
            <div key={i} className={`day ${i === dow ? 'today' : ''}`}>
              {DAYS[i]}
              <b>{d.getDate()}</b>
              <div className={`dot ${weekKeys[i] && s.sessions.some((x) => x.day === weekKeys[i]) ? 'done' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      <h2 className="h2">Sesión rápida</h2>
      <div className="grid two">
        {QUICK.map((q) => (
          <Press key={q.id} className="item" onClick={() => onPreview(q)}>
            <div className="grow">
              <div className="t">{q.title}</div>
              <div className="s">{q.tag} · {workoutMinutes(q)} min</div>
            </div>
            <span className="badge">Ver</span>
          </Press>
        ))}
      </div>

      <h2 className="h2">Hábitos de hoy</h2>
      <div className="card">
        <div className="grid two" style={{ gap: 18 }}>
          <div className="row between"><div><div className="t" style={{ fontWeight: 600 }}>Cigarros</div><div className="small">{hab.cigs === 0 ? 'Día sin humo. Eso suma.' : 'Cada uno menos cuenta'}</div></div><Stepper value={hab.cigs} onChange={(v) => setHab('cigs', v)} /></div>
          <div className="row between"><div><div className="t" style={{ fontWeight: 600 }}>Tragos</div><div className="small">{hab.drinks === 0 ? 'Recuperación intacta' : 'El alcohol frena la recuperación'}</div></div><Stepper value={hab.drinks} onChange={(v) => setHab('drinks', v)} /></div>
          <div className="row between"><div><div className="t" style={{ fontWeight: 600 }}>Vasos de agua</div><div className="small">Meta: 8</div></div><Stepper value={hab.water} onChange={(v) => setHab('water', v)} /></div>
          <div>
            <div className="small" style={{ marginBottom: 6 }}>Cigarros · últimos 7 días</div>
            <div className="row" style={{ alignItems: 'flex-end', gap: 6, height: 54 }}>
              {last7.map((v, i) => (
                <motion.div key={i} style={{ flex: 1, background: i === 6 ? '#ff375f' : '#d2d2d7', borderRadius: 6, minHeight: 4 }} initial={{ height: 0 }} animate={{ height: `${(v / maxC) * 100 || 7}%` }} transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.04 }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Onboarding />
    </div>
  );
}

function Onboarding() {
  const s = useStore();
  const [p, setP] = useState(s.profile);
  const num = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: parseFloat(e.target.value) || 0 });
  return (
    <Sheet open={!s.profile.setup} onClose={() => {}}>
      <h2 className="h2" style={{ margin: '0 0 6px' }}>Empecemos por tu línea base</h2>
      <p className="sub" style={{ marginBottom: 18 }}>Se guarda solo en tu dispositivo. Puedes cambiarlo después. Antes de empezar, conviene un chequeo médico.</p>
      <div className="fields" style={{ marginBottom: 16 }}>
        <div className="field"><label>Edad</label><input type="number" inputMode="numeric" value={p.age || ''} onChange={num('age')} /></div>
        <div className="field"><label>Estatura (cm)</label><input type="number" inputMode="numeric" value={p.heightCm || ''} onChange={num('heightCm')} /></div>
        <div className="field"><label>Peso (kg)</label><input type="number" inputMode="decimal" value={p.weightKg || ''} onChange={num('weightKg')} /></div>
        <div className="field"><label>Cintura (cm)</label><input type="number" inputMode="decimal" value={p.waistCm || ''} onChange={num('waistCm')} /></div>
        <div className="field"><label>Peso meta (kg)</label><input type="number" inputMode="decimal" value={p.goalWeight || ''} onChange={num('goalWeight')} /></div>
      </div>
      <Press
        className="btn"
        style={{ width: '100%' }}
        onClick={() =>
          setState((st) => ({
            ...st,
            startDate: dkey(new Date()),
            profile: { ...p, setup: true },
            body: [...st.body, { day: dkey(new Date()), weightKg: p.weightKg, waistCm: p.waistCm }],
          }))
        }
      >
        Comenzar el regreso
      </Press>
    </Sheet>
  );
}
