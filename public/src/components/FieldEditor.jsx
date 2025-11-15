import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import ImageUpload from './ImageUpload'
import '../styles/FieldEditor.css'

export default function FieldEditor({ field, onUpdate, onClose }) {
  if (!field) {
    return null
  }
  
  const initializeFormData = (fieldData) => {
    const needsOptions = ['dropdown', 'radio', 'checkbox', 'single-choice', 'multiple-choice'].includes(fieldData.type)
    
    return {
      label: fieldData.label || '',
      placeholder: fieldData.placeholder || '',
      required: fieldData.required || false,
      description: fieldData.description || '',
      options: needsOptions ? (fieldData.options && fieldData.options.length > 0 ? [...fieldData.options] : ['Option 1', 'Option 2']) : [],
      ...(fieldData.type === 'number' && { min: fieldData.min, max: fieldData.max }),
      ...(fieldData.type === 'rating' && { max: fieldData.max || 5 }),
      ...(fieldData.type === 'star-rating' && { max: fieldData.max || 5 }),
      ...(fieldData.type === 'scale-rating' && { max: fieldData.max || 5 }),
      ...(fieldData.type === 'file' && { 
        accept: fieldData.accept || '*',
        multiple: fieldData.multiple || false 
      }),
      ...(fieldData.type === 'textarea' && { rows: fieldData.rows || 4 }),
      ...(fieldData.type === 'long-text' && { rows: fieldData.rows || 4 }),
      ...(fieldData.type === 'logo' && {
        imageUrl: fieldData.imageUrl || '',
        width: fieldData.width || 200,
        height: fieldData.height || 100
      })
    }
  }

  const [formData, setFormData] = useState(() => initializeFormData(field))

  // Update formData when field changes (when a different field is selected)
  useEffect(() => {
    if (field) {
      setFormData(initializeFormData(field))
    }
  }, [field.id, field.type]) // Update when field ID or type changes

  // Call onUpdate when formData changes
  useEffect(() => {
    if (field && formData) {
      onUpdate(formData)
    }
  }, [formData, onUpdate, field])

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const addOption = () => {
    setFormData(prev => {
      const currentOptions = prev.options || []
      return {
        ...prev,
        options: [...currentOptions, `Option ${currentOptions.length + 1}`]
      }
    })
  }

  const updateOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, idx) => idx === index ? value : opt)
    }))
  }

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index)
    }))
  }

  const needsOptions = ['dropdown', 'radio', 'checkbox', 'single-choice', 'multiple-choice'].includes(field.type)

  return (
    <div className="field-editor">
      <div className="field-editor-header">
        <h3>Field Properties</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="field-editor-content">
        <div className="form-group">
          <label>Label</label>
          <input
            type="text"
            className="input"
            value={formData.label}
            onChange={(e) => updateField('label', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Placeholder</label>
          <input
            type="text"
            className="input"
            value={formData.placeholder}
            onChange={(e) => updateField('placeholder', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="input"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => updateField('required', e.target.checked)}
            />
            <span>Required field</span>
          </label>
        </div>

        {needsOptions && (
          <div className="form-group">
            <label>Options</label>
            <div className="options-list">
              {formData.options && formData.options.length > 0 ? (
                formData.options.map((option, idx) => (
                  <div key={idx} className="option-item">
                    <input
                      type="text"
                      className="input"
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeOption(idx)}
                      title="Remove option"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-options-text">No options yet. Click "Add Option" to add one.</p>
              )}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addOption}>
              + Add Option
            </button>
            {formData.options && formData.options.length === 0 && (
              <small className="help-text">Add at least one option for users to choose from</small>
            )}
          </div>
        )}

        {field.type === 'number' && (
          <>
            <div className="form-group">
              <label>Min Value</label>
              <input
                type="number"
                className="input"
                value={formData.min || 0}
                onChange={(e) => updateField('min', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Max Value</label>
              <input
                type="number"
                className="input"
                value={formData.max || 100}
                onChange={(e) => updateField('max', parseInt(e.target.value) || 100)}
              />
            </div>
          </>
        )}

        {(field.type === 'rating' || field.type === 'star-rating' || field.type === 'scale-rating') && (
          <div className="form-group">
            <label>Max Rating</label>
            <input
              type="number"
              className="input"
              value={formData.max || 5}
              onChange={(e) => updateField('max', parseInt(e.target.value) || 5)}
              min={1}
              max={10}
            />
          </div>
        )}

        {(field.type === 'long-text' || field.type === 'textarea') && (
          <div className="form-group">
            <label>Rows</label>
            <input
              type="number"
              className="input"
              value={formData.rows || 4}
              onChange={(e) => updateField('rows', parseInt(e.target.value) || 4)}
              min={1}
              max={20}
            />
          </div>
        )}

        {field.type === 'file' && (
          <>
            <div className="form-group">
              <label>Accept File Types</label>
              <input
                type="text"
                className="input"
                value={formData.accept || '*'}
                onChange={(e) => updateField('accept', e.target.value)}
                placeholder="e.g., image/*, .pdf, .doc"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.multiple || false}
                  onChange={(e) => updateField('multiple', e.target.checked)}
                />
                <span>Allow multiple files</span>
              </label>
            </div>
          </>
        )}


        {field.type === 'logo' && (
          <>
            <div className="form-group">
              <ImageUpload
                label="Logo Image"
                value={formData.imageUrl || ''}
                onChange={(value) => updateField('imageUrl', value)}
              />
            </div>
            <div className="form-group">
              <label>Width (px)</label>
              <input
                type="number"
                className="input"
                value={formData.width || 200}
                onChange={(e) => updateField('width', parseInt(e.target.value) || 200)}
                min={50}
                max={500}
              />
            </div>
            <div className="form-group">
              <label>Height (px)</label>
              <input
                type="number"
                className="input"
                value={formData.height || 100}
                onChange={(e) => updateField('height', parseInt(e.target.value) || 100)}
                min={50}
                max={300}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
