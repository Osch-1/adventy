import test from 'node:test'
import assert from 'node:assert/strict'
import { taskWindows, decorativeWindows } from '../src/lib/houseLayout.js'

test('Facade contains exactly 31 unique ordered task days and four separate decorative windows', () => {
  assert.deepEqual(taskWindows.map(window => window.day), Array.from({ length:31 }, (_, i) => i + 1))
  assert.equal(taskWindows.length + decorativeWindows.length, 35)
  assert.equal(decorativeWindows.filter(window => window.kind === 'hall').length, 2)
  const stories = decorativeWindows.filter(window => window.kind === 'story')
  assert.deepEqual(stories.map(window => [window.after, window.side]), [[9,'left'],[19,'right']])
  assert.notEqual(stories[0].y, stories[1].y)
  for (const window of taskWindows) {
    assert.ok(window.x >= 0 && window.x + window.width <= 1672)
    assert.ok(window.y >= 0 && window.y + window.height <= 941)
  }
})
