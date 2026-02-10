# Quick Fix: Loan Accounts Not Showing

## Problem
Loan accounts (Home Loan, Car Loan, etc.) are not displaying in the frontend.

## Root Cause
The Beeceptor `/get-loan-accounts` endpoint is returning the wrong format or missing required fields.

## Solution

### Step 1: Update Beeceptor `/get-loan-accounts` Endpoint

Go to your Beeceptor dashboard: `https://yello-bank.free.beeceptor.com`

**Current Format (WRONG):**
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

**Required Format (CORRECT):**
```json
{
  "status": "success",
  "accounts": [
    {
      "loan_account_id": "LA123456",
      "type_of_loan": "Home Loan",
      "tenure": "20 years"
    },
    {
      "loan_account_id": "LA789012",
      "type_of_loan": "Car Loan",
      "tenure": "5 years"
    },
    {
      "loan_account_id": "LA345678",
      "type_of_loan": "Personal Loan",
      "tenure": "3 years"
    }
  ]
}
```

### Step 2: Field Mapping

The agent now supports multiple field names, but **preferred format** is:
- `loan_account_id` (not `accountNumber`)
- `type_of_loan` (not `accountType`)
- `tenure` (required - e.g., "20 years", "5 years")

### Step 3: Example Loan Accounts

Here are example accounts you can use:

```json
{
  "status": "success",
  "accounts": [
    {
      "loan_account_id": "LA123456",
      "type_of_loan": "Home Loan",
      "tenure": "20 years"
    },
    {
      "loan_account_id": "LA789012",
      "type_of_loan": "Car Loan",
      "tenure": "5 years"
    },
    {
      "loan_account_id": "LA345678",
      "type_of_loan": "Personal Loan",
      "tenure": "3 years"
    },
    {
      "loan_account_id": "LA901234",
      "type_of_loan": "Education Loan",
      "tenure": "10 years"
    }
  ]
}
```

### Step 4: Verify

1. Update the Beeceptor endpoint with the correct format
2. Test the endpoint directly: `https://yello-bank.free.beeceptor.com/get-loan-accounts`
3. Check Vercel logs for detailed API response logging
4. Refresh the frontend and try the flow again

## Debugging

The agent now logs:
- Raw API response
- Extracted accounts
- Projected accounts
- Any errors

Check Vercel function logs to see what the API is returning.

## Notes

- The agent now supports multiple formats, but the **preferred format** is shown above
- The `tenure` field is **required** - without it, accounts won't display
- Account IDs should start with "LA" (e.g., "LA123456")
- Loan types should be descriptive (e.g., "Home Loan", "Car Loan", "Personal Loan")
