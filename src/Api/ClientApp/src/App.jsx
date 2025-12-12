import React, { useState, useMemo, useEffect, useRef } from 'react'
import DateCard from './components/DateCard'
import AdventureCard from './components/AdventureCard'
import './App.css'

// Error handling function - maps backend error codes to Russian messages
function getErrorMessage(error) {
  if (!error) {
    return '⚠️ Неожиданная ошибка. Пожалуйста, обратитесь к администратору.'
  }

  const errorType = error.type
  const errorCode = error.code

  // Handle InvalidRequestParameters (ErrorType = 0)
  if (errorType === 0) { // InvalidRequestParameters
    switch (errorCode) {
      case 0: // InvalidSearchDate
        return '⚠️ Неверная дата запроса. Если вы уверены, что все делаете правильно, пожалуйста, напишите администратору.'
      case 1: // InvalidUserTimeZone
        return '⚠️ Неверный часовой пояс. Пожалуйста, обратитесь к администратору.'
      case 2: // SearchDatePassed
        return '📅 Дата уже прошла, пора выполнять следующие задания!'
      case 3: // SearchDateHasNotAppeared
        return '⏳ Обожди, не торопись, скоро новое приключение будет доступно!'
      case 4: // ResourceIsNotConfigured
        return '⚠️ Ресурс не настроен. Пожалуйста, обратитесь к администратору.'
      default:
        return '⚠️ Неверный запрос. Пожалуйста, обратитесь к администратору.'
    }
  }

  // Handle InternalServerError (ErrorType = 1)
  if (errorType === 1) { // InternalServerError
    switch (errorCode) {
      case 4: // ResourceIsNotConfigured
        return '⚠️ Ресурс не настроен. Пожалуйста, обратитесь к администратору.'
      default:
        return '⚠️ Внутренняя ошибка сервера. Пожалуйста, обратитесь к администратору.'
    }
  }

  // Default error message for unknown error types
  return '⚠️ Неожиданная ошибка. Пожалуйста, обратитесь к администратору.'
}

// Return a random Christmas emoji for future dates without content
function getRandomChristmasEmoji() {
  const emojis = ['🎄', '🎅', '🤶', '🧑‍🎄', '⛄', '🦌', '🎁']
  return emojis[Math.floor(Math.random() * emojis.length)]
}

function App() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [adventure, setAdventure] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [skipSecrets, setSkipSecrets] = useState({
    first: null,
    second: null
  })

  // Ref for cards container and auto-scroll management
  const cardsContainerRef = useRef(null)
  const autoScrollTimeoutRef = useRef(null)
  const isAutoScrollingRef = useRef(false)
  const userInteractedRef = useRef(false)

  // Read query parameters for skip validation secrets
  // Using generic names (first, second) to hide actual header names from users
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSkipSecrets({
      first: params.get('first') || null,
      second: params.get('second') || null
    })
  }, [])

  // Generate dates from December 10, 2025 to December 31, 2025
  // Using UTC to make calendar timezone-independent
  const dates = useMemo(() => {
    // Create dates in UTC to avoid timezone issues
    const startYear = 2025
    const startMonth = 11 // December (0-indexed)
    const startDay = 10

    const endYear = 2025
    const endMonth = 11 // December
    const endDay = 31

    // Get today's date in UTC (date only, no time)
    const now = new Date()
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ))

    const dateArray = []

    // Generate dates using UTC
    for (let year = startYear; year <= endYear; year++) {
      const monthStart = (year === startYear) ? startMonth : 0
      const monthEnd = (year === endYear) ? endMonth : 11

      for (let month = monthStart; month <= monthEnd; month++) {
        const dayStart = (year === startYear && month === startMonth) ? startDay : 1
        const dayEnd = (year === endYear && month === endMonth) ? endDay :
          new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

        for (let day = dayStart; day <= dayEnd; day++) {
          // Create date in UTC at midnight
          const dateUTC = new Date(Date.UTC(year, month, day))

          // Compare dates by date components only (UTC)
          const dateYear = dateUTC.getUTCFullYear()
          const dateMonth = dateUTC.getUTCMonth()
          const dateDay = dateUTC.getUTCDate()

          const todayYear = todayUTC.getUTCFullYear()
          const todayMonth = todayUTC.getUTCMonth()
          const todayDay = todayUTC.getUTCDate()

          const isToday = dateYear === todayYear &&
                         dateMonth === todayMonth &&
                         dateDay === todayDay

          const isPast = dateYear < todayYear ||
                        (dateYear === todayYear && dateMonth < todayMonth) ||
                        (dateYear === todayYear && dateMonth === todayMonth && dateDay < todayDay)

          const isFuture = dateYear > todayYear ||
                          (dateYear === todayYear && dateMonth > todayMonth) ||
                          (dateYear === todayYear && dateMonth === todayMonth && dateDay > todayDay)

          dateArray.push({
            date: dateUTC,
            isToday,
            isPast,
            isFuture
          })
        }
      }
    }

    return dateArray
  }, [])

  const handleCardClick = async (dateInfo) => {
    // Compare dates by UTC date components to handle timezone differences
    const compareDates = (date1, date2) => {
      return date1.getUTCFullYear() === date2.getUTCFullYear() &&
             date1.getUTCMonth() === date2.getUTCMonth() &&
             date1.getUTCDate() === date2.getUTCDate()
    }

    if (selectedDate && compareDates(selectedDate, dateInfo.date)) {
      // Close the card if clicking the same date
      setSelectedDate(null)
      setAdventure(null)
      setError(null)
      return
    }

    setSelectedDate(dateInfo.date)
    setError(null)

    // Always fetch adventure for any date
    setLoading(true)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      // Format date using UTC components to ensure consistency worldwide
      const year = dateInfo.date.getUTCFullYear()
      const month = String(dateInfo.date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(dateInfo.date.getUTCDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      // Build headers with skip validation secrets if provided (for testing future dates and dates outside range)
      // Map generic parameter names to actual header names
      const headers = {
        'X-Timezone': timezone
      }

      if (skipSecrets.first) {
        headers['Adventy-SkipSearchDateInRangeValidationSecret'] = skipSecrets.first
      }
      if (skipSecrets.second) {
        headers['Adventy-SkipSearchDateHasNotAppearedValidationSecret'] = skipSecrets.second
      }

      const response = await fetch(`/api/Adventures?searchDateTime=${dateStr}T00:00:00`, {
        headers
      })

      const data = await response.json()

      if (response.ok && data.data) {
        setAdventure({
          message: data.data.message,
          title: data.data.title
        })
      } else {
        // Handle backend errors with Russian messages
        const primaryError = data.errors?.[0]

        // For future dates, show a festive emoji instead of a warning
        if (dateInfo.isFuture && primaryError?.type === 0 && primaryError?.code === 3) {
          setAdventure(getRandomChristmasEmoji())
          setError(null)
        } else {
          const errorMessage = getErrorMessage(primaryError)
          setError(errorMessage)
        }
      }
    } catch (err) {
      setError('⚠️ Неожиданная ошибка. Пожалуйста, обратитесь к администратору.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedDate(null)
    setAdventure(null)
    setError(null)
  }


  const [showInfoPopup, setShowInfoPopup] = useState(false)

  // Close popup when clicking outside
  useEffect(() => {
    if (showInfoPopup) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.app-title-container')) {
          setShowInfoPopup(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showInfoPopup])

  // Handle Escape key to close info popup (stack behavior - only if card is not open)
  useEffect(() => {
    // Only handle Escape for main page info popup if no card is open
    if (showInfoPopup && !selectedDate) {
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          setShowInfoPopup(false)
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showInfoPopup, selectedDate])

  // Auto-scroll to today's date on mount
  useEffect(() => {
    // Only auto-scroll if user hasn't interacted yet
    if (userInteractedRef.current) {
      return
    }

    // Find today's date index
    const todayIndex = dates.findIndex(dateInfo => dateInfo.isToday)

    if (todayIndex === -1 || !cardsContainerRef.current) {
      return
    }

    // Get the today's date card element
    const cardsContainer = cardsContainerRef.current
    const todayCard = cardsContainer.children[todayIndex]

    if (!todayCard) {
      return
    }

    let scrollStartPosition = { x: window.scrollX, y: window.scrollY }
    let lastScrollTime = Date.now()
    let scrollTimeout = null
    let animationFrameId = null

    // Easing function for smooth acceleration and deceleration (ease-in-out cubic)
    const easeInOutCubic = (t) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    // Cancel scroll handlers
    const cancelAutoScroll = () => {
      userInteractedRef.current = true
      isAutoScrollingRef.current = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current)
        autoScrollTimeoutRef.current = null
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
        scrollTimeout = null
      }
    }

    // Custom smooth scroll function with easing
    const smoothScrollTo = (targetElement, duration = 1200) => {
      if (!targetElement) return

      const startX = window.scrollX || window.pageXOffset
      const startY = window.scrollY || window.pageYOffset

      // Get element position relative to viewport
      const rect = targetElement.getBoundingClientRect()
      const targetX = startX + rect.left + rect.width / 2 - window.innerWidth / 2
      const targetY = startY + rect.top + rect.height / 2 - window.innerHeight / 2

      const distanceX = targetX - startX
      const distanceY = targetY - startY
      const startTime = performance.now()

      const animateScroll = (currentTime) => {
        if (userInteractedRef.current || !isAutoScrollingRef.current) {
          return
        }

        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeInOutCubic(progress)

        const currentX = startX + distanceX * easedProgress
        const currentY = startY + distanceY * easedProgress

        window.scrollTo(currentX, currentY)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animateScroll)
        } else {
          isAutoScrollingRef.current = false
          animationFrameId = null
        }
      }

      animationFrameId = requestAnimationFrame(animateScroll)
    }

    // Function to perform smooth scroll
    const performScroll = () => {
      if (userInteractedRef.current || !todayCard) {
        return
      }

      isAutoScrollingRef.current = true
      scrollStartPosition = { x: window.scrollX, y: window.scrollY }

      // Calculate scroll duration based on distance for consistent speed
      const rect = todayCard.getBoundingClientRect()
      const currentY = window.scrollY || window.pageYOffset
      const targetY = currentY + rect.top + rect.height / 2 - window.innerHeight / 2
      const distance = Math.abs(targetY - currentY)

      // Base duration of 800ms, add 0.3ms per pixel for longer distances
      // This ensures consistent perceived speed regardless of distance
      const duration = Math.min(800 + distance * 0.3, 2000)

      // Use custom smooth scroll with easing
      smoothScrollTo(todayCard, duration)
    }

    // Delay scroll slightly to ensure DOM is fully rendered and layout is stable
    scrollTimeout = setTimeout(performScroll, 300)

    // Listen for user interactions to cancel auto-scroll
    const handleClick = (e) => {
      // Don't cancel if clicking on info icon or popup
      if (!e.target.closest('.app-info-icon') && !e.target.closest('.info-popup')) {
        cancelAutoScroll()
      }
    }

    const handleTouchStart = () => {
      cancelAutoScroll()
    }

    const handleTouchMove = () => {
      cancelAutoScroll()
    }

    const handleWheel = () => {
      cancelAutoScroll()
    }

    const handleScroll = () => {
      // Only cancel if we're not currently auto-scrolling
      // During auto-scroll, our custom animation will trigger scroll events,
      // so we ignore them to avoid interrupting the smooth animation
      if (!isAutoScrollingRef.current) {
        cancelAutoScroll()
      }
    }

    // Add event listeners with capture phase to catch early
    const options = { passive: true, capture: true }
    document.addEventListener('click', handleClick, options)
    document.addEventListener('touchstart', handleTouchStart, options)
    document.addEventListener('touchmove', handleTouchMove, options)
    document.addEventListener('wheel', handleWheel, options)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      clearTimeout(scrollTimeout)
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current)
      }
      document.removeEventListener('click', handleClick, { capture: true })
      document.removeEventListener('touchstart', handleTouchStart, { capture: true })
      document.removeEventListener('touchmove', handleTouchMove, { capture: true })
      document.removeEventListener('wheel', handleWheel, { capture: true })
      window.removeEventListener('scroll', handleScroll)
    }
  }, [dates])

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title-container">
          <h1 className="app-title">🎄 Создай свое новогоднее приключение! 🎅</h1>
          <button
            className="app-info-icon"
            onClick={(e) => {
              e.stopPropagation()
              setShowInfoPopup(!showInfoPopup)
            }}
            aria-label="Информация"
          >
            ℹ️
          </button>
          {showInfoPopup && (
            <div className="info-popup" onClick={(e) => e.stopPropagation()}>
              <div className="info-popup-content">
                <button
                  className="info-popup-close"
                  onClick={(e) => {
                    e.stopPropagation()
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
      </div>
      <div
        ref={cardsContainerRef}
        className={`cards-container ${selectedDate ? 'overlay-open' : ''}`}
      >
        {dates.map((dateInfo, index) => (
          <DateCard
            key={index}
            dateInfo={dateInfo}
            isSelected={selectedDate &&
              selectedDate.getUTCFullYear() === dateInfo.date.getUTCFullYear() &&
              selectedDate.getUTCMonth() === dateInfo.date.getUTCMonth() &&
              selectedDate.getUTCDate() === dateInfo.date.getUTCDate()}
            onClick={() => handleCardClick(dateInfo)}
          />
        ))}
      </div>
      {selectedDate && (
        <AdventureCard
          date={selectedDate}
          adventure={adventure?.message}
          adventureTitle={adventure?.title}
          loading={loading}
          error={error}
          dateInfo={dates.find(d =>
            d.date.getUTCFullYear() === selectedDate.getUTCFullYear() &&
            d.date.getUTCMonth() === selectedDate.getUTCMonth() &&
            d.date.getUTCDate() === selectedDate.getUTCDate()
          )}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default App

