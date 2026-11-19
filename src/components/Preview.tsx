import { fmt, type Workout } from '../lib/store';
import { stepSeconds, workoutMinutes } from '../lib/plan';
import { Press, Sheet } from './ui';

export function Preview({ workout, onClose, onStart, weightKg }: { workout: Workout | null; onClose: () => void; onStart: (w: Workout) => void; weightKg: number }) {
  const w = workout;
  const kcal = w ? Math.round((w.met * weightKg * w.steps.reduce((a, s) => a + stepSeconds(s), 0)) / 3600) : 0;
  return (
    <Sheet open={!!w} onClose={onClose}>
      {w && (
        <>
          <div className="eyebrow">{w.tag} · {workoutMinutes(w)} min · ~{kcal} kcal</div>
          <h2 className="h2" style={{ margin: '4px 0 6px' }}>{w.title}</h2>
          <p className="sub" style={{ marginBottom: 16 }}>{w.subtitle}</p>
          <Press className="btn" style={{ width: '100%', marginBottom: 18 }} onClick={() => onStart(w)}>Empezar ahora</Press>
          <div className="list">
            {w.steps.map((s, i) => (
              <div key={i} className="item" style={{ padding: '10px 14px', borderRadius: 16, opacity: s.phase === 'rest' ? 0.6 : 1 }}>
                <div className="grow">
                  <div className="t" style={{ fontSize: 15 }}>{s.name}</div>
                  {s.set && <div className="s">{s.set}</div>}
                </div>
                <div className="badge">{s.kind === 'reps' ? `${s.reps} reps` : fmt(s.seconds ?? 0)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
