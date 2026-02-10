// Quick API test
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API server...');
    const response = await fetch('http://localhost:3001/get-loan-accounts');
    const data = await response.json();
    console.log('✅ API Server is running!');
    console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200));
    return true;
  } catch (error) {
    console.log('❌ API Server not ready:', error.message);
    return false;
  }
}

testAPI();
