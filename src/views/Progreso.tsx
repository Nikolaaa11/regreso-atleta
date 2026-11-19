import { motion } from 'motion/react';
import { useState } from 'react';
import { dkey, setState, useStore } from '../lib/store';
import { tdee } from '../lib/plan';
import { CountUp, fadeUp, Press, Spark } from '../components/ui';

export function Progreso() {
  const s = useStore();
  const p = s.profile;
  const [w, setW] = useState('');
  const [c, setC] = useState('');
  const body = [...s.body].sort((a, b) => a.day.localeCompare(b.day));
  const weights = body.map((b) => b.weightKg);
  const waists = body.filter((b) => b.waistCm).map((b) => b.waistCm as number);
  const curW = weights.length ? weights[weights.length - 1] : p.weightKg;
  const startW = weights.length ? weights[0] : p.weightKg;
  const toGo = Math.max(0, curW - p.goalWeight);
  const lost = Math.max(0, startW - curW);
  const pct = startW - p.goalWeight > 0 ? Math.min(1, lost / (startW - p.goalWeight)) : 0;
  const maint = tdee({ weightKg: curW, heightCm: p.heightCm, age: p.age });
  const target = maint - 450;
  const weeks = Math.ceil(toGo / 0.45);
  const protein = Math.round(curW * 1.8);

  const log = () => {
    const wk = parseFloat(w.replace(',', '.'));
    const cm = parseFloat(c.replace(',', '.'));
    if (!wk && !cm) return;
    setState((st) => {
      const day = dkey(new Date());
      const rest = st.body.filter((b) => b.day !== day);
      const prev = st.body.find((b) => b.day === day);
      return {
        ...st,
        profile: { ...st.profile, weightKg: wk || st.profile.weightKg, waistCm: cm || st.profile.waistCm },
        body: [...rest, { day, weightKg: wk || prev?.weightKg || st.profile.weightKg, waistCm: cm || prev?.waistCm }],
      };
    });
    setW('');
    setC('');
  };

  return (
    <div>
      <motion.div {...fadeUp}>
        <div className="eyebrow">Peso, cintura y calorías</div>
        <h1 className="h1">Progreso.</h1>
      </motion.div>

      <div className="stats">
        <div className="stat"><div className="v"><CountUp to={curW} decimals={1} /> kg</div><div className="l">Peso actual</div></div>
        <div className="stat"><div className="v"><CountUp to={lost} decimals={1} /> kg</div><div className="l">Bajados</div></div>
        <div className="stat"><div className="v"><CountUp to={toGo} decimals={1} /> kg</div><div className="l">Para la meta ({p.goalWeight} kg)</div></div>
      </div>
      <div className="bar" style={{ marginTop: 14 }}>
        <motion.div style={{ background: '#30b350' }} initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 60, damping: 16 }} />
      </div>

      <h2 className="h2">Registrar hoy</h2>
      <div className="card">
        <div className="fields">
          <div className="field"><label>Peso (kg)</label><input inputMode="decimal" placeholder={String(curW)} value={w} onChange={(e) => setW(e.target.value)} /></div>
          <div className="field"><label>Cintura al ombligo (cm)</label><input inputMode="decimal" placeholder={String(p.waistCm)} value={c} onChange={(e) => setC(e.target.value)} /></div>
        </div>
        <Press className="btn" style={{ marginTop: 14 }} onClick={log}>Guardar medición</Press>
        <p className="small" style={{ marginTop: 10 }}>Pésate en ayunas y mide la cintura siempre en el mismo punto, una o dos veces por semana. La cintura dice más que la balanza.</p>
      </div>

      <div className="grid two" style={{ marginTop: 14 }}>
        <div className="card"><div className="eyebrow">Peso</div><Spark data={weights} color="#0071e3" unit=" kg" /></div>
        <div className="card"><div className="eyebrow">Cintura</div><Spark data={waists} color="#ff375f" unit=" cm" /></div>
      </div>

      <h2 className="h2">Calorías para bajar la panza</h2>
      <div className="card">
        <div className="stats">
          <div className="stat" style={{ background: '#fff' }}><div className="v">{maint}</div><div className="l">kcal para mantenerte (estimado)</div></div>
          <div className="stat" style={{ background: '#fff' }}><div className="v">{target}</div><div className="l">kcal objetivo (déficit ~450)</div></div>
          <div className="stat" style={{ background: '#fff' }}><div className="v">{protein} g</div><div className="l">proteína diaria</div></div>
          <div className="stat" style={{ background: '#fff' }}><div className="v">{toGo ? `~${weeks} sem` : '¡Meta!'}</div><div className="l">a ~0,45 kg por semana</div></div>
        </div>
        <p className="small" style={{ marginTop: 12 }}>Estimación con la fórmula Mifflin-St Jeor y actividad moderada. Es un punto de partida: ajusta según tu cintura a las 2–3 semanas. Un déficit de ~450 kcal es moderado y sostenible; más agresivo cuesta músculo y energía.</p>
      </div>

      <h2 className="h2">Lo que de verdad pasa con la panza y las calugas</h2>
      <div className="list">
        {[
          ['No se puede quitar grasa “de la panza” con abdominales', 'El cuerpo toma grasa de todas partes según su genética. Los abdominales fortalecen el core, pero la panza baja con déficit calórico sostenido.'],
          ['Las calugas aparecen al bajar el % de grasa', 'Ya existen bajo la grasa. En hombres suelen verse claras cerca de 12–15 % de grasa corporal. Por eso el plan combina cardio, fuerza y alimentación.'],
          ['Alcohol y tabaco sabotean el proceso', 'El alcohol aporta 7 kcal/g, empeora el sueño y frena la recuperación. El tabaco reduce el oxígeno disponible y baja tu rendimiento al correr.'],
          ['Duerme 7–9 horas y camina a diario', 'Dormir poco sube el hambre y baja la energía. Caminar 7–10 mil pasos suma gasto sin fatiga extra.'],
        ].map(([t, d], i) => (
          <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="item" style={{ alignItems: 'flex-start' }}>
            <div><div className="t">{t}</div><div className="s" style={{ fontSize: 14, lineHeight: 1.45 }}>{d}</div></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
