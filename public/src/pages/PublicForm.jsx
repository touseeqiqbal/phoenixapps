import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import FieldRenderer from '../components/FieldRenderer'
import { Eye, Download, X } from 'lucide-react'
import '../styles/PublicForm.css'

export default function PublicForm() {
  const { shareKey } = useParams()
  const [form, setForm] = useState(null)
  const [fields, setFields] = useState([])
  const [formData, setFormData] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
    
    // Show preview if enabled
    if (form.settings?.showPreviewBeforeSubmit && !showPreview) {
      setShowPreview(true)
      return
    }
    
    setSubmitting(true)

    try {
      await api.post(`/public/form/${shareKey}/submit`, {
        data: formData
      })
      setSubmitted(true)
      setFormData({})
      setShowPreview(false)
    } catch (error) {
      console.error('Failed to submit form:', error)
      alert(error.response?.data?.error || 'Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadPDF = () => {
    import('jspdf').then((jsPDF) => {
      const { jsPDF: JSPDF } = jsPDF
      const doc = new JSPDF()
      
      // Add logo if available
      if (form.settings?.logo) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          doc.addImage(img, 'PNG', 10, 10, 50, 20)
          doc.text(form.title, 10, 40)
          let yPos = 50
          
          fields.forEach((field, idx) => {
            if (yPos > 280) {
              doc.addPage()
              yPos = 20
            }
            const value = formData[field.id]
            if (value !== undefined && value !== null && value !== '') {
              doc.setFontSize(10)
              doc.text(`${field.label}:`, 10, yPos)
              doc.setFontSize(9)
              const valueStr = Array.isArray(value) ? value.join(', ') : String(value)
              const lines = doc.splitTextToSize(valueStr, 180)
              doc.text(lines, 10, yPos + 5)
              yPos += lines.length * 5 + 10
            }
          })
          
          doc.save(`${form.title}_submission.pdf`)
        }
        img.src = form.settings.logo
      } else {
        doc.text(form.title, 10, 20)
        let yPos = 30
        
        fields.forEach((field) => {
          if (yPos > 280) {
            doc.addPage()
            yPos = 20
          }
          const value = formData[field.id]
          if (value !== undefined && value !== null && value !== '') {
            doc.setFontSize(10)
            doc.text(`${field.label}:`, 10, yPos)
            doc.setFontSize(9)
            const valueStr = Array.isArray(value) ? value.join(', ') : String(value)
            const lines = doc.splitTextToSize(valueStr, 180)
            doc.text(lines, 10, yPos + 5)
            yPos += lines.length * 5 + 10
          }
        })
        
        doc.save(`${form.title}_submission.pdf`)
      }
    }).catch(() => {
      alert('PDF library not loaded. Please install jspdf package.')
    })
  }

  if (loading) {
    return <div className="loading">Loading form...</div>
  }

  if (!form) {
    return <div className="error-message">Form not found</div>
  }

  const formStyle = {
    backgroundImage: form.settings?.backgroundImage ? `url(${form.settings.backgroundImage})` : 'none',
    backgroundColor: form.settings?.backgroundColor || '#ffffff',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }

  return (
    <div className="public-form-page" style={formStyle}>
      <div className="public-form-container">
        <div className="public-form-card">
          {form.settings?.logo && (
            <div className="form-logo-header">
              <img src={form.settings.logo} alt="Logo" className="form-header-logo" />
            </div>
          )}
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
                  type="button"
                  className="btn btn-secondary"
                  onClick={downloadPDF}
                >
                  <Download size={18} />
                  Download PDF
                </button>
                {form.settings?.showPreviewBeforeSubmit && !showPreview && (
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye size={18} />
                    Preview
                  </button>
                )}
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : showPreview ? 'Confirm Submit' : 'Submit'}
                </button>
                {showPreview && (
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPreview(false)}
                  >
                    <X size={18} />
                    Edit
                  </button>
                )}
              </div>
              
              {showPreview && (
                <div className="form-preview-section">
                  <h3>Preview Your Submission</h3>
                  <div className="preview-content">
                    {fields.map(field => {
                      const value = formData[field.id]
                      if (value === undefined || value === null || value === '') return null
                      return (
                        <div key={field.id} className="preview-item">
                          <strong>{field.label}:</strong>
                          <span>
                            {Array.isArray(value) 
                              ? value.join(', ') 
                              : typeof value === 'object' 
                              ? JSON.stringify(value) 
                              : String(value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
