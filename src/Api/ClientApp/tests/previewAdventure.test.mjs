import test from 'node:test'
import assert from 'node:assert/strict'
import { previewAdventure } from '../src/lib/previewAdventure.js'
import { dateInputDay } from '../src/lib/windowSchedule.js'

test('Every simulated date gates all 31 tasks before making a request', async () => {
  for (let offset = 0; offset < 34; offset++) {
    const date = new Date(Date.UTC(2026, 10, 29 + offset)).toISOString().slice(0, 10)
    for (let day = 1; day <= 31; day++) {
      const calls = []
      const result = await previewAdventure({ day, today:dateInputDay(date), previewDate:date,
        fetcher:async (...args) => {
          calls.push(args)
          return { ok:true, json:async () => ({ data:{ title:'Task', message:'Content' } }) }
        } })
      const available = dateInputDay(`2026-12-${String(day).padStart(2, '0')}`) <= dateInputDay(date)
      assert.equal(result.kind, available ? 'task' : 'future', `${date}, day ${day}`)
      assert.equal(calls.length, available ? 1 : 0)
      if (available) {
        const [url, options] = calls[0]
        assert.ok(url.startsWith('/api/dev/window-preview/adventure?'))
        assert.equal(new URL(url, 'http://localhost').searchParams.get('previewDate'), date)
        assert.equal(options.headers, undefined)
        assert.equal(options.cache, 'no-store')
      }
    }
  }
})

test('Unknown time fails closed without requesting content', async () => {
  assert.equal((await previewAdventure({ day:1, today:null,
    fetcher:() => assert.fail('No API request before clock synchronization') })).kind, 'future')
})

test('Live mode uses the real API with no legacy bypass headers', async () => {
  let request
  const result = await previewAdventure({ day:6, today:dateInputDay('2026-12-06'), previewDate:'',
    fetcher:async (...args) => {
      request = args
      return { ok:false, json:async () => ({ errors:[{ type:0, code:3 }] }) }
    } })
  assert.ok(request[0].startsWith('/api/Adventures?'))
  assert.equal(request[1].headers, undefined)
  assert.equal(result.kind, 'future')
})
