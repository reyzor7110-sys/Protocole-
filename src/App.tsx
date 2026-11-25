import { useEffect, useMemo, useState } from 'react'
import {
  SERMENT_TEXT,
  formatCountdown,
  intensityHint,
  intensityLabel,
  orderDeadlineAt,
  ordersMatchContentRev,
  pickDailyOrders,
  pickDiscipline,
  pickSevereDiscipline,
  todayISO,
  uid,
} from './data'
import { clampScore, loadState, saveState, scoreTone } from './storage'
import type {
  AppState,
  Confession,
  DisciplineEntry,
  Intensity,
  Ongoing,
  Order,
  Rule,
  Screen,
} from './types'

function ensureDailyOrders(state: AppState): AppState {
  const today = todayISO()
  const todays = state.orders.filter((o) => o.date === today)
  const revOk = ordersMatchContentRev(todays, today)
  if (todays.length > 0 && revOk) {
    return { ...state, lastActiveDate: today }
  }

  let next = { ...state }
  // Drop stale same-day orders when content rev changes (keep history of other days).
  if (todays.length > 0 && !revOk) {
    next = {
      ...next,
      orders: next.orders.filter((o) => o.date !== today),
    }
  }

  const yesterday = shiftDate(today, -1)
  const yOrders = next.orders.filter((o) => o.date === yesterday)
  if (todays.length === 0 && yOrders.length > 0) {
    const unfinished = yOrders.filter((o) => !o.done && !o.failed)
    if (unfinished.length > 0) {
      const failedMarked = next.orders.map((o) =>
        o.date === yesterday && !o.done && !o.failed ? { ...o, failed: true } : o,
      )
      const penalty = unfinished.length * 6
      const disciplines: DisciplineEntry[] = unfinished.map((o) => ({
        id: uid('dis'),
        text: pickDiscipline(next.intensity, o.id),
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
  return applyExpiredTimers({
    ...next,
    orders: [...fresh, ...next.orders].slice(0, 90),
    lastActiveDate: today,
  })
}

/** Marque les ordres dont le timer est à 0 et inflige une peine sévère. */
function applyExpiredTimers(state: AppState, now = Date.now()): AppState {
  const expired = state.orders.filter(
    (o) =>
      !o.done &&
      !o.failed &&
      o.deadlineAt &&
      new Date(o.deadlineAt).getTime() <= now,
  )
  if (expired.length === 0) return state

  const expiredIds = new Set(expired.map((o) => o.id))
  const disciplines: DisciplineEntry[] = expired.map((o) => ({
    id: uid('dis'),
    text: pickSevereDiscipline(`timer:${o.id}:${o.deadlineAt}`),
    reason: `Timer écoulé — peine sévère : ${o.text}`,
    done: false,
    createdAt: new Date().toISOString(),
  }))

  return {
    ...state,
    orders: state.orders.map((o) =>
      expiredIds.has(o.id) ? { ...o, failed: true, timedOut: true } : o,
    ),
    score: clampScore(state.score - expired.length * 15),
    streak: 0,
    totalFailed: state.totalFailed + expired.length,
    disciplines: [...disciplines, ...state.disciplines].slice(0, 40),
  }
}

function ensureOrderDeadlines(state: AppState): AppState {
  let changed = false
  const today = todayISO()
  const openToday = state.orders.filter(
    (o) => o.date === today && !o.done && !o.failed,
  )
  const orders = state.orders.map((o) => {
    if (o.done || o.failed) {
      if (o.deadlineAt === undefined) {
        changed = true
        return { ...o, deadlineAt: o.deadlineAt ?? null, timedOut: o.timedOut ?? false }
      }
      return o
    }
    if (o.deadlineAt) return o
    changed = true
    const idx = Math.max(
      0,
      openToday.findIndex((x) => x.id === o.id),
    )
    return {
      ...o,
      deadlineAt: orderDeadlineAt(state.intensity, idx),
      timedOut: false,
    }
  })
  return changed ? { ...state, orders } : state
}

function shiftDate(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
  const [state, setState] = useState<AppState>(() =>
    applyExpiredTimers(ensureOrderDeadlines(ensureDailyOrders(loadState()))),
  )
  const [screen, setScreen] = useState<Screen>('home')
  const [now, setNow] = useState(() => Date.now())
  const [flashId, setFlashId] = useState<string | null>(null)
  const [draftRule, setDraftRule] = useState('')
  const [draftOngoing, setDraftOngoing] = useState('')
  const [draftConfession, setDraftConfession] = useState('')
  const [oathName, setOathName] = useState('')
  const [oathIntensity, setOathIntensity] = useState<Intensity>('ferme')
  const [timerAlert, setTimerAlert] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const tick = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      setState((prev) => {
        const next = applyExpiredTimers(prev, t)
        if (next === prev) return prev
        const newly = next.orders.filter(
          (o) => o.timedOut && !prev.orders.find((x) => x.id === o.id)?.timedOut,
        )
        if (newly.length > 0) {
          queueMicrotask(() => {
            setTimerAlert(
              newly.length === 1
                ? 'Timer écoulé — peine sévère infligée.'
                : `${newly.length} timers écoulés — peines sévères infligées.`,
            )
            setScreen('discipline')
          })
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [])

  const today = todayISO()
  const todaysOrders = useMemo(
    () => state.orders.filter((o) => o.date === today),
    [state.orders, today],
  )
  const pendingDiscipline = state.disciplines.filter((d) => !d.done)
  const pendingOngoing = useMemo(
    () => state.ongoing.filter((o) => !o.done),
    [state.ongoing],
  )
  const doneOngoing = useMemo(
    () => state.ongoing.filter((o) => o.done),
    [state.ongoing],
  )
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
    patch((s) => {
      const punishment = pickDiscipline(s.intensity, `${order.id}:${Date.now()}`)
      return {
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
      }
    })
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

  function addOngoing() {
    const text = draftOngoing.trim()
    if (!text) return
    const entry: Ongoing = {
      id: uid('ong'),
      text,
      done: false,
      createdAt: new Date().toISOString(),
      doneAt: null,
    }
    patch((s) => ({
      ...s,
      ongoing: [entry, ...s.ongoing].slice(0, 40),
    }))
    setDraftOngoing('')
  }

  function completeOngoing(id: string) {
    patch((s) => ({
      ...s,
      ongoing: s.ongoing.map((o) =>
        o.id === id ? { ...o, done: true, doneAt: new Date().toISOString() } : o,
      ),
      score: clampScore(s.score + 2),
    }))
  }

  function reopenOngoing(id: string) {
    patch((s) => ({
      ...s,
      ongoing: s.ongoing.map((o) =>
        o.id === id ? { ...o, done: false, doneAt: null } : o,
      ),
    }))
  }

  function removeOngoing(id: string) {
    patch((s) => ({
      ...s,
      ongoing: s.ongoing.filter((o) => o.id !== id),
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
    patch((s) => {
      const text = pickDiscipline(s.intensity, `vol:${Date.now()}:${Math.random()}`)
      return {
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
      }
    })
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
              <p className="hint" style={{ marginTop: 10 }}>
                {intensityHint(oathIntensity)}
              </p>
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
          <p className="hint" style={{ marginTop: -4, marginBottom: 14 }}>
            {intensityHint(state.intensity)}
          </p>

          {timerAlert && (
            <div className="banner banner-severe">
              <span>{timerAlert}</span>
              <button type="button" className="mini" onClick={() => setTimerAlert(null)}>
                OK
              </button>
            </div>
          )}

          {pendingDiscipline.length > 0 && (
            <div className="banner">
              <strong>{pendingDiscipline.length} discipline(s)</strong> en attente — va les régler.
            </div>
          )}

          <div className="section-title">
            <h2>En cours</h2>
            <span>{pendingOngoing.length} ouvert{pendingOngoing.length === 1 ? '' : 's'}</span>
          </div>
          {pendingOngoing.length === 0 ? (
            <p className="hint">Rien d’ouvert. Ajoute une tâche longue dans l’onglet En cours.</p>
          ) : (
            <div className="card-list">
              {pendingOngoing.slice(0, 3).map((o) => (
                <OngoingRow
                  key={o.id}
                  item={o}
                  onDone={() => completeOngoing(o.id)}
                  onRemove={() => removeOngoing(o.id)}
                />
              ))}
            </div>
          )}
          {pendingOngoing.length > 3 && (
            <p className="hint" style={{ marginTop: 10 }}>
              +{pendingOngoing.length - 3} autres dans l’onglet En cours.
            </p>
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
                now={now}
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

      {screen === 'encours' && (
        <div className="screen" key="encours">
          <div className="topbar">
            <div className="brand">En cours</div>
            <div className="meta">{pendingOngoing.length} ouvert{pendingOngoing.length === 1 ? '' : 's'}</div>
          </div>
          <p className="hint">
            Tâches qui dépassent la journée. Elles restent jusqu’à ce que tu les boucles.
          </p>
          <div className="composer">
            <textarea
              value={draftOngoing}
              onChange={(e) => setDraftOngoing(e.target.value)}
              placeholder="Ex. : finir le dossier, tenir 7 jours sans…, ranger le garage…"
              maxLength={280}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!draftOngoing.trim()}
              onClick={addOngoing}
            >
              Ajouter
            </button>
          </div>
          <div className="card-list" style={{ marginTop: 16 }}>
            {pendingOngoing.length === 0 && (
              <div className="empty">Aucun élément en cours. Pose-en un.</div>
            )}
            {pendingOngoing.map((o) => (
              <OngoingRow
                key={o.id}
                item={o}
                onDone={() => completeOngoing(o.id)}
                onRemove={() => removeOngoing(o.id)}
              />
            ))}
          </div>
          {doneOngoing.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 28 }}>
                <h2>Terminés</h2>
                <span>{doneOngoing.length}</span>
              </div>
              <div className="card-list">
                {doneOngoing.slice(0, 12).map((o) => (
                  <div key={o.id} className="item done">
                    <div className="check">✓</div>
                    <div className="item-body">
                      <div className="cat">
                        {o.doneAt ? `Clos · ${formatWhen(o.doneAt)}` : 'Clos'}
                      </div>
                      <p>{o.text}</p>
                    </div>
                    <div className="item-actions">
                      <button type="button" className="mini" onClick={() => reopenOngoing(o.id)}>
                        Rouvrir
                      </button>
                      <button
                        type="button"
                        className="mini danger"
                        onClick={() => removeOngoing(o.id)}
                      >
                        Effacer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
          <p className="hint">
            Chaque ordre a un timer. À 0 : échec automatique et peine très sévère. Valide avant.
          </p>
          {timerAlert && (
            <div className="banner banner-severe">
              <span>{timerAlert}</span>
              <button type="button" className="mini" onClick={() => setTimerAlert(null)}>
                OK
              </button>
            </div>
          )}
          <div className="card-list">
            {todaysOrders.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                now={now}
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
            <div className="meta">
              {pendingDiscipline.length} ouverte{pendingDiscipline.length === 1 ? '' : 's'}
            </div>
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

      <nav className="nav nav-6" aria-label="Navigation">
        {(
          [
            ['home', 'Accueil'],
            ['ordres', 'Ordres'],
            ['encours', 'Cours'],
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
            {id === 'encours' && pendingOngoing.length > 0 ? (
              <span className="nav-badge" aria-hidden>
                {pendingOngoing.length}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  )
}

function OngoingRow({
  item,
  onDone,
  onRemove,
}: {
  item: Ongoing
  onDone: () => void
  onRemove: () => void
}) {
  return (
    <div className="item">
      <button type="button" className="check" aria-label="Marquer comme terminé" onClick={onDone} />
      <div className="item-body">
        <div className="cat">Depuis {formatWhen(item.createdAt)}</div>
        <p>{item.text}</p>
      </div>
      <div className="item-actions">
        <button type="button" className="mini" onClick={onDone}>
          Terminé
        </button>
        <button type="button" className="mini danger" onClick={onRemove}>
          Retirer
        </button>
      </div>
    </div>
  )
}

function OrderRow({
  order,
  now,
  flash,
  onDone,
  onFail,
}: {
  order: Order
  now: number
  flash: boolean
  onDone: () => void
  onFail: () => void
}) {
  const remaining = order.deadlineAt ? new Date(order.deadlineAt).getTime() - now : null
  const urgent = remaining !== null && remaining > 0 && remaining < 15 * 60_000
  const critical = remaining !== null && remaining > 0 && remaining < 5 * 60_000

  const cls = [
    'item',
    order.done ? 'done' : '',
    order.failed ? 'failed' : '',
    order.timedOut ? 'timed-out' : '',
    flash ? 'just-done' : '',
    critical ? 'timer-critical' : urgent ? 'timer-urgent' : '',
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
        <div className="cat-row">
          <div className="cat">{order.category}</div>
          {!order.done && !order.failed && remaining !== null && (
            <div
              className={`order-timer ${critical ? 'critical' : urgent ? 'urgent' : ''}`}
              aria-label="Temps restant"
            >
              {formatCountdown(remaining)}
            </div>
          )}
          {order.timedOut && <div className="order-timer expired">Timer · peine sévère</div>}
          {order.failed && !order.timedOut && <div className="order-timer expired">Manqué</div>}
        </div>
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
