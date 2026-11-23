import React, { useEffect, useRef } from 'react'
import letterArt from '../assets/optimized/winter-letter-v1.webp'
import { taskTitle } from '../lib/taskPresentation'

function Message({ text }) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
    return link ? <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a> : part
  })
}

export default function CalendarDialog({ day, result, busy, showDecorationClue, decorationKind, opener, onClose }) {
  const dialog = useRef(null)
  const hint = result?.kind === 'hint'
  const finale = result?.kind === 'finale'
  const hasMessage = hint || finale || result?.kind === 'task'
  const cardKind = decorationKind ?? result?.kind
  const subject = cardKind === 'finale' ? 'поздравление' : cardKind === 'hint' ? 'подсказку' : 'задание'
  const closeLabel = `Закрыть ${subject}`
  const futureMessage = showDecorationClue
    ? 'Задание откроется завтра. А пока найди сегодняшнее украшение — оно подскажет, что ждёт тебя за стеклом.'
    : 'Праздник приближается. Загляни сюда, когда наступит этот день.'
  useEffect(() => {
    const node = dialog.current
    const page = document.documentElement
    const x = window.scrollX, y = window.scrollY
    const bodyStyle = document.body.getAttribute('style')
    const minHeight = page.style.minHeight
    // Keep the page's scroll range while the fixed body holds the backdrop in place.
    page.style.minHeight = `${page.scrollHeight}px`
    Object.assign(document.body.style, { position:'fixed', top:`-${y}px`, left:`-${x}px`, width:'100%', overflow:'hidden' })
    node.showModal()
    return () => {
      node.close()
      page.style.minHeight = minHeight
      if (bodyStyle === null) document.body.removeAttribute('style')
      else document.body.setAttribute('style', bodyStyle)
      window.scrollTo(x, y)

      const trigger = opener?.element
      if (!trigger?.isConnected) return
      if (opener.keyboard) {
        trigger.focus({ preventScroll:true })
      } else if (document.activeElement === trigger) {
        // The native dialog can restore focus even after a pointer click.
        trigger.blur()
      }
    }
  }, [])

  return <dialog ref={dialog} className={`calendar-dialog${hint ? ' calendar-dialog-hint' : ''}`} aria-labelledby="calendar-task-title"
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <article className="calendar-letter" aria-busy={busy}>
      <button className="calendar-dialog-close" autoFocus aria-label={closeLabel} onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <header className="calendar-letterhead">
        <img className="calendar-letter-art" src={letterArt} alt="" aria-hidden="true" draggable="false" />
        <p className="calendar-dialog-date"><span className="calendar-letter-day">{day}</span><span className="calendar-letter-month">декабря</span></p>
      </header>
      <div className="calendar-letter-content" aria-live="polite">
        <h2 id="calendar-task-title">{busy ? `Открываем ${subject}…` : hasMessage ? taskTitle(result.title) : result?.kind === 'future' ? 'У этого окна ещё всё впереди' : `Не удалось открыть ${subject}`}</h2>
        {!busy && <p className={hint ? 'calendar-dialog-message calendar-dialog-poem' : 'calendar-dialog-message'}>{hasMessage ? <Message text={result.message} /> : result?.kind === 'future' ? futureMessage : 'Не получилось получить ответ от сервера. Закрой карточку и попробуй ещё раз.'}</p>}
      </div>
    </article>
  </dialog>
}
