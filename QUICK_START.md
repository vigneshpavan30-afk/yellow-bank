# Quick Start Guide - Yellow Bank Agent

This is a condensed guide to get your agent up and running quickly. For detailed instructions, refer to the full documentation files.

## 🚀 5-Minute Setup Overview

### Step 1: Create Mock APIs (2 minutes)

1. Go to https://beeceptor.com
2. Create endpoint: `yellow-bank-api`
3. Copy your URL: `https://yellow-bank-api.free.beeceptor.com`

**Configure 3 APIs:**

**API 1: OTP Trigger**
- Path: `/trigger-otp`
- Method: POST
- Response: `{"status":"success","otp":"1234"}`

**API 2: Loan Accounts**
- Path: `/get-loan-accounts`
- Method: GET
- Response: See `MOCK_API_SETUP.md` for full JSON

**API 3: Loan Details**
- Path: `/get-loan-details?accountId=LA123456`
- Method: GET
- Response: See `MOCK_API_SETUP.md` for JSON

### Step 2: Create Agent in Yellow.ai (1 minute)

1. Go to https://docs.yellow.ai/
2. Create new agent: "Yellow Bank - Loan Details Agent"
3. Set language: English only

### Step 3: Add System Prompt (1 minute)

1. Go to Agent Settings → System Prompt
2. Copy entire content from `SYSTEM_PROMPT.md`
3. Paste and save

### Step 4: Configure Intents & Slots (5 minutes)

**Intents:**
- `view_loan_details` - Add phrases from `YELLOW_AI_CONFIG.md`
- `change_phone_number` - Add phrases from config

**Slots:**
- `phoneNumber` (Text, 10 digits, required)
- `dob` (Date, DD/MM/YYYY, required)
- `otp` (Text, 4 digits, required, max 2 retries)
- `selectedAccountId` (Text, from DRM selection)

### Step 5: Add Functions (2 minutes)

Copy and paste these functions in Yellow.ai Functions section:

1. **projectLoanAccounts** - From `functions/projectLoanAccounts.js`
2. **verifyOTP** - From `functions/verifyOTP.js`
3. **clearAuthSlots** - From `functions/clearAuthSlots.js`

### Step 6: Create Workflows (10 minutes)

**Workflow 1: triggerOTP**
- Type: API Workflow
- Trigger: After phoneNumber + dob collected
- API: POST to `/trigger-otp`
- Body: `{"phoneNumber":"{{phoneNumber}}","dob":"{{dob}}"}`

**Workflow 2: getLoanAccounts**
- Type: DRM (Interactive Cards)
- Trigger: After OTP verified
- API: GET to `/get-loan-accounts`
- **Add Transformation**: Call `projectLoanAccounts` function
- DRM Template: Use from `config/drm-templates.json`
- **CRITICAL**: Button message must contain `loan_account_id`

**Workflow 3: loanDetails**
- Type: DRM (Quick Replies)
- Trigger: After account selected
- API: GET to `/get-loan-details?accountId={{selectedAccountId}}`
- DRM Template: Use from `config/drm-templates.json`
- Include "Rate our chat" button → CSAT agent

### Step 7: Test (5 minutes)

**Happy Path:**
```
User: "I want to check my loan details"
→ Provide phone: 9876543210
→ Provide DOB: 15/01/1990
→ Receive OTP: 1234
→ Enter OTP: 1234
→ See loan account cards
→ Select account
→ See loan details
→ Click "Rate our chat"
```

## 📋 Critical Checklist

Before going live, verify:

- [ ] System prompt is added
- [ ] All 4 slots are configured
- [ ] OTP verification accepts: 1234, 5678, 7889, 1209
- [ ] Token optimization function is added and called
- [ ] DRM button message contains `loan_account_id`
- [ ] Language restriction is enabled (English only)
- [ ] Phone number correction clears slots
- [ ] CSAT agent is created and linked

## 🔧 Common Issues & Fixes

**Issue**: OTP not working
- ✅ Check OTP values in mock API (must be 1234, 5678, 7889, or 1209)
- ✅ Verify OTP verification function is called

**Issue**: DRM not showing
- ✅ Check data structure matches template
- ✅ Verify projection function output format
- ✅ Ensure account ID is in button message

**Issue**: Token usage too high
- ✅ Verify projection function is called before DRM
- ✅ Check function is filtering correctly
- ✅ Test with sample data

**Issue**: Account selection not working
- ✅ Verify button message contains `loan_account_id`
- ✅ Check slot extraction configuration
- ✅ Test button payload format

## 📚 Full Documentation

- **System Prompt**: `SYSTEM_PROMPT.md`
- **Interaction Logic**: `INTERACTION_LOGIC.md`
- **Yellow.ai Config**: `YELLOW_AI_CONFIG.md`
- **Mock API Setup**: `MOCK_API_SETUP.md`
- **CSAT Agent**: `CSAT_AGENT_CONFIG.md`
- **Token Optimization**: `TOKEN_OPTIMIZATION_GUIDE.md`
- **Implementation Checklist**: `IMPLEMENTATION_CHECKLIST.md`

## 🎯 Next Steps

1. Follow `IMPLEMENTATION_CHECKLIST.md` for detailed step-by-step
2. Test all edge cases
3. Deploy to development environment
4. Perform UAT
5. Deploy to production

## ⚡ Quick Test Commands

```bash
# Test OTP API
curl -X POST https://YOUR-URL.free.beeceptor.com/trigger-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","dob":"15/01/1990"}'

# Test Loan Accounts
curl -X GET https://YOUR-URL.free.beeceptor.com/get-loan-accounts

# Test Loan Details
curl -X GET "https://YOUR-URL.free.beeceptor.com/get-loan-details?accountId=LA123456"
```

---

**Estimated Total Time**: 30-45 minutes for basic setup

For detailed implementation, follow `IMPLEMENTATION_CHECKLIST.md`.
