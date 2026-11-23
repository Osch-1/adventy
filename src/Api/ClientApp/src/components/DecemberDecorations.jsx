import React, { useEffect, useRef, useState } from 'react'
import CalendarDialog from './CalendarDialog'
import './DecemberDecorations.css'

const houseWidth = 1672
const houseHeight = 941

function paintedStyle(image, { clip, mask, crop:[sizeX, sizeY, offsetX, offsetY],
  region:[x, y, width, height], hit:[hitX, hitY, hitWidth, hitHeight] = [0, 0, 0, 0] }) {
  return {
    '--paint-image':`url("${image}")`,
    ...(clip && { '--paint-clip':clip }),
    ...(mask && { '--paint-mask':mask }),
    left:`${(x + width / 2) / houseWidth * 100}%`,
    top:`${(y + height / 2) / houseHeight * 100}%`,
    width:`${width / houseWidth * 100}%`,
    height:`${height / houseHeight * 100}%`,
    backgroundSize:`${sizeX}% ${sizeY}%`,
    backgroundPosition:`${offsetX}% ${offsetY}%`,
    '--foreground-size':`${houseWidth / width * 100}% ${houseHeight / height * 100}%`,
    '--foreground-position':`${x / (houseWidth - width) * 100}% ${y / (houseHeight - height) * 100}%`,
    '--hit-x':`${(hitX - x) / width * 100}%`,
    '--hit-y':`${(hitY - y) / height * 100}%`,
    '--hit-width':`${hitWidth / width * 100}%`,
    '--hit-height':`${hitHeight / height * 100}%`,
  }
}

export default function DecemberDecorations({ day, previewDate }) {
  const [scene, setScene] = useState(null)
  const layers = scene && scene.previewDate === previewDate ? scene.layers : []
  useEffect(() => {
    const controller = new AbortController()
    const query = previewDate ? `?${new URLSearchParams({ previewDate })}` : ''
    const url = previewDate ? `/api/dev/window-preview/decorations${query}` : '/api/decorations'
    let retry
    let attempts = 0
    async function load() {
      try {
        const response = await fetch(url, { cache:'no-store', signal:controller.signal })
        if (!response.ok) throw new Error('Scene unavailable')
        const next = await response.json()
        if (controller.signal.aborted) return
        setScene({ ...next, previewDate })
        if (next.day < day && !previewDate) throw new Error('Moscow midnight not reached yet')
      } catch {
        if (!controller.signal.aborted && ++attempts <= 3) retry = setTimeout(load, 1000 * attempts)
      }
    }
    load()
    return () => { controller.abort(); clearTimeout(retry) }
  }, [day, previewDate])

  return <DecemberScene layers={layers} day={day} previewDate={previewDate} />
}

export function DecemberScene({ layers, day, previewDate }) {
  const [opener, setOpener] = useState(null)
  const [result, setResult] = useState(null)
  const request = useRef(null)
  const finale = day === 31
  const kind = finale ? 'finale' : 'hint'

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => { closeHint() }, [day, previewDate])

  function closeHint() {
    request.current?.abort()
    setOpener(null)
    setResult(null)
  }

  async function openHint(event) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setResult(null)
    setOpener({ element:event.currentTarget, keyboard:event.detail === 0 })
    const url = previewDate
      ? `/api/dev/window-preview/hint/${day}?${new URLSearchParams({ previewDate })}`
      : `/api/hints/today/${day}`
    try {
      const response = await fetch(url, { cache:'no-store', signal:controller.signal })
      if (!response.ok) throw new Error('Hint unavailable')
      const { message } = await response.json()
      if (typeof message !== 'string' || !message.trim()) throw new Error('Invalid hint')
      if (!controller.signal.aborted) setResult({ kind, title:finale ? 'С Новым годом!' : 'Подсказка на завтра', message })
    } catch {
      if (!controller.signal.aborted) setResult({ kind:'error' })
    }
  }

  return <>
    {layers.filter(layer => layer.day <= day).map(painted => {
      const file = `${encodeURIComponent(painted.key)}/${encodeURIComponent(painted.version)}`
      const image = previewDate
        ? `/api/dev/window-preview/decoration-art/${file}?${new URLSearchParams({ previewDate })}`
        : `/api/decorations/art/${file}`
      const style = paintedStyle(image, painted)
      if (!painted.name) return <span key={painted.key} className={`calendar-house-detail is-${painted.key}`}
        style={style} aria-hidden="true" />
      const className = `december-decoration december-decoration-painted${painted.alpha ? ' is-alpha' : ''}${painted.front ? ' is-front' : ''}`
      const active = painted.day === day
      return <span key={painted.key} className={className} style={style} data-surface={painted.surface} aria-hidden={active ? undefined : true}>
        {painted?.frame && <span className={`december-decoration-window-frame is-${painted.frame}`} aria-hidden="true" />}
        {painted.frame === 'upper' && <>
          <span className="december-decoration-window-frame is-curtain-left" aria-hidden="true" />
          <span className="december-decoration-window-frame is-curtain-right" aria-hidden="true" />
        </>}
        {active && <button type="button"
          aria-label={`${painted.name}. ${finale ? 'Открыть поздравление' : 'Открыть подсказку на завтра'}`}
          onClick={openHint} />}
      </span>
    })}
    {opener && <CalendarDialog day={finale ? day : day + 1} busy={!result} opener={opener}
      result={result} decorationKind={kind} onClose={closeHint} />}
  </>
}
