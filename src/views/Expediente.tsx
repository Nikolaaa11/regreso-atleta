import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { dkey, fmt, setState, useStore } from '../lib/store';
import { fadeUp, Press } from '../components/ui';

const TIMELINE = [
  { age: '22', title: 'El pico', body: 'Entrenabas de lunes a lunes, corrías 5K, ganabas medallas y premios, y eras muy bueno al básquetbol. Sin gimnasio: aire libre, variedad y competencia.' },
  { age: '22–31', title: 'La deriva', body: 'La rutina se fue soltando. Sin competencias ni estructura, el gasto diario bajó poco a poco. Esto es normal y reversible.' },
  { age: '31', title: 'El quiebre', body: 'Hace un año empezó a subir el peso. Tabaco y alcohol se suman: menos oxígeno, peor sueño, recuperación más lenta.' },
  { age: '32', title: 'Hoy', body: 'Punto de partida honesto. Lo que tienes a favor: técnica, memoria motora y un historial real de disciplina.' },
  { age: '+12 sem', title: 'La meta', body: 'Un 5K continuo, cintura menor y las primeras señales de abdomen marcado. Los plazos varían: lo que no varía es la constancia.' },
];

const FINDINGS = [
  { t: 'Memoria muscular', e: 'A favor', d: 'El músculo entrenado conserva núcleos celulares añadidos durante años. Por eso quien ya entrenó recupera fuerza y volumen más rápido que un principiante.' },
  { t: 'Capacidad aeróbica', e: 'Recuperable', d: 'La resistencia cae con la inactividad, pero un corredor previo reconstruye su base en semanas con progresión de trote–caminata. El plan empieza con intervalos cortos a propósito.' },
  { t: 'Tabaco', e: 'Freno principal', d: 'El monóxido de carbono ocupa el lugar del oxígeno en la sangre y baja el rendimiento al correr. Reducir y dejar de fumar mejora el aire en pocas semanas. Pide apoyo médico si te cuesta: es una adicción, no falta de voluntad.' },
  { t: 'Alcohol', e: 'Freno silencioso', d: 'Calorías vacías (7 kcal/g), peor sueño profundo y recuperación más lenta. Bajar los tragos acelera todo lo demás.' },
  { t: 'Grasa abdominal', e: 'Responde bien', d: 'La grasa de la zona abdominal suele responder al déficit calórico moderado + cardio + fuerza. No hay reducción localizada, pero la cintura baja de forma visible.' },
  { t: 'Tendones y articulaciones', e: 'Ojo', d: 'Se adaptan más lento que el músculo y el peso extra suma impacto. Por eso las primeras semanas son de trote suave y sin saltos fuertes.' },
  { t: 'Adherencia', e: 'La clave', d: 'No te gustaba el gimnasio y funcionabas por metas y competencia. El plan es al aire libre y en casa, con rachas, pruebas y un 5K como objetivo final.' },
];

export function Expediente() {
  const s = useStore();
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const [f, setF] = useState({ pushups: '', plank: '', km1: '', waist: '' });
  const p = s.profile;
  const tests = [...s.tests].sort((a, b) => a.day.localeCompare(b.day));
  const first = tests[0];

  const saveTest = () => {
    const n = (v: string) => parseFloat(v.replace(',', '.')) || 0;
    if (!n(f.pushups) && !n(f.plank) && !n(f.km1) && !n(f.waist)) return;
    setState((st) => ({ ...st, tests: [...st.tests, { day: dkey(new Date()), pushups: n(f.pushups), plank: n(f.plank), km1: n(f.km1), waist: n(f.waist) }] }));
    setF({ pushups: '', plank: '', km1: '', waist: '' });
  };
  const delta = (cur: number, base: number | undefined, lowerBetter = false) => {
    if (base === undefined || !cur || !base) return null;
    const d = cur - base;
    if (d === 0) return <span>=</span>;
    const good = lowerBetter ? d < 0 : d > 0;
    return <span className={good ? 'up' : 'down'}>{d > 0 ? '+' : ''}{Math.round(d * 10) / 10}</span>;
  };
  const gap = p.best5k && p.now5k ? p.now5k - p.best5k : null;

  return (
    <div>
      <motion.div {...fadeUp}>
        <div className="eyebrow">Investigación forense · caso 22 → 32</div>
        <h1 className="h1">El expediente.</h1>
        <p className="sub" style={{ marginBottom: 24, maxWidth: 560 }}>Reconstruimos qué fue de aquel deportista de los 22: qué conservas, qué se perdió y cuál es la ruta más corta de vuelta.</p>
      </motion.div>

      <div className="tl">
        {TIMELINE.map((n, i) => (
          <Press key={i} className={`node ${sel === i ? 'on' : ''}`} onClick={() => setSel(i)}>
            <b>{n.age}</b>
            <div className="s" style={{ fontWeight: 600 }}>{n.title}</div>
          </Press>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sel} className="card" style={{ marginTop: 10 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>{TIMELINE[sel].title}</div>
          <p className="sub" style={{ marginTop: 6 }}>{TIMELINE[sel].body}</p>
        </motion.div>
      </AnimatePresence>

      <h2 className="h2">Hallazgos</h2>
      <div className="list">
        {FINDINGS.map((x, i) => (
          <motion.div key={i} layout className="item" style={{ display: 'block', cursor: 'pointer' }} onClick={() => setOpen(open === i ? null : i)}>
            <div className="row between">
              <div className="t">{x.t}</div>
              <span className="badge">{x.e}</span>
            </div>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p className="small" style={{ fontSize: 14, marginTop: 8 }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {x.d}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <h2 className="h2">Tu 5K: de los 22 a hoy</h2>
      <div className="card">
        <div className="fields">
          <div className="field"><label>Mejor 5K a los 22 (min)</label><input inputMode="decimal" placeholder="Ej: 19" defaultValue={p.best5k ?? ''} onBlur={(e) => setState((st) => ({ ...st, profile: { ...st.profile, best5k: parseFloat(e.target.value.replace(',', '.')) || undefined } }))} /></div>
          <div className="field"><label>5K estimado hoy (min)</label><input inputMode="decimal" placeholder="Ej: 32" defaultValue={p.now5k ?? ''} onBlur={(e) => setState((st) => ({ ...st, profile: { ...st.profile, now5k: parseFloat(e.target.value.replace(',', '.')) || undefined } }))} /></div>
        </div>
        {gap !== null && (
          <p className="sub" style={{ marginTop: 12 }}>
            Brecha actual: <b>{Math.round(gap * 10) / 10} min</b>. Meta realista en 12 semanas: completar los 5 km corriendo seguido; el ritmo de competencia se recupera después, con trabajo de velocidad.
          </p>
        )}
      </div>

      <h2 className="h2">Pruebas de campo</h2>
      <div className="card">
        <p className="small" style={{ marginBottom: 12 }}>Repítelas cada 4 semanas, en las mismas condiciones. Son tu evidencia de que el regreso funciona.</p>
        <div className="fields">
          <div className="field"><label>Flexiones seguidas</label><input inputMode="numeric" value={f.pushups} onChange={(e) => setF({ ...f, pushups: e.target.value })} /></div>
          <div className="field"><label>Plancha (segundos)</label><input inputMode="numeric" value={f.plank} onChange={(e) => setF({ ...f, plank: e.target.value })} /></div>
          <div className="field"><label>1 km trotando (seg)</label><input inputMode="numeric" value={f.km1} onChange={(e) => setF({ ...f, km1: e.target.value })} /></div>
          <div className="field"><label>Cintura (cm)</label><input inputMode="decimal" value={f.waist} onChange={(e) => setF({ ...f, waist: e.target.value })} /></div>
        </div>
        <Press className="btn" style={{ marginTop: 14 }} onClick={saveTest}>Guardar pruebas</Press>
        {tests.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table className="t">
              <thead><tr><th>Fecha</th><th>Flexiones</th><th>Plancha</th><th>1 km</th><th>Cintura</th></tr></thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr key={i}>
                    <td>{t.day.slice(5)}</td>
                    <td>{t.pushups || '–'} {i > 0 && delta(t.pushups, first.pushups)}</td>
                    <td>{t.plank ? fmt(t.plank) : '–'} {i > 0 && delta(t.plank, first.plank)}</td>
                    <td>{t.km1 ? fmt(t.km1) : '–'} {i > 0 && delta(t.km1, first.km1, true)}</td>
                    <td>{t.waist || '–'} {i > 0 && delta(t.waist, first.waist, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="small" style={{ marginTop: 26, maxWidth: 560 }}>
        Información general, no un diagnóstico. Antes de empezar un programa intenso, y más si fumas, bebes o has subido de peso, consulta a un médico. Si sientes dolor en el pecho, mareo o falta de aire anormal, detente.
      </p>
    </div>
  );
}
