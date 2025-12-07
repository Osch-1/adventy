import React, { useRef } from 'react'
import './DateCard.css'

function DateCard({ dateInfo, isSelected, onClick }) {
  // Track touch start position and movement to distinguish taps from scrolls
  const touchStartRef = useRef(null)
  const touchMovedRef = useRef(false)

  // Format dates using UTC to ensure consistency across timezones
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC'
    })
  }

  const handleClick = (e) => {
    // Prevent clicks if parent container has overlay-open class (iOS Safari fix)
    const cardsContainer = e.currentTarget.closest('.cards-container')
    if (cardsContainer && cardsContainer.classList.contains('overlay-open')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick()
  }

  const handleTouchStart = (e) => {
    // Record touch start position
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    }
    touchMovedRef.current = false
  }

  const handleTouchMove = (e) => {
    // If touch moved significantly, mark it as a scroll
    if (touchStartRef.current) {
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
      // If moved more than 10px in any direction, consider it a scroll
      if (deltaX > 10 || deltaY > 10) {
        touchMovedRef.current = true
      }
    }
  }

  const handleTouchEnd = (e) => {
    // iOS Safari: Check if overlay is open before allowing touch
    const cardsContainer = e.currentTarget.closest('.cards-container')
    if (cardsContainer && cardsContainer.classList.contains('overlay-open')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // Only trigger click if touch didn't move (was a tap, not a scroll)
    if (!touchMovedRef.current) {
      handleClick(e)
    }

    // Reset touch tracking
    touchStartRef.current = null
    touchMovedRef.current = false
  }

  return (
    <div
      className={`date-card ${isSelected ? 'selected' : ''} ${dateInfo.isToday ? 'today' : ''}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="date-card-content">
        <div className="date-card-day">{formatDay(dateInfo.date)}</div>
        <div className="date-card-date">{dateInfo.date.getUTCDate()}</div>
        <div className="date-card-month">
          {dateInfo.date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
        </div>
        <div className="date-card-year">{dateInfo.date.getUTCFullYear()}</div>
        {dateInfo.isToday && (
          <div className="date-card-badge">Today</div>
        )}
      </div>
    </div>
  )
}

export default DateCard

