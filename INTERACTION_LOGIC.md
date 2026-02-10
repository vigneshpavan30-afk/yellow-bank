# Yellow Bank - AI Banking Agent Interaction Logic

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Initiates Conversation              │
│              "I want to check my loan details"              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Intent Recognition: Loan Details               │
│         (Patterns: "loan details", "check loan", etc.)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 1: Request Phone Number                   │
│    "Please provide your registered phone number"            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              User Provides Phone Number                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 2: Request Date of Birth                  │
│    "Please provide your date of birth (DD/MM/YYYY)"         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              User Provides DOB                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Step 3: Trigger OTP Workflow                        │
│    Workflow: triggerOTP(phoneNumber, dob)                    │
│    Mock API Returns: 1234, 5678, 7889, or 1209              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Agent: "An OTP has been sent. Please provide OTP" │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              User Provides OTP                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
            ┌───────────┐  ┌──────────────┐
            │  Valid    │  │   Invalid    │
            │   OTP     │  │     OTP      │
            └─────┬─────┘  └──────┬───────┘
                  │               │
                  │               │ (Max 2 retries)
                  │               │
                  ▼               ▼
        ┌─────────────────────────────┐
        │   Authentication Successful  │
        └─────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         Step 4: Get Loan Accounts (Workflow A)              │
│    Workflow: getLoanAccounts DRM                             │
│    API Returns: List of Loan Account IDs                    │
│    Display: Interactive Cards (with Account ID in message)  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              User Selects Loan Account ID                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Step 5: Get Loan Details (Workflow B)               │
│    Workflow: loanDetails DRM (with selected Account ID)      │
│    API Returns: tenure, interest_rate, principal_pending,   │
│                  interest_pending, nominee                   │
│    Display: Quick Replies + "Rate our chat" button          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│    User Clicks "Rate our chat" → Redirect to CSAT Agent     │
└─────────────────────────────────────────────────────────────┘
```

## Edge Case Flows

### Edge Case 1: Phone Number Correction

```
┌─────────────────────────────────────────────────────────────┐
│  User: "Wait, that's my old number"                         │
│  (Can occur after phone number or after loan list)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent Action:                                             │
│  1. Clear Phone Number slot                                 │
│  2. Clear DOB slot                                          │
│  3. Retain Intent: View Loan Details                        │
│  4. Restart collection flow                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "No problem! Please provide your current            │
│          registered phone number."                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Continue with normal flow (Phone → DOB → OTP)              │
└─────────────────────────────────────────────────────────────┘
```

### Edge Case 2: OTP Verification Failure

```
┌─────────────────────────────────────────────────────────────┐
│  User Provides Incorrect OTP                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "The OTP you entered is incorrect. Please try again"│
│  Retry Count: 1                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  User Provides OTP Again                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
            ┌───────────┐  ┌──────────────┐
            │  Valid    │  │   Invalid    │
            │   OTP     │  │     OTP      │
            └─────┬─────┘  └──────┬───────┘
                  │               │
                  │               │ (Retry Count: 2)
                  │               │
                  │               ▼
                  │      ┌─────────────────┐
                  │      │  Max Retries    │
                  │      │  Re-authenticate│
                  │      └─────────────────┘
                  │
                  ▼
        ┌─────────────────────────────┐
        │   Continue to Loan Accounts  │
        └─────────────────────────────┘
```

### Edge Case 3: API Failure

```
┌─────────────────────────────────────────────────────────────┐
│  API Call Fails (OTP, Loan Accounts, or Loan Details)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "I'm experiencing a technical issue.                │
│          Please try again in a moment, or contact support." │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Option 1: Retry workflow                                   │
│  Option 2: End session with support contact info            │
└─────────────────────────────────────────────────────────────┘
```

### Edge Case 4: Language Restriction

```
┌─────────────────────────────────────────────────────────────┐
│  User: [Message in non-English language]                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent: "I apologize, but I'm restricted to operating        │
│          in English only. Please continue our conversation  │
│          in English."                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Wait for English input, do not process other languages      │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Authentication State
- **phoneNumber**: String (10 digits)
- **dob**: String (DD/MM/YYYY format)
- **otpVerified**: Boolean
- **otpRetryCount**: Integer (0-2)

### Intent State
- **primaryIntent**: "view_loan_details"
- **currentStep**: "collecting_phone" | "collecting_dob" | "verifying_otp" | "showing_accounts" | "showing_details"

### Workflow State
- **selectedAccountId**: String (set after user selects account)
- **loanAccounts**: Array (cached after Workflow A)
- **loanDetails**: Object (cached after Workflow B)

## Slot Management

### Required Slots
1. **phoneNumber**: Collected in Step 1
2. **dob**: Collected in Step 2
3. **otp**: Collected in Step 3 (verified, then cleared)
4. **selectedAccountId**: Collected in Step 4 (from card selection)

### Slot Clearing Rules
- Clear phoneNumber and dob when user requests number change
- Clear otp after successful verification
- Do NOT clear selectedAccountId until session ends

## Workflow Integration Points

### Workflow A: getLoanAccounts
**Trigger**: After successful OTP verification
**Input**: None (user already authenticated)
**Output**: Array of loan accounts
**DRM Type**: Interactive Cards
**Token Optimization**: Apply projection to extract only Loan Account ID, Type of Loan, Tenure

### Workflow B: loanDetails
**Trigger**: After user selects a loan account
**Input**: `{ "accountId": "<selected_account_id>" }`
**Output**: Loan details object
**DRM Type**: Quick Replies
**Action**: Include "Rate our chat" button → CSAT agent

### Workflow: triggerOTP
**Trigger**: After collecting Phone Number and DOB
**Input**: `{ "phoneNumber": "<phone>", "dob": "<dob>" }`
**Output**: OTP value (1234, 5678, 7889, or 1209)
**Action**: Request OTP from user, then verify

## Error Recovery Strategies

1. **Invalid Input**: Request correction with clear format guidance
2. **API Timeout**: Retry once, then show error message
3. **Authentication Failure**: Clear slots, restart authentication flow
4. **Session Expiry**: Clear all slots, require full re-authentication

## Conversation Examples

### Happy Path Example
```
User: I want to check my loan details
Agent: To access your loan details, I'll need to verify your identity. Please provide your registered phone number.
User: 9876543210
Agent: Thank you. Now, please provide your date of birth (format: DD/MM/YYYY or DD-MM-YYYY).
User: 15/01/1990
Agent: An OTP has been sent to your registered phone number. Please provide the OTP you received.
User: 1234
Agent: [Displays loan account cards]
User: [Selects account LA123456]
Agent: [Displays loan details with "Rate our chat" button]
```

### Phone Number Correction Example
```
User: 9876543210
Agent: Thank you. Now, please provide your date of birth...
User: Wait, that's my old number
Agent: No problem! Let me update your information. Please provide your current registered phone number.
User: 9876543211
Agent: Thank you. Now, please provide your date of birth (format: DD/MM/YYYY or DD-MM-YYYY).
```

### Language Restriction Example
```
User: मुझे अपने लोन विवरण देखने हैं
Agent: I apologize, but I'm restricted to operating in English only. Please continue our conversation in English.
User: I want to check my loan details
Agent: To access your loan details, I'll need to verify your identity...
```
