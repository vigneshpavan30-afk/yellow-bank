# Mock API Setup Guide using Beeceptor

## Overview
This guide will help you set up mock APIs for the Yellow Bank agent using Beeceptor (https://beeceptor.com).

## Prerequisites
1. Access to https://beeceptor.com
2. Basic understanding of REST APIs
3. JSON format knowledge

## Step 1: Create Beeceptor Endpoint

1. Go to https://beeceptor.com
2. Sign up or log in
3. Click "Create Endpoint"
4. Enter endpoint name: `yellow-bank-api` (or your preferred name)
5. Copy your endpoint URL: `https://yellow-bank-api.free.beeceptor.com`

## Step 2: Configure OTP Trigger API

### Endpoint: `/trigger-otp`

**Method**: POST

**Request Body**:
```json
{
  "phoneNumber": "9876543210",
  "dob": "15/01/1990"
}
```

**Response Configuration** (in Beeceptor):

Click on your endpoint → "Rules" → "Add Rule"

**Rule Configuration**:
- **Method**: POST
- **Path**: `/trigger-otp`
- **Response Code**: 200
- **Response Body**:
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

**Multiple OTP Values** (for testing):

To return different OTPs, you can create multiple rules or use conditional logic:

**Option 1: Random OTP Selection**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "{{random(['1234', '5678', '7889', '1209'])}}"
}
```

**Option 2: Sequential OTPs** (create 4 separate rules with different responses)

**Rule 1**:
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

**Rule 2**:
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "5678"
}
```

**Rule 3**:
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "7889"
}
```

**Rule 4**:
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "1209"
}
```

**Testing**:
```bash
curl -X POST https://yellow-bank-api.free.beeceptor.com/trigger-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","dob":"15/01/1990"}'
```

## Step 3: Configure Get Loan Accounts API

### Endpoint: `/get-loan-accounts`

**Method**: GET

**Headers** (optional, for authentication simulation):
```
Authorization: Bearer <token>
```

**Response Configuration**:

**Full Response** (with 15+ fields for token optimization testing):
```json
{
  "status": "success",
  "accounts": [
    {
      "loan_account_id": "LA123456",
      "type_of_loan": "Home Loan",
      "tenure": "20 years",
      "internal_bank_code": "HB-INT-789",
      "audit_date": "2024-01-15T10:30:00Z",
      "branch_code": "BR001",
      "branch_name": "Main Branch",
      "account_status": "ACTIVE",
      "created_date": "2020-05-10",
      "last_modified": "2024-01-15T10:30:00Z",
      "currency": "INR",
      "loan_amount": "5000000",
      "disbursement_date": "2020-05-15",
      "maturity_date": "2040-05-15",
      "interest_type": "FIXED",
      "processing_fee": "50000",
      "insurance_premium": "25000",
      "tax_id": "TAX-789456",
      "compliance_flag": "Y",
      "risk_category": "LOW"
    },
    {
      "loan_account_id": "LA789012",
      "type_of_loan": "Personal Loan",
      "tenure": "5 years",
      "internal_bank_code": "HB-INT-456",
      "audit_date": "2024-01-15T10:30:00Z",
      "branch_code": "BR002",
      "branch_name": "City Branch",
      "account_status": "ACTIVE",
      "created_date": "2022-03-20",
      "last_modified": "2024-01-15T10:30:00Z",
      "currency": "INR",
      "loan_amount": "1000000",
      "disbursement_date": "2022-03-25",
      "maturity_date": "2027-03-25",
      "interest_type": "FLOATING",
      "processing_fee": "10000",
      "insurance_premium": "5000",
      "tax_id": "TAX-456123",
      "compliance_flag": "Y",
      "risk_category": "MEDIUM"
    },
    {
      "loan_account_id": "LA345678",
      "type_of_loan": "Car Loan",
      "tenure": "7 years",
      "internal_bank_code": "HB-INT-123",
      "audit_date": "2024-01-15T10:30:00Z",
      "branch_code": "BR003",
      "branch_name": "Suburban Branch",
      "account_status": "ACTIVE",
      "created_date": "2021-08-10",
      "last_modified": "2024-01-15T10:30:00Z",
      "currency": "INR",
      "loan_amount": "800000",
      "disbursement_date": "2021-08-15",
      "maturity_date": "2028-08-15",
      "interest_type": "FIXED",
      "processing_fee": "8000",
      "insurance_premium": "15000",
      "tax_id": "TAX-123789",
      "compliance_flag": "Y",
      "risk_category": "LOW"
    }
  ]
}
```

**Note**: This response contains 20+ fields per account. The workflow should project this to only 3 fields (loan_account_id, type_of_loan, tenure) before passing to the LLM.

**Testing**:
```bash
curl -X GET https://yellow-bank-api.free.beeceptor.com/get-loan-accounts \
  -H "Authorization: Bearer test-token"
```

## Step 4: Configure Get Loan Details API

### Endpoint: `/get-loan-details`

**Method**: GET

**Query Parameters**:
- `accountId`: The selected loan account ID (e.g., `LA123456`)

**Response Configuration**:

```json
{
  "status": "success",
  "account_id": "{{query.accountId}}",
  "tenure": "20 years",
  "interest_rate": "8.5",
  "principal_pending": "500000",
  "interest_pending": "25000",
  "nominee": "John Doe"
}
```

**Multiple Account Responses** (create conditional rules):

**For LA123456**:
```json
{
  "status": "success",
  "account_id": "LA123456",
  "tenure": "20 years",
  "interest_rate": "8.5",
  "principal_pending": "500000",
  "interest_pending": "25000",
  "nominee": "John Doe"
}
```

**For LA789012**:
```json
{
  "status": "success",
  "account_id": "LA789012",
  "tenure": "5 years",
  "interest_rate": "12.0",
  "principal_pending": "200000",
  "interest_pending": "15000",
  "nominee": "Jane Smith"
}
```

**For LA345678**:
```json
{
  "status": "success",
  "account_id": "LA345678",
  "tenure": "7 years",
  "interest_rate": "9.5",
  "principal_pending": "300000",
  "interest_pending": "18000",
  "nominee": "Robert Johnson"
}
```

**Testing**:
```bash
curl -X GET "https://yellow-bank-api.free.beeceptor.com/get-loan-details?accountId=LA123456" \
  -H "Authorization: Bearer test-token"
```

## Step 5: Error Response Configuration

### Endpoint: `/trigger-otp` (Error Case)

Create an additional rule for error simulation:

**Rule Configuration**:
- **Condition**: When `phoneNumber` contains "999" (for testing)
- **Response Code**: 400
- **Response Body**:
```json
{
  "status": "error",
  "message": "Invalid phone number or DOB",
  "error_code": "AUTH_001"
}
```

### Endpoint: `/get-loan-accounts` (Error Case)

**Response Code**: 500
**Response Body**:
```json
{
  "status": "error",
  "message": "Unable to retrieve loan accounts at this time",
  "error_code": "API_001"
}
```

### Endpoint: `/get-loan-details` (Error Case)

**Response Code**: 404
**Response Body**:
```json
{
  "status": "error",
  "message": "Loan account not found",
  "error_code": "API_002"
}
```

## Step 6: Beeceptor Rule Priority

In Beeceptor, rules are evaluated in order. Set priorities:

1. **Error cases** (highest priority)
2. **Specific account responses** (for loan details)
3. **Default responses** (lowest priority)

## Step 7: Testing All Endpoints

### Test Script (using curl)

```bash
# Test OTP Trigger
echo "Testing OTP Trigger..."
curl -X POST https://yellow-bank-api.free.beeceptor.com/trigger-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","dob":"15/01/1990"}'

# Test Get Loan Accounts
echo -e "\n\nTesting Get Loan Accounts..."
curl -X GET https://yellow-bank-api.free.beeceptor.com/get-loan-accounts \
  -H "Authorization: Bearer test-token"

# Test Get Loan Details
echo -e "\n\nTesting Get Loan Details..."
curl -X GET "https://yellow-bank-api.free.beeceptor.com/get-loan-details?accountId=LA123456" \
  -H "Authorization: Bearer test-token"
```

## Step 8: Integration with Yellow.ai

1. Copy your Beeceptor endpoint URL
2. In Yellow.ai workflow configuration, use:
   - `https://yellow-bank-api.free.beeceptor.com/trigger-otp`
   - `https://yellow-bank-api.free.beeceptor.com/get-loan-accounts`
   - `https://yellow-bank-api.free.beeceptor.com/get-loan-details`
3. Configure headers and request bodies as per workflow configuration

## Step 9: Monitoring API Calls

Beeceptor provides:
- **Request Logs**: View all incoming requests
- **Response Logs**: View all responses sent
- **Analytics**: Request counts, response times

Use these to debug and monitor your agent's API calls.

## Troubleshooting

### Issue: API not responding
- Check Beeceptor endpoint is active
- Verify rule configuration
- Check request method matches (GET vs POST)

### Issue: Wrong response format
- Verify JSON structure in Beeceptor rules
- Check response headers (Content-Type: application/json)

### Issue: Conditional responses not working
- Check rule priority order
- Verify condition syntax in Beeceptor

## Best Practices

1. **Use descriptive endpoint names**: Makes debugging easier
2. **Document your mock responses**: Keep a reference of what each endpoint returns
3. **Test error cases**: Ensure your agent handles failures gracefully
4. **Monitor request logs**: Check if agent is calling APIs correctly
5. **Use variables**: Beeceptor supports dynamic values for testing different scenarios
