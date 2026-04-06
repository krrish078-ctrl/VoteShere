// src/components/CountdownTimer.jsx
import { useState, useEffect } from 'react'
import { getTimeRemaining } from '../utils/helpers'

export default function CountdownTimer({ targetDate }) {
  const [time, setTime] = useState(getTimeRemaining(targetDate))

  useEffect(() => {
    setTime(getTimeRemaining(targetDate))
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetDate)
      setTime(remaining)
      if (remaining.isExpired) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (time.isExpired) {
    return (
      <div className="countdown-expired">
        <span>⏰ Voting has ended</span>
      </div>
    )
  }

  // Color logic
  const totalSeconds =
    time.days * 86400 + time.hours * 3600 + time.minutes * 60 + time.seconds
  let timerColor = '#2563eb' // blue — more than 1 day
  if (totalSeconds < 3600) timerColor = '#dc2626' // red — less than 1 hour
  else if (totalSeconds < 86400) timerColor = '#d97706' // orange — less than 1 day

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Mins' },
    { value: time.seconds, label: 'Secs' },
  ]

  return (
    <div className="countdown-grid">
      {units.map(({ value, label }) => (
        <div key={label} className="countdown-box" style={{ borderTop: `3px solid ${timerColor}` }}>
          <span className="countdown-number" style={{ color: timerColor }}>
            {String(value).padStart(2, '0')}
          </span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
