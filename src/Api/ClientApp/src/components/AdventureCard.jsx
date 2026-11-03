import React, { useEffect, useState } from 'react'
import './AdventureCard.css'

function renderAdventureMessage(message) {
  return message.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
    if (!link) return part

    return (
      <a
        key={index}
        href={link[2]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
      >
        {link[1]}
      </a>
    )
  })
}

function AdventureCard({ date, adventure, loading, error, dateInfo, adventureTitle, onClose }) {
  const isToday = dateInfo?.isToday || false
  const isPast = dateInfo?.isPast || false
  const isFuture = dateInfo?.isFuture || false
  const hasAdventure = adventure !== null && adventure !== undefined
  const [showInfoPopup, setShowInfoPopup] = useState(false)

  // Close popup when clicking outside
  useEffect(() => {
    if (showInfoPopup) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.adventure-content-header')) {
          setShowInfoPopup(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showInfoPopup])

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const previousRootOverflow = root.style.overflow
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow
    }

    // Lock the document, including touch scrolling, without moving the background.
    root.style.overflow = 'hidden'
    Object.assign(body.style, {
      position: 'fixed',
      top: `-${scrollY}px`,
      left: `-${scrollX}px`,
      width: '100%',
      overflow: 'hidden'
    })

    return () => {
      root.style.overflow = previousRootOverflow
      Object.assign(body.style, previousBodyStyles)
      window.scrollTo(scrollX, scrollY)
    }
  }, [])

  useEffect(() => {
    // Handle Escape key - close info popup first, then card (stack behavior)
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        // If info popup is open, close it first (stack behavior)
        if (showInfoPopup) {
          setShowInfoPopup(false)
        } else {
          // If no info popup, close the card
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, showInfoPopup])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on the card
    if (e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  const handleOverlayTouchEnd = (e) => {
    // iOS Safari: Use touchEnd instead of touchStart to prevent ghost clicks
    if (e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  return (
    <div 
      className="adventure-overlay" 
      onClick={handleOverlayClick}
      onTouchEnd={handleOverlayTouchEnd}
    >
      <div
        className="adventure-card"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <button 
          className="adventure-close" 
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onClose()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onClose()
          }}
        >
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
                    <div className="adventure-content-header">
                      <h2>{adventureTitle || (isToday ? '🎯 Задание на сегодня' : 'Приключение')}</h2>
                      <button
                        className="adventure-info-icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          setShowInfoPopup(!showInfoPopup)
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          setShowInfoPopup(!showInfoPopup)
                        }}
                        aria-label="Информация"
                      >
                        ℹ️
                      </button>
                      {showInfoPopup && (
                        <div
                          className="adventure-info-popup"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                        >
                          <div className="adventure-info-popup-content">
                            <button
                              className="adventure-info-popup-close"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setShowInfoPopup(false)
                              }}
                              onTouchEnd={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setShowInfoPopup(false)
                              }}
                            >
                              ×
                            </button>
                            <p>Прочитай задание, выполни его и пришли ответ в чат ТехОтдела в тг</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="adventure-message">{renderAdventureMessage(adventure)}</div>
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

