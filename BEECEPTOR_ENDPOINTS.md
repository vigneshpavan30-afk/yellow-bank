# Beeceptor Endpoint Configuration - Exact Format

## Current Status

✅ `/get-loan-accounts` - EXISTS but needs format update
❌ `/trigger-otp` - NEEDS TO BE CREATED
❌ `/get-loan-details` - NEEDS TO BE CREATED

## 1. POST /trigger-otp

**Current Status**: Not configured (shows "nothing is configured")

**Configuration:**
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

**Important**: 
- Must check `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q` header
- Return 401 if header is missing or wrong
- OTP can be: `1234`, `5678`, `7889`, or `1209`

---

## 2. GET /get-loan-accounts

**Current Status**: ✅ Configured but WRONG FORMAT

**Current Response** (WRONG):
```json
{
  "accounts": [
    {
      "accountNumber": "38465935",
      "accountType": "Personal Loan",
      "balance": "20297.94",
      "currency": "USD"
    }
  ]
}
```

**Required Response** (CORRECT):
```json
[
  {
    "loan_account_id": "LA123456",
    "type_of_loan": "Home Loan",
    "tenure": "20 years",
    "principal_amount": 5000000,
    "interest_rate": 8.5,
    "principal_pending": 3500000,
    "interest_pending": 50000,
    "nominee": "John Doe",
    "disbursement_date": "2020-01-15",
    "maturity_date": "2040-01-15",
    "emi_amount": 45000,
    "next_emi_date": "2024-02-01",
    "total_paid": 1500000,
    "outstanding_balance": 3550000,
    "status": "Active",
    "last_payment_date": "2024-01-01"
  },
  {
    "loan_account_id": "LA789012",
    "type_of_loan": "Personal Loan",
    "tenure": "5 years",
    "principal_amount": 500000,
    "interest_rate": 12.0,
    "principal_pending": 300000,
    "interest_pending": 25000,
    "nominee": "Jane Smith",
    "disbursement_date": "2022-06-01",
    "maturity_date": "2027-06-01",
    "emi_amount": 12000,
    "next_emi_date": "2024-02-15",
    "total_paid": 200000,
    "outstanding_balance": 325000,
    "status": "Active",
    "last_payment_date": "2024-01-15"
  }
]
```

**Key Changes Needed**:
- Return an ARRAY directly (not wrapped in `{"accounts": [...]}`)
- Use `loan_account_id` (not `accountNumber`)
- Use `type_of_loan` (not `accountType`)
- Add `tenure` field
- Include all the other fields shown above

**Important**: 
- Must check `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q` header
- Return 401 if header is missing or wrong

---

## 3. GET /get-loan-details

**Current Status**: Not configured

**Configuration:**
- **Method**: GET
- **Path**: `/get-loan-details`
- **Query Parameter**: `accountId` (e.g., `?accountId=LA123456`)
- **Response Code**: 200
- **Response Body**:
```json
{
  "loan_account_id": "LA123456",
  "type_of_loan": "Home Loan",
  "tenure": "20 years",
  "principal_amount": 5000000,
  "interest_rate": 8.5,
  "principal_pending": 3500000,
  "interest_pending": 50000,
  "nominee": "John Doe",
  "disbursement_date": "2020-01-15",
  "maturity_date": "2040-01-15",
  "emi_amount": 45000,
  "next_emi_date": "2024-02-01",
  "total_paid": 1500000,
  "outstanding_balance": 3550000,
  "status": "Active",
  "last_payment_date": "2024-01-01"
}
```

**Important**: 
- Must check `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q` header
- Return 401 if header is missing or wrong
- Use the `accountId` query parameter to return the correct loan details

---

## Quick Fix Steps

1. **Update `/get-loan-accounts`**:
   - Edit the existing rule
   - Change response to return array directly
   - Update field names to match format above

2. **Create `/trigger-otp`**:
   - Add new rule
   - Method: POST
   - Response: JSON with `status`, `message`, and `otp` fields

3. **Create `/get-loan-details`**:
   - Add new rule
   - Method: GET
   - Response: Single loan object (use `accountId` to determine which one)
