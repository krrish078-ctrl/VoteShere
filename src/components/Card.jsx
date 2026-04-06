// src/components/Card.jsx
export default function Card({ children, title, className = '' }) {
  return (
    <div className={`card ${className}`.trim()}>
      {title && (
        <h3 className="card-title">{title}</h3>
      )}
      {children}
    </div>
  )
}
