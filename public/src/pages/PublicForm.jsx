import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import FieldRenderer from '../components/FieldRenderer'
import '../styles/PublicForm.css'

export default function PublicForm() {
  const { shareKey } = useParams()
  const [form, setForm] = useState(null)
  const [fields, setFields] = useState([])
  const [formData, setFormData] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [shareKey])

  const fetchForm = async () => {
    try {
      const response = await api.get(`/public/form/${shareKey}`)
      setForm(response.data)
      setFields(response.data.fields || [])
    } catch (error) {
      console.error('Failed to fetch form:', error)
      alert('Form not found')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post(`/public/form/${shareKey}/submit`, {
        data: formData
      })
      setSubmitted(true)
      setFormData({})
    } catch (error) {
      console.error('Failed to submit form:', error)
      alert(error.response?.data?.error || 'Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading form...</div>
  }

  if (!form) {
    return <div className="error-message">Form not found</div>
  }

  return (
    <div className="public-form-page">
      <div className="public-form-container">
        <div className="public-form-card">
          <h1 className="form-title">{form.title}</h1>
          
          {submitted ? (
            <div className="submission-success">
              <div className="success-icon">✓</div>
              <h2>Thank you!</h2>
              <p>{form.settings?.confirmationMessage || 'Your submission has been received.'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="public-form">
              {fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              ))}
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
