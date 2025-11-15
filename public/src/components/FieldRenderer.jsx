export default function FieldRenderer({ field, value, onChange, disabled }) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || field.label}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            required={field.required}
            className="field-input"
          />
        )

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || field.label}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            required={field.required}
            className="field-textarea"
            rows={field.rows || 4}
          />
        )

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            required={field.required}
            className="field-select"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option, idx) => (
              <label key={idx} className="radio-label">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled}
                  required={field.required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options?.map((option, idx) => (
              <label key={idx} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : []
                    const newValue = e.target.checked
                      ? [...current, option]
                      : current.filter(v => v !== option)
                    onChange?.(newValue)
                  }}
                  disabled={disabled}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            required={field.required}
            className="field-input"
          />
        )

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => onChange?.(e.target.files)}
            disabled={disabled}
            required={field.required}
            multiple={field.multiple}
            accept={field.accept}
            className="field-input"
          />
        )

      case 'rating':
        return (
          <div className="rating-group">
            {Array.from({ length: field.max || 5 }).map((_, idx) => {
              const starValue = idx + 1
              return (
                <button
                  key={idx}
                  type="button"
                  className={`rating-star ${value >= starValue ? 'filled' : ''}`}
                  onClick={() => !disabled && onChange?.(starValue)}
                  disabled={disabled}
                >
                  ★
                </button>
              )
            })}
          </div>
        )

      default:
        return <div className="field-placeholder">{field.label}</div>
    }
  }

  return (
    <div className="field-renderer">
      <label className="field-label">
        {field.label}
        {field.required && <span className="required">*</span>}
      </label>
      {renderField()}
      {field.description && (
        <p className="field-description">{field.description}</p>
      )}
    </div>
  )
}
