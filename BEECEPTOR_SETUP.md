# Beeceptor Endpoint Configuration

## Your Endpoint
**URL**: `https://yello-bank.free.beeceptor.com`

## Required Endpoints

### 1. POST /trigger-otp

**Request:**
```json
{
  "phoneNumber": "9876543210",
  "dob": "01/01/1990"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

**Headers to check:**
- `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q`

### 2. GET /get-loan-accounts

**Response:**
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

**Headers to check:**
- `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q`

### 3. GET /get-loan-details?accountId=LA123456

**Response:**
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

**Headers to check:**
- `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q`

## How to Configure on Beeceptor

1. Go to https://beeceptor.com
2. Login to your account
3. Find your endpoint: `yello-bank`
4. Click "Add Rule" for each endpoint
5. Set the path (e.g., `/trigger-otp`)
6. Set the method (POST or GET)
7. Set the response body (copy from above)
8. Save the rule

## Testing

After configuration, test with:

```bash
# Test OTP trigger
curl -X POST https://yello-bank.free.beeceptor.com/trigger-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q" \
  -d '{"phoneNumber":"9876543210","dob":"01/01/1990"}'

# Test loan accounts
curl -X GET https://yello-bank.free.beeceptor.com/get-loan-accounts \
  -H "Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q"

# Test loan details
curl -X GET "https://yello-bank.free.beeceptor.com/get-loan-details?accountId=LA123456" \
  -H "Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q"
```
