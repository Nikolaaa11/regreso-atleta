import type { Step, Workout } from './store';

interface Ex {
  name: string;
  cue: string;
}
const E = (name: string, cue: string): Ex => ({ name, cue });

const X = {
  plancha: E('Plancha', 'Cuerpo en línea, abdomen firme. No hundas la cadera.'),
  escaladores: E('Escaladores', 'Rodillas al pecho rápido, manos firmes bajo los hombros.'),
  bicicleta: E('Bicicleta abdominal', 'Codo hacia la rodilla contraria, sin tirar del cuello.'),
  hollow: E('Hollow hold', 'Lumbar pegada al suelo, brazos y piernas largos.'),
  lateral: E('Plancha lateral', 'Cadera alta. Cambia de lado a mitad del tiempo.'),
  deadbug: E('Dead bug', 'Brazo y pierna contrarios, lumbar pegada al suelo.'),
  flexiones: E('Flexiones', 'Pecho al suelo, codos a 45°. De rodillas si lo necesitas.'),
  pike: E('Flexiones pike', 'Cadera arriba en V, baja la cabeza entre los brazos.'),
  fondos: E('Fondos en silla', 'Espalda cerca de la silla, baja hasta 90° de codo.'),
  hombro: E('Plancha toque de hombro', 'Cadera quieta, alterna la mano al hombro.'),
  superman: E('Superman', 'Eleva pecho y piernas, pausa de 1 segundo arriba.'),
  sentadilla: E('Sentadillas', 'Peso en los talones, rodillas siguen la punta del pie.'),
  zancadas: E('Zancadas alternas', 'Paso largo, rodilla trasera casi al suelo.'),
  puente: E('Puente de glúteos', 'Aprieta glúteos arriba y sostén 1 segundo.'),
  talones: E('Elevación de talones', 'Sube lento, baja lento. Apóyate si necesitas.'),
  saltoSent: E('Sentadilla con salto', 'Aterriza suave, rodillas flexionadas.'),
  bulgara: E('Sentadilla búlgara', 'Pie trasero en la silla, torso erguido. Cuenta por pierna.'),
  jacks: E('Jumping jacks', 'Ritmo constante, aterriza suave.'),
  rodillas: E('Rodillas altas', 'Rodillas a la cadera, brazos activos.'),
  burpees: E('Burpees', 'Pecho al suelo, salto explosivo. Sin salto si es necesario.'),
  skaters: E('Skaters', 'Salta lateral como patinador, controla el aterrizaje.'),
  gato: E('Gato–camello', 'Mueve la columna lento, respira profundo.'),
  cadera: E('Apertura de cadera 90/90', 'Rota las rodillas de lado a lado sin forzar.'),
  isquios: E('Estiramiento de isquios', 'Espalda larga, siente el estiramiento sin dolor.'),
  zancadaRot: E('Zancada baja con rotación', 'Abre el pecho hacia la pierna delantera.'),
  nino: E('Postura del niño', 'Cadera a los talones, respira hondo.'),
  pecho: E('Apertura de pecho', 'Manos tras la espalda, abre el pecho.'),
};

const lvl = (w: number) => (w <= 3 ? 0 : w <= 8 ? 1 : 2);
const pick = <T,>(w: number, a: [T, T, T]) => a[lvl(w)];

const restStep = (s: number, next?: string): Step => ({
  name: 'Descanso',
  kind: 'time',
  seconds: s,
  phase: 'rest',
  cue: next ? `Sigue: ${next}` : 'Respira y toma agua.',
});

function warmup(): Step[] {
  return [
    { name: 'Marcha en el lugar', kind: 'time', seconds: 40, phase: 'warm', cue: 'Sube la frecuencia poco a poco.' },
    { name: 'Círculos de brazos', kind: 'time', seconds: 30, phase: 'warm', cue: 'Grandes y controlados.' },
    { name: 'Rotación de cadera', kind: 'time', seconds: 30, phase: 'warm', cue: 'Círculos amplios en ambas direcciones.' },
    { name: 'Sentadilla lenta', kind: 'time', seconds: 40, phase: 'warm', cue: 'Baja en 3 segundos, sube en 1.' },
  ];
}

function cooldown(): Step[] {
  return [
    { name: X.isquios.name, kind: 'time', seconds: 40, phase: 'cool', cue: X.isquios.cue },
    { name: X.pecho.name, kind: 'time', seconds: 30, phase: 'cool', cue: X.pecho.cue },
    { name: X.nino.name, kind: 'time', seconds: 40, phase: 'cool', cue: X.nino.cue },
  ];
}

function circuit(list: Ex[], rounds: number, work: number, rst: number): Step[] {
  const out: Step[] = [];
  for (let r = 1; r <= rounds; r++) {
    list.forEach((e, i) => {
      out.push({ name: e.name, kind: 'time', seconds: work, phase: 'work', cue: e.cue, set: `Ronda ${r} de ${rounds}` });
      const last = r === rounds && i === list.length - 1;
      if (!last) out.push(restStep(rst, list[(i + 1) % list.length].name));
    });
  }
  return out;
}

function strength(list: { ex: Ex; reps: number }[], sets: number, rst: number): Step[] {
  const out: Step[] = [];
  for (let s = 1; s <= sets; s++) {
    list.forEach(({ ex, reps }, i) => {
      out.push({ name: ex.name, kind: 'reps', reps, phase: 'work', cue: ex.cue, set: `Serie ${s} de ${sets}` });
      const last = s === sets && i === list.length - 1;
      if (!last) out.push(restStep(rst, list[(i + 1) % list.length].ex.name));
    });
  }
  return out;
}

export const RUN: [number, number, number][] = [
  [60, 120, 6],
  [90, 120, 6],
  [120, 90, 6],
  [180, 90, 5],
  [240, 90, 5],
  [300, 60, 5],
  [420, 60, 4],
  [600, 60, 3],
  [900, 60, 2],
  [1200, 60, 2],
  [1500, 60, 1],
  [1800, 0, 1],
];

function run(week: number, id: string, title: string, subtitle: string, extra = 0, back = 0): Workout {
  const [r, w, reps0] = RUN[Math.max(0, week - 1 - back)];
  const reps = reps0 + extra;
  const steps: Step[] = [
    { name: 'Calentamiento caminando', kind: 'time', seconds: 300, phase: 'warm', cue: 'Camina a paso vivo y suelta los hombros.' },
  ];
  for (let i = 1; i <= reps; i++) {
    steps.push({
      name: week === 12 && !extra ? 'Prueba 5K' : 'Trota suave',
      kind: 'time',
      seconds: r,
      phase: 'work',
      cue: week === 12 && !extra ? 'Meta: 5 km a ritmo constante. Tú ya has hecho esto.' : 'Ritmo conversacional: debes poder hablar.',
      set: `Intervalo ${i} de ${reps}`,
    });
    if (w > 0 && i < reps) steps.push({ name: 'Camina', kind: 'time', seconds: w, phase: 'rest', cue: 'Recupera el aire caminando.' });
  }
  steps.push({ name: 'Enfría caminando', kind: 'time', seconds: 180, phase: 'cool', cue: 'Baja las pulsaciones poco a poco.' });
  return { id, title, subtitle, tag: 'Correr', met: 7.5, steps };
}

function fuerzaA(w: number, id: string): Workout {
  const sets = pick(w, [2, 3, 4]);
  const steps = [
    ...warmup(),
    ...strength(
      [
        { ex: X.flexiones, reps: pick(w, [8, 12, 16]) },
        { ex: X.pike, reps: pick(w, [6, 8, 10]) },
        { ex: X.fondos, reps: pick(w, [8, 12, 15]) },
        { ex: X.hombro, reps: pick(w, [10, 14, 20]) },
        { ex: X.superman, reps: pick(w, [10, 12, 15]) },
      ],
      sets,
      pick(w, [45, 40, 35]),
    ),
    ...cooldown(),
  ];
  return { id, title: 'Fuerza · Tren superior', subtitle: 'Empuje, hombros y espalda baja. Sin equipo.', tag: 'Fuerza', met: 5, steps };
}

function fuerzaB(w: number, id: string): Workout {
  const sets = pick(w, [2, 3, 4]);
  const steps = [
    ...warmup(),
    ...strength(
      [
        { ex: X.sentadilla, reps: pick(w, [12, 15, 20]) },
        { ex: X.zancadas, reps: pick(w, [10, 12, 16]) },
        { ex: X.puente, reps: pick(w, [12, 15, 20]) },
        w >= 4 ? { ex: w >= 9 ? X.bulgara : X.saltoSent, reps: w >= 9 ? 8 : 10 } : { ex: X.talones, reps: 15 },
      ],
      sets,
      pick(w, [45, 40, 35]),
    ),
    ...cooldown(),
  ];
  return { id, title: 'Fuerza · Piernas y glúteos', subtitle: 'La base del motor que tenías a los 22.', tag: 'Fuerza', met: 5.5, steps };
}

function coreHiit(w: number, id: string): Workout {
  const rounds = pick(w, [2, 3, 4]);
  const steps = [
    ...warmup(),
    ...circuit([X.plancha, X.bicicleta, X.deadbug, X.hollow], rounds, pick(w, [30, 40, 45]), pick(w, [30, 25, 20])),
    restStep(45, X.jacks.name),
    ...circuit([X.jacks, X.rodillas, X.skaters, X.escaladores], pick(w, [2, 3, 3]), pick(w, [30, 35, 40]), 20),
    ...cooldown(),
  ];
  return { id, title: 'Core + HIIT', subtitle: 'Abdomen firme y quema de grasa en poco tiempo.', tag: 'Core', met: 6, steps };
}

function mobility(id: string, long = true): Workout {
  const list = [X.gato, X.cadera, X.zancadaRot, X.isquios, X.pecho, X.nino];
  const steps: Step[] = list.map((e) => ({
    name: e.name,
    kind: 'time',
    seconds: long ? 50 : 75,
    phase: 'cool',
    cue: e.cue,
  }));
  return { id, title: 'Movilidad activa', subtitle: 'Recupera, suelta y previene lesiones.', tag: 'Recuperación', met: 2.5, steps };
}

export const SCHEDULE = ['Correr · Intervalos', 'Fuerza · Tren superior', 'Core + HIIT', 'Correr · Rodaje suave', 'Fuerza · Piernas', 'Salida larga', 'Movilidad activa'];
export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const PHASES = ['Reactivar', 'Construir', 'Afilar'];
export const phaseOf = (w: number) => lvl(w);

export function workoutFor(week: number, dow: number): Workout {
  const id = `w${week}-d${dow}`;
  switch (dow) {
    case 0:
      return run(week, id, 'Correr · Intervalos', week === 12 ? 'Hoy toca la prueba de 5K.' : 'Trota y camina. El motor vuelve por capas.');
    case 1:
      return fuerzaA(week, id);
    case 2:
      return coreHiit(week, id);
    case 3:
      return run(week, id, 'Correr · Rodaje suave', 'Mismo esfuerzo, cabeza fría. Termina con ganas.', 0, week > 1 ? 1 : 0);
    case 4:
      return fuerzaB(week, id);
    case 5:
      return run(week, id, 'Salida larga', 'Más tiempo en movimiento, más intervalos.', 1, week > 2 ? 2 : 0);
    default:
      return mobility(id);
  }
}

export const QUICK: Workout[] = [
  {
    id: 'quick-core10',
    title: 'Core 10 minutos',
    subtitle: 'Para las calugas. Sin pausa larga.',
    tag: 'Core',
    met: 4.5,
    steps: circuit([X.plancha, X.bicicleta, X.hollow, X.lateral, X.deadbug], 3, 30, 15),
  },
  {
    id: 'quick-hiit7',
    title: 'HIIT 7 minutos',
    subtitle: 'Máxima quema en mínimo tiempo.',
    tag: 'HIIT',
    met: 8,
    steps: circuit([X.jacks, X.rodillas, X.burpees, X.skaters, X.escaladores], 2, 35, 15),
  },
  {
    id: 'quick-piernas',
    title: 'Piernas exprés',
    subtitle: 'Sentadillas, zancadas y puente.',
    tag: 'Fuerza',
    met: 5.5,
    steps: strength(
      [
        { ex: X.sentadilla, reps: 15 },
        { ex: X.zancadas, reps: 12 },
        { ex: X.puente, reps: 15 },
      ],
      3,
      30,
    ),
  },
  { ...mobility('quick-mov8', false), id: 'quick-mov8', title: 'Movilidad 8 minutos' },
];

export const stepSeconds = (s: Step) => (s.kind === 'time' ? s.seconds ?? 0 : 40);
export const workoutMinutes = (w: Workout) => Math.max(1, Math.round(w.steps.reduce((a, s) => a + stepSeconds(s), 0) / 60));
export const kcalFor = (met: number, weightKg: number, sec: number) => Math.round((met * weightKg * sec) / 3600);

export function tdee(p: { weightKg: number; heightCm: number; age: number }) {
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5;
  return Math.round(bmr * 1.45);
}
