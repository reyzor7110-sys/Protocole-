import type { Intensity, Rule } from './types'

export const DEFAULT_RULES: Omit<Rule, 'id' | 'createdAt'>[] = [
  { text: 'Tu t’adresses à toi-même avec honnêteté. Aucun mensonge dans le journal.', locked: true },
  { text: 'Les ordres du jour sont complétés avant minuit, sans exception.', locked: true },
  { text: 'Un manquement est confessé le jour même — y compris les manquements sexuels.', locked: true },
  { text: 'Tu ne modifies pas les règles verrouillées pour te faciliter la vie.', locked: true },
  { text: 'Ton corps appartient au Protocole tant que tu restes. Le plaisir est une faveur, jamais un droit.', locked: true },
  { text: 'Tu acceptes l’humiliation choisie : te rabaisser n’est pas une erreur, c’est ton rôle.', locked: true },
  { text: 'Tu restes digne dans ton consentement : tu peux partir — mais tant que tu restes, tu subis et tu obéis.', locked: true },
]

export const ORDER_POOL: { text: string; category: string; min: Intensity[] }[] = [
  // Base / doux
  { text: 'Tenue correcte toute la journée — posture droite, vêtements soignés.', category: 'Présentation', min: ['doux', 'ferme', 'strict'] },
  { text: 'Boire 2 litres d’eau et noter chaque verre.', category: 'Corps', min: ['doux', 'ferme', 'strict'] },
  { text: 'Méditation agenouillée 10 minutes, chronométrée.', category: 'Rituel', min: ['doux', 'ferme', 'strict'] },
  { text: 'Écrire 5 phrases d’obéissance dans le journal.', category: 'Esprit', min: ['doux', 'ferme', 'strict'] },
  { text: 'Ranger entièrement un espace de vie avant 18h.', category: 'Ordre', min: ['doux', 'ferme', 'strict'] },
  { text: 'Compléter une tâche utile que tu reportais depuis trop longtemps.', category: 'Service', min: ['doux', 'ferme', 'strict'] },
  { text: '30 minutes d’exercice physique sans écran.', category: 'Corps', min: ['doux', 'ferme', 'strict'] },
  { text: 'Envoyer un message poli et utile à quelqu’un (ami, famille, collège).', category: 'Service', min: ['doux', 'ferme'] },
  { text: 'Manger sans téléphone, en silence, pendant au moins un repas.', category: 'Discipline', min: ['doux', 'ferme', 'strict'] },
  { text: 'Se coucher avant 23h30. Alarme réglée, téléphone hors chambre.', category: 'Ordre', min: ['doux', 'ferme', 'strict'] },
  { text: 'Te regarder nu·e dans le miroir 2 minutes et dire à voix haute : « Je suis un objet qui obéit. »', category: 'Humiliation', min: ['doux', 'ferme', 'strict'] },
  { text: 'Écrire 8 lignes : ce que tu mérites d’entendre quand on te rabaisse.', category: 'Humiliation', min: ['doux', 'ferme', 'strict'] },

  // Ferme+
  { text: 'Pas de réseaux sociaux avant d’avoir validé tous les ordres.', category: 'Discipline', min: ['ferme', 'strict'] },
  { text: 'Demander la permission (à toi, à voix haute) avant chaque plaisir.', category: 'Contrôle', min: ['ferme', 'strict'] },
  { text: 'Douche froide le matin, 60 secondes minimum.', category: 'Corps', min: ['ferme', 'strict'] },
  { text: 'S’agenouiller 3 minutes avant de dormir et réciter ton serment.', category: 'Rituel', min: ['ferme', 'strict'] },
  { text: 'Lister 3 manquements récents et une correction concrète pour chacun.', category: 'Esprit', min: ['ferme', 'strict'] },
  { text: 'Porter un rappel discret (bracelet, collier, anneau) toute la journée.', category: 'Rituel', min: ['ferme', 'strict'] },
  { text: 'Interdiction de te toucher sexuellement sans l’avoir demandé à voix haute et noté.', category: 'Contrôle', min: ['ferme', 'strict'] },
  { text: '10 minutes à genoux, mains derrière le dos, yeux baissés — chronomètre visible.', category: 'Humiliation', min: ['ferme', 'strict'] },
  { text: 'Écrire une confession sale : ce que tu veux qu’on te force à avouer.', category: 'Sexualité', min: ['ferme', 'strict'] },
  { text: 'Te gifler légèrement une fois (joue) après chaque manquement mental de la journée — noter le total.', category: 'Douleur', min: ['ferme', 'strict'] },
  { text: 'Porter (ou imaginer nettement) un collier de soumis pendant 1h, sans le retirer « pour rien ».', category: 'Possession', min: ['ferme', 'strict'] },
  { text: 'Te parler uniquement à la 3e personne pendant 20 minutes (« il/elle obéit… »).', category: 'Humiliation', min: ['ferme', 'strict'] },
  { text: 'Masturbation contrôlée 5 minutes max, sans orgasme — puis te remercier d’avoir été privé·e.', category: 'Sexualité', min: ['ferme', 'strict'] },
  { text: 'Photographier (privé, local) ta posture agenouillée et la décrire comme une preuve d’obéissance.', category: 'Humiliation', min: ['ferme', 'strict'] },

  // Trash ferme+
  { text: 'Te branler / te caresser 3 minutes pile, sans jouir, en te traitant de pute à voix haute.', category: 'Trash', min: ['ferme', 'strict'] },
  { text: 'Écrire 10 fois : « Je suis une chienne en chaleur qui n’a pas le droit de jouir. »', category: 'Trash', min: ['ferme', 'strict'] },
  { text: 'Lécher ton miroir / ton sol (propre) 1 minute à quatre pattes, puis dire merci.', category: 'Trash', min: ['ferme', 'strict'] },
  { text: 'Te mettre à poil 10 minutes et te filmer / te regarder comme une salope à vendre (privé).', category: 'Trash', min: ['ferme', 'strict'] },
  { text: 'Noter chaque fois que tu as eu envie de baiser aujourd’hui — et ce que tu as fait à la place.', category: 'Trash', min: ['ferme', 'strict'] },
  { text: 'Te gifler la gueule 4 fois (légères) en disant : « Ta gueule, tu obéis. »', category: 'Trash', min: ['ferme', 'strict'] },
  { text: 'Passer 8 minutes cul en l’air / poitrine au sol, sans te toucher, chrono visible.', category: 'Trash', min: ['ferme', 'strict'] },

  // Strict
  { text: 'Aucune masturbation / orgasme sans l’avoir noté comme faveur reçue.', category: 'Contrôle', min: ['strict'] },
  { text: 'Parler à voix basse et mesurée toute la journée.', category: 'Présentation', min: ['strict'] },
  { text: 'Journée sans orgasme. Tout edge doit être stoppé et confessé.', category: 'Contrôle', min: ['strict'] },
  { text: 'Écrire 15 fois : « Je suis une salope qui obéit. Mon plaisir n’appartient pas à moi. »', category: 'Humiliation', min: ['strict'] },
  { text: '20 minutes à genoux nu·e (ou semi-nu·e), front au sol, chronométrées.', category: 'Humiliation', min: ['strict'] },
  { text: 'Te pincer / claquer les cuisses ou fesses 10 fois nettes après chaque désir non autorisé.', category: 'Douleur', min: ['strict'] },
  { text: 'Rédiger un contrat d’objet : 10 phrases où tu te définis comme chose utilisable.', category: 'Possession', min: ['strict'] },
  { text: 'Utiliser un jouet / doigt 8 minutes sans orgasme, puis te remercier d’avoir été frustré·e.', category: 'Sexualité', min: ['strict'] },
  { text: 'Te regarder et te traiter verbalement de « putain de soumis·e » pendant 3 minutes sans rire.', category: 'Humiliation', min: ['strict'] },
  { text: 'Coucher face au sol 5 minutes, mains croisées dans le dos, en récitant ton serment.', category: 'Douleur', min: ['strict'] },
  { text: 'Noter chaque excitation de la journée et ce que tu aurais dû faire à la place (service, silence, peine).', category: 'Contrôle', min: ['strict'] },
  { text: 'Finir la soirée en position de présentation (agenouillé·e, mains ouvertes) 4 minutes avant le lit.', category: 'Rituel', min: ['strict'] },

  // Trash strict
  { text: 'Te doigter / te branler jusqu’au bord 3 fois, sans jouir, en suppliant à voix haute.', category: 'Trash', min: ['strict'] },
  { text: 'Écrire 20 fois : « Je suis un trou. Je sers. Je jouis seulement si on me le permet. »', category: 'Trash', min: ['strict'] },
  { text: 'Bouche ouverte, langue dehors, 3 minutes face miroir — te traiter de pute avide.', category: 'Trash', min: ['strict'] },
  { text: 'Te mettre un jouet / doigts 12 minutes, rythme lent, interdiction de jouir, merci à la fin.', category: 'Trash', min: ['strict'] },
  { text: 'Spit play solo : cracher dans ta main, te tartiner le visage, rester comme ça 2 minutes.', category: 'Trash', min: ['strict'] },
  { text: 'À quatre pattes 10 minutes, aboyer / geindre 10 fois, puis front au sol.', category: 'Trash', min: ['strict'] },
  { text: 'Te claquer les fesses 20 fois nettes, compter sale (« une pour la chienne… »).', category: 'Trash', min: ['strict'] },
  { text: 'Écrire une annonce trash (privée) qui te vend comme objet sexuel à corriger — 8 lignes min.', category: 'Trash', min: ['strict'] },
  { text: 'Te priver de culotte / slip sous les vêtements toute une plage de 2h (chez toi).', category: 'Trash', min: ['strict'] },
  { text: 'Finir la journée à genoux, cul exposé, 5 minutes, en récitant : « Baise-moi le cerveau, pas le droit. »', category: 'Trash', min: ['strict'] },

  // ABDL doux+
  { text: 'Porter une couche (ou équivalent) 1h chez toi — noter comment tu te sens.', category: 'ABDL', min: ['doux', 'ferme', 'strict'] },
  { text: '10 minutes avec tétine / sucette, sans téléphone, chrono visible.', category: 'ABDL', min: ['doux', 'ferme', 'strict'] },
  { text: 'Boire au biberon / gobelet « little » 200 ml minimum, sans se précipiter.', category: 'ABDL', min: ['doux', 'ferme', 'strict'] },
  { text: 'Écrire 6 phrases : pourquoi tu obéis comme un·e petit·e soumis·e adulte.', category: 'ABDL', min: ['doux', 'ferme', 'strict'] },
  { text: 'Coloriage / gribouillage 15 minutes, puis montrer (privé) ta « preuve ».', category: 'ABDL', min: ['doux', 'ferme', 'strict'] },

  // ABDL ferme+
  { text: 'Couche obligatoire 3h : toilettes interdites, tu utilises la couche si besoin.', category: 'ABDL', min: ['ferme', 'strict'] },
  { text: 'Te changer toi-même en rituel : à plat dos, compter à voix haute, dire merci.', category: 'ABDL', min: ['ferme', 'strict'] },
  { text: 'Parler « little » 20 minutes (phrases simples) — noter 5 phrases dites.', category: 'ABDL', min: ['ferme', 'strict'] },
  { text: 'Ramper 5 minutes jusqu’à un objectif, tétine en bouche, sans te relever.', category: 'ABDL', min: ['ferme', 'strict'] },
  { text: 'Sieste « little » 20 minutes : couche + tétine, alarme, pas d’écran.', category: 'ABDL', min: ['ferme', 'strict'] },
  { text: 'Check couche : te toucher / te regarder 1 minute et dire « couche pleine ou propre ».', category: 'ABDL', min: ['ferme', 'strict'] },

  // ABDL strict
  { text: 'Journée (ou plage 6h) en couche : zéro toilette, tu mouilles / tu assumes.', category: 'ABDL', min: ['strict'] },
  { text: 'Rester en couche mouillée 30 minutes avant de te changer — chrono + confession.', category: 'ABDL', min: ['strict'] },
  { text: 'Te faire « punir » little : corner 10 minutes, couche, tétine, visage au mur.', category: 'ABDL', min: ['strict'] },
  { text: 'Écrire 15 fois : « Je suis un bébé adulte qui porte des couches et qui obéit. »', category: 'ABDL', min: ['strict'] },
  { text: 'Dîner / collation au biberon uniquement pour un repas, assis·e par terre.', category: 'ABDL', min: ['strict'] },
  { text: 'Couche + body / pyjama little 2h ; te regarder et te traiter de petit·e chiotte.', category: 'ABDL', min: ['strict'] },
  { text: 'Mouiller volontairement ta couche, applaudir 5 fois, rester 15 minutes dedans.', category: 'ABDL', min: ['strict'] },
  { text: 'Journal ABDL : 12 lignes sur ta régression, ta honte et pourquoi tu restes.', category: 'ABDL', min: ['strict'] },
]

export const DISCIPLINE_POOL: { text: string; min: Intensity[] }[] = [
  { text: 'Tenue agenouillée 15 minutes, chronomètre visible.', min: ['doux', 'ferme', 'strict'] },
  { text: 'Écrire 20 fois : « J’obéis. Je corrige. Je progresse. »', min: ['doux', 'ferme', 'strict'] },
  { text: 'Pas de dessert / sucre / alcool jusqu’à demain soir.', min: ['doux', 'ferme', 'strict'] },
  { text: 'Douche froide supplémentaire ce soir.', min: ['doux', 'ferme', 'strict'] },
  { text: 'Lit fait à la perfection + chambre rangée avant toute distraction.', min: ['doux', 'ferme', 'strict'] },
  { text: '30 minutes de corvée utile (ménage, admin, sport).', min: ['doux', 'ferme', 'strict'] },
  { text: 'Couvre-feu anticipé : écran éteint 1h plus tôt.', min: ['doux', 'ferme', 'strict'] },
  { text: 'Confession écrite détaillée (10 lignes minimum) sur le manquement.', min: ['doux', 'ferme', 'strict'] },
  { text: '15 minutes à genoux, mains derrière le dos, yeux au sol — sans téléphone.', min: ['ferme', 'strict'] },
  { text: 'Écrire 25 fois : « J’ai déçu. Je mérite d’être corrigé·e. »', min: ['ferme', 'strict'] },
  { text: 'Douche froide 90 secondes + 5 minutes agenouillé·e ensuite, gouttes comprises.', min: ['ferme', 'strict'] },
  { text: 'Porter un rappel de peine (élastique / collier / écriture discrète) jusqu’à demain midi.', min: ['ferme', 'strict'] },
  { text: 'Interdiction de plaisir jusqu’à demain soir. Tout toucher sexuel = nouvelle peine.', min: ['strict'] },
  { text: '10 claques nettes sur les fesses ou cuisses, comptées à voix haute.', min: ['strict'] },
  { text: 'Confession humiliante : décrire ton manquement comme une faute de salope / d’objet.', min: ['strict'] },
  { text: 'Edge unique de 4 minutes, stop net, sans orgasme — puis « merci pour le refus ».', min: ['strict'] },
  { text: 'Te coller le front au sol 8 minutes et réciter ton serment trois fois.', min: ['strict'] },
  { text: 'Rédiger 12 lignes : pourquoi tu mérites d’être utilisé·e et privé·e.', min: ['strict'] },
  { text: 'Écrire 30 fois : « Je suis une pute qui a merdé. Je rampe. »', min: ['strict'] },
  { text: 'Edge trash 6 minutes (gros mots obligatoires), stop net, pas de jouissance.', min: ['strict'] },
  { text: '10 minutes à quatre pattes, front au sol, te traiter de chienne à chaque respiration longue.', min: ['strict'] },
  { text: 'Te claquer les fesses 30 fois, puis rester exposé·e 3 minutes sans te toucher.', min: ['strict'] },
  { text: '1h de couche forcée + tétine ; toilettes interdites.', min: ['ferme', 'strict'] },
  { text: 'Corner little 15 minutes : couche, nez au mur, tétine, chrono.', min: ['ferme', 'strict'] },
  { text: 'Mouiller ta couche, rester 20 minutes, te changer en te traitant de bébé qui a merdé.', min: ['strict'] },
  { text: 'Écrire 25 fois : « Couche. Obéissance. Je suis petit·e et corrigé·e. »', min: ['strict'] },
]

export function pickDiscipline(intensity: Intensity, seed: string): string {
  const pool = DISCIPLINE_POOL.filter((d) => d.min.includes(intensity))
  const list = pool.length > 0 ? pool : DISCIPLINE_POOL
  return list[Math.abs(hash(seed)) % list.length].text
}

export const SERMENT_TEXT = `Je m’engage volontairement sous PROTOCOLE.
Je choisis l’obéissance, l’humiliation et la correction comme discipline.
Mon plaisir n’est pas un droit : c’est une faveur qu’on peut refuser.
Je tiendrai mes ordres, mes règles, et j’assumerai chaque manquement.
Je reste libre : je peux partir — mais tant que je reste, j’obéis et je subis.`

const INTENSITY_COUNT: Record<Intensity, number> = {
  doux: 3,
  ferme: 4,
  strict: 5,
}

export function intensityLabel(i: Intensity): string {
  return { doux: 'Doux', ferme: 'Ferme', strict: 'Strict' }[i]
}

export function intensityHint(i: Intensity): string {
  return {
    doux: 'Cadre ferme, ABDL doux, humiliation légère.',
    ferme: 'Trash, ABDL, contrôle et rabaissement.',
    strict: 'Trash + ABDL sadiques, privation, humiliation crue.',
  }[i]
}

/** Bump to force regenerating today's open orders after content updates. */
export const ORDER_CONTENT_REV = 6

const CATEGORY_SLOTS: Record<Intensity, Partial<Record<string, number>>> = {
  doux: { ABDL: 1 },
  ferme: { Trash: 1, ABDL: 1 },
  strict: { Trash: 2, ABDL: 2 },
}

function shuffleBySeed<T extends { text: string }>(list: T[], seed: string): T[] {
  return [...list].sort((a, b) => hash(`${seed}:${a.text}`) - hash(`${seed}:${b.text}`))
}

export function pickDailyOrders(intensity: Intensity, date: string, seedExtra = 0) {
  const pool = ORDER_POOL.filter((o) => o.min.includes(intensity))
  const count = INTENSITY_COUNT[intensity]
  const seed = hash(`${date}:${intensity}:${ORDER_CONTENT_REV}:${seedExtra}`)
  const slots = CATEGORY_SLOTS[intensity]
  const reservedCats = Object.keys(slots)
  const picked: typeof pool = []
  const used = new Set<string>()

  for (const cat of reservedCats) {
    const want = Math.min(slots[cat] ?? 0, Math.max(0, count - picked.length))
    const catPool = shuffleBySeed(
      pool.filter((o) => o.category === cat && !used.has(o.text)),
      `${seed}:${cat}`,
    )
    for (const item of catPool.slice(0, want)) {
      picked.push(item)
      used.add(item.text)
    }
  }

  const otherPool = shuffleBySeed(
    pool.filter((o) => !used.has(o.text)),
    `${seed}:other`,
  )
  for (const item of otherPool) {
    if (picked.length >= count) break
    picked.push(item)
    used.add(item.text)
  }

  return picked.slice(0, count).map((o, idx) => ({
    id: `ord-${date}-r${ORDER_CONTENT_REV}-${idx}`,
    text: o.text,
    category: o.category,
    done: false,
    failed: false,
    date,
  }))
}

export function ordersMatchContentRev(orders: { id: string }[], date: string): boolean {
  const todays = orders.filter((o) => o.id.startsWith(`ord-${date}-`))
  if (todays.length === 0) return false
  const marker = `-r${ORDER_CONTENT_REV}-`
  return todays.every((o) => o.id.includes(marker))
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
