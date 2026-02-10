# Vercel Deployment - Backend API Setup

## The Problem

The agent is failing because the backend API endpoint `https://yellow-bank-api.free.beeceptor.com` doesn't exist or isn't configured.

## Solution Options

### Option 1: Use Beeceptor (Recommended for Testing)

1. Go to https://beeceptor.com
2. Create a new endpoint: `yellow-bank-api`
3. Configure the `/trigger-otp` endpoint to return:
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "1234"
}
```
4. Configure `/get-loan-accounts` endpoint
5. Configure `/get-loan-details` endpoint

### Option 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add: `API_BASE_URL` = `https://your-actual-api-url.com`
4. Redeploy

### Option 3: Use Local Mock Server (For Development)

The mock API server is in `agent/mock-api-server.js`. You can:
1. Deploy it to a service like Railway, Render, or Heroku
2. Update `API_BASE_URL` in Vercel to point to your deployed mock server

## Current Configuration

- **API Base URL**: `https://yellow-bank-api.free.beeceptor.com` (default)
- **API Key**: `AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q`

## Quick Test

Test if your backend is accessible:
```bash
curl -X POST https://yellow-bank-api.free.beeceptor.com/trigger-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q" \
  -d '{"phoneNumber":"9876543210","dob":"01/01/1990"}'
```

If this fails, the endpoint doesn't exist and needs to be created.
