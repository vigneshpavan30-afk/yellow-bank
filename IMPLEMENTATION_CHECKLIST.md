# Yellow Bank Agent - Implementation Checklist

Use this checklist to systematically build and deploy your Banking Agent.

## Phase 1: Prerequisites Setup

### 1.1 Yellow.ai Account Setup
- [ ] Sign up at https://docs.yellow.ai/
- [ ] Log in to Yellow.ai dashboard
- [ ] Navigate to "Bots" or "Agents" section
- [ ] Create a new bot/agent workspace

### 1.2 Beeceptor Setup
- [ ] Sign up at https://beeceptor.com
- [ ] Create endpoint: `yellow-bank-api` (or your preferred name)
- [ ] Copy your endpoint URL: `https://yellow-bank-api.free.beeceptor.com`
- [ ] Note: You'll configure APIs in Phase 2

## Phase 2: Mock API Configuration

### 2.1 OTP Trigger API
- [ ] Go to Beeceptor dashboard
- [ ] Create rule for `/trigger-otp`
- [ ] Method: POST
- [ ] Response Code: 200
- [ ] Response Body: Configure with OTP values (1234, 5678, 7889, 1209)
- [ ] Test API using curl or Postman
- [ ] Verify response format matches expected structure

### 2.2 Get Loan Accounts API
- [ ] Create rule for `/get-loan-accounts`
- [ ] Method: GET
- [ ] Response Code: 200
- [ ] Response Body: Configure with full JSON (15+ fields per account)
- [ ] Include at least 2-3 loan accounts in response
- [ ] Test API and verify response structure

### 2.3 Get Loan Details API
- [ ] Create rule for `/get-loan-details`
- [ ] Method: GET
- [ ] Query Parameter: `accountId`
- [ ] Response Code: 200
- [ ] Response Body: Configure with loan details (tenure, interest_rate, etc.)
- [ ] Create separate responses for different account IDs
- [ ] Test API with different account IDs

### 2.4 Error Response Setup (Optional)
- [ ] Configure error responses for each API
- [ ] Test error handling scenarios

**Reference**: See `MOCK_API_SETUP.md` for detailed instructions

## Phase 3: Banking Agent Basic Configuration

### 3.1 Agent Settings
- [ ] Set agent name: "Yellow Bank - Loan Details Agent"
- [ ] Set language: English (en)
- [ ] Configure timezone
- [ ] Set max token limit: 4000
- [ ] Enable context retention
- [ ] Set session timeout: 5 minutes (300 seconds)

### 3.2 System Prompt
- [ ] Navigate to "Agent Settings" → "System Prompt"
- [ ] Copy content from `SYSTEM_PROMPT.md`
- [ ] Paste into system prompt field
- [ ] Save system prompt

### 3.3 Language Restriction
- [ ] Enable language restriction
- [ ] Set allowed language: English only
- [ ] Configure rejection message: "I apologize, but I'm restricted to operating in English only. Please continue our conversation in English."

## Phase 4: Intent Configuration

### 4.1 View Loan Details Intent
- [ ] Navigate to "Intents" → "Create New Intent"
- [ ] Intent name: `view_loan_details`
- [ ] Add training phrases (use list from `YELLOW_AI_CONFIG.md`)
- [ ] Set intent action: Trigger authentication flow
- [ ] Save intent

### 4.2 Change Phone Number Intent
- [ ] Create new intent: `change_phone_number`
- [ ] Add training phrases (from config)
- [ ] Set intent action: Clear and restart authentication
- [ ] Save intent

## Phase 5: Slot Configuration

### 5.1 Phone Number Slot
- [ ] Navigate to "Slots" → "Create New Slot"
- [ ] Slot name: `phoneNumber`
- [ ] Type: Text
- [ ] Required: Yes
- [ ] Validation: 10-digit pattern
- [ ] Set prompt message
- [ ] Configure entity extraction (phone number pattern)
- [ ] Save slot

### 5.2 DOB Slot
- [ ] Create slot: `dob`
- [ ] Type: Date
- [ ] Required: Yes
- [ ] Format: DD/MM/YYYY or DD-MM-YYYY
- [ ] Set prompt message
- [ ] Configure date extraction
- [ ] Save slot

### 5.3 OTP Slot
- [ ] Create slot: `otp`
- [ ] Type: Text
- [ ] Required: Yes
- [ ] Temporary: Yes
- [ ] Validation: 4-digit pattern
- [ ] Max retries: 2
- [ ] Set prompt message
- [ ] Clear after use: Yes
- [ ] Save slot

### 5.4 Selected Account ID Slot
- [ ] Create slot: `selectedAccountId`
- [ ] Type: Text
- [ ] Required: Yes
- [ ] Source: DRM selection
- [ ] Configure extraction from button message value
- [ ] Save slot

## Phase 6: Function Configuration

### 6.1 Token Optimization Function
- [ ] Navigate to "Functions" or "Custom Code"
- [ ] Create new function: `projectLoanAccounts`
- [ ] Copy code from `functions/projectLoanAccounts.js`
- [ ] Save function
- [ ] Test function with sample data

### 6.2 OTP Verification Function
- [ ] Create function: `verifyOTP`
- [ ] Copy code from `functions/verifyOTP.js`
- [ ] Save function
- [ ] Test function with valid/invalid OTPs

### 6.3 Clear Auth Slots Function
- [ ] Create function: `clearAuthSlots`
- [ ] Copy code from `functions/clearAuthSlots.js`
- [ ] Save function
- [ ] Test function

## Phase 7: Workflow Configuration

### 7.1 Trigger OTP Workflow
- [ ] Navigate to "Workflows" → "Create New Workflow"
- [ ] Workflow name: `triggerOTP`
- [ ] Type: API Workflow
- [ ] Configure trigger: After phoneNumber and dob are collected
- [ ] API Method: POST
- [ ] API URL: Your Beeceptor endpoint + `/trigger-otp`
- [ ] Headers: Content-Type: application/json
- [ ] Request Body: `{ "phoneNumber": "{{phoneNumber}}", "dob": "{{dob}}" }`
- [ ] Response Mapping: Extract `otp` from response
- [ ] Store in variable: `{{otpValue}}`
- [ ] Error Handling: Configure error message
- [ ] Save workflow

### 7.2 Get Loan Accounts Workflow (DRM)
- [ ] Create workflow: `getLoanAccounts`
- [ ] Type: Dynamic Rich Media (DRM)
- [ ] Trigger: After OTP verification successful
- [ ] API Method: GET
- [ ] API URL: Your Beeceptor endpoint + `/get-loan-accounts`
- [ ] Add Data Transformation Node:
  - [ ] Call function: `projectLoanAccounts`
  - [ ] Input: `{{apiResponse}}`
  - [ ] Output: `{{projectedLoanAccounts}}`
- [ ] Configure DRM:
  - [ ] Type: Interactive Cards
  - [ ] Use template from `config/drm-templates.json`
  - [ ] Data source: `{{projectedLoanAccounts.accounts}}`
  - [ ] **CRITICAL**: Ensure button message contains `loan_account_id`
- [ ] Save workflow

### 7.3 Loan Details Workflow (DRM)
- [ ] Create workflow: `loanDetails`
- [ ] Type: Dynamic Rich Media (DRM)
- [ ] Trigger: After user selects account (selectedAccountId is set)
- [ ] API Method: GET
- [ ] API URL: Your Beeceptor endpoint + `/get-loan-details?accountId={{selectedAccountId}}`
- [ ] Configure DRM:
  - [ ] Type: Quick Replies
  - [ ] Use template from `config/drm-templates.json`
  - [ ] Include "Rate our chat" button
  - [ ] Configure redirect to CSAT agent
- [ ] Save workflow

## Phase 8: Edge Case Handling

### 8.1 Phone Number Correction
- [ ] Configure `change_phone_number` intent handler
- [ ] Add action: Call `clearAuthSlots` function
- [ ] Retain intent: `view_loan_details`
- [ ] Restart slot collection: Request phoneNumber again
- [ ] Test flow

### 8.2 OTP Retry Logic
- [ ] Configure OTP verification in workflow
- [ ] Set max retries: 2
- [ ] After 2 failures: Clear slots and restart authentication
- [ ] Test with invalid OTPs

### 8.3 API Error Handling
- [ ] Configure error handling for each workflow
- [ ] Set user-friendly error messages
- [ ] Test error scenarios

## Phase 9: CSAT Agent Configuration

### 9.1 Create CSAT Agent
- [ ] Create new agent: "Yellow Bank - CSAT Survey Agent"
- [ ] Set language: English
- [ ] Configure basic settings

### 9.2 CSAT System Prompt
- [ ] Copy system prompt from `CSAT_AGENT_CONFIG.md`
- [ ] Paste into CSAT agent system prompt
- [ ] Save

### 9.3 CSAT Slots
- [ ] Create slot: `csat_rating` (Good, Average, Bad)
- [ ] Create slot: `csat_feedback` (optional text)
- [ ] Configure quick replies for rating

### 9.4 CSAT Workflow
- [ ] Create workflow to store feedback (optional)
- [ ] Configure thank you messages
- [ ] Test CSAT flow

### 9.5 Integration
- [ ] Get CSAT agent URL/ID
- [ ] Update "Rate our chat" button in loanDetails DRM
- [ ] Test redirect from banking agent to CSAT agent

## Phase 10: Testing

### 10.1 Happy Path Testing
- [ ] Test: User asks for loan details
- [ ] Test: Phone number collection
- [ ] Test: DOB collection
- [ ] Test: OTP trigger and verification
- [ ] Test: Loan accounts display
- [ ] Test: Account selection
- [ ] Test: Loan details display
- [ ] Test: CSAT redirect and completion

### 10.2 Edge Case Testing
- [ ] Test: Phone number correction flow
- [ ] Test: Invalid OTP (1st attempt)
- [ ] Test: Invalid OTP (2nd attempt)
- [ ] Test: Invalid OTP (3rd attempt - should restart)
- [ ] Test: Non-English input (should reject)
- [ ] Test: Invalid phone number format
- [ ] Test: Invalid DOB format
- [ ] Test: API failure scenarios

### 10.3 Token Optimization Testing
- [ ] Check token usage before optimization
- [ ] Verify projection function is called
- [ ] Check token usage after optimization
- [ ] Verify ~93% reduction in tokens
- [ ] Test with multiple loan accounts

## Phase 11: Deployment

### 11.1 Pre-Deployment Checks
- [ ] All workflows tested and working
- [ ] All edge cases handled
- [ ] Token optimization verified
- [ ] CSAT integration working
- [ ] Error handling tested
- [ ] System prompt reviewed

### 11.2 Development Environment
- [ ] Deploy to development/staging environment
- [ ] Perform UAT (User Acceptance Testing)
- [ ] Fix any issues found
- [ ] Get stakeholder approval

### 11.3 Production Deployment
- [ ] Update API URLs to production endpoints (if different)
- [ ] Deploy to production environment
- [ ] Monitor initial usage
- [ ] Set up analytics and monitoring

## Phase 12: Monitoring and Maintenance

### 12.1 Analytics Setup
- [ ] Configure analytics for authentication success rate
- [ ] Track OTP verification success rate
- [ ] Monitor token usage
- [ ] Track CSAT ratings
- [ ] Monitor API response times

### 12.2 Ongoing Maintenance
- [ ] Review user feedback
- [ ] Monitor error logs
- [ ] Update training phrases based on user queries
- [ ] Optimize workflows based on analytics
- [ ] Regular testing of all flows

## Quick Reference

### Important URLs to Replace
- `YOUR-BEECEPTOR-URL` → Your actual Beeceptor endpoint
- `{{csatAgentUrl}}` → Your CSAT agent URL/ID

### Critical Points
1. **Token Optimization**: Must implement projection function before DRM
2. **Button Message**: Account ID must be in button message value
3. **OTP Values**: Only accept 1234, 5678, 7889, 1209
4. **Language**: English only - reject all other languages
5. **Phone Number Change**: Must clear slots and restart flow

### Testing Commands
```bash
# Test OTP API
curl -X POST https://YOUR-URL.free.beeceptor.com/trigger-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","dob":"15/01/1990"}'

# Test Loan Accounts API
curl -X GET https://YOUR-URL.free.beeceptor.com/get-loan-accounts

# Test Loan Details API
curl -X GET "https://YOUR-URL.free.beeceptor.com/get-loan-details?accountId=LA123456"
```

## Estimated Time

- Phase 1-2: 30 minutes (Setup)
- Phase 3-5: 1-2 hours (Basic Configuration)
- Phase 6-7: 2-3 hours (Workflows)
- Phase 8-9: 1-2 hours (Edge Cases & CSAT)
- Phase 10: 2-3 hours (Testing)
- Phase 11-12: 1 hour (Deployment)

**Total Estimated Time**: 8-12 hours

---

**Note**: Check off each item as you complete it. This ensures nothing is missed during implementation.
