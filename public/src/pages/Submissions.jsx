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
      const [formRes, submissionsRes] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/submissions/form/${id}`)
      ])
      setForm(formRes.data)
      setSubmissions(submissionsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      alert('Failed to load submissions')
      navigate('/dashboard')
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
    return <div className="loading">Loading...</div>
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
            <h1>{form?.title} - Submissions</h1>
            <button className="btn btn-primary" onClick={exportCSV} disabled={submissions.length === 0}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {submissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions yet</p>
            <p className="hint">Share your form to start collecting responses</p>
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
                  {form.fields.map(field => (
                    <div key={field.id} className="submission-field">
                      <label>{field.label}</label>
                      <div className="field-value">
                        {Array.isArray(submission.data[field.id])
                          ? submission.data[field.id].join(', ')
                          : submission.data[field.id] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
