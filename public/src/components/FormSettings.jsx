import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import '../styles/FormSettings.css'

export default function FormSettings({ form, onUpdate, onClose }) {
  const [settings, setSettings] = useState(form.settings || {
    theme: 'default',
    allowMultipleSubmissions: true,
    showProgressBar: true,
    confirmationMessage: 'Thank you for your submission!',
    backgroundImage: '',
    backgroundColor: '#ffffff',
    logo: '',
    showPreviewBeforeSubmit: false,
  })

  useEffect(() => {
    onUpdate({ settings })
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Form Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="form-group">
            <label>Theme</label>
            <select
              className="input"
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="colorful">Colorful</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.allowMultipleSubmissions}
                onChange={(e) => updateSetting('allowMultipleSubmissions', e.target.checked)}
              />
              <span>Allow multiple submissions</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.showProgressBar}
                onChange={(e) => updateSetting('showProgressBar', e.target.checked)}
              />
              <span>Show progress bar</span>
            </label>
          </div>

          <div className="form-group">
            <label>Confirmation Message</label>
            <textarea
              className="input"
              value={settings.confirmationMessage}
              onChange={(e) => updateSetting('confirmationMessage', e.target.value)}
              rows={3}
              placeholder="Message shown after form submission"
            />
          </div>

          <div className="form-group">
            <label>Background Color</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="color"
                value={settings.backgroundColor || '#ffffff'}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
              />
              <input
                type="text"
                className="input"
                value={settings.backgroundColor || '#ffffff'}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Background Image URL</label>
            <input
              type="url"
              className="input"
              value={settings.backgroundImage || ''}
              onChange={(e) => updateSetting('backgroundImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {settings.backgroundImage && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={settings.backgroundImage} 
                  alt="Background preview" 
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <p style={{ display: 'none', color: '#ef4444', fontSize: '12px' }}>Invalid image URL</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Form Logo URL</label>
            <input
              type="url"
              className="input"
              value={settings.logo || ''}
              onChange={(e) => updateSetting('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {settings.logo && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={settings.logo} 
                  alt="Logo preview" 
                  style={{ maxWidth: '200px', maxHeight: '100px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <p style={{ display: 'none', color: '#ef4444', fontSize: '12px' }}>Invalid image URL</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.showPreviewBeforeSubmit || false}
                onChange={(e) => updateSetting('showPreviewBeforeSubmit', e.target.checked)}
              />
              <span>Show preview before submit</span>
            </label>
          </div>

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
