import React, { useEffect, useRef, useState } from 'react'
import AdventWindow from './components/AdventWindow'
import CalendarDialog from './components/CalendarDialog'
import './WindowPreview.css'
import useCalendarClock from './lib/useCalendarClock'
import { calendarDay, calendarTimeZone, dateInputDay, windowState } from './lib/windowSchedule'
import { previewAdventure } from './lib/previewAdventure'

export default function WindowPreview() {
  const [day, setDay] = useState(1)
  const [previewDate, setPreviewDate] = useState('')
  const clock = useCalendarClock()
  const today = previewDate ? dateInputDay(previewDate) : clock.now === null ? null : calendarDay(clock.now)
  const appearance = windowState(day, today)
  const [state, setState] = useState('closed')
  const [result, setResult] = useState(null)
  const [modal, setModal] = useState(false)
  const request = useRef(null)
  const trigger = useRef(null)
  const help = useRef(null)

  useEffect(() => () => request.current?.abort(), [])
  // Also invalidate pending content when synchronized time crosses a calendar boundary.
  useEffect(() => { reset() }, [day, today, previewDate])

  function reset() {
    request.current?.abort()
    setModal(false)
    setState('closed')
    setResult(null)
  }

  async function open(event) {
    trigger.current = { element: event.currentTarget, keyboard: event.detail === 0 }
    help.current?.removeAttribute('open')
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setState('loading')
    try {
      const data = await previewAdventure({ day, today, previewDate, signal:controller.signal })
      if (controller.signal.aborted) return
      setResult(data)
      setState('closed')
      setModal(true)
    } catch (error) {
      if (error.name !== 'AbortError') { setResult({ kind:'error' }); setState('closed'); setModal(true) }
    }
  }

  return <main className="window-preview">
    <header className="window-preview-header">
      <details ref={help} className="window-preview-help"
        onFocus={event => { if (event.target.matches(':focus-visible')) event.currentTarget.open = true }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }}
        onMouseEnter={event => { if (window.matchMedia('(hover: hover)').matches) event.currentTarget.open = true }}
        onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) event.currentTarget.open = false }}
        onKeyDown={event => { if (event.key === 'Escape') event.currentTarget.open = false }}>
        <summary>Как участвовать</summary>
        <p>Прочитай задание, выполни его и пришли ответ в чат ТехОтдела в тг</p>
      </details>
      <a href="/">Вернуться к календарю</a>
    </header>
    <section className="window-preview-stage" aria-labelledby="preview-title">
      <h1 id="preview-title">Окна декабря</h1>
      <p className="window-preview-caption">Проверяем состояния по дате</p>
      <AdventWindow day={day} appearance={appearance} busy={state === 'loading'} onClick={open} />
      <p className="window-preview-status" role="status">{state === 'loading' ? 'Проверяем доступ…' : appearance === 'clear' ? 'Прозрачное окно · задание этого дня' : appearance === 'tinted' ? 'Завтрашнее окно · тонированное стекло' : 'Будущий день · ставни закрыты'}</p>
      <label className="window-preview-select">Проверить день
        <select value={day} onChange={event => { reset(); setDay(Number(event.target.value)) }}>
          {Array.from({ length:31 }, (_, i) => <option key={i} value={i+1}>{i+1} декабря</option>)}
        </select>
      </label>
      <label className="window-preview-select">Тестовая дата
        <select value={previewDate} onChange={event => { reset(); setPreviewDate(event.target.value) }}>
          <option value="">Время сервера</option>
          {Array.from({ length:34 }, (_, i) => {
            const date = new Date(Date.UTC(2026, 10, 29 + i))
            const value = date.toISOString().slice(0, 10)
            return <option key={value} value={value}>{new Intl.DateTimeFormat('ru-RU', { timeZone:'UTC', day:'numeric', month:'long' }).format(date)}</option>
          })}
        </select>
      </label>
      {previewDate ? <button className="window-preview-clock-reset" onClick={() => { reset(); setPreviewDate('') }}>Вернуть время сервера</button> :
        <p className="window-preview-caption">{clock.now === null ? clock.error ? 'Не удалось получить время сервера.' : 'Получаем время сервера…' : `Дата по Москве: ${new Intl.DateTimeFormat('ru-RU', { timeZone:calendarTimeZone, day:'numeric', month:'long', year:'numeric' }).format(clock.now)}`}</p>}
      {clock.error && !previewDate && <button className="window-preview-clock-reset" onClick={clock.synchronize}>Повторить синхронизацию</button>}
      <p className="window-preview-test-note">{previewDate ? 'Симуляция: выбранная дата управляет видом окна и доступом к заданию.' : 'Вид окна и доступ к заданию определяются временем сервера.'}</p>
    </section>
    <section className="window-preview-gallery" aria-labelledby="rooms-title">
      <h2 id="rooms-title">Все окна · масштаб фасада</h2>
      <p className="window-preview-caption">31 разный интерьер. Выбери окно для проверки; тестовая дата действует на весь ряд.</p>
      <div className="window-preview-gallery-grid">
        {Array.from({ length:31 }, (_, i) => <AdventWindow key={i + 1} day={i + 1}
          appearance={windowState(i + 1, today)} label={`Выбрать окно ${i + 1} декабря`}
          onClick={() => { reset(); setDay(i + 1) }} />)}
      </div>
    </section>
    {modal && <CalendarDialog day={day} result={result} busy={false} opener={trigger.current} onClose={() => setModal(false)} />}
  </main>
}
