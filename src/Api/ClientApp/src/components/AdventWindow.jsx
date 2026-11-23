import React from 'react'
import frame from '../assets/optimized/frame.webp'
import shutters from '../assets/optimized/shutters.webp'
import sash from '../assets/optimized/wooden-sash-v2.webp'
import strip0 from '../assets/optimized/room-strip-0.webp'
import strip1 from '../assets/optimized/room-strip-1.webp'
import strip2 from '../assets/optimized/room-strip-2.webp'
import strip3 from '../assets/optimized/room-strip-3.webp'
import stripGeometry from '../assets/optimized/room-strips.json'
import { roomTile } from '../lib/windowRooms'
import './AdventWindow.css'

const strips = [strip0, strip1, strip2, strip3]

function roomArt(day) {
  const { row, column } = roomTile(day)
  const [height, y] = stripGeometry[row]
  return {
    backgroundImage:`url(${strips[row]})`,
    backgroundSize:`800% ${height}%`,
    backgroundPosition:`${column / 7 * 100}% ${y}%`,
  }
}

export default function AdventWindow({ day, appearance = 'closed', busy, onClick, label, variant = 'standalone' }) {
  const open = appearance !== 'closed'
  return (
    <button className={`advent-window${variant === 'facade' ? ' advent-window-facade' : ''}${open ? ' is-open' : ''}${appearance === 'tinted' ? ' is-tinted' : ''}`} onClick={onClick}
      disabled={busy} aria-busy={busy} aria-expanded={open}
      aria-label={label || `Открыть задание на ${day} декабря`}
      aria-description={appearance === 'clear' ? 'Прозрачное стекло' : appearance === 'tinted' ? 'Тонированное стекло. Задание ещё недоступно' : 'Ставни закрыты'}>
      <span className="advent-window-room" aria-hidden="true">
        {open && <span className="advent-window-room-art" style={roomArt(day)} />}
        <span className="advent-window-glass" />
        {open && <img className="advent-window-sash" src={sash} alt="" draggable="false" />}
        {open && <span className="advent-window-glass-number">{day}</span>}
      </span>
      {variant !== 'facade' && <img className="advent-window-frame" src={frame} alt="" draggable="false" />}
      <span className="advent-window-shutters" aria-hidden="true">
        {['left', 'right'].map(side => (
          <span key={side} className={`advent-window-leaf ${side}`} style={{ backgroundImage: `url(${shutters})` }}>
            <span className="advent-window-number">{day}</span>
          </span>
        ))}
      </span>
    </button>
  )
}
