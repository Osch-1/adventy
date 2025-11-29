import React, { useEffect } from 'react'
import './AdventureCard.css'

function AdventureCard({ date, adventure, loading, error, dateInfo, onClose }) {
  const isToday = dateInfo?.isToday || false
  const isPast = dateInfo?.isPast || false
  const isFuture = dateInfo?.isFuture || false
  const hasAdventure = adventure !== null && adventure !== undefined

  useEffect(() => {
    // Get the app container and root element
    const appContainer = document.querySelector('.app')
    const root = document.documentElement

    // Save current scroll positions
    const scrollY = appContainer ? appContainer.scrollTop : window.scrollY
    const scrollX = window.scrollX

    // Prevent all scrolling on body and html
    document.body.style.position = 'fixed'
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.left = `-${scrollX}px`
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    document.body.style.overflow = 'hidden'
    document.body.style.overflowX = 'hidden'
    document.body.style.overflowY = 'hidden'

    root.style.overflow = 'hidden'
    root.style.overflowX = 'hidden'
    root.style.overflowY = 'hidden'

    // Also lock the app container if it exists
    if (appContainer) {
      appContainer.style.overflow = 'hidden'
      appContainer.style.overflowY = 'hidden'
    }

    // Handle Escape key to close card
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      // Restore scroll positions
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.body.style.overflow = ''
      document.body.style.overflowX = ''
      document.body.style.overflowY = ''

      root.style.overflow = ''
      root.style.overflowX = ''
      root.style.overflowY = ''

      if (appContainer) {
        appContainer.style.overflow = ''
        appContainer.style.overflowY = ''
        appContainer.scrollTop = scrollY
      } else {
        window.scrollTo(scrollX, scrollY)
      }

      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  return (
    <div className="adventure-overlay" onClick={onClose}>
      <div
        className="adventure-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="adventure-close" onClick={onClose}>
          ×
        </button>
        <div className="adventure-card-inner">
          <div className="adventure-card-front">
            <div className="adventure-date">{formatDate(date)}</div>
          </div>
          <div className="adventure-card-back">
            {hasAdventure || loading || error ? (
              <>
                {loading && (
                  <div className="adventure-loading">
                    <div className="spinner"></div>
                    <p>Loading adventure...</p>
                  </div>
                )}
                {error && (
                  <div className="adventure-error">
                    <p>⚠️</p>
                    <p>{error}</p>
                  </div>
                )}
                {!loading && !error && adventure && (
                  <div className="adventure-content">
                    <h2>{isToday ? "Today's Adventure" : "Сегодняшнее приключение"}</h2>
                    <div className="adventure-message">{adventure}</div>
                  </div>
                )}
              </>
            ) : isPast ? (
              <div className="adventure-message-placeholder">
                <p className="placeholder-icon">📅</p>
                <p className="placeholder-text">
                  Дата уже прошла, пора выполнять следующие задания
                </p>
              </div>
            ) : isFuture ? (
              <div className="adventure-message-placeholder">
                <p className="placeholder-icon">⏳</p>
                <p className="placeholder-text">
                  Обожди, не торопись, скоро новое приключение будет доступно!
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdventureCard

