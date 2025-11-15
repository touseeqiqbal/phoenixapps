import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import ImageUpload from './ImageUpload'
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
    emailNotifications: {
      enabled: false,
      notifyOwner: true,
      notifySubmitter: false,
      ownerEmail: '',
      submitterEmailField: ''
    }
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
            <ImageUpload
              label="Background Image"
              value={settings.backgroundImage || ''}
              onChange={(value) => updateSetting('backgroundImage', value)}
            />
          </div>

          <div className="form-group">
            <ImageUpload
              label="Form Logo"
              value={settings.logo || ''}
              onChange={(value) => updateSetting('logo', value)}
            />
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

          <div className="settings-section-divider">
            <h3>Email Notifications</h3>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications?.enabled || false}
                onChange={(e) => updateSetting('emailNotifications', {
                  ...settings.emailNotifications,
                  enabled: e.target.checked
                })}
              />
              <span>Enable email notifications</span>
            </label>
          </div>

          {settings.emailNotifications?.enabled && (
            <>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications?.notifyOwner !== false}
                    onChange={(e) => updateSetting('emailNotifications', {
                      ...settings.emailNotifications,
                      notifyOwner: e.target.checked
                    })}
                  />
                  <span>Notify form owner when form is submitted</span>
                </label>
              </div>

              {settings.emailNotifications?.notifyOwner && (
                <div className="form-group">
                  <label>Owner Email Address</label>
                  <input
                    type="email"
                    className="input"
                    value={settings.emailNotifications?.ownerEmail || ''}
                    onChange={(e) => updateSetting('emailNotifications', {
                      ...settings.emailNotifications,
                      ownerEmail: e.target.value
                    })}
                    placeholder="owner@example.com"
                  />
                  <small className="help-text">Email address to receive submission notifications</small>
                </div>
              )}

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications?.notifySubmitter || false}
                    onChange={(e) => updateSetting('emailNotifications', {
                      ...settings.emailNotifications,
                      notifySubmitter: e.target.checked
                    })}
                  />
                  <span>Send confirmation email to submitter</span>
                </label>
              </div>

              {settings.emailNotifications?.notifySubmitter && (
                <div className="form-group">
                  <label>Email Field (for submitter notification)</label>
                  <select
                    className="input"
                    value={settings.emailNotifications?.submitterEmailField || ''}
                    onChange={(e) => updateSetting('emailNotifications', {
                      ...settings.emailNotifications,
                      submitterEmailField: e.target.value
                    })}
                  >
                    <option value="">Select email field from form</option>
                    {form.fields?.filter(f => f.type === 'email').map(field => (
                      <option key={field.id} value={field.id}>{field.label}</option>
                    ))}
                  </select>
                  <small className="help-text">Select which email field to use for submitter notifications</small>
                </div>
              )}
            </>
          )}

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
