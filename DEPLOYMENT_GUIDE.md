# Deployment Guide - Yellow Bank Agent

This guide helps you deploy the tested agent to Yellow.ai platform.

## Prerequisites

1. ✅ Agent tested locally and working
2. ✅ Beeceptor APIs configured (or use production APIs)
3. ✅ Yellow.ai account created
4. ✅ All functions tested

## Step 1: Set Up Production APIs

### Option A: Use Beeceptor (for testing/staging)

1. Go to https://beeceptor.com
2. Use your existing endpoint or create a new one
3. Configure all 3 APIs as per `MOCK_API_SETUP.md`
4. Copy your endpoint URL

### Option B: Use Production APIs

Update API URLs in Yellow.ai workflows to your production endpoints.

## Step 2: Deploy Functions to Yellow.ai

### 2.1 Token Optimization Function

1. Go to Yellow.ai Dashboard → Functions
2. Create new function: `projectLoanAccounts`
3. Copy code from `functions/projectLoanAccounts.js`
4. Remove `module.exports` and test code
5. Save function

### 2.2 OTP Verification Function

1. Create function: `verifyOTP`
2. Copy code from `functions/verifyOTP.js`
3. Remove `module.exports` and test code
4. Save function

### 2.3 Clear Auth Slots Function

1. Create function: `clearAuthSlots`
2. Copy code from `functions/clearAuthSlots.js`
3. Remove `module.exports` and test code
4. Save function

## Step 3: Configure Agent in Yellow.ai

Follow `IMPLEMENTATION_CHECKLIST.md` Phase 3-9, or use the quick steps below:

### 3.1 Basic Settings
- Agent name: "Yellow Bank - Loan Details Agent"
- Language: English only
- Max tokens: 4000
- Context retention: Enabled
- Session timeout: 5 minutes

### 3.2 System Prompt
- Copy from `SYSTEM_PROMPT.md`
- Paste into Yellow.ai system prompt field
- Save

### 3.3 Intents
- Create `view_loan_details` intent
- Create `change_phone_number` intent
- Add training phrases from `YELLOW_AI_CONFIG.md`

### 3.4 Slots
- `phoneNumber` (Text, 10 digits)
- `dob` (Date, DD/MM/YYYY)
- `otp` (Text, 4 digits, max 2 retries)
- `selectedAccountId` (Text, from DRM)

## Step 4: Configure Workflows

### 4.1 triggerOTP Workflow

**Configuration:**
```
Type: API Workflow
Trigger: After phoneNumber && dob collected
Method: POST
URL: https://YOUR-API-URL/trigger-otp
Headers: Content-Type: application/json
Body: {
  "phoneNumber": "{{phoneNumber}}",
  "dob": "{{dob}}"
}
Response Mapping: otpValue = {{response.otp}}
```

### 4.2 getLoanAccounts Workflow

**Configuration:**
```
Type: DRM (Dynamic Rich Media)
Trigger: After OTP verified
Method: GET
URL: https://YOUR-API-URL/get-loan-accounts

Add Transformation Node:
  Function: projectLoanAccounts
  Input: {{apiResponse}}
  Output: {{projectedLoanAccounts}}

DRM Configuration:
  Type: Interactive Cards
  Template: Use from config/drm-templates.json
  Data: {{projectedLoanAccounts.accounts}}
  
CRITICAL: Button message must contain loan_account_id
```

### 4.3 loanDetails Workflow

**Configuration:**
```
Type: DRM (Dynamic Rich Media)
Trigger: After selectedAccountId is set
Method: GET
URL: https://YOUR-API-URL/get-loan-details?accountId={{selectedAccountId}}

DRM Configuration:
  Type: Quick Replies
  Template: Use from config/drm-templates.json
  Include "Rate our chat" button → CSAT agent URL
```

## Step 5: Configure Edge Cases

### 5.1 Phone Number Correction

**Intent Handler:**
```
Intent: change_phone_number
Action:
  1. Call clearAuthSlots function
  2. Retain intent: view_loan_details
  3. Request phoneNumber slot again
```

### 5.2 OTP Retry Logic

**In OTP Verification:**
```
If OTP invalid:
  - Increment retry count
  - If retry count < 2: Request OTP again
  - If retry count >= 2: Clear slots, restart authentication
```

### 5.3 Language Restriction

**Settings:**
```
Language Restriction: Enabled
Allowed Languages: English only
Rejection Message: "I apologize, but I'm restricted to operating in English only. Please continue our conversation in English."
```

## Step 6: Deploy CSAT Agent

1. Create new agent: "Yellow Bank - CSAT Survey Agent"
2. Copy system prompt from `CSAT_AGENT_CONFIG.md`
3. Configure slots: `csat_rating`, `csat_feedback`
4. Set up quick replies for rating
5. Get CSAT agent URL/ID
6. Update "Rate our chat" button in loanDetails DRM

## Step 7: Testing in Yellow.ai

### 7.1 Test Happy Path

1. Open agent in Yellow.ai test console
2. Send: "I want to check my loan details"
3. Provide phone: 9876543210
4. Provide DOB: 15/01/1990
5. Enter OTP (one of: 1234, 5678, 7889, 1209)
6. Verify loan accounts display
7. Select account
8. Verify loan details display
9. Test CSAT redirect

### 7.2 Test Edge Cases

- Phone number correction
- Invalid OTP (test retries)
- Non-English input
- API failures

## Step 8: Production Deployment

### 8.1 Pre-Deployment Checklist

- [ ] All workflows tested
- [ ] Edge cases handled
- [ ] Token optimization verified
- [ ] CSAT integration working
- [ ] Error handling tested
- [ ] API URLs updated to production
- [ ] System prompt reviewed

### 8.2 Deploy to Production

1. Go to Yellow.ai Dashboard → Deploy
2. Select your agent
3. Choose production environment
4. Review configuration
5. Deploy

### 8.3 Post-Deployment

1. Monitor initial conversations
2. Check error logs
3. Verify API calls are working
4. Monitor token usage
5. Collect user feedback

## Step 9: Monitoring

### 9.1 Key Metrics

- Authentication success rate
- OTP verification success rate
- Token usage per conversation
- API response times
- CSAT ratings
- Error rates

### 9.2 Analytics Setup

Configure analytics in Yellow.ai to track:
- User intents
- Slot collection success
- Workflow execution
- DRM interactions
- Error occurrences

## Troubleshooting

### Issue: Agent not responding
- Check system prompt is saved
- Verify intents are configured
- Check workflow triggers

### Issue: OTP not working
- Verify OTP API is accessible
- Check OTP values match (1234, 5678, 7889, 1209)
- Verify OTP verification function

### Issue: DRM not displaying
- Check data structure matches template
- Verify projection function output
- Check DRM configuration

### Issue: High token usage
- Verify projection function is called
- Check function is filtering correctly
- Review API response size

## Support

- Yellow.ai Documentation: https://docs.yellow.ai/
- Review `IMPLEMENTATION_CHECKLIST.md` for detailed steps
- Check `QUICK_START.md` for quick reference

---

**Ready to deploy!** Follow this guide step by step to get your agent live.
