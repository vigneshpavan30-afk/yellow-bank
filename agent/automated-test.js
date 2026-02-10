/**
 * Automated Test Script for Banking Agent
 * Tests the complete flow without user interaction
 */

const BankingAgent = require('./banking-agent');

// Use local mock server
process.env.API_BASE_URL = 'http://localhost:3001';

const agent = new BankingAgent();

// Test results
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n🧪 Yellow Bank Agent - Automated Tests');
  console.log('========================================\n');
  console.log('Waiting for API server to be ready...\n');
  await sleep(2000); // Wait for server to start

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

  // Test 3: DOB Collection
  console.log('\nTest 3: DOB Collection');
  console.log('─'.repeat(50));
  response = await agent.processMessage('15/01/1990');
  logTest('DOB Collection & OTP Trigger',
    response.action === 'collect_otp' && response.otpValue,
    `OTP Generated: ${response.otpValue}`);

  const generatedOTP = response.otpValue;

  // Test 4: OTP Verification
  console.log('\nTest 4: OTP Verification');
  console.log('─'.repeat(50));
  response = await agent.processMessage(generatedOTP);
  logTest('OTP Verification',
    response.action === 'show_accounts' && agent.getState().otpVerified === true,
    `Accounts found: ${response.accounts ? response.accounts.length : 0}`);

  // Test 5: Account Selection
  console.log('\nTest 5: Account Selection');
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

  // Test 6: Phone Number Correction
  console.log('\nTest 6: Phone Number Correction');
  console.log('─'.repeat(50));
  agent.reset();
  await agent.processMessage('I want to check my loan details');
  await agent.processMessage('9876543210');
  response = await agent.processMessage("Wait, that's my old number");
  logTest('Phone Number Correction',
    response.action === 'collect_phone' && agent.getState().phoneNumber === null,
    response.message);

  // Test 7: Invalid OTP
  console.log('\nTest 7: Invalid OTP Handling');
  console.log('─'.repeat(50));
  agent.reset();
  await agent.processMessage('I want to check my loan details');
  await agent.processMessage('9876543210');
  const otpResponse = await agent.processMessage('15/01/1990');
  const validOTP = otpResponse.otpValue;
  response = await agent.processMessage('9999'); // Invalid OTP
  logTest('Invalid OTP Rejection',
    response.action === 'retry_otp' && agent.getState().otpRetryCount === 1,
    `Retry count: ${agent.getState().otpRetryCount}`);

  // Test 8: Language Restriction
  console.log('\nTest 8: Language Restriction');
  console.log('─'.repeat(50));
  agent.reset();
  response = await agent.processMessage('मुझे लोन देखना है'); // Hindi
  logTest('Language Restriction',
    response.message.includes('English only'),
    response.message);

  // Test 9: Token Optimization
  console.log('\nTest 9: Token Optimization');
  console.log('─'.repeat(50));
  agent.reset();
  await agent.processMessage('I want to check my loan details');
  await agent.processMessage('9876543210');
  await agent.processMessage('15/01/1990');
  const otpResp = await agent.processMessage(otpResponse.otpValue || '1234');
  if (otpResp.accounts) {
    const account = otpResp.accounts[0];
    const fields = Object.keys(account);
    logTest('Token Optimization (Projection)',
      fields.length === 3 && fields.includes('loan_account_id') && 
      fields.includes('type_of_loan') && fields.includes('tenure'),
      `Fields after projection: ${fields.join(', ')} (should be only 3)`);
  } else {
    logTest('Token Optimization', false, 'No accounts to test');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('\n');

  if (testResults.failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});
