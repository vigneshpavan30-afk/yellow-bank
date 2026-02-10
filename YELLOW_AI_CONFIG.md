# Yellow.ai Agent Configuration Guide

## Prerequisites
1. Sign up at https://docs.yellow.ai/
2. Create a new bot/agent in your Yellow.ai dashboard
3. Navigate to the AI Agent configuration section

## Agent Configuration Steps

### 1. Basic Agent Settings

**Agent Name**: Yellow Bank - Loan Details Agent
**Language**: English (en)
**Timezone**: Set according to your region
**Bot Type**: Conversational AI Agent

### 2. System Prompt Configuration

Navigate to: **Agent Settings → System Prompt**

Copy the entire content from `SYSTEM_PROMPT.md` and paste it into the system prompt field.

**Key Settings**:
- Enable "Strict Language Mode" → English only
- Set "Max Token Limit" → 4000 (for token optimization)
- Enable "Context Retention" → Yes

### 3. Intent Configuration

Navigate to: **Intents → Create New Intent**

#### Intent: view_loan_details

**Intent Name**: `view_loan_details`

**Training Phrases**:
- "I want to check my loan details"
- "Show loan details"
- "I need to see my loan information"
- "Can you show me my loan account details"
- "Display my loan details"
- "I want to view my loan"
- "Show me my loan information"
- "Check my loan account"
- "Loan details please"
- "I need my loan information"

**Intent Action**: Trigger authentication flow

### 4. Slot Configuration

Navigate to: **Slots → Create New Slot**

#### Slot 1: phoneNumber
- **Slot Name**: `phoneNumber`
- **Type**: Text
- **Required**: Yes
- **Validation**: 10-digit number
- **Prompt**: "Please provide your registered phone number."
- **Entity Extraction**: Phone number pattern

#### Slot 2: dob
- **Slot Name**: `dob`
- **Type**: Date
- **Required**: Yes
- **Format**: DD/MM/YYYY or DD-MM-YYYY
- **Prompt**: "Please provide your date of birth (format: DD/MM/YYYY or DD-MM-YYYY)."
- **Entity Extraction**: Date pattern

#### Slot 3: otp
- **Slot Name**: `otp`
- **Type**: Text
- **Required**: Yes (temporary)
- **Validation**: 4-digit number
- **Prompt**: "An OTP has been sent to your registered phone number. Please provide the OTP you received."
- **Clear After Use**: Yes

#### Slot 4: selectedAccountId
- **Slot Name**: `selectedAccountId`
- **Type**: Text
- **Required**: Yes
- **Source**: From DRM card selection
- **Extraction**: From button message value

### 5. Workflow Configuration

Navigate to: **Workflows → Create New Workflow**

#### Workflow 1: triggerOTP

**Workflow Name**: `triggerOTP`

**Input Parameters**:
```json
{
  "phoneNumber": "{{phoneNumber}}",
  "dob": "{{dob}}"
}
```

**API Configuration**:
- **Method**: POST
- **URL**: `https://your-beeceptor-url.free.beeceptor.com/trigger-otp`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{env.YB_API_KEY}}"
  }
  ```
- **Body**:
  ```json
  {
    "phoneNumber": "{{phoneNumber}}",
    "dob": "{{dob}}"
  }
  ```

**Response Handling**:
- Extract `otp` from response
- Store in variable: `{{otpValue}}`
- Return to agent for user verification

**Error Handling**:
- If API fails, return error message: "I'm experiencing a technical issue. Please try again in a moment."

#### Workflow 2: getLoanAccounts (DRM)

**Workflow Name**: `getLoanAccounts`

**Type**: Dynamic Rich Media (DRM)

**Input Parameters**: None (user already authenticated via slots)

**API Configuration**:
- **Method**: GET
- **URL**: `https://your-beeceptor-url.free.beeceptor.com/get-loan-accounts`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{env.YB_API_KEY}}"
  }
  ```

**Token Optimization - Middle-man Projection**:

Create a **Data Transformation Step** before passing to LLM:

```javascript
// In Yellow.ai workflow, add a transformation function
function projectLoanAccounts(rawResponse) {
  const accounts = rawResponse.accounts || [];
  return accounts.map(account => ({
    loan_account_id: account.loan_account_id,
    type_of_loan: account.type_of_loan,
    tenure: account.tenure
  }));
}

// Apply projection
const projectedData = projectLoanAccounts(apiResponse);
```

**DRM Configuration**:
- **Type**: Interactive Cards
- **Card Template**:
  ```json
  {
    "title": "{{type_of_loan}}",
    "subtitle": "Account ID: {{loan_account_id}}",
    "description": "Tenure: {{tenure}}",
    "buttons": [
      {
        "type": "select",
        "label": "Select",
        "message": "{{loan_account_id}}"
      }
    ]
  }
  ```
- **CRITICAL**: The button's `message` value MUST contain the `loan_account_id`

**Response Format**:
```json
{
  "accounts": [
    {
      "loan_account_id": "LA123456",
      "type_of_loan": "Home Loan",
      "tenure": "20 years"
    }
  ]
}
```

#### Workflow 3: loanDetails (DRM)

**Workflow Name**: `loanDetails`

**Type**: Dynamic Rich Media (DRM)

**Input Parameters**:
```json
{
  "accountId": "{{selectedAccountId}}"
}
```

**API Configuration**:
- **Method**: GET
- **URL**: `https://your-beeceptor-url.free.beeceptor.com/get-loan-details?accountId={{selectedAccountId}}`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{env.YB_API_KEY}}"
  }
  ```

**DRM Configuration**:
- **Type**: Quick Replies
- **Template**:
  ```json
  {
    "text": "Your Loan Account Details:",
    "quickReplies": [
      {
        "type": "text",
        "title": "Tenure: {{tenure}}",
        "payload": "tenure_info"
      },
      {
        "type": "text",
        "title": "Interest Rate: {{interest_rate}}%",
        "payload": "interest_info"
      },
      {
        "type": "text",
        "title": "Principal Pending: ₹{{principal_pending}}",
        "payload": "principal_info"
      },
      {
        "type": "text",
        "title": "Interest Pending: ₹{{interest_pending}}",
        "payload": "interest_pending_info"
      },
      {
        "type": "text",
        "title": "Nominee: {{nominee}}",
        "payload": "nominee_info"
      },
      {
        "type": "button",
        "title": "Rate our chat",
        "payload": "redirect_to_csat",
        "url": "{{csatAgentUrl}}"
      }
    ]
  }
  ```

**Response Format**:
```json
{
  "tenure": "20 years",
  "interest_rate": "8.5",
  "principal_pending": "500000",
  "interest_pending": "25000",
  "nominee": "John Doe"
}
```

### 6. Edge Case Handling Configuration

#### Phone Number Correction Intent

**Intent Name**: `change_phone_number`

**Training Phrases**:
- "Wait, that's my old number"
- "I want to check for a different number"
- "That's not my current number"
- "I need to update my phone number"
- "That's wrong number"

**Intent Action**:
```javascript
// Clear slots
clearSlot("phoneNumber");
clearSlot("dob");
clearSlot("otp");

// Retain intent
setIntent("view_loan_details");

// Restart collection
requestSlot("phoneNumber");
```

### 7. Language Restriction Configuration

Navigate to: **Agent Settings → Language Settings**

**Configuration**:
- **Primary Language**: English (en)
- **Enable Language Detection**: Yes
- **Action on Non-English**: Reject with message
- **Rejection Message**: "I apologize, but I'm restricted to operating in English only. Please continue our conversation in English."

### 8. OTP Verification Logic

**Custom Function** (in Yellow.ai Functions):

```javascript
function verifyOTP(userOTP, generatedOTP) {
  // Valid OTPs: 1234, 5678, 7889, 1209
  const validOTPs = ["1234", "5678", "7889", "1209"];
  
  if (validOTPs.includes(userOTP) && userOTP === generatedOTP) {
    return { verified: true, message: "OTP verified successfully" };
  } else {
    return { verified: false, message: "The OTP you entered is incorrect. Please try again." };
  }
}
```

**Retry Logic**:
- Max retries: 2
- After 2 failed attempts, clear OTP slot and restart authentication

### 9. Session Management

**Session Timeout**: 5 minutes of inactivity
**Action on Timeout**: Clear all slots, require re-authentication
**Context Retention**: Yes (for intent retention during phone number change)

### 10. CSAT Integration

**Redirect Configuration**:
- **Button Action**: Redirect to CSAT Agent
- **CSAT Agent URL**: Configure in Yellow.ai dashboard
- **Pass Context**: User ID, session ID (optional)

## Testing Checklist

- [ ] Intent recognition works for loan details queries
- [ ] Phone number collection and validation
- [ ] DOB collection and format validation
- [ ] OTP trigger workflow calls API correctly
- [ ] OTP verification accepts valid OTPs (1234, 5678, 7889, 1209)
- [ ] OTP verification rejects invalid OTPs
- [ ] Phone number correction clears slots and restarts flow
- [ ] getLoanAccounts DRM displays cards correctly
- [ ] Card selection captures account ID in message value
- [ ] loanDetails DRM displays quick replies
- [ ] "Rate our chat" button redirects to CSAT agent
- [ ] Language restriction rejects non-English input
- [ ] Token optimization reduces response size
- [ ] API failure handling works correctly
- [ ] Session timeout clears slots

## Deployment Steps

1. Configure all workflows and APIs
2. Test each workflow individually
3. Test complete happy path flow
4. Test all edge cases
5. Deploy to development environment
6. Perform UAT (User Acceptance Testing)
7. Deploy to production environment

## Monitoring and Analytics

Set up monitoring for:
- Authentication success/failure rates
- OTP verification success rates
- API response times
- Token usage per conversation
- User drop-off points
- CSAT redirect success rate
