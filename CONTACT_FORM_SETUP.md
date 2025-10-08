# Contact Form Setup Guide

## Email Configuration

To enable the contact form functionality, you need to set up email configuration in your backend environment.

### Required Environment Variables

Add the following environment variables to your `backend/.env` file:

```env
# Email Configuration for Contact Form
CONTACT_EMAIL=your-email@gmail.com
CONTACT_EMAIL_PASSWORD=your-app-password-here
```

### Gmail Setup Instructions

1. **Use a Gmail account** for sending emails
2. **Enable 2-Factor Authentication** on your Gmail account
3. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular password) in `CONTACT_EMAIL_PASSWORD`

### Example Configuration

```env
CONTACT_EMAIL=message.crimewise@gmail.com
CONTACT_EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Features

- ✅ Sends contact form submissions to the configured email
- ✅ Sends auto-reply confirmation to the sender
- ✅ Includes sender's email as reply-to for easy responses
- ✅ Professional HTML email templates
- ✅ Form validation and error handling
- ✅ Loading states and user feedback

### Testing

1. Set up your environment variables
2. Start the backend server: `npm start`
3. Start the frontend: `npm run dev`
4. Navigate to the contact form
5. Fill out and submit the form
6. Check both your inbox and the sender's inbox for emails

### Troubleshooting

- **Authentication failed**: Make sure you're using an App Password, not your regular Gmail password
- **Connection timeout**: Check your internet connection and Gmail SMTP settings
- **Form not submitting**: Check browser console for errors and verify API_BASE_URL in frontend config
