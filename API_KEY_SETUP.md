# API Key Setup Guide

## API Key Configuration

The API key has been configured for all four workflows:
- ✅ `triggerOTP`
- ✅ `getLoanAccounts`
- ✅ `loanDetails`
- ✅ `storeCSATFeedback`

## Local Testing

### Option 1: Environment Variable (Recommended)

**PowerShell:**
```powershell
$env:YB_API_KEY = "AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY"
npm test
```

**Command Prompt:**
```cmd
set YB_API_KEY=AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY
npm test
```

### Option 2: Already Set in test-agent.js

The API key is already configured in `agent/test-agent.js` for local testing. You can run:
```powershell
npm test
```

## Yellow.ai Deployment

### Step 1: Add API Key to Yellow.ai Environment Variables

1. Go to Yellow.ai Dashboard
2. Navigate to **Settings** → **Environment Variables** or **Secrets**
3. Add new variable:
   - **Name**: `YB_API_KEY`
   - **Value**: `AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY`
   - **Type**: Secret (recommended)

### Step 2: Update Workflow Headers

The configuration files have been updated to use `{{env.YB_API_KEY}}` in headers:

**triggerOTP Workflow:**
```json
"headers": {
  "Content-Type": "application/json",
  "Authorization": "Bearer {{env.YB_API_KEY}}"
}
```

**getLoanAccounts Workflow:**
```json
"headers": {
  "Content-Type": "application/json",
  "Authorization": "Bearer {{env.YB_API_KEY}}"
}
```

**loanDetails Workflow:**
```json
"headers": {
  "Content-Type": "application/json",
  "Authorization": "Bearer {{env.YB_API_KEY}}"
}
```

**storeCSATFeedback Workflow:**
```json
"headers": {
  "Content-Type": "application/json",
  "Authorization": "Bearer {{env.YB_API_KEY}}"
}
```

## Beeceptor API Setup

If using Beeceptor for mock APIs, you can add header validation:

1. Go to Beeceptor Dashboard
2. For each endpoint, add a rule:
   - **Condition**: Header `Authorization` contains your API key
   - **Action**: Process request

Or simply accept all requests for testing (remove validation in production).

## Security Notes

⚠️ **Important:**
- Never commit the API key to version control
- Use environment variables or Yellow.ai secrets
- The key is already in `agent/test-agent.js` for local testing only
- For production, always use environment variables

## Verification

To verify the API key is being sent:

1. **Local Testing**: Check network requests in browser DevTools
2. **Beeceptor**: Check request logs in Beeceptor dashboard
3. **Yellow.ai**: Check workflow execution logs

## Troubleshooting

**Issue**: API returns 401 Unauthorized
- ✅ Check API key is set in environment variables
- ✅ Verify header format: `Bearer <key>`
- ✅ Ensure key matches exactly (no extra spaces)

**Issue**: API key not being sent
- ✅ Verify environment variable is set: `echo $env:YB_API_KEY`
- ✅ Check workflow headers configuration
- ✅ Restart agent/test after setting environment variable

---

**API Key configured for all workflows!** ✅
