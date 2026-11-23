import React, { useEffect } from 'react'
import { dateInputDay } from '../lib/windowSchedule'

const previewDates = Array.from({ length:34 }, (_, i) => new Date(Date.UTC(2026, 10, 29 + i)))
const firstPreviewDay = dateInputDay('2026-11-29')
const dateLabel = new Intl.DateTimeFormat('ru-RU', { timeZone:'UTC', day:'numeric', month:'long' })

export default function CalendarDateControls({ value, today, onChange }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || !event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.target instanceof HTMLElement &&
        (event.target.isContentEditable || event.target.matches('input, textarea'))) return

      event.preventDefault()
      const offset = event.key === 'ArrowLeft' ? -1 : 1
      const index = today === null ? 0 : today - firstPreviewDay + offset
      const boundedIndex = Math.max(0, Math.min(previewDates.length - 1, index))
      const nextDate = previewDates[boundedIndex].toISOString().slice(0, 10)
      if (nextDate !== value) onChange(nextDate)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [value, today, onChange])

  return <aside className="calendar-dev-controls" aria-label="Проверка календаря">
    <label>Тестовая дата <select value={value} onChange={event => onChange(event.target.value)}>
      <option value="">Время сервера</option>
      {previewDates.map(date => {
        const day = date.toISOString().slice(0, 10)
        return <option key={day} value={day}>{dateLabel.format(date)}</option>
      })}
    </select></label>
    {value && <button onClick={() => onChange('')}>Вернуть время сервера</button>}
    <a href="/window-preview">Отдельное окно</a>
    <p>{value ? 'Симуляция: дата управляет окнами и доступом к заданиям.' : 'Состояния окон и доступ определяются временем сервера.'}</p>
    <p>Ctrl+← — предыдущий день, Ctrl+→ — следующий.</p>
  </aside>
}
