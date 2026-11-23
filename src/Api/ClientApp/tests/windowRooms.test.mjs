import test from 'node:test'
import assert from 'node:assert/strict'
import { roomTile } from '../src/lib/windowRooms.js'

test('All 31 days have distinct rooms within the illustrated atlas', () => {
  const positions = Array.from({ length:31 }, (_, i) => roomTile(i + 1))
  assert.equal(new Set(positions.map(({ row, column }) => `${row}:${column}`)).size, 31)
  assert.deepEqual(positions[0], { row: 0, column: 0 })
  assert.deepEqual(positions[7], { row: 0, column: 7 })
  assert.deepEqual(positions[8], { row: 1, column: 0 })
  for (const { row, column } of positions) {
    assert.ok(row >= 0 && row < 4 && column >= 0 && column < 8)
  }
})
