/**
 * Test Beeceptor /get-loan-accounts Endpoint
 * 
 * This script tests what your Beeceptor endpoint is actually returning
 */

const https = require('https');

const API_KEY = 'AIzaSyCSmKNYSnZ6raJ7SFYnXjrsiyXrl6LMc7Q';
const API_URL = 'https://yello-bank.free.beeceptor.com/get-loan-accounts';

console.log('Testing Beeceptor endpoint...\n');
console.log('URL:', API_URL);
console.log('API Key:', API_KEY);
console.log('─'.repeat(60));

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
};

const req = https.request(API_URL, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  console.log('─'.repeat(60));

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('\n✅ Response received:');
      console.log(JSON.stringify(json, null, 2));
      console.log('\n─'.repeat(60));
      
      // Analyze the response
      console.log('\n📊 Analysis:');
      
      if (json.accounts && Array.isArray(json.accounts)) {
        console.log(`✅ Has 'accounts' array with ${json.accounts.length} items`);
        
        if (json.accounts.length === 0) {
          console.log('❌ PROBLEM: accounts array is EMPTY!');
          console.log('   → This is why no loan accounts are showing');
        } else {
          console.log('✅ accounts array has items');
          
          json.accounts.forEach((account, index) => {
            console.log(`\n   Account ${index + 1}:`);
            console.log(`     - loan_account_id: ${account.loan_account_id || 'MISSING'}`);
            console.log(`     - type_of_loan: ${account.type_of_loan || 'MISSING'}`);
            console.log(`     - tenure: ${account.tenure || 'MISSING'}`);
            
            if (!account.loan_account_id) {
              console.log(`     ❌ Missing loan_account_id!`);
            }
            if (!account.type_of_loan) {
              console.log(`     ❌ Missing type_of_loan!`);
            }
            if (!account.tenure) {
              console.log(`     ❌ Missing tenure!`);
            }
          });
        }
      } else if (Array.isArray(json)) {
        console.log('⚠️  Response is a direct array (not wrapped in { accounts: [...] })');
        console.log(`   Array has ${json.length} items`);
        console.log('   → Agent can handle this, but preferred format is { accounts: [...] }');
      } else {
        console.log('❌ PROBLEM: Response does not have "accounts" array!');
        console.log('   Response structure:', Object.keys(json));
        console.log('   → This is why no loan accounts are showing');
      }
      
      if (!json.status) {
        console.log('\n⚠️  Response missing "status" field (optional but recommended)');
      }
      
    } catch (error) {
      console.error('\n❌ Error parsing JSON:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request error:', error.message);
  console.error('   → Check if the endpoint URL is correct');
  console.error('   → Check your internet connection');
});

req.end();
