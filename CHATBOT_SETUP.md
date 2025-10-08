# CrimeWise AI Chatbot Setup Guide

## Overview

The CrimeWise AI Chatbot is a forensic handwriting analysis assistant powered by Google's Gemini AI. It provides detailed analysis of handwriting images focusing on key forensic aspects.

## Features

- **Text Chat**: Ask questions about forensic analysis and the CrimeWise system
- **Image Analysis**: Upload handwriting images for detailed forensic examination
- **Role-Based Access**: Only available to admin, instructor, and super_admin users
- **Chat History**: Persistent conversation history per user
- **Real-time Analysis**: Instant AI-powered handwriting analysis

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your backend:

```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key and add it to your environment variables

### 3. Install Dependencies

The required dependencies are already included in `package.json`:

- `@google/genai`: Google's latest AI SDK
- `multer`: File upload handling
- `jsonwebtoken`: Authentication

### 4. Usage

#### For Admins and Instructors:

1. Log in to the CrimeWise system
2. Look for the floating blue bot icon in the bottom-right corner
3. Click to open the AI Assistant
4. Ask questions or upload handwriting images for analysis

#### Chat Features:

- **Text Questions**: Ask about forensic analysis, system features, or general questions
- **Image Upload**: Click the upload button to analyze handwriting images
- **Analysis Results**: Get detailed analysis covering:
  - General Formation
  - Relation to Baseline
  - Line Quality
  - Proportion and Spacing
  - Variation

#### API Endpoints:

- `POST /api/chatbot/message` - Send text messages
- `POST /api/chatbot/analyze-image` - Analyze handwriting images
- `GET /api/chatbot/history/:userId` - Get chat history
- `DELETE /api/chatbot/history/:userId` - Clear chat history

## Security

- Role-based access control (admin, instructor, super_admin only)
- JWT token authentication required
- File size limits (10MB max)
- Image file type validation
- Automatic file cleanup after analysis

## Analysis Categories

The AI analyzes handwriting images for:

1. **General Formation**: Overall structure and style
2. **Relation to Baseline**: Alignment and deviations
3. **Line Quality**: Consistency and characteristics
4. **Proportion and Spacing**: Size relationships
5. **Variation**: Consistency and unique features

## Troubleshooting

### Common Issues:

1. **API Key Error**: Ensure GEMINI_API_KEY is set correctly
2. **Access Denied**: Verify user has admin/instructor role
3. **File Upload Error**: Check file size (max 10MB) and type (images only)
4. **Analysis Failure**: Ensure image is clear and contains handwriting

### Error Messages:

- "Authentication required" - User not logged in
- "Access denied" - User role not authorized
- "File too large" - Image exceeds 10MB limit
- "Only image files allowed" - Invalid file type

## Support

For technical issues, check the backend logs for detailed error messages. The chatbot integrates seamlessly with the existing CrimeWise authentication and user management system.
