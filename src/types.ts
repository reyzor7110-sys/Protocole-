export type Intensity = 'doux' | 'ferme' | 'strict'

export type Screen = 'home' | 'ordres' | 'regles' | 'confession' | 'discipline'

export interface Rule {
  id: string
  text: string
  locked: boolean
  createdAt: string
}

export interface Order {
  id: string
  text: string
  category: string
  done: boolean
  failed: boolean
  date: string
}

export interface Confession {
  id: string
  text: string
  createdAt: string
}

export interface DisciplineEntry {
  id: string
  text: string
  reason: string
  done: boolean
  createdAt: string
}

export interface AppState {
  sworn: boolean
  name: string
  intensity: Intensity
  swornAt: string | null
  score: number
  streak: number
  lastActiveDate: string | null
  rules: Rule[]
  orders: Order[]
  confessions: Confession[]
  disciplines: DisciplineEntry[]
  totalCompleted: number
  totalFailed: number
}
