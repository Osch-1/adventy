import React, { useState, useMemo, useEffect } from 'react'
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

function App() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [adventure, setAdventure] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [skipSecrets, setSkipSecrets] = useState({
    first: null,
    second: null,
    third: null
  })
  const [showPast, setShowPast] = useState(false)

  // Read query parameters for skip validation secrets and showPast flag
  // Using generic names (first, second, third) to hide actual header names from users
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSkipSecrets({
      first: params.get('first') || null,
      second: params.get('second') || null,
      third: params.get('third') || null
    })
    // showPast flag: if set to 'true', show past dates
    setShowPast(params.get('showPast') === 'true')
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
    const endDay = 24

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

  // Filter dates: hide past dates unless showPast flag is set to true
  const visibleDates = useMemo(() => {
    if (showPast) {
      // If showPast flag is true, show all dates including past ones
      return dates
    }
    // Otherwise, filter out past dates
    return dates.filter(dateInfo => !dateInfo.isPast)
  }, [dates, showPast])

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

    // Fetch adventure if it's today, or if skip secrets are provided (for testing past/future dates)
    const shouldFetchAdventure = dateInfo.isToday ||
      skipSecrets.first ||
      skipSecrets.second ||
      skipSecrets.third

    if (shouldFetchAdventure) {
      setLoading(true)
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        // Format date using UTC components to ensure consistency worldwide
        const year = dateInfo.date.getUTCFullYear()
        const month = String(dateInfo.date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(dateInfo.date.getUTCDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        // Build headers with skip validation secrets if provided
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
        if (skipSecrets.third) {
          headers['Adventy-SkipSearchDatePassedValidationSecret'] = skipSecrets.third
        }

        const response = await fetch(`/api/Adventures?searchDateTime=${dateStr}T00:00:00`, {
          headers
        })

        const data = await response.json()

        if (response.ok && data.data) {
          setAdventure(data.data.message)
        } else {
          // Handle backend errors with Russian messages
          const errorMessage = getErrorMessage(data.errors?.[0])
          setError(errorMessage)
        }
      } catch (err) {
        setError('⚠️ Неожиданная ошибка. Пожалуйста, обратитесь к администратору.')
      } finally {
        setLoading(false)
      }
    } else {
      setAdventure(null)
    }
  }

  const handleClose = () => {
    setSelectedDate(null)
    setAdventure(null)
    setError(null)
  }

  // Fun phrases for today's adventure title
  const getAdventureTitle = () => {
    const phrases = [
      '🎯 Задание на сегодня',
      '✨ Твое приключение',
      '🎄 Новогоднее задание',
      '🌟 Сегодняшний квест',
      '🎁 Задание дня',
      '❄️ Зимнее приключение',
      '🎊 Твоя миссия',
      '🎈 Задание для тебя'
    ]
    const randomIndex = Math.floor(Math.random() * phrases.length)
    return phrases[randomIndex]
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
      <div className="cards-container">
        {visibleDates.map((dateInfo, index) => (
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
          adventure={adventure}
          loading={loading}
          error={error}
          dateInfo={visibleDates.find(d =>
            d.date.getUTCFullYear() === selectedDate.getUTCFullYear() &&
            d.date.getUTCMonth() === selectedDate.getUTCMonth() &&
            d.date.getUTCDate() === selectedDate.getUTCDate()
          )}
          adventureTitle={getAdventureTitle()}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default App

