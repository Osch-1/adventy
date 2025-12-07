import React from 'react'
import './DateCard.css'

function DateCard({ dateInfo, isSelected, onClick }) {
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

  return (
    <div
      className={`date-card ${isSelected ? 'selected' : ''} ${dateInfo.isToday ? 'today' : ''}`}
      onClick={handleClick}
      onTouchEnd={(e) => {
        // iOS Safari: Check if overlay is open before allowing touch
        const cardsContainer = e.currentTarget.closest('.cards-container')
        if (cardsContainer && cardsContainer.classList.contains('overlay-open')) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        handleClick(e)
      }}
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

