# Loan Details API Format

## Problem
Loan details are not showing all fields like account number, loan amount, interest pending, etc.

## Solution

### Beeceptor `/get-loan-details` Endpoint Format

**Endpoint**: `GET /get-loan-details?accountId=LA123456`

**Required Response Format**:
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

### Field Mapping (Agent supports multiple formats)

The agent now supports these field name variations:

| Preferred | Alternatives |
|-----------|-------------|
| `loan_account_id` | `account_id`, `accountNumber` |
| `type_of_loan` | `accountType`, `type` |
| `tenure` | `tenure_years`, `duration` |
| `interest_rate` | `interestRate`, `rate` |
| `principal_pending` | `principalPending`, `principal` |
| `interest_pending` | `interestPending`, `interest` |
| `loan_amount` | `loanAmount`, `principal_amount`, `principalAmount` |
| `outstanding_balance` | `outstandingBalance`, `balance` |
| `emi_amount` | `emiAmount`, `emi` |
| `disbursement_date` | `disbursementDate` |
| `maturity_date` | `maturityDate` |
| `next_emi_date` | `nextEmiDate`, `nextPaymentDate` |
| `total_paid` | `totalPaid` |
| `last_payment_date` | `lastPaymentDate` |
| `nominee` | `nominee_name` |

### Example Response for Different Account IDs

**For accountId=LA123456 (Home Loan)**:
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

**For accountId=LA789012 (Personal Loan)**:
```json
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
```

**For accountId=LA345678 (Car Loan)**:
```json
{
  "loan_account_id": "LA345678",
  "type_of_loan": "Car Loan",
  "tenure": "7 years",
  "principal_amount": 800000,
  "interest_rate": 9.5,
  "principal_pending": 400000,
  "interest_pending": 30000,
  "nominee": "Robert Johnson",
  "disbursement_date": "2021-08-15",
  "maturity_date": "2028-08-15",
  "emi_amount": 15000,
  "next_emi_date": "2024-02-20",
  "total_paid": 400000,
  "outstanding_balance": 430000,
  "status": "Active",
  "last_payment_date": "2024-01-20"
}
```

### Important Notes

1. **API Key**: Must include `Authorization: Bearer AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q` header
2. **Query Parameter**: Use `accountId` (e.g., `?accountId=LA123456`)
3. **Response Code**: Return `200` for success
4. **Field Types**: 
   - Numbers can be strings or numbers (e.g., `5000000` or `"5000000"`)
   - Dates should be in `YYYY-MM-DD` format
   - Percentages can be numbers or strings (e.g., `8.5` or `"8.5"`)

### Frontend Display

The frontend will now display all these fields:
- Account Number
- Loan Type
- Tenure
- Loan Amount
- Interest Rate
- Principal Pending
- Interest Pending
- Outstanding Balance
- EMI Amount
- Total Paid
- Disbursement Date
- Maturity Date
- Next EMI Date
- Last Payment Date
- Nominee
- Status

All currency values are formatted with ₹ symbol and Indian number formatting.
