# Email Notification Setup Guide

## Overview

Phoenix Form Builder supports email notifications for form submissions. You can:
- Notify the form owner when a form is submitted
- Send confirmation emails to form submitters

## Configuration

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Set Environment Variables**:
   ```bash
   export SMTP_HOST=smtp.gmail.com
   export SMTP_PORT=587
   export SMTP_SECURE=false
   export SMTP_USER=your-email@gmail.com
   export SMTP_PASSWORD=your-16-char-app-password
   export SMTP_FROM=your-email@gmail.com
   ```

### Option 2: Other Email Services

#### Outlook/Office 365
```bash
export SMTP_HOST=smtp.office365.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-email@outlook.com
export SMTP_PASSWORD=your-password
```

#### SendGrid
```bash
export SMTP_HOST=smtp.sendgrid.net
export SMTP_PORT=587
export SMTP_USER=apikey
export SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```bash
export SMTP_HOST=smtp.mailgun.org
export SMTP_PORT=587
export SMTP_USER=your-mailgun-username
export SMTP_PASSWORD=your-mailgun-password
```

### Option 3: Create .env File

Create a `.env` file in the root directory:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

**Note:** Make sure `.env` is in `.gitignore` to keep credentials secure!

## Using Email Notifications

1. **In Form Settings**:
   - Enable "Email notifications"
   - Check "Notify form owner" and enter your email
   - Optionally check "Send confirmation email to submitter"
   - Select the email field from your form for submitter notifications

2. **When a form is submitted**:
   - Owner receives an email with all submission data
   - Submitter receives a confirmation email (if enabled)

## Testing

1. Configure email settings (see above)
2. Create a form with an email field
3. Enable email notifications in form settings
4. Submit a test form
5. Check both email inboxes

## Troubleshooting

### Emails not sending
- Check SMTP credentials are correct
- Verify firewall/network allows SMTP connections
- Check server logs for error messages
- For Gmail: Make sure you're using an App Password, not your regular password

### "Email service not configured" warning
- This is normal if SMTP credentials aren't set
- Form submissions will still work, just no emails will be sent
- Configure SMTP to enable email notifications

## Security Notes

- Never commit `.env` files with real credentials
- Use App Passwords instead of main account passwords
- Consider using a dedicated email service account
- For production, use environment variables or a secrets manager
