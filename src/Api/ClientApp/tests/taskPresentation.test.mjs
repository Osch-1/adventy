import test from 'node:test'
import assert from 'node:assert/strict'
import { taskTitle } from '../src/lib/taskPresentation.js'

test('Decorative title emoji are omitted without rewriting approved words', () => {
  for (const emoji of ['🎯','✨','🎄','🌟','🎁','❄️','🎊','🎈','🪩','💙']) {
    assert.equal(taskTitle(`${emoji} Задание на сегодня`), 'Задание на сегодня')
  }
  assert.equal(taskTitle('Зимнее приключение'), 'Зимнее приключение')
  assert.equal(taskTitle('31 декабря'), '31 декабря')
})
