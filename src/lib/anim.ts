/* Figura articulada en SVG: cada pose define cadera, cuello, manos y pies; codos y rodillas se resuelven con IK. */
export type V = [number, number];
export interface Pose {
  hip: V;
  neck: V;
  hA: V;
  hB: V;
  fA: V;
  fB: V;
  kA: V; // dirección preferida de la rodilla
  kB: V;
  eA: V; // dirección preferida del codo
  eB: V;
  ta: number; // ángulo del pie (grados, hacia abajo)
  tb: number;
  arch: number; // curvatura del torso
  hd: number; // giro de la cabeza (grados)
}
export interface AnimDef {
  seq: Pose[];
  dur: number; // segundos por ciclo completo
  front?: boolean;
  prop?: 'chair' | 'bench';
}

const BASE: Pose = {
  hip: [120, 76],
  neck: [120, 34],
  hA: [121, 75],
  hB: [119, 75],
  fA: [124, 135],
  fB: [116, 135],
  kA: [1, 0],
  kB: [1, 0],
  eA: [-0.3, 1],
  eB: [-0.3, 1],
  ta: 0,
  tb: 0,
  arch: 0,
  hd: 0,
};
const P = (o: Partial<Pose>, b: Pose = BASE): Pose => ({ ...b, ...o });
const swap = (p: Pose): Pose => ({ ...p, hA: p.hB, hB: p.hA, fA: p.fB, fB: p.fA, kA: p.kB, kB: p.kA, eA: p.eB, eB: p.eA, ta: p.tb, tb: p.ta });
const mirror = (p: Pose): Pose => {
  const m = (v: V): V => [240 - v[0], v[1]];
  const d = (v: V): V => [-v[0], v[1]];
  return { ...p, hip: m(p.hip), neck: m(p.neck), hA: m(p.hA), hB: m(p.hB), fA: m(p.fA), fB: m(p.fB), kA: d(p.kA), kB: d(p.kB), eA: d(p.eA), eB: d(p.eB), hd: -p.hd, arch: -p.arch };
};

const STAND = P({});

// Sentadillas
const SQ = P({ hip: [94, 102], neck: [116, 66], hA: [148, 70], hB: [146, 72], fA: [124, 135], fB: [118, 135], eA: [0, 1], eB: [0, 1] });
const JUMP = P({ hip: [120, 66], neck: [121, 24], hA: [150, 22], hB: [148, 26], fA: [122, 121], fB: [117, 122], eA: [0, 1], eB: [0, 1] });

// Zancadas
const LUNGE_A = P({ hip: [116, 100], neck: [118, 58], hA: [124, 90], hB: [122, 92], fA: [150, 135], fB: [84, 132], kA: [1, 0], kB: [1, 1], tb: 45, eA: [0, 1], eB: [0, 1] });
const LUNGE_B = swap(LUNGE_A);
const LR0 = P({ hip: [114, 104], neck: [122, 62], hA: [150, 96], hB: [152, 94], fA: [152, 135], fB: [82, 132], kB: [1, 1], tb: 45, eA: [0, 1], eB: [0, 1] });
const LR1 = P({ ...LR0, neck: [126, 62], hA: [134, 20], hB: [132, 22], hd: -20 });

// Suelo, boca arriba
const BR_DOWN = P({ hip: [112, 134], neck: [70, 134], hA: [96, 135], hB: [94, 135], fA: [146, 135], fB: [140, 135], kA: [0, -1], kB: [0, -1], eA: [0, 1], eB: [0, 1] });
const BR_UP = P({ ...BR_DOWN, hip: [112, 102], neck: [78, 128], hd: 30 });
const DB0 = P({ hip: [104, 134], neck: [62, 134], hA: [62, 94], hB: [58, 96], fA: [134, 106], fB: [130, 108], kA: [0, -1], kB: [0, -1], eA: [0, 1], eB: [0, 1] });
const DB1 = P({ ...DB0, hA: [22, 132], fB: [160, 124] });
const DB3 = P({ ...DB0, hB: [20, 133], fA: [160, 124] });
const BC1 = P({ hip: [108, 134], neck: [70, 122], hA: [58, 106], hB: [54, 110], fA: [124, 110], fB: [162, 124], kA: [0.3, -1], kB: [0, -1], eA: [-1, -0.5], eB: [-1, -0.5], hd: 25 });
const BC2 = P({ ...BC1, fA: [162, 124], fB: [124, 110], kA: [0, -1], kB: [0.3, -1] });
const HO0 = P({ hip: [104, 134], neck: [66, 126], hA: [26, 124], hB: [24, 126], fA: [160, 126], fB: [158, 128], kA: [0, -1], kB: [0, -1], eA: [0, 1], eB: [0, 1], hd: 20 });
const HO1 = P({ ...HO0, neck: [64, 118], hA: [24, 114], hB: [22, 116], fA: [162, 116], fB: [160, 118] });

// Planchas y flexiones
const PU_TOP = P({ hip: [107, 110], neck: [146, 95], hA: [148, 138], hB: [146, 138], fA: [52, 132], fB: [56, 132], ta: 45, tb: 45, eA: [-1, -0.2], eB: [-1, -0.2], kA: [0, 1], kB: [0, 1] });
const PU_BOT = P({ ...PU_TOP, hip: [111, 126], neck: [152, 122] });
const PK_TOP = P({ hip: [100, 78], neck: [134, 104], hA: [150, 138], hB: [148, 138], fA: [70, 132], fB: [74, 132], ta: 45, tb: 45, eA: [-1, 0], eB: [-1, 0] });
const PK_BOT = P({ ...PK_TOP, hip: [102, 88], neck: [138, 114] });
const PL_A = P({ hip: [101, 123], neck: [142, 116], hA: [164, 138], hB: [162, 138], fA: [43, 132], fB: [47, 132], ta: 45, tb: 45, eA: [-1, 1], eB: [-1, 1], kA: [0, 1], kB: [0, 1] });
const PL_B = P({ ...PL_A, hip: [101, 119], neck: [142, 115] });
const SP_DOWN = P({ ...PL_A, hip: [100, 130], hB: [150, 74], eB: [0, -1] });
const SP_UP = P({ ...PL_A, hip: [101, 116], hB: [150, 74], eB: [0, -1] });
const MC1 = P({ ...PU_TOP, fA: [132, 128], kA: [0.4, -1], tb: 45, ta: 0 });
const MC2 = P({ ...PU_TOP, fB: [132, 128], kB: [0.4, -1], ta: 45, tb: 0 });
const ST_A = P({ ...PU_TOP, hA: [152, 100], eA: [-1, 0] });
const ST_B = P({ ...PU_TOP, hB: [152, 100], eB: [-1, 0] });
const SU0 = P({ hip: [110, 134], neck: [152, 134], hA: [192, 133], hB: [190, 134], fA: [52, 134], fB: [56, 135], kA: [0, -1], kB: [0, -1], eA: [0, 1], eB: [0, 1] });
const SU1 = P({ ...SU0, hip: [110, 128], neck: [150, 118], hA: [188, 102], hB: [186, 104], fA: [54, 114], fB: [58, 116], hd: -20 });

// Cardio
const JJ0 = P({ hip: [120, 80], neck: [120, 38], hA: [115, 78], hB: [125, 78], fA: [114, 135], fB: [126, 135], kA: [-1, 0], kB: [1, 0], eA: [-1, 0.5], eB: [1, 0.5] });
const JJ1 = P({ ...JJ0, hA: [96, 4], hB: [144, 4], fA: [93, 135], fB: [147, 135], eA: [-1, 0], eB: [1, 0] });
const HK_A = P({ hip: [120, 74], neck: [121, 32], fA: [148, 104], fB: [118, 135], hA: [102, 62], hB: [142, 50], eA: [-0.5, 1], eB: [0, 1] });
const MARCH_A = P({ hip: [120, 75], neck: [121, 33], fA: [138, 114], fB: [118, 135], hA: [104, 66], hB: [138, 56], eA: [-0.5, 1], eB: [0, 1] });
const CROUCH = P({ hip: [98, 114], neck: [134, 98], hA: [150, 138], hB: [148, 138], fA: [118, 135], fB: [112, 135], eA: [-1, 0], eB: [-1, 0] });
const SK_R = P({ hip: [140, 86], neck: [152, 46], fB: [154, 135], fA: [108, 124], kB: [1, 0], kA: [-1, 0.3], hA: [112, 78], hB: [170, 72], eA: [-0.5, 1], eB: [0.5, 1] });
const SK_AIR = P({ hip: [120, 70], neck: [121, 28], fA: [110, 118], fB: [130, 118], hA: [96, 50], hB: [144, 50], eA: [-0.5, 1], eB: [0.5, 1] });

// Movilidad
const CC_CAT = P({ hip: [104, 96], neck: [148, 98], hA: [150, 139], hB: [148, 139], fA: [72, 136], fB: [70, 136], kA: [1, 1], kB: [1, 1], eA: [-1, 0], eB: [-1, 0], arch: -12, hd: 60 });
const CC_COW = P({ ...CC_CAT, hip: [104, 100], neck: [148, 100], arch: 12, hd: -35 });
const H9_L = P({ hip: [120, 128], neck: [120, 86], hA: [104, 126], hB: [136, 126], fA: [88, 136], fB: [148, 136], kA: [-1, -0.5], kB: [-1, -0.5], eA: [-1, 0], eB: [1, 0] });
const H9_R = P({ ...H9_L, kA: [1, -0.5], kB: [1, -0.5] });
const HS0 = P({ hip: [80, 132], neck: [82, 90], hA: [108, 124], hB: [106, 126], fA: [138, 132], fB: [136, 134], kA: [0, -1], kB: [0, -1], eA: [0, 1], eB: [0, 1] });
const HS1 = P({ ...HS0, neck: [116, 108], hA: [146, 122], hB: [144, 124], hd: 50 });
const CH0 = P({ hip: [88, 124], neck: [130, 120], hA: [172, 137], hB: [170, 138], fA: [84, 137], fB: [80, 137], kA: [1, 0], kB: [1, 0], eA: [0, 1], eB: [0, 1], hd: 40 });
const CH1 = P({ ...CH0, hip: [88, 120], neck: [130, 116] });
const CO0 = P({ hA: [108, 78], hB: [106, 80], eA: [-1, 0], eB: [-1, 0] });
const CO1 = P({ neck: [116, 33], hA: [92, 52], hB: [90, 54], eA: [-1, 0], eB: [-1, 0], hd: -15 });

// Ciclos de marcha y carrera
const RP1 = P({ hip: [120, 79], neck: [126, 38], fA: [140, 135], fB: [96, 120], kA: [1, 0], kB: [1, 0.4], hA: [100, 62], hB: [142, 54], eA: [-1, -0.3], eB: [0.2, 1] });
const RP2 = P({ hip: [120, 74], neck: [124, 33], fA: [122, 135], fB: [112, 102], kA: [1, 0], kB: [1, 0], hA: [120, 54], hB: [128, 54], eA: [-1, 0.2], eB: [0.4, 1] });
const WK1 = P({ hip: [120, 76], neck: [121, 34], fA: [136, 135], fB: [104, 133], tb: 35, hA: [104, 70], hB: [138, 68], eA: [0, 1], eB: [0, 1] });
const WK2 = P({ hip: [120, 73], neck: [121, 31], fA: [121, 135], fB: [124, 118], hA: [118, 72], hB: [124, 72], eA: [-0.3, 1], eB: [0.3, 1] });
const REST0 = P({ hA: [110, 76], hB: [130, 76], eA: [-1, 0], eB: [1, 0] });
const REST1 = P({ ...REST0, neck: [120, 31] });

// Poses generadas
const armCircle = (): Pose[] =>
  Array.from({ length: 8 }, (_, k) => {
    const th = ((90 - k * 45) * Math.PI) / 180;
    const h = (dx: number): V => [120 + 43.5 * Math.cos(th) + dx, 34 + 43.5 * Math.sin(th)];
    return P({ hA: h(0), hB: h(1.5), eA: [Math.cos(th), Math.sin(th)], eB: [Math.cos(th), Math.sin(th)] });
  });
const hipCircle = (): Pose[] =>
  Array.from({ length: 4 }, (_, k) => {
    const th = (k * Math.PI) / 2;
    const hx = 120 + 10 * Math.cos(th);
    const hy = 77 + 2 * Math.sin(th);
    return P({ hip: [hx, hy], neck: [120 - 5 * Math.cos(th), 34], hA: [hx - 12, hy - 4], hB: [hx + 12, hy - 4], fA: [114, 135], fB: [126, 135], kA: [-1, 0], kB: [1, 0], eA: [-1, 0], eB: [1, 0] });
  });

const RUN: AnimDef = { seq: [RP1, RP2, swap(RP1), swap(RP2)], dur: 1.0 };
const WALK: AnimDef = { seq: [WK1, WK2, swap(WK1), swap(WK2)], dur: 2.4 };
const SQUAT: AnimDef = { seq: [STAND, SQ], dur: 3.2 };

export const ANIM: Record<string, AnimDef> = {
  Descanso: { seq: [REST0, REST1], dur: 4 },
  Plancha: { seq: [PL_A, PL_B], dur: 3 },
  'Plancha lateral': { seq: [SP_DOWN, SP_UP], dur: 3 },
  Escaladores: { seq: [MC1, MC2], dur: 1.2 },
  'Bicicleta abdominal': { seq: [BC1, BC2], dur: 1.8 },
  'Hollow hold': { seq: [HO0, HO1], dur: 2.4 },
  'Dead bug': { seq: [DB0, DB1, DB0, DB3], dur: 5 },
  Flexiones: { seq: [PU_TOP, PU_BOT], dur: 2.6 },
  'Flexiones pike': { seq: [PK_TOP, PK_BOT], dur: 2.8 },
  'Fondos en silla': {
    seq: [
      P({ hip: [116, 100], neck: [102, 60], hA: [96, 101], hB: [94, 101], fA: [160, 135], fB: [164, 135], eA: [-1, 0.3], eB: [-1, 0.3] }),
      P({ hip: [118, 124], neck: [104, 84], hA: [96, 101], hB: [94, 101], fA: [160, 135], fB: [164, 135], eA: [-1, 0.3], eB: [-1, 0.3] }),
    ],
    dur: 2.8,
    prop: 'chair',
  },
  'Plancha toque de hombro': { seq: [PU_TOP, ST_A, PU_TOP, ST_B], dur: 4 },
  Superman: { seq: [SU0, SU1], dur: 3 },
  Sentadillas: SQUAT,
  'Sentadilla lenta': { seq: [STAND, SQ], dur: 4.5 },
  'Zancadas alternas': { seq: [STAND, LUNGE_A, STAND, LUNGE_B], dur: 5.2 },
  'Zancada baja con rotación': { seq: [LR0, LR1], dur: 4 },
  'Puente de glúteos': { seq: [BR_DOWN, BR_UP], dur: 3 },
  'Elevación de talones': {
    seq: [STAND, P({ hip: [120, 68], neck: [121, 26], hA: [122, 68], hB: [120, 68], fA: [124, 127], fB: [116, 127], ta: 50, tb: 50 })],
    dur: 2.4,
  },
  'Sentadilla con salto': { seq: [SQ, JUMP], dur: 1.6 },
  'Sentadilla búlgara': {
    seq: [
      P({ hip: [112, 78], neck: [118, 38], hA: [134, 60], hB: [132, 62], fA: [134, 135], fB: [72, 90], kA: [1, 0], kB: [0, 1], eA: [0, 1], eB: [0, 1] }),
      P({ hip: [112, 100], neck: [120, 60], hA: [138, 84], hB: [136, 86], fA: [134, 135], fB: [72, 90], kA: [1, 0], kB: [0, 1], eA: [0, 1], eB: [0, 1] }),
    ],
    dur: 3.4,
    prop: 'bench',
  },
  'Jumping jacks': { seq: [JJ0, JJ1], dur: 1.1, front: true },
  'Rodillas altas': { seq: [HK_A, swap(HK_A)], dur: 0.9 },
  'Marcha en el lugar': { seq: [MARCH_A, swap(MARCH_A)], dur: 1.6 },
  Burpees: { seq: [STAND, CROUCH, PU_TOP, CROUCH, JUMP], dur: 3.6 },
  Skaters: { seq: [SK_R, SK_AIR, mirror(SK_R), SK_AIR], dur: 2, front: true },
  'Gato–camello': { seq: [CC_CAT, CC_COW], dur: 4 },
  'Apertura de cadera 90/90': { seq: [H9_L, H9_R], dur: 4, front: true },
  'Estiramiento de isquios': { seq: [HS0, HS1], dur: 4 },
  'Postura del niño': { seq: [CH0, CH1], dur: 4.5 },
  'Apertura de pecho': { seq: [CO0, CO1], dur: 3.5 },
  'Círculos de brazos': { seq: armCircle(), dur: 3, front: true },
  'Rotación de cadera': { seq: hipCircle(), dur: 3, front: true },
  'Calentamiento caminando': WALK,
  'Enfría caminando': WALK,
  Camina: WALK,
  'Trota suave': RUN,
  'Prueba 5K': RUN,
};

export const hasAnim = (name: string) => name in ANIM;

const ease = (f: number) => (f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);

export function samplePose(def: AnimDef, t: number): Pose {
  const n = def.seq.length;
  const u = ((((t % def.dur) + def.dur) % def.dur) / def.dur) * n;
  const i = Math.floor(u) % n;
  const f = ease(u - Math.floor(u));
  const a = def.seq[i];
  const b = def.seq[(i + 1) % n];
  const o: Record<string, unknown> = {};
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const x = a[k];
    const y = b[k];
    o[k] = Array.isArray(x) ? [x[0] + ((y as V)[0] - x[0]) * f, x[1] + ((y as V)[1] - x[1]) * f] : (x as number) + ((y as number) - (x as number)) * f;
  }
  return o as unknown as Pose;
}

function ik(p0: V, t: V, l1: number, l2: number, pref: V): { mid: V; end: V } {
  const dx = t[0] - p0[0];
  const dy = t[1] - p0[1];
  const d = Math.hypot(dx, dy) || 0.001;
  const dd = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const ux = dx / d;
  const uy = dy / d;
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const px = -uy;
  const py = ux;
  const s = px * pref[0] + py * pref[1] >= 0 ? 1 : -1;
  return {
    mid: [p0[0] + ux * a + px * h * s, p0[1] + uy * a + py * h * s],
    end: [p0[0] + ux * dd, p0[1] + uy * dd],
  };
}

export interface Skeleton {
  hip: V;
  neck: V;
  head: V;
  ctrl: V;
  eA: V;
  hA: V;
  eB: V;
  hB: V;
  kA: V;
  fA: V;
  kB: V;
  fB: V;
  tA: V;
  tB: V;
}

export function skeleton(p: Pose, front = false): Skeleton {
  const eA = ik(p.neck, p.hA, 22, 22, p.eA);
  const eB = ik(p.neck, p.hB, 22, 22, p.eB);
  const kA = ik(p.hip, p.fA, 30, 30, p.kA);
  const kB = ik(p.hip, p.fB, 30, 30, p.kB);
  const dx = p.neck[0] - p.hip[0];
  const dy = p.neck[1] - p.hip[1];
  const len = Math.hypot(dx, dy) || 1;
  const th = (p.hd * Math.PI) / 180;
  const ux = dx / len;
  const uy = dy / len;
  const hx = ux * Math.cos(th) - uy * Math.sin(th);
  const hy = ux * Math.sin(th) + uy * Math.cos(th);
  const head: V = [p.neck[0] + hx * 13, p.neck[1] + hy * 13];
  const ctrl: V = [(p.hip[0] + p.neck[0]) / 2 + (-dy / len) * p.arch, (p.hip[1] + p.neck[1]) / 2 + (dx / len) * p.arch];
  const toe = (a: V, deg: number, dir: number): V => [a[0] + dir * 10 * Math.cos((deg * Math.PI) / 180), a[1] + 10 * Math.sin((deg * Math.PI) / 180)];
  return {
    hip: p.hip,
    neck: p.neck,
    head,
    ctrl,
    eA: eA.mid,
    hA: eA.end,
    eB: eB.mid,
    hB: eB.end,
    kA: kA.mid,
    fA: kA.end,
    kB: kB.mid,
    fB: kB.end,
    tA: toe(kA.end, p.ta, front ? -1 : 1),
    tB: toe(kB.end, p.tb, 1),
  };
}
