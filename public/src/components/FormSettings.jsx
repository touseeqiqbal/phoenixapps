import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import '../styles/FormSettings.css'

export default function FormSettings({ form, onUpdate, onClose }) {
  const [settings, setSettings] = useState(form.settings || {
    theme: 'default',
    allowMultipleSubmissions: true,
    showProgressBar: true,
    confirmationMessage: 'Thank you for your submission!',
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
