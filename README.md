<<<<<<< HEAD
# Yellow Bank - AI Banking Agent Implementation Guide

## Overview

This repository contains the complete design and implementation guide for a Gen AI Banking Agent for "Yellow Bank" built on the Yellow.ai platform. The agent handles user authentication, multi-step API workflows, token optimization, and Dynamic Rich Media (DRM) rendering.

## Project Structure

```
yellow.ai/
├── README.md                      # This file - Project overview and quick start
├── QUICK_START.md                 # Quick 5-minute setup guide
├── IMPLEMENTATION_CHECKLIST.md    # Step-by-step implementation checklist
├── SYSTEM_PROMPT.md              # Complete system prompt for Banking Agent
├── INTERACTION_LOGIC.md          # Detailed interaction flow and edge cases
├── YELLOW_AI_CONFIG.md           # Step-by-step Yellow.ai configuration guide
├── MOCK_API_SETUP.md             # Beeceptor mock API setup instructions
├── CSAT_AGENT_CONFIG.md          # Customer Satisfaction survey agent config
├── TOKEN_OPTIMIZATION_GUIDE.md   # Token optimization implementation guide
├── config/
│   ├── agent-config.json         # Banking agent JSON configuration
│   ├── drm-templates.json        # DRM template configurations
│   └── csat-agent-config.json    # CSAT agent JSON configuration
└── functions/
    ├── projectLoanAccounts.js    # Token optimization function
    ├── verifyOTP.js              # OTP verification function
    └── clearAuthSlots.js         # Clear authentication slots function
```

## Features

### Core Functionality
- ✅ User authentication (Phone Number + DOB + OTP)
- ✅ Multi-step API workflow handling
- ✅ Dynamic Rich Media (DRM) card rendering
- ✅ Loan account retrieval and display
- ✅ Loan details display with quick replies
- ✅ CSAT survey integration

### Edge Case Handling
- ✅ Phone number correction flow
- ✅ OTP retry mechanism (max 2 attempts)
- ✅ API failure handling
- ✅ Invalid input validation
- ✅ Language restriction (English only)

### Technical Features
- ✅ Token optimization for large JSON responses (~93% reduction)
- ✅ Middle-man projection method
- ✅ Session management
- ✅ Context retention

## Quick Start Guide

**🚀 For fastest setup, start with [`QUICK_START.md`](./QUICK_START.md) - it's a condensed 30-minute guide!**

**📋 For detailed step-by-step, follow [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md)**

### Step 1: Prerequisites

1. **Yellow.ai Account**
   - Sign up at https://docs.yellow.ai/
   - Create a new bot/agent in your dashboard

2. **Beeceptor Account** (for mock APIs)
   - Sign up at https://beeceptor.com
   - Create an endpoint for mock APIs

### Step 2: Set Up Mock APIs

Follow the instructions in [`MOCK_API_SETUP.md`](./MOCK_API_SETUP.md) to:
- Create OTP trigger API endpoint
- Create loan accounts retrieval API
- Create loan details API
- Configure error responses

**Quick Setup**:
1. Go to https://beeceptor.com
2. Create endpoint: `yellow-bank-api`
3. Configure the three endpoints as per the guide
4. Copy your endpoint URL for Yellow.ai configuration

### Step 3: Configure Banking Agent

Follow the step-by-step guide in [`YELLOW_AI_CONFIG.md`](./YELLOW_AI_CONFIG.md):

1. **Basic Settings**
   - Set agent name and language (English only)
   - Configure system prompt from [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md)

2. **Intents & Slots**
   - Create `view_loan_details` intent
   - Configure slots: `phoneNumber`, `dob`, `otp`, `selectedAccountId`

3. **Workflows**
   - Configure `triggerOTP` workflow
   - Configure `getLoanAccounts` DRM workflow (with token optimization)
   - Configure `loanDetails` DRM workflow

4. **Edge Cases**
   - Set up phone number correction intent
   - Configure language restriction
   - Set up OTP retry logic

### Step 4: Configure CSAT Agent

Follow [`CSAT_AGENT_CONFIG.md`](./CSAT_AGENT_CONFIG.md) to:
- Create CSAT survey agent
- Configure rating collection (Good, Average, Bad)
- Set up optional feedback collection
- Integrate with banking agent redirect

### Step 5: Implement Token Optimization

Follow [`TOKEN_OPTIMIZATION_GUIDE.md`](./TOKEN_OPTIMIZATION_GUIDE.md) to:
- Add projection function in workflow
- Filter API responses to only required fields
- Monitor token usage and savings

### Step 6: Test Complete Flow

**Happy Path Test**:
1. User: "I want to check my loan details"
2. Provide phone number: `9876543210`
3. Provide DOB: `15/01/1990`
4. Receive OTP (one of: 1234, 5678, 7889, 1209)
5. Enter OTP
6. View loan account cards
7. Select an account
8. View loan details
9. Click "Rate our chat"
10. Complete CSAT survey

**Edge Case Tests**:
- Phone number correction flow
- Invalid OTP (test retry mechanism)
- Language restriction (test non-English input)
- API failure scenarios

## Implementation Files

### Ready-to-Use Code Files

**Configuration Files** (`config/`):
- `agent-config.json` - Complete banking agent configuration (import-ready format)
- `drm-templates.json` - DRM templates for loan accounts and details
- `csat-agent-config.json` - CSAT agent configuration

**Function Files** (`functions/`):
- `projectLoanAccounts.js` - Token optimization function (copy-paste ready)
- `verifyOTP.js` - OTP verification function (copy-paste ready)
- `clearAuthSlots.js` - Clear authentication slots function (copy-paste ready)

**Quick Guides**:
- `QUICK_START.md` - 30-minute quick setup guide
- `IMPLEMENTATION_CHECKLIST.md` - Detailed step-by-step checklist with checkboxes

## Documentation Files

### [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md)
Complete system prompt for the Banking Agent including:
- Agent identity and capabilities
- Authentication flow
- Loan account retrieval flow
- Edge case handling
- Token optimization strategy
- Security guidelines

### [`INTERACTION_LOGIC.md`](./INTERACTION_LOGIC.md)
Detailed interaction flow diagrams and logic including:
- Complete flow diagram
- Edge case flow diagrams
- State management
- Slot management
- Workflow integration points
- Conversation examples

### [`YELLOW_AI_CONFIG.md`](./YELLOW_AI_CONFIG.md)
Step-by-step Yellow.ai platform configuration:
- Agent settings
- Intent configuration
- Slot setup
- Workflow configuration
- DRM setup
- Testing checklist

### [`MOCK_API_SETUP.md`](./MOCK_API_SETUP.md)
Complete guide for setting up mock APIs using Beeceptor:
- Endpoint creation
- API configuration for all three endpoints
- Error response setup
- Testing instructions

### [`CSAT_AGENT_CONFIG.md`](./CSAT_AGENT_CONFIG.md)
Customer Satisfaction survey agent configuration:
- Agent setup
- Rating collection
- Feedback collection
- Integration with banking agent

### [`TOKEN_OPTIMIZATION_GUIDE.md`](./TOKEN_OPTIMIZATION_GUIDE.md)
Token optimization implementation guide:
- Problem statement
- Projection method implementation
- Code examples
- Token usage comparison
- Best practices

## Key Workflows

### Workflow A: getLoanAccounts
- **Trigger**: After successful OTP verification
- **Type**: Dynamic Rich Media (DRM) - Interactive Cards
- **Token Optimization**: Projects API response to only 3 fields
- **Output**: Loan account cards with selectable buttons

### Workflow B: loanDetails
- **Trigger**: After user selects a loan account
- **Type**: Dynamic Rich Media (DRM) - Quick Replies
- **Input**: Selected account ID
- **Output**: Loan details with "Rate our chat" button

### Workflow: triggerOTP
- **Trigger**: After collecting Phone Number and DOB
- **Type**: API call
- **Output**: OTP value (1234, 5678, 7889, or 1209)

## Token Optimization

The `getLoanAccounts` workflow implements token optimization by:
1. Receiving full API response (15+ fields per account)
2. Applying projection function to extract only 3 fields:
   - `loan_account_id`
   - `type_of_loan`
   - `tenure`
3. Passing only projected data to LLM

**Result**: ~93% token reduction (1,350 tokens → 90 tokens for 3 accounts)

See [`TOKEN_OPTIMIZATION_GUIDE.md`](./TOKEN_OPTIMIZATION_GUIDE.md) for complete implementation.

## Edge Cases Handled

1. **Phone Number Correction**
   - User can correct phone number at any point
   - Clears authentication slots
   - Retains intent
   - Restarts collection flow

2. **OTP Verification**
   - Max 2 retry attempts
   - Clear error messages
   - Re-authentication after max retries

3. **Language Restriction**
   - Only English allowed
   - Polite rejection message
   - No processing of non-English input

4. **API Failures**
   - Graceful error handling
   - User-friendly error messages
   - Retry mechanisms

## Testing Checklist

### Authentication Flow
- [ ] Intent recognition works
- [ ] Phone number collection and validation
- [ ] DOB collection and format validation
- [ ] OTP trigger workflow
- [ ] OTP verification (all 4 valid OTPs: 1234, 5678, 7889, 1209)
- [ ] Invalid OTP rejection
- [ ] OTP retry mechanism (max 2 attempts)

### Loan Account Flow
- [ ] getLoanAccounts DRM displays cards
- [ ] Card selection captures account ID
- [ ] Token optimization works (check token usage)
- [ ] Multiple accounts display correctly

### Loan Details Flow
- [ ] loanDetails DRM displays quick replies
- [ ] All loan details shown correctly
- [ ] "Rate our chat" button redirects to CSAT

### Edge Cases
- [ ] Phone number correction clears slots and restarts
- [ ] Language restriction rejects non-English
- [ ] API failure handling works
- [ ] Session timeout clears slots

### CSAT Flow
- [ ] CSAT agent starts on redirect
- [ ] Rating collection works (Good, Average, Bad)
- [ ] Optional feedback collection
- [ ] Thank you message displays

## Resources

- **Yellow.ai Documentation**: https://docs.yellow.ai/
- **Beeceptor**: https://beeceptor.com
- **Yellow.ai Platform**: Access via your dashboard

## Support and Troubleshooting

### Common Issues

1. **API not responding**
   - Check Beeceptor endpoint is active
   - Verify API URLs in workflow configuration
   - Check request/response format

2. **OTP not working**
   - Verify OTP values in mock API (1234, 5678, 7889, 1209)
   - Check OTP verification logic
   - Ensure OTP slot is configured correctly

3. **DRM not displaying**
   - Verify DRM template format
   - Check data structure matches template
   - Ensure account ID is in button message value

4. **Token optimization not working**
   - Verify projection function is added
   - Check function is called before DRM
   - Validate projected data structure

### Getting Help

1. Review the relevant documentation file
2. Check Yellow.ai documentation
3. Test individual workflows separately
4. Use Beeceptor request logs to debug API calls

## Next Steps

After completing the setup:

1. **Test thoroughly** using the testing checklist
2. **Monitor token usage** to verify optimization
3. **Collect CSAT feedback** to improve the agent
4. **Iterate and improve** based on user feedback
5. **Deploy to production** after UAT

## License

This is a project implementation guide for Yellow Bank's AI Banking Agent.

---

**Note**: This is a comprehensive implementation guide. Follow each document in sequence for best results. Start with mock API setup, then configure the banking agent, followed by CSAT agent, and finally implement token optimization.
=======
# yellow-bank
it is a bank agent
>>>>>>> a6d5d7b964765b47e4321ff19b326f45d363f38c
