import { useSyncExternalStore } from 'react';

export type Phase = 'warm' | 'work' | 'rest' | 'cool';
export interface Step {
  name: string;
  kind: 'time' | 'reps';
  seconds?: number;
  reps?: number;
  cue?: string;
  phase: Phase;
  set?: string;
}
export interface Workout {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  met: number;
  steps: Step[];
}
export interface Session {
  id: string;
  day: string;
  ts: number;
  durationSec: number;
  kcal: number;
  stepsDone: number;
  stepsTotal: number;
  rpe?: number;
  note?: string;
  workout: Workout;
}
export interface Profile {
  setup: boolean;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  age: number;
  goalWeight: number;
  best5k?: number; // minutos
  now5k?: number; // minutos
}
export interface Test {
  day: string;
  pushups: number;
  plank: number;
  km1: number;
  waist: number;
}
export interface Body {
  day: string;
  weightKg: number;
  waistCm?: number;
}
export interface Habit {
  cigs: number;
  drinks: number;
  water: number;
}
export interface State {
  startDate: string;
  profile: Profile;
  sessions: Session[];
  saved: Workout[];
  body: Body[];
  habits: Record<string, Habit>;
  tests: Test[];
}

export const dkey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDay = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const mondayOf = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7));
export const weekOf = (startDate: string, now = new Date()) => {
  const diff = Math.round((mondayOf(now).getTime() - mondayOf(parseDay(startDate)).getTime()) / 86400000);
  return Math.min(12, Math.max(1, Math.floor(diff / 7) + 1));
};

const KEY = 'regreso.v1';

function defaults(): State {
  return {
    startDate: dkey(new Date()),
    profile: { setup: false, heightCm: 175, weightKg: 85, waistCm: 95, age: 32, goalWeight: 77 },
    sessions: [],
    saved: [],
    body: [],
    habits: {},
    tests: [],
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const d = defaults();
      return { ...d, ...p, profile: { ...d.profile, ...p.profile } };
    }
  } catch {
    /* sin almacenamiento */
  }
  return defaults();
}

let state: State = load();
const listeners = new Set<() => void>();

export function setState(fn: (s: State) => State) {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignorar */
  }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export const fmt = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function streakOf(sessions: Session[], now = new Date()) {
  const days = new Set(sessions.map((s) => s.day));
  let d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dkey(d))) d = addDays(d, -1);
  let n = 0;
  while (days.has(dkey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function bestStreak(sessions: Session[]) {
  const days = [...new Set(sessions.map((s) => s.day))].sort();
  let best = 0,
    cur = 0,
    prev: Date | null = null;
  for (const k of days) {
    const d = parseDay(k);
    cur = prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}
