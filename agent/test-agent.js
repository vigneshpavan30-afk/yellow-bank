/**
 * Interactive CLI Test for Banking Agent
 * Run this to test the complete agent flow
 */

const readline = require('readline');
const BankingAgent = require('./banking-agent');

// Use local mock server
process.env.API_BASE_URL = 'http://localhost:3001';
// Set API key for testing (replace with your actual key)
process.env.YB_API_KEY = process.env.YB_API_KEY || 'AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q';

const agent = new BankingAgent();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🏦 Yellow Bank - AI Banking Agent');
console.log('==================================\n');
console.log('Type your messages to interact with the agent.');
console.log('Commands:');
console.log('  - "reset" to restart the conversation');
console.log('  - "state" to see current agent state');
console.log('  - "exit" to quit\n');
console.log('Example: "I want to check my loan details"\n');

function displayResponse(response) {
  console.log('\n🤖 Agent:', response.message);
  
  if (response.accounts && response.accounts.length > 0) {
    console.log('\n📋 Loan Accounts:');
    response.accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.type_of_loan} - ${account.loan_account_id} (${account.tenure})`);
    });
    console.log('\n💡 Tip: Type the account number (e.g., LA123456) or number (e.g., 1) to select\n');
  }
  
  if (response.details) {
    console.log('\n📊 Loan Details:');
    console.log(`  Account ID: ${response.details.account_id}`);
    console.log(`  Tenure: ${response.details.tenure}`);
    console.log(`  Interest Rate: ${response.details.interest_rate}%`);
    console.log(`  Principal Pending: ₹${response.details.principal_pending}`);
    console.log(`  Interest Pending: ₹${response.details.interest_pending}`);
    console.log(`  Nominee: ${response.details.nominee}`);
    console.log('\n💡 Type "rate" or "feedback" to go to CSAT survey\n');
  }
  
  if (response.otpValue) {
    console.log(`\n🔐 [TEST MODE] Generated OTP: ${response.otpValue}`);
    console.log('   (In production, this would be sent via SMS)\n');
  }
  
  if (response.action === 'redirect_to_csat') {
    console.log(`\n📝 Redirecting to CSAT survey at: ${response.csatUrl}\n`);
  }
  
  console.log('─'.repeat(50));
}

function promptUser() {
  rl.question('\n👤 You: ', async (input) => {
    const userInput = input.trim();
    
    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      return;
    }
    
    if (userInput.toLowerCase() === 'reset') {
      agent.reset();
      console.log('\n🔄 Agent reset. Starting fresh...\n');
      promptUser();
      return;
    }
    
    if (userInput.toLowerCase() === 'state') {
      const state = agent.getState();
      console.log('\n📊 Current Agent State:');
      console.log(JSON.stringify(state, null, 2));
      console.log();
      promptUser();
      return;
    }
    
    if (!userInput) {
      promptUser();
      return;
    }
    
    try {
      const response = await agent.processMessage(userInput);
      displayResponse(response);
      promptUser();
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      promptUser();
    }
  });
}

// Start the conversation
console.log('💬 Starting conversation...\n');
promptUser();
