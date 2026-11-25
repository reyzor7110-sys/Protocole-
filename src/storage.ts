import { DEFAULT_RULES, todayISO, uid } from './data'
import type { AppState } from './types'

const KEY = 'protocole.v1'

export function createInitialState(): AppState {
  const now = todayISO()
  return {
    sworn: false,
    name: '',
    intensity: 'ferme',
    swornAt: null,
    score: 70,
    streak: 0,
    lastActiveDate: null,
    rules: DEFAULT_RULES.map((r) => ({
      ...r,
      id: uid('rule'),
      createdAt: now,
    })),
    orders: [],
    confessions: [],
    disciplines: [],
    totalCompleted: 0,
    totalFailed: 0,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as AppState
    return { ...createInitialState(), ...parsed }
  } catch {
    return createInitialState()
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function scoreTone(score: number): 'low' | 'mid' | 'high' {
  if (score < 40) return 'low'
  if (score < 70) return 'mid'
  return 'high'
}
