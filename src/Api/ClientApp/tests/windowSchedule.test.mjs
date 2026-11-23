import test from 'node:test'
import assert from 'node:assert/strict'
import { calendarDay, dateInputDay, windowState } from '../src/lib/windowSchedule.js'

for (const [date, expected] of [
  ['2026-11-29', ['closed', 'closed', 'closed']],
  ['2026-11-30', ['tinted', 'closed', 'closed']],
  ['2026-12-01', ['clear', 'tinted', 'closed']],
  ['2026-12-02', ['clear', 'clear', 'tinted']],
]) test(`Window states on ${date}`, () => {
  assert.deepEqual([1,2,3].map(day => windowState(day, dateInputDay(date))), expected)
})

test('All 31 windows follow the schedule on every day of December', () => {
  for (let today = 1; today <= 31; today++) {
    for (let day = 1; day <= 31; day++) {
      assert.equal(windowState(day, dateInputDay(`2026-12-${String(today).padStart(2, '0')}`)),
        day <= today ? 'clear' : day === today + 1 ? 'tinted' : 'closed')
    }
  }
})

test('Moscow midnight advances windows without a click', () => {
  const before = calendarDay('2026-11-30T20:59:59.999Z')
  const midnight = calendarDay('2026-11-30T21:00:00.000Z')
  assert.deepEqual([1,2].map(day => windowState(day, before)), ['tinted','closed'])
  assert.deepEqual([1,2].map(day => windowState(day, midnight)), ['clear','tinted'])
})

test('Unknown server time fails closed', () => assert.equal(windowState(1, null), 'closed'))
test('December ends without a phantom day 32', () => {
  assert.equal(windowState(31, dateInputDay('2026-12-30')), 'tinted')
  assert.equal(windowState(31, dateInputDay('2026-12-31')), 'clear')
  assert.ok(Array.from({length:31}, (_, i) => windowState(i+1, dateInputDay('2027-01-01'))).every(state => state === 'clear'))
})
