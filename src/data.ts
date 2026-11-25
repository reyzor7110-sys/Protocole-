import type { Intensity, Rule } from './types'

export const DEFAULT_RULES: Omit<Rule, 'id' | 'createdAt'>[] = [
  { text: 'Tu t’adresses à toi-même avec honnêteté. Aucun mensonge dans le journal.', locked: true },
  { text: 'Les ordres du jour sont complétés avant minuit, sans exception.', locked: true },
  { text: 'Un manquement est confessé le jour même.', locked: true },
  { text: 'Tu ne modifies pas les règles verrouillées pour te faciliter la vie.', locked: true },
  { text: 'Tu restes digne : la soumission est choisie, jamais improvisée dans le chaos.', locked: true },
]

export const ORDER_POOL: { text: string; category: string; min: Intensity[] }[] = [
  { text: 'Tenue correcte toute la journée — posture droite, vêtements soignés.', category: 'Présentation', min: ['doux', 'ferme', 'strict'] },
  { text: 'Boire 2 litres d’eau et noter chaque verre.', category: 'Corps', min: ['doux', 'ferme', 'strict'] },
  { text: 'Méditation agenouillée 10 minutes, chronométrée.', category: 'Rituel', min: ['doux', 'ferme', 'strict'] },
  { text: 'Écrire 5 phrases d’obéissance dans le journal.', category: 'Esprit', min: ['doux', 'ferme', 'strict'] },
  { text: 'Pas de réseaux sociaux avant d’avoir validé tous les ordres.', category: 'Discipline', min: ['ferme', 'strict'] },
  { text: 'Demander la permission (à toi, à voix haute) avant chaque plaisir.', category: 'Contrôle', min: ['ferme', 'strict'] },
  { text: 'Douche froide le matin, 60 secondes minimum.', category: 'Corps', min: ['ferme', 'strict'] },
  { text: 'Ranger entièrement un espace de vie avant 18h.', category: 'Ordre', min: ['doux', 'ferme', 'strict'] },
  { text: 'S’agenouiller 3 minutes avant de dormir et réciter ton serment.', category: 'Rituel', min: ['ferme', 'strict'] },
  { text: 'Aucune masturbation / orgasme sans l’avoir noté comme faveur reçue.', category: 'Contrôle', min: ['strict'] },
  { text: 'Parler à voix basse et mesurée toute la journée.', category: 'Présentation', min: ['strict'] },
  { text: 'Compléter une tâche utile que tu reportais depuis trop longtemps.', category: 'Service', min: ['doux', 'ferme', 'strict'] },
  { text: '30 minutes d’exercice physique sans écran.', category: 'Corps', min: ['doux', 'ferme', 'strict'] },
  { text: 'Envoyer un message poli et utile à quelqu’un (ami, famille, collège).', category: 'Service', min: ['doux', 'ferme'] },
  { text: 'Manger sans téléphone, en silence, pendant au moins un repas.', category: 'Discipline', min: ['doux', 'ferme', 'strict'] },
  { text: 'Lister 3 manquements récents et une correction concrète pour chacun.', category: 'Esprit', min: ['ferme', 'strict'] },
  { text: 'Se coucher avant 23h30. Alarme réglée, téléphone hors chambre.', category: 'Ordre', min: ['doux', 'ferme', 'strict'] },
  { text: 'Porter un rappel discret (bracelet, collier, anneau) toute la journée.', category: 'Rituel', min: ['ferme', 'strict'] },
]

export const DISCIPLINE_POOL = [
  'Tenue agenouillée 15 minutes, chronomètre visible.',
  'Écrire 20 fois : « J’obéis. Je corrige. Je progresse. »',
  'Pas de dessert / sucre / alcool jusqu’à demain soir.',
  'Douche froide supplémentaire ce soir.',
  'Lit fait à la perfection + chambre rangée avant toute distraction.',
  '30 minutes de corvée utile (ménage, admin, sport).',
  'Couvre-feu anticipé : écran éteint 1h plus tôt.',
  'Confession écrite détaillée (10 lignes minimum) sur le manquement.',
]

export const SERMENT_TEXT = `Je m’engage volontairement sous PROTOCOLE.
Je choisis l’obéissance comme discipline, pas comme excuse.
Je tiendrai mes ordres, mes règles, et j’assumerai chaque manquement.
Je reste libre : je peux partir — mais tant que je reste, j’obéis.`

const INTENSITY_COUNT: Record<Intensity, number> = {
  doux: 3,
  ferme: 4,
  strict: 5,
}

export function intensityLabel(i: Intensity): string {
  return { doux: 'Doux', ferme: 'Ferme', strict: 'Strict' }[i]
}

export function pickDailyOrders(intensity: Intensity, date: string, seedExtra = 0) {
  const pool = ORDER_POOL.filter((o) => o.min.includes(intensity))
  const count = INTENSITY_COUNT[intensity]
  const seed = hash(`${date}:${intensity}:${seedExtra}`)
  const shuffled = [...pool].sort((a, b) => {
    const ha = hash(`${seed}:${a.text}`)
    const hb = hash(`${seed}:${b.text}`)
    return ha - hb
  })
  return shuffled.slice(0, count).map((o, idx) => ({
    id: `ord-${date}-${idx}`,
    text: o.text,
    category: o.category,
    done: false,
    failed: false,
    date,
  }))
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
