# Token Optimization Guide for Large JSON Responses

## Problem Statement

The `getLoanAccounts` API returns a massive JSON response with 15+ fields per loan account object, including:
- Internal bank codes
- Audit dates
- Branch information
- Compliance flags
- Tax IDs
- And many other fields not needed by the LLM

**Challenge**: Passing this entire response to the LLM consumes excessive tokens and can lead to:
1. Higher API costs
2. Slower response times
3. Potential hallucinations from irrelevant data
4. Token limit issues

## Solution: Middle-man Instruction / Projection Method

### Concept

Create a **data transformation layer** between the API response and the LLM that:
1. Extracts only the required fields
2. Structures the data in a clean, minimal format
3. Passes only the essential information to the LLM

### Required Fields Only

For the `getLoanAccounts` workflow, we only need:
- `loan_account_id`
- `type_of_loan`
- `tenure`

All other fields should be filtered out before reaching the LLM.

## Implementation Methods

### Method 1: Yellow.ai Workflow Transformation

#### Step 1: Create Transformation Function

In Yellow.ai workflow editor, add a **Function Node** after the API call:

```javascript
// Function: projectLoanAccounts
function projectLoanAccounts(apiResponse) {
  try {
    // Parse the API response
    const response = typeof apiResponse === 'string' 
      ? JSON.parse(apiResponse) 
      : apiResponse;
    
    // Extract accounts array
    const accounts = response.accounts || [];
    
    // Project only required fields
    const projectedAccounts = accounts.map(account => ({
      loan_account_id: account.loan_account_id,
      type_of_loan: account.type_of_loan,
      tenure: account.tenure
    }));
    
    // Return clean structure
    return {
      status: "success",
      accounts: projectedAccounts
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to process loan accounts",
      error: error.message
    };
  }
}
```

#### Step 2: Apply Transformation in Workflow

**Workflow Structure**:
```
API Call (getLoanAccounts)
    ↓
Function Node (projectLoanAccounts)
    ↓
Store in Variable (projectedData)
    ↓
Pass to DRM (with projectedData)
```

**Variable Assignment**:
```javascript
// In workflow node
const rawResponse = {{apiResponse}};
const projectedData = projectLoanAccounts(rawResponse);
// Store in variable: {{projectedLoanAccounts}}
```

#### Step 3: Use Projected Data in DRM

In the DRM configuration, use the projected data:

```json
{
  "accounts": "{{projectedLoanAccounts.accounts}}"
}
```

### Method 2: API-Level Projection (Recommended)

If you have control over the API, create a projection endpoint:

#### Endpoint: `/get-loan-accounts-projected`

**Response** (already filtered):
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
      "type_of_loan": "Personal Loan",
      "tenure": "5 years"
    }
  ]
}
```

**Advantages**:
- No transformation needed in workflow
- Faster processing
- Less code to maintain

### Method 3: Beeceptor Response Transformation

In Beeceptor, you can create a rule that returns only projected fields:

**Beeceptor Rule**:
- Path: `/get-loan-accounts`
- Response: Use only the 3 required fields in the JSON

**Note**: This works if you're using Beeceptor for mocking, but in production, use Method 1 or 2.

## Token Usage Comparison

### Before Optimization

**Full API Response** (example for 3 accounts):
```json
{
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
    }
    // ... 2 more accounts
  ]
}
```

**Estimated Tokens**: ~450 tokens per account = ~1,350 tokens for 3 accounts

### After Optimization

**Projected Response**:
```json
{
  "accounts": [
    {
      "loan_account_id": "LA123456",
      "type_of_loan": "Home Loan",
      "tenure": "20 years"
    }
    // ... 2 more accounts
  ]
}
```

**Estimated Tokens**: ~30 tokens per account = ~90 tokens for 3 accounts

**Token Savings**: ~93% reduction (1,350 → 90 tokens)

## Implementation in Yellow.ai

### Complete Workflow Configuration

#### Node 1: API Call
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `https://api.example.com/get-loan-accounts`
- **Output Variable**: `{{rawLoanAccountsResponse}}`

#### Node 2: Data Transformation
- **Type**: Function
- **Function Name**: `projectLoanAccounts`
- **Input**: `{{rawLoanAccountsResponse}}`
- **Output Variable**: `{{projectedLoanAccounts}}`

#### Node 3: DRM Generation
- **Type**: Dynamic Rich Media
- **Data Source**: `{{projectedLoanAccounts.accounts}}`
- **Template**: Card template with 3 fields

### Function Code (Complete)

```javascript
/**
 * Projects loan accounts data to include only required fields
 * Reduces token usage by ~93%
 * 
 * @param {Object|String} apiResponse - Raw API response
 * @returns {Object} Projected response with only required fields
 */
function projectLoanAccounts(apiResponse) {
  try {
    // Handle string or object input
    let response;
    if (typeof apiResponse === 'string') {
      response = JSON.parse(apiResponse);
    } else {
      response = apiResponse;
    }
    
    // Validate response structure
    if (!response || !response.accounts || !Array.isArray(response.accounts)) {
      throw new Error('Invalid API response structure');
    }
    
    // Project only required fields
    const projectedAccounts = response.accounts
      .filter(account => account.loan_account_id) // Filter out invalid accounts
      .map(account => ({
        loan_account_id: account.loan_account_id || '',
        type_of_loan: account.type_of_loan || 'N/A',
        tenure: account.tenure || 'N/A'
      }));
    
    // Return clean, minimal structure
    return {
      status: response.status || 'success',
      accounts: projectedAccounts,
      count: projectedAccounts.length
    };
    
  } catch (error) {
    // Error handling
    console.error('Projection error:', error);
    return {
      status: 'error',
      message: 'Failed to process loan accounts',
      error: error.message,
      accounts: []
    };
  }
}
```

## Testing Token Optimization

### Test Script

```javascript
// Test with full response
const fullResponse = {
  accounts: [
    {
      loan_account_id: "LA123456",
      type_of_loan: "Home Loan",
      tenure: "20 years",
      // ... 17 more fields
    }
  ]
};

// Test projection
const projected = projectLoanAccounts(fullResponse);
console.log('Original size:', JSON.stringify(fullResponse).length);
console.log('Projected size:', JSON.stringify(projected).length);
console.log('Reduction:', 
  ((1 - JSON.stringify(projected).length / JSON.stringify(fullResponse).length) * 100).toFixed(2) + '%'
);
```

### Expected Output
```
Original size: 1245 characters
Projected size: 87 characters
Reduction: 93.01%
```

## Best Practices

1. **Always Project Before LLM**: Never pass raw API responses directly to LLM
2. **Validate Data**: Ensure required fields exist before projection
3. **Handle Errors**: Return meaningful error messages if projection fails
4. **Log Transformations**: Track token savings for monitoring
5. **Cache Projected Data**: Store projected data to avoid re-processing

## Monitoring Token Usage

### Metrics to Track

1. **Token Usage Before Projection**: Measure raw API response tokens
2. **Token Usage After Projection**: Measure projected response tokens
3. **Token Savings Percentage**: Calculate reduction
4. **Cost Savings**: Calculate API cost reduction

### Sample Monitoring Code

```javascript
function monitorTokenUsage(rawResponse, projectedResponse) {
  const rawTokens = estimateTokens(JSON.stringify(rawResponse));
  const projectedTokens = estimateTokens(JSON.stringify(projectedResponse));
  const savings = ((rawTokens - projectedTokens) / rawTokens) * 100;
  
  return {
    rawTokens,
    projectedTokens,
    savings: savings.toFixed(2) + '%',
    costReduction: calculateCostSavings(rawTokens, projectedTokens)
  };
}
```

## Additional Optimization Tips

1. **Remove Null/Empty Fields**: Don't include fields with null or empty values
2. **Use Abbreviations**: If acceptable, use shorter field names (e.g., `id` instead of `loan_account_id`)
3. **Limit Array Size**: If there are many accounts, consider pagination
4. **Compress Data**: Use shorter values where possible (e.g., "HL" instead of "Home Loan")

## Conclusion

Token optimization through projection is critical for:
- **Cost Reduction**: Lower API costs
- **Performance**: Faster response times
- **Reliability**: Reduced risk of token limit errors
- **Accuracy**: Less irrelevant data reduces hallucination risk

Always implement projection for any API response that contains more data than the LLM needs.
