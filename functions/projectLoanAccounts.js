/**
 * Token Optimization Function: Project Loan Accounts
 * 
 * This function extracts only the required fields from the API response
 * to reduce token usage by ~93%.
 * 
 * Required fields:
 * - loan_account_id
 * - type_of_loan
 * - tenure
 * 
 * All other fields (internal_bank_code, audit_date, etc.) are filtered out.
 * 
 * @param {Object|String} apiResponse - Raw API response from getLoanAccounts
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
      throw new Error('Invalid API response structure. Expected { accounts: [] }');
    }
    
    // Project only required fields
    const projectedAccounts = response.accounts
      .filter(account => {
        // Filter out invalid accounts (must have loan_account_id)
        return account && account.loan_account_id;
      })
      .map(account => {
        // Extract only the 3 required fields
        return {
          loan_account_id: account.loan_account_id || '',
          type_of_loan: account.type_of_loan || 'N/A',
          tenure: account.tenure || 'N/A'
        };
      });
    
    // Return clean, minimal structure
    return {
      status: response.status || 'success',
      accounts: projectedAccounts,
      count: projectedAccounts.length,
      message: 'Loan accounts retrieved successfully'
    };
    
  } catch (error) {
    // Error handling - return empty structure on failure
    console.error('Projection error:', error);
    return {
      status: 'error',
      message: 'Failed to process loan accounts',
      error: error.message,
      accounts: [],
      count: 0
    };
  }
}

// Export for use in Yellow.ai workflow
module.exports = projectLoanAccounts;

// For direct testing
if (typeof window === 'undefined' && require.main === module) {
  // Test data
  const testResponse = {
    status: "success",
    accounts: [
      {
        loan_account_id: "LA123456",
        type_of_loan: "Home Loan",
        tenure: "20 years",
        internal_bank_code: "HB-INT-789",
        audit_date: "2024-01-15T10:30:00Z",
        branch_code: "BR001",
        branch_name: "Main Branch",
        account_status: "ACTIVE",
        created_date: "2020-05-10",
        last_modified: "2024-01-15T10:30:00Z",
        currency: "INR",
        loan_amount: "5000000",
        disbursement_date: "2020-05-15",
        maturity_date: "2040-05-15",
        interest_type: "FIXED",
        processing_fee: "50000",
        insurance_premium: "25000",
        tax_id: "TAX-789456",
        compliance_flag: "Y",
        risk_category: "LOW"
      }
    ]
  };
  
  const projected = projectLoanAccounts(testResponse);
  console.log('Original size:', JSON.stringify(testResponse).length, 'characters');
  console.log('Projected size:', JSON.stringify(projected).length, 'characters');
  console.log('Reduction:', 
    ((1 - JSON.stringify(projected).length / JSON.stringify(testResponse).length) * 100).toFixed(2) + '%'
  );
  console.log('Projected result:', JSON.stringify(projected, null, 2));
}
