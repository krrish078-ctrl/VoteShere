// src/components/Input.jsx
export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  name,
  error,
  required = false,
  placeholder = '',
  rows = 4,
}) {
  const isTextarea = type === 'textarea'

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="required-star"> *</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`input-field input-textarea${error ? ' input-error' : ''}`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field${error ? ' input-error' : ''}`}
        />
      )}

      {error && <p className="input-error-msg">{error}</p>}
    </div>
  )
}
