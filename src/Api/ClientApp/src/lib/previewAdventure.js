import { windowState } from './windowSchedule.js'

// Neither a legacy URL secret nor a successful API response can open a future window.
export async function previewAdventure({ day, today, previewDate, signal, fetcher = fetch }) {
  if (windowState(day, today) !== 'clear') return { kind:'future' }

  const params = new URLSearchParams({ searchDateTime:`2026-12-${String(day).padStart(2, '0')}T00:00:00` })
  const endpoint = previewDate ? '/api/dev/window-preview/adventure' : '/api/Adventures'
  if (previewDate) params.set('previewDate', previewDate)
  const response = await fetcher(`${endpoint}?${params}`, {
    cache:'no-store', signal,
  })
  const data = await response.json()
  if (response.ok && data.data) return { ...data.data, kind:'task' }
  if (data.errors?.some(error => error.type === 0 && error.code === 3)) return { kind:'future' }
  return { kind:'error' }
}
