import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import FieldPalette from '../components/FieldPalette'
import FormCanvas from '../components/FormCanvas'
import FormPreview from '../components/FormPreview'
import FormSettings from '../components/FormSettings'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import '../styles/FormBuilder.css'

export default function FormBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForm()
  }, [id])

  const fetchForm = async () => {
    try {
      const response = await api.get(`/forms/${id}`)
      setForm(response.data)
      setFields(response.data.fields || [])
    } catch (error) {
      console.error('Failed to fetch form:', error)
      alert('Failed to load form')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const saveForm = async () => {
    setSaving(true)
    try {
      const response = await api.put(`/forms/${id}`, {
        ...form,
        fields,
        title: form.title
      })
      setForm(response.data)
      alert('Form saved successfully!')
    } catch (error) {
      console.error('Failed to save form:', error)
      alert('Failed to save form')
    } finally {
      setSaving(false)
    }
  }

  const updateFormTitle = (title) => {
    setForm({ ...form, title })
  }

  const addField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      label: getDefaultLabel(fieldType),
      required: false,
      placeholder: '',
      options: fieldType === 'dropdown' || fieldType === 'radio' || fieldType === 'checkbox' 
        ? ['Option 1', 'Option 2'] 
        : [],
      ...getDefaultProps(fieldType)
    }
    setFields([...fields, newField])
    setSelectedField(newField)
  }

  const updateField = (fieldId, updates) => {
    setFields(fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    ))
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates })
    }
  }

  const deleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const moveField = (dragIndex, hoverIndex) => {
    const draggedField = fields[dragIndex]
    const newFields = [...fields]
    newFields.splice(dragIndex, 1)
    newFields.splice(hoverIndex, 0, draggedField)
    setFields(newFields)
  }

  const getDefaultLabel = (type) => {
    const labels = {
      text: 'Text Input',
      email: 'Email',
      number: 'Number',
      textarea: 'Text Area',
      dropdown: 'Dropdown',
      radio: 'Radio Buttons',
      checkbox: 'Checkboxes',
      date: 'Date',
      file: 'File Upload',
      rating: 'Rating'
    }
    return labels[type] || 'Field'
  }

  const getDefaultProps = (type) => {
    const props = {}
    if (type === 'number') {
      props.min = 0
      props.max = 100
    }
    if (type === 'rating') {
      props.max = 5
    }
    if (type === 'file') {
      props.accept = '*'
      props.multiple = false
    }
    return props
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!form) {
    return null
  }

  return (
    <div className="form-builder">
      <header className="builder-header">
        <div className="builder-header-content">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
            Back
          </button>
          <input
            type="text"
            className="form-title-input"
            value={form.title}
            onChange={(e) => updateFormTitle(e.target.value)}
            placeholder="Form Title"
          />
          <div className="builder-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye size={18} />
              Preview
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </button>
            <button 
              className="btn btn-primary" 
              onClick={saveForm}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <div className="builder-content">
        <FieldPalette onAddField={addField} />
        <FormCanvas
          fields={fields}
          selectedField={selectedField}
          onSelectField={setSelectedField}
          onUpdateField={updateField}
          onDeleteField={deleteField}
          onMoveField={moveField}
        />
      </div>

      {showPreview && (
        <FormPreview
          form={form}
          fields={fields}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showSettings && (
        <FormSettings
          form={form}
          onUpdate={(settings) => setForm({ ...form, settings })}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
