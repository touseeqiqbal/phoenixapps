import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import '../styles/Submissions.css'

export default function Submissions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      console.log('Fetching submissions for form:', id)
      const [formRes, submissionsRes] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/submissions/form/${id}`)
      ])
      console.log('Form data:', formRes.data)
      console.log('Submissions data:', submissionsRes.data)
      setForm(formRes.data)
      setSubmissions(submissionsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load submissions'
      alert(`Failed to load submissions: ${errorMessage}`)
      // Don't navigate away, just show error
    } finally {
      setLoading(false)
    }
  }

  const deleteSubmission = async (submissionId) => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      await api.delete(`/submissions/${submissionId}`)
      setSubmissions(submissions.filter(s => s.id !== submissionId))
    } catch (error) {
      console.error('Failed to delete submission:', error)
      alert('Failed to delete submission')
    }
  }

  const exportCSV = () => {
    if (submissions.length === 0) return

    const headers = form.fields.map(f => f.label).join(',')
    const rows = submissions.map(sub => {
      return form.fields.map(field => {
        const value = sub.data[field.id]
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`
        }
        return `"${value || ''}"`
      }).join(',')
    })

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title}_submissions.csv`
    a.click()
  }

  if (loading) {
    return <div className="loading">Loading submissions...</div>
  }

  if (!form) {
    return (
      <div className="submissions-page">
        <div className="container">
          <div className="empty-state">
            <p>Form not found</p>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="submissions-page">
      <header className="submissions-header">
        <div className="container">
          <div className="header-content">
            <button className="btn btn-secondary" onClick={() => navigate(`/form/${id}`)}>
              <ArrowLeft size={18} />
              Back to Form
            </button>
            <h1>{form?.title || 'Form'} - Submissions</h1>
            <button className="btn btn-primary" onClick={exportCSV} disabled={submissions.length === 0}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {!form ? (
          <div className="empty-state">
            <p>Form not found</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions yet</p>
            <p className="hint">Share your form to start collecting responses</p>
            {form.shareKey && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ marginBottom: '10px', fontWeight: 600 }}>Share Link:</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/share/${form.shareKey}`}
                    style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/share/${form.shareKey}`)
                      alert('Share link copied!')
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((submission, idx) => (
              <div key={submission.id} className="submission-card">
                <div className="submission-header">
                  <h3>Submission #{submissions.length - idx}</h3>
                  <div className="submission-meta">
                    <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteSubmission(submission.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="submission-data">
                  {form.fields && form.fields.length > 0 ? (
                    form.fields.map(field => {
                      const value = submission.data?.[field.id]
                      return (
                        <div key={field.id} className="submission-field">
                          <label>{field.label}</label>
                          <div className="field-value">
                            {value === undefined || value === null || value === '' 
                              ? '—'
                              : Array.isArray(value)
                              ? value.join(', ')
                              : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="submission-field">
                      <p>No fields in form</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
