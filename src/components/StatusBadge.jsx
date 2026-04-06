// src/components/StatusBadge.jsx
import { getStatusColor, getStatusLabel } from '../utils/helpers'

export default function StatusBadge({ status }) {
  const label = getStatusLabel(status)

  const colorMap = {
    DRAFT: { bg: '#e5e7eb', color: '#4b5563' },
    OPEN: { bg: '#d1fae5', color: '#065f46' },
    CLOSED: { bg: '#fee2e2', color: '#991b1b' },
  }

  const colors = colorMap[status] || colorMap.DRAFT

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: colors.bg, color: colors.color }}
    >
      {label}
    </span>
  )
}
