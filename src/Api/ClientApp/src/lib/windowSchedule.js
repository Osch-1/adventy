const DAY = 86_400_000
export const calendarTimeZone = 'Europe/Moscow'
const calendarDateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone:calendarTimeZone, year:'numeric', month:'2-digit', day:'2-digit',
})

// Use calendar-day numbers, not elapsed local hours: DST days may have 23 or 25 hours.
export function calendarDay(instant) {
  const parts = Object.fromEntries(calendarDateFormat.formatToParts(new Date(instant)).map(part => [part.type, part.value]))
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / DAY
}

export function dateInputDay(value) {
  return Date.parse(`${value}T00:00:00Z`) / DAY
}

export function windowState(day, today) {
  if (today === null) return 'closed'
  const releaseDay = Date.UTC(2026, 11, day) / DAY
  if (releaseDay <= today) return 'clear'
  return releaseDay === today + 1 ? 'tinted' : 'closed'
}
