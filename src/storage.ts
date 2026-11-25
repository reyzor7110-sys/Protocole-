import { DEFAULT_RULES, todayISO, uid } from './data'
import type { AppState, Rule } from './types'

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
    ongoing: [],
    confessions: [],
    disciplines: [],
    totalCompleted: 0,
    totalFailed: 0,
  }
}

function mergeLockedRules(existing: Rule[] | undefined): Rule[] {
  const now = todayISO()
  const current = existing ?? []
  const unlocked = current.filter((r) => !r.locked)
  const byText = new Map(current.filter((r) => r.locked).map((r) => [r.text, r]))
  const locked = DEFAULT_RULES.filter((r) => r.locked).map((r) => {
    const prev = byText.get(r.text)
    return prev ?? { ...r, id: uid('rule'), createdAt: now }
  })
  return [...locked, ...unlocked]
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = createInitialState()
    return {
      ...base,
      ...parsed,
      rules: mergeLockedRules(parsed.rules),
      orders: parsed.orders ?? base.orders,
      ongoing: parsed.ongoing ?? base.ongoing,
      confessions: parsed.confessions ?? base.confessions,
      disciplines: parsed.disciplines ?? base.disciplines,
    }
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
