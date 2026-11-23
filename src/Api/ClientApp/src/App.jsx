import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import AdventWindow from './components/AdventWindow'
import CalendarDialog from './components/CalendarDialog'
import useCalendarClock from './lib/useCalendarClock'
import { calendarDay, dateInputDay, windowState } from './lib/windowSchedule'
import { previewAdventure } from './lib/previewAdventure'
import { taskWindows } from './lib/houseLayout'
import house from './assets/optimized/winter-house-base-v1.webp'
import mobileHouse from './assets/optimized/winter-house-mobile-v1.webp'
import './App.css'

const DateControls = import.meta.env.DEV && typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('preview') === '1'
  ? React.lazy(() => import('./components/CalendarDateControls')) : null
const Decorations = React.lazy(() => import('./components/DecemberDecorations'))
const desktopMedia = typeof window !== 'undefined'
  ? window.matchMedia('(width > 700px) and (pointer: fine)')
  : null

function subscribeDesktop(onChange) {
  desktopMedia?.addEventListener('change', onChange)
  return () => desktopMedia?.removeEventListener('change', onChange)
}

const isDesktop = () => desktopMedia?.matches ?? false
const isServerDesktop = () => false
const windowsPerRow = 3
const windowRows = Array.from({ length: Math.ceil(taskWindows.length / windowsPerRow) }, (_, row) => {
  const start = row * windowsPerRow
  return taskWindows.slice(start, start + windowsPerRow)
})

export default function App() {
  const clock = useCalendarClock()
  const [testDate, setTestDate] = useState('')
  const previewDate = DateControls ? testDate : ''
  const today = previewDate ? dateInputDay(previewDate) : clock.now === null ? null : calendarDay(clock.now)
  const desktop = useSyncExternalStore(subscribeDesktop, isDesktop, isServerDesktop)
  const decemberDay = today === null ? -1 : Math.min(32, today - dateInputDay('2026-11-30'))
  const canFindDecoration = desktop && decemberDay >= 0 && decemberDay <= 31
  const [selectedDay, setSelectedDay] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const request = useRef(null)
  const trigger = useRef(null)
  const help = useRef(null)

  function close() {
    request.current?.abort()
    setSelectedDay(null)
    setResult(null)
    setBusy(false)
  }

  useEffect(() => { close() }, [today, previewDate])
  useEffect(() => () => request.current?.abort(), [])

  async function open(event, day) {
    trigger.current = { element: event.currentTarget, keyboard: event.detail === 0 }
    help.current?.removeAttribute('open')
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setSelectedDay(day)
    setResult(null)
    setBusy(true)
    try {
      const data = await previewAdventure({ day, today, previewDate, signal:controller.signal })
      if (!controller.signal.aborted) { setResult(data); setBusy(false) }
    } catch (error) {
      if (!controller.signal.aborted) { setResult({ kind:'error' }); setBusy(false) }
    }
  }

  return <main className="calendar-page">
    <section className="calendar-house" aria-label="Декабрьский календарь: 31 задание">
      <picture className="calendar-house-art">
        <source media="(max-width: 700px)" srcSet={mobileHouse} />
        <img src={house} alt="Зимний дом со снежной крышей, красной входной дверью, двумя освещёнными холлами и двумя закрытыми окнами-сюрпризами" draggable="false" />
      </picture>
      <header className="calendar-header">
        <h1>Adventy</h1>
        <details ref={help} className="calendar-help"
          onFocus={event => { if (event.target.matches(':focus-visible')) event.currentTarget.open = true }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }}
          onMouseEnter={event => { if (window.matchMedia('(hover: hover)').matches) event.currentTarget.open = true }}
          onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) event.currentTarget.open = false }}
          onKeyDown={event => { if (event.key === 'Escape') event.currentTarget.open = false }}>
          <summary>Как участвовать</summary>
          <p>Прочитай задание, выполни его и пришли ответ в чат ТехОтдела в тг. Новые задания открываются в полночь по Москве.
            {canFindDecoration && <>
              <br /><br />{decemberDay === 31
                ? 'Найди последнее украшение — в нём новогоднее поздравление.'
                : 'Найди сегодняшнее украшение — в нём подсказка на завтра.'}
            </>}
          </p>
        </details>
      </header>
      <div className="calendar-task-windows" aria-label="Задания декабря">
        {windowRows.map(row => <div className="calendar-window-row" key={row[0].day}>
          {row.map(window => <div className={`calendar-window-slot${window.day <= 7 ? ' is-attic' : ''}`} key={window.day} style={window.style}>
            <AdventWindow day={window.day} appearance={windowState(window.day, today)} variant="facade"
              busy={busy && selectedDay === window.day} onClick={event => open(event, window.day)} />
          </div>)}
        </div>)}
      </div>
      <span className="calendar-foreground-post" aria-hidden="true" style={{ backgroundImage:`url("${house}")` }} />
      {desktop && decemberDay >= 0 && <React.Suspense fallback={null}>
        <Decorations day={decemberDay} previewDate={previewDate} />
      </React.Suspense>}
    </section>
    {clock.now === null && !previewDate && <div className="calendar-clock-status" role="status">
      <p>{clock.error ? 'Не удалось получить время сервера.' : 'Получаем время сервера…'}</p>
      {clock.error && <button onClick={clock.synchronize}>Повторить</button>}
    </div>}
    {DateControls && <React.Suspense fallback={null}><DateControls value={previewDate} today={today} onChange={value => { close(); setTestDate(value) }} /></React.Suspense>}
    {selectedDay !== null && <CalendarDialog key={selectedDay} day={selectedDay} result={result} busy={busy}
      showDecorationClue={canFindDecoration && windowState(selectedDay, today) === 'tinted'}
      opener={trigger.current} onClose={close} />}
  </main>
}

