import { useEffect, useMemo, useState } from 'react'
import {
  DISCIPLINE_POOL,
  SERMENT_TEXT,
  intensityLabel,
  pickDailyOrders,
  todayISO,
  uid,
} from './data'
import { clampScore, loadState, saveState, scoreTone } from './storage'
import type { AppState, Confession, DisciplineEntry, Intensity, Order, Rule, Screen } from './types'

function ensureDailyOrders(state: AppState): AppState {
  const today = todayISO()
  const todays = state.orders.filter((o) => o.date === today)
  if (todays.length > 0) {
    return { ...state, lastActiveDate: today }
  }

  let next = { ...state }
  const yesterday = shiftDate(today, -1)
  const yOrders = state.orders.filter((o) => o.date === yesterday)
  if (yOrders.length > 0) {
    const unfinished = yOrders.filter((o) => !o.done && !o.failed)
    if (unfinished.length > 0) {
      const failedMarked = state.orders.map((o) =>
        o.date === yesterday && !o.done && !o.failed ? { ...o, failed: true } : o,
      )
      const penalty = unfinished.length * 6
      const disciplines: DisciplineEntry[] = unfinished.map((o) => ({
        id: uid('dis'),
        text: DISCIPLINE_POOL[Math.abs(hash(o.id)) % DISCIPLINE_POOL.length],
        reason: `Ordre non tenu : ${o.text}`,
        done: false,
        createdAt: new Date().toISOString(),
      }))
      next = {
        ...next,
        orders: failedMarked,
        score: clampScore(next.score - penalty),
        streak: 0,
        totalFailed: next.totalFailed + unfinished.length,
        disciplines: [...disciplines, ...next.disciplines].slice(0, 40),
      }
    }
  }

  const fresh = pickDailyOrders(next.intensity, today)
  return {
    ...next,
    orders: [...fresh, ...next.orders].slice(0, 90),
    lastActiveDate: today,
  }
}

function shiftDate(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Paris',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(() => ensureDailyOrders(loadState()))
  const [screen, setScreen] = useState<Screen>('home')
  const [flashId, setFlashId] = useState<string | null>(null)
  const [draftRule, setDraftRule] = useState('')
  const [draftConfession, setDraftConfession] = useState('')
  const [oathName, setOathName] = useState('')
  const [oathIntensity, setOathIntensity] = useState<Intensity>('ferme')

  useEffect(() => {
    saveState(state)
  }, [state])

  const today = todayISO()
  const todaysOrders = useMemo(
    () => state.orders.filter((o) => o.date === today),
    [state.orders, today],
  )
  const pendingDiscipline = state.disciplines.filter((d) => !d.done)
  const doneToday = todaysOrders.filter((o) => o.done).length
  const tone = scoreTone(state.score)

  function patch(updater: (s: AppState) => AppState) {
    setState((s) => ensureDailyOrders(updater(s)))
  }

  function swear() {
    const name = oathName.trim()
    if (!name) return
    setState((s) =>
      ensureDailyOrders({
        ...s,
        sworn: true,
        name,
        intensity: oathIntensity,
        swornAt: new Date().toISOString(),
        score: oathIntensity === 'strict' ? 65 : oathIntensity === 'ferme' ? 70 : 75,
      }),
    )
    setScreen('home')
  }

  function completeOrder(order: Order) {
    if (order.done || order.failed) return
    setFlashId(order.id)
    setTimeout(() => setFlashId(null), 700)
    patch((s) => {
      const orders = s.orders.map((o) => (o.id === order.id ? { ...o, done: true } : o))
      const todays = orders.filter((o) => o.date === today)
      const allDone = todays.every((o) => o.done)
      let streak = s.streak
      if (allDone) {
        const yesterday = shiftDate(today, -1)
        const yOrders = orders.filter((o) => o.date === yesterday)
        const yPerfect = yOrders.length > 0 && yOrders.every((o) => o.done)
        streak = yPerfect ? s.streak + 1 : Math.max(1, s.streak || 1)
        if (!yOrders.length) streak = Math.max(1, s.streak || 1)
      }
      return {
        ...s,
        orders,
        score: clampScore(s.score + (allDone ? 8 : 3)),
        streak,
        totalCompleted: s.totalCompleted + 1,
      }
    })
  }

  function failOrder(order: Order) {
    if (order.done || order.failed) return
    const punishment = DISCIPLINE_POOL[Math.abs(hash(order.id + Date.now())) % DISCIPLINE_POOL.length]
    patch((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === order.id ? { ...o, failed: true } : o)),
      score: clampScore(s.score - 8),
      streak: 0,
      totalFailed: s.totalFailed + 1,
      disciplines: [
        {
          id: uid('dis'),
          text: punishment,
          reason: `Manquement : ${order.text}`,
          done: false,
          createdAt: new Date().toISOString(),
        },
        ...s.disciplines,
      ].slice(0, 40),
    }))
    setScreen('discipline')
  }

  function addRule() {
    const text = draftRule.trim()
    if (!text) return
    const rule: Rule = { id: uid('rule'), text, locked: false, createdAt: today }
    patch((s) => ({ ...s, rules: [...s.rules, rule] }))
    setDraftRule('')
  }

  function removeRule(id: string) {
    patch((s) => ({
      ...s,
      rules: s.rules.filter((r) => r.id !== id || r.locked),
    }))
  }

  function addConfession() {
    const text = draftConfession.trim()
    if (!text) return
    const entry: Confession = {
      id: uid('conf'),
      text,
      createdAt: new Date().toISOString(),
    }
    patch((s) => ({
      ...s,
      confessions: [entry, ...s.confessions].slice(0, 60),
      score: clampScore(s.score + 1),
    }))
    setDraftConfession('')
  }

  function completeDiscipline(id: string) {
    patch((s) => ({
      ...s,
      disciplines: s.disciplines.map((d) => (d.id === id ? { ...d, done: true } : d)),
      score: clampScore(s.score + 4),
    }))
  }

  function assignSelfDiscipline() {
    const text = DISCIPLINE_POOL[Math.floor(Math.random() * DISCIPLINE_POOL.length)]
    patch((s) => ({
      ...s,
      disciplines: [
        {
          id: uid('dis'),
          text,
          reason: 'Discipline volontaire',
          done: false,
          createdAt: new Date().toISOString(),
        },
        ...s.disciplines,
      ].slice(0, 40),
    }))
  }

  function resetAll() {
    if (!confirm('Effacer tout le protocole et recommencer le serment ?')) return
    localStorage.removeItem('protocole.v1')
    setState(loadState())
    setScreen('home')
  }

  if (!state.sworn) {
    return (
      <div className="app oath">
        <div className="grain" />
        <div className="oath-screen">
          <header className="oath-brand">
            <div className="brand">PROTOCOLE</div>
            <div className="tag">Cadre d’obéissance</div>
            <div className="seal">Serment</div>
          </header>

          <div>
            <div className="serment">{SERMENT_TEXT}</div>
            <div className="field">
              <label htmlFor="name">Ton nom de soumis</label>
              <input
                id="name"
                value={oathName}
                onChange={(e) => setOathName(e.target.value)}
                placeholder="Ex. : Ash, Unit 7, ton prénom…"
                autoComplete="off"
                maxLength={32}
              />
            </div>
            <div className="field">
              <label>Intensité</label>
              <div className="intensity">
                {(['doux', 'ferme', 'strict'] as Intensity[]).map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={oathIntensity === i ? 'active' : ''}
                    onClick={() => setOathIntensity(i)}
                  >
                    {intensityLabel(i)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="button" className="btn btn-seal" disabled={!oathName.trim()} onClick={swear}>
            Je jure et j’obéis
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="grain" />

      {screen === 'home' && (
        <div className="screen" key="home">
          <div className="topbar">
            <div className="brand">PROTOCOLE</div>
            <div className="meta">{state.name}</div>
          </div>

          <div className="hero-score">
            <div className={`score-num ${tone}`}>{state.score}</div>
            <div className="score-label">Obéissance</div>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>{state.streak}</strong>
              <span>Série</span>
            </div>
            <div className="stat">
              <strong>
                {doneToday}/{todaysOrders.length}
              </strong>
              <span>Aujourd’hui</span>
            </div>
            <div className="stat">
              <strong>{intensityLabel(state.intensity)}</strong>
              <span>Niveau</span>
            </div>
          </div>

          {pendingDiscipline.length > 0 && (
            <div className="banner">
              <strong>{pendingDiscipline.length} discipline(s)</strong> en attente — va les régler.
            </div>
          )}

          <div className="section-title">
            <h2>Ordres du jour</h2>
            <span>{today}</span>
          </div>
          <div className="card-list">
            {todaysOrders.slice(0, 3).map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                flash={flashId === o.id}
                onDone={() => completeOrder(o)}
                onFail={() => failOrder(o)}
              />
            ))}
          </div>
          {todaysOrders.length > 3 && (
            <p className="hint" style={{ marginTop: 10 }}>
              +{todaysOrders.length - 3} autres dans l’onglet Ordres.
            </p>
          )}

          <p className="quote">« Tant que tu restes, tu obéis. »</p>
        </div>
      )}

      {screen === 'ordres' && (
        <div className="screen" key="ordres">
          <div className="topbar">
            <div className="brand">Ordres</div>
            <div className="meta">
              {doneToday}/{todaysOrders.length}
            </div>
          </div>
          <p className="hint">Valide avant minuit. Un manquement génère une discipline.</p>
          <div className="card-list">
            {todaysOrders.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                flash={flashId === o.id}
                onDone={() => completeOrder(o)}
                onFail={() => failOrder(o)}
              />
            ))}
          </div>
        </div>
      )}

      {screen === 'regles' && (
        <div className="screen" key="regles">
          <div className="topbar">
            <div className="brand">Règles</div>
            <div className="meta">{state.rules.length}</div>
          </div>
          <p className="hint">Les règles verrouillées font partie du serment. Les tiennes restent.</p>
          {state.rules.map((r) => (
            <div className="rule-row" key={r.id}>
              {r.locked && <div className="lock">Sceau</div>}
              <p>{r.text}</p>
              {!r.locked && (
                <button type="button" className="mini danger" onClick={() => removeRule(r.id)}>
                  Retirer
                </button>
              )}
            </div>
          ))}
          <div className="composer">
            <textarea
              value={draftRule}
              onChange={(e) => setDraftRule(e.target.value)}
              placeholder="Ajouter une règle personnelle…"
              maxLength={220}
            />
            <button type="button" className="btn btn-primary" disabled={!draftRule.trim()} onClick={addRule}>
              Ajouter la règle
            </button>
          </div>
        </div>
      )}

      {screen === 'confession' && (
        <div className="screen" key="confession">
          <div className="topbar">
            <div className="brand">Confession</div>
            <div className="meta">Journal</div>
          </div>
          <p className="hint">Écris ce que tu as manqué, désiré, ou tenu. L’honnêteté compte.</p>
          <div className="composer">
            <textarea
              value={draftConfession}
              onChange={(e) => setDraftConfession(e.target.value)}
              placeholder="Aujourd’hui j’ai…"
              maxLength={1200}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!draftConfession.trim()}
              onClick={addConfession}
            >
              Déposer
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            {state.confessions.length === 0 && <div className="empty">Aucune confession encore.</div>}
            {state.confessions.map((c) => (
              <div className="confession" key={c.id}>
                <time dateTime={c.createdAt}>{formatWhen(c.createdAt)}</time>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'discipline' && (
        <div className="screen" key="discipline">
          <div className="topbar">
            <div className="brand">Discipline</div>
            <div className="meta">{pendingDiscipline.length} ouvertes</div>
          </div>
          <p className="hint">Les manquements se paient. Accomplis, puis coche.</p>
          <button type="button" className="btn btn-ghost" onClick={assignSelfDiscipline}>
            Demander une discipline
          </button>
          <div className="card-list" style={{ marginTop: 14 }}>
            {state.disciplines.length === 0 && <div className="empty">Rien à régler. Reste digne.</div>}
            {state.disciplines.map((d) => (
              <div key={d.id} className={`item ${d.done ? 'done' : ''}`}>
                <div className="check">{d.done ? '✓' : ''}</div>
                <div className="item-body">
                  <div className="cat">{d.reason}</div>
                  <p>{d.text}</p>
                </div>
                {!d.done && (
                  <button type="button" className="mini" onClick={() => completeDiscipline(d.id)}>
                    Fait
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="reset-zone">
            <p className="hint">Quitter le protocole efface ton score et ton serment sur cet appareil.</p>
            <button type="button" className="btn btn-danger" onClick={resetAll}>
              Briser le serment
            </button>
          </div>
        </div>
      )}

      <nav className="nav" aria-label="Navigation">
        {(
          [
            ['home', 'Accueil'],
            ['ordres', 'Ordres'],
            ['regles', 'Règles'],
            ['confession', 'Journal'],
            ['discipline', 'Peines'],
          ] as [Screen, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={screen === id ? 'active' : ''}
            onClick={() => setScreen(id)}
          >
            <span className="dot" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function OrderRow({
  order,
  flash,
  onDone,
  onFail,
}: {
  order: Order
  flash: boolean
  onDone: () => void
  onFail: () => void
}) {
  const cls = [
    'item',
    order.done ? 'done' : '',
    order.failed ? 'failed' : '',
    flash ? 'just-done' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls}>
      <button
        type="button"
        className="check"
        aria-label="Marquer comme fait"
        disabled={order.done || order.failed}
        onClick={onDone}
      >
        {order.done ? '✓' : order.failed ? '×' : ''}
      </button>
      <div className="item-body">
        <div className="cat">{order.category}</div>
        <p>{order.text}</p>
      </div>
      {!order.done && !order.failed && (
        <div className="item-actions">
          <button type="button" className="mini" onClick={onDone}>
            Obéi
          </button>
          <button type="button" className="mini danger" onClick={onFail}>
            Manqué
          </button>
        </div>
      )}
    </div>
  )
}
