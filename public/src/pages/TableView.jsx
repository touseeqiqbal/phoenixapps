import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Download, Filter, Search } from 'lucide-react'
import '../styles/TableView.css'

export default function TableView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    if (searchTerm) {
      const filtered = submissions.filter(sub => {
        return Object.values(sub.data).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
      setFilteredSubmissions(filtered)
    } else {
      setFilteredSubmissions(submissions)
    }
  }, [searchTerm, submissions])

  const fetchData = async () => {
    try {
      const [formRes, submissionsRes] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/submissions/form/${id}`)
      ])
      setForm(formRes.data)
      setSubmissions(submissionsRes.data)
      setFilteredSubmissions(submissionsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      alert('Failed to load data')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (submissions.length === 0) return

    const headers = ['Submission ID', 'Submitted At', ...form.fields.map(f => f.label)].join(',')
    const rows = submissions.map(sub => {
      const rowData = [
        sub.id,
        new Date(sub.submittedAt).toLocaleString(),
        ...form.fields.map(field => {
          const value = sub.data[field.id]
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value)}"`
          }
          return `"${value || ''}"`
        })
      ]
      return rowData.join(',')
    })

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title}_table.csv`
    a.click()
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="table-view-page">
      <header className="table-view-header">
        <div className="container">
          <div className="header-content">
            <button className="btn btn-secondary" onClick={() => navigate(`/form/${id}`)}>
              <ArrowLeft size={18} />
              Back to Form
            </button>
            <h1>{form?.title} - Data Table</h1>
            <button className="btn btn-primary" onClick={exportCSV} disabled={submissions.length === 0}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="table-stats">
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submitted</th>
                  {form.fields.map(field => (
                    <th key={field.id}>{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, idx) => (
                  <tr key={submission.id}>
                    <td>{idx + 1}</td>
                    <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                    {form.fields.map(field => (
                      <td key={field.id}>
                        {Array.isArray(submission.data[field.id])
                          ? submission.data[field.id].join(', ')
                          : typeof submission.data[field.id] === 'object' && submission.data[field.id] !== null
                          ? JSON.stringify(submission.data[field.id])
                          : submission.data[field.id] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
