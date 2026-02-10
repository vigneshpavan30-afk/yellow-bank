/**
 * Self-contained test that mocks the API calls
 * No need for separate server
 */

const BankingAgent = require('./banking-agent');

// Mock fetch using a module interceptor
const Module = require('module');
const originalRequire = Module.prototype.require;

// Intercept require calls to mock node-fetch
Module.prototype.require = function(...args) {
  if (args[0] === 'node-fetch') {
    return function(url, options) {
      const urlStr = url.toString();
      
      // Mock OTP trigger
      if (urlStr.includes('/trigger-otp')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            status: "success",
            message: "OTP sent successfully",
            otp: "1234"
          }),
          ok: true,
          status: 200
        });
      }
      
      // Mock get loan accounts
      if (urlStr.includes('/get-loan-accounts')) {
        return Promise.resolve({
          json: () => Promise.resolve({
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
              },
              {
                loan_account_id: "LA789012",
                type_of_loan: "Personal Loan",
                tenure: "5 years",
                internal_bank_code: "HB-INT-456",
                audit_date: "2024-01-15T10:30:00Z",
                branch_code: "BR002",
                branch_name: "City Branch",
                account_status: "ACTIVE",
                created_date: "2022-03-20",
                last_modified: "2024-01-15T10:30:00Z",
                currency: "INR",
                loan_amount: "1000000",
                disbursement_date: "2022-03-25",
                maturity_date: "2027-03-25",
                interest_type: "FLOATING",
                processing_fee: "10000",
                insurance_premium: "5000",
                tax_id: "TAX-456123",
                compliance_flag: "Y",
                risk_category: "MEDIUM"
              }
            ]
          }),
          ok: true,
          status: 200
        });
      }
      
      // Mock get loan details
      if (urlStr.includes('/get-loan-details')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            status: "success",
            account_id: "LA123456",
            tenure: "20 years",
            interest_rate: "8.5",
            principal_pending: "500000",
            interest_pending: "25000",
            nominee: "John Doe"
          }),
          ok: true,
          status: 200
        });
      }
      
      // Default: return error
      return Promise.reject(new Error('Unknown endpoint'));
    };
  }
  return originalRequire.apply(this, args);
};

const agent = new (require('./banking-agent'))();

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message) {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
    if (message) console.log(`   ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name}`);
    if (message) console.log(`   ${message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Yellow Bank Agent - Automated Tests (Mocked APIs)');
  console.log('====================================================\n');

  // Test 1: Intent Recognition
  console.log('Test 1: Intent Recognition');
  console.log('─'.repeat(50));
  let response = await agent.processMessage('I want to check my loan details');
  logTest('Intent Recognition', 
    response.action === 'collect_phone' && response.message.includes('phone number'),
    response.message);

  // Test 2: Phone Number Collection
  console.log('\nTest 2: Phone Number Collection');
  console.log('─'.repeat(50));
  response = await agent.processMessage('9876543210');
  logTest('Phone Number Collection',
    response.action === 'collect_dob' && agent.getState().phoneNumber === '9876543210',
    response.message);

  // Test 3: DOB Collection & OTP Trigger
  console.log('\nTest 3: DOB Collection & OTP Trigger');
  console.log('─'.repeat(50));
  response = await agent.processMessage('15/01/1990');
  logTest('DOB Collection & OTP Trigger',
    response.action === 'collect_otp' && response.otpValue === '1234',
    `OTP Generated: ${response.otpValue}`);

  // Test 4: OTP Verification
  console.log('\nTest 4: OTP Verification');
  console.log('─'.repeat(50));
  response = await agent.processMessage('1234');
  logTest('OTP Verification',
    response.action === 'show_accounts' && agent.getState().otpVerified === true,
    `Accounts found: ${response.accounts ? response.accounts.length : 0}`);

  // Test 5: Token Optimization
  console.log('\nTest 5: Token Optimization (Projection)');
  console.log('─'.repeat(50));
  if (response.accounts && response.accounts.length > 0) {
    const account = response.accounts[0];
    const fields = Object.keys(account);
    logTest('Token Optimization',
      fields.length === 3 && 
      fields.includes('loan_account_id') && 
      fields.includes('type_of_loan') && 
      fields.includes('tenure'),
      `Fields: ${fields.join(', ')} (should be only 3, not 15+)`);
  } else {
    logTest('Token Optimization', false, 'No accounts to test');
  }

  // Test 6: Account Selection
  console.log('\nTest 6: Account Selection & Details Retrieval');
  console.log('─'.repeat(50));
  if (response.accounts && response.accounts.length > 0) {
    const accountId = response.accounts[0].loan_account_id;
    response = await agent.processMessage(accountId);
    logTest('Account Selection & Details Retrieval',
      response.action === 'show_details' && response.details,
      `Account: ${response.details.account_id}, Tenure: ${response.details.tenure}`);
  } else {
    logTest('Account Selection', false, 'No accounts available');
  }

  // Test 7: Phone Number Correction
  console.log('\nTest 7: Phone Number Correction');
  console.log('─'.repeat(50));
  agent.reset();
  await agent.processMessage('I want to check my loan details');
  await agent.processMessage('9876543210');
  response = await agent.processMessage("Wait, that's my old number");
  logTest('Phone Number Correction',
    response.action === 'collect_phone' && agent.getState().phoneNumber === null,
    response.message);

  // Test 8: Invalid OTP
  console.log('\nTest 8: Invalid OTP Handling');
  console.log('─'.repeat(50));
  agent.reset();
  await agent.processMessage('I want to check my loan details');
  await agent.processMessage('9876543210');
  await agent.processMessage('15/01/1990');
  response = await agent.processMessage('9999'); // Invalid OTP
  logTest('Invalid OTP Rejection',
    response.action === 'retry_otp' && agent.getState().otpRetryCount === 1,
    `Retry count: ${agent.getState().otpRetryCount}`);

  // Test 9: Language Restriction
  console.log('\nTest 9: Language Restriction');
  console.log('─'.repeat(50));
  agent.reset();
  response = await agent.processMessage('मुझे लोन देखना है'); // Hindi
  logTest('Language Restriction',
    response.message.includes('English only'),
    response.message);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  const total = testResults.passed + testResults.failed;
  console.log(`📈 Success Rate: ${total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0}%`);
  console.log('\n');

  if (testResults.failed === 0) {
    console.log('🎉 All tests passed!');
    console.log('\n✅ Agent is working correctly!');
    console.log('📝 Next steps:');
    console.log('   1. Deploy to Yellow.ai using DEPLOYMENT_GUIDE.md');
    console.log('   2. Set up Beeceptor APIs using MOCK_API_SETUP.md');
    console.log('   3. Configure workflows in Yellow.ai dashboard\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test execution error:', error);
  console.error(error.stack);
  process.exit(1);
});
