import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('The actual calendar renders all task buttons and the live facade, without legacy cards', async () => {
  // Compile JSX through the real app toolchain; no browser or network navigation is involved.
  const server = await createServer({ server:{ middlewareMode:true }, appType:'custom' })
  try {
    const { default:App } = await server.ssrLoadModule('/src/App.jsx')
    const html = renderToStaticMarkup(React.createElement(App))
    assert.match(html, /winter-house-base-v1\.webp/)
    assert.doesNotMatch(html, /room-strip|wooden-sash/)
    assert.equal((html.match(/class="calendar-window-slot/g) || []).length, 31)
    for (let day = 1; day <= 31; day++) {
      assert.ok(html.includes(`aria-label="Открыть задание на ${day} декабря"`))
    }
    assert.equal((html.match(/<summary>Как участвовать<\/summary>/g) || []).length, 1)
    assert.ok(!html.includes('Каждый день — повод быть ближе'))
    assert.ok(!html.includes('Создай свое новогоднее приключение'))
    assert.ok(!html.includes('class="date-card'))
    assert.equal((html.match(/is-open/g) || []).length, 0, 'Unknown initial clock must leave all shutters closed')

    const { default:AdventWindow } = await server.ssrLoadModule('/src/components/AdventWindow.jsx')
    for (const appearance of ['closed','tinted','clear']) {
      const window = renderToStaticMarkup(React.createElement(AdventWindow, { day:6, appearance, variant:'facade' }))
      assert.equal((window.match(/class="advent-window-number"/g) || []).length, 2, 'Number stays split between both moving leaves')
      assert.equal(window.includes('is-open'), appearance !== 'closed')
      assert.equal(window.includes('is-tinted'), appearance === 'tinted')
      assert.equal(window.includes('wooden-sash-v2.webp'), appearance !== 'closed')
      assert.equal(window.includes('room-strip-0.webp'), appearance !== 'closed')
      assert.ok(!window.includes('advent-window-frame'), 'Painted facade already supplies its trim')
    }

    const { default:CalendarDialog } = await server.ssrLoadModule('/src/components/CalendarDialog.jsx')
    const message = 'Делаем новогоднее оригами. Инструкция [тут](https://www.youtube.com/watch?v=3v8qVDh1qf4)'
    const letter = renderToStaticMarkup(React.createElement(CalendarDialog, {
      day:6, result:{ kind:'task', title:'❄️ Зимнее приключение', message }, busy:false,
    }))
    assert.ok(!letter.includes('❄'))
    assert.match(letter, /Зимнее приключение/)
    assert.match(letter, /winter-letter-v1\.webp/)
    assert.match(letter, /href="https:\/\/www.youtube.com\/watch\?v=3v8qVDh1qf4"/)
    assert.match(letter, />тут<\/a>/)
    assert.match(letter, /aria-label="Закрыть задание"/)
    for (const state of [{ kind:'future' }, { kind:'error' }]) {
      const hidden = renderToStaticMarkup(React.createElement(CalendarDialog, { day:6, result:state, busy:false }))
      assert.ok(!hidden.includes('youtube.com'), 'Denied and failed tasks must not render cached task content')
    }

    const { DecemberScene } = await server.ssrLoadModule('/src/components/DecemberDecorations.jsx')
    const layers = JSON.parse(readFileSync(new URL('../../DecorationAssets/manifest.json', import.meta.url), 'utf8'))
    for (const [day, opening] of [[11, [930, 463, 116, 75]], [14, [930, 327, 117, 103]]]) {
      const [x, y, width, height] = layers.find(layer => layer.key === String(day)).region
      const [left, top, openingWidth, openingHeight] = opening
      assert.ok(x >= left && y >= top && x + width <= left + openingWidth && y + height <= top + openingHeight,
        `Hall decoration ${day} must stay within the glass, clear of the canopy and outside sill`)
    }
    // Each date adds one decoration; only today's item can reveal tomorrow's hint.
    for (let day = -1; day <= 32; day++) {
      const visible = Math.min(day + 1, 32)
      const active = day >= 0 && day <= 31 ? 1 : 0
      const scene = renderToStaticMarkup(React.createElement(DecemberScene, { layers, day }))
      assert.equal((scene.match(/class="december-decoration /g) || []).length, visible)
      assert.equal((scene.match(/<button/g) || []).length, active)
      assert.equal(scene.includes('is-tracks'), day >= 15, 'The tracks appear with the mittens on December 15')
      assert.ok(!scene.includes('<dialog'), 'Opening the hint requires activating the current decoration')
    }
    assert.ok(layers.every(layer => !Object.hasOwn(layer, 'message')))
    const poem = 'Первая строка\nВторая строка'
    const hint = renderToStaticMarkup(React.createElement(CalendarDialog, {
      day:2, result:{ kind:'hint', title:'Подсказка на завтра', message:poem },
    }))
    assert.match(hint, /aria-label="Закрыть подсказку"/)
    assert.match(hint, /Подсказка на завтра/)
    assert.ok(hint.includes('<p class="calendar-dialog-message calendar-dialog-poem">' + poem + '</p>'))
  } finally {
    await server.close()
  }
})
