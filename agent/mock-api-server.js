/**
 * Mock API Server for Testing
 * Simulates the Beeceptor APIs locally
 */

const http = require('http');
const url = require('url');

const PORT = 3001;

// API Key for authentication
const API_KEY = process.env.YB_API_KEY || 'AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY';

// Mock data
const mockOTPs = ['1234', '5678', '7889', '1209'];
let currentOTPIndex = 0;

const mockLoanAccounts = {
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
    },
    {
      loan_account_id: "LA345678",
      type_of_loan: "Car Loan",
      tenure: "7 years",
      internal_bank_code: "HB-INT-123",
      audit_date: "2024-01-15T10:30:00Z",
      branch_code: "BR003",
      branch_name: "Suburban Branch",
      account_status: "ACTIVE",
      created_date: "2021-08-10",
      last_modified: "2024-01-15T10:30:00Z",
      currency: "INR",
      loan_amount: "800000",
      disbursement_date: "2021-08-15",
      maturity_date: "2028-08-15",
      interest_type: "FIXED",
      processing_fee: "8000",
      insurance_premium: "15000",
      tax_id: "TAX-123789",
      compliance_flag: "Y",
      risk_category: "LOW"
    }
  ]
};

const mockLoanDetails = {
  "LA123456": {
    status: "success",
    account_id: "LA123456",
    tenure: "20 years",
    interest_rate: "8.5",
    principal_pending: "500000",
    interest_pending: "25000",
    nominee: "John Doe"
  },
  "LA789012": {
    status: "success",
    account_id: "LA789012",
    tenure: "5 years",
    interest_rate: "12.0",
    principal_pending: "200000",
    interest_pending: "15000",
    nominee: "Jane Smith"
  },
  "LA345678": {
    status: "success",
    account_id: "LA345678",
    tenure: "7 years",
    interest_rate: "9.5",
    principal_pending: "300000",
    interest_pending: "18000",
    nominee: "Robert Johnson"
  }
};

// Helper function to validate API key
function validateApiKey(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }
  
  // Extract Bearer token
  const token = authHeader.replace('Bearer ', '').trim();
  return token === API_KEY;
}

// Helper function to send unauthorized response
function sendUnauthorized(res) {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: "error",
    message: "Unauthorized. Invalid or missing API key.",
    error_code: "AUTH_001"
  }));
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Validate API key for all endpoints (except OPTIONS)
  if (!validateApiKey(req)) {
    sendUnauthorized(res);
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Reduced logging for performance

  // Route: POST /trigger-otp
  if (path === '/trigger-otp' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('OTP Request:', data);
        
        // Rotate through OTPs
        const otp = mockOTPs[currentOTPIndex % mockOTPs.length];
        currentOTPIndex++;
        
        res.writeHead(200);
        res.end(JSON.stringify({
          status: "success",
          message: "OTP sent successfully",
          otp: otp
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          status: "error",
          message: "Invalid request"
        }));
      }
    });
    return;
  }

  // Route: GET /get-loan-accounts
  if (path === '/get-loan-accounts' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockLoanAccounts));
    return;
  }

  // Route: GET /get-loan-details
  if (path === '/get-loan-details' && method === 'GET') {
    const accountId = parsedUrl.query.accountId;
    
    if (!accountId) {
      res.writeHead(400);
      res.end(JSON.stringify({
        status: "error",
        message: "accountId parameter is required"
      }));
      return;
    }

    const details = mockLoanDetails[accountId];
    if (details) {
      res.writeHead(200);
      res.end(JSON.stringify(details));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        status: "error",
        message: "Loan account not found"
      }));
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end(JSON.stringify({
    status: "error",
    message: "Route not found"
  }));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`\n🔑 API Key Authentication: ENABLED`);
  console.log(`   API Key: ${API_KEY.substring(0, 20)}...`);
  console.log(`\nAvailable endpoints (require Authorization header):`);
  console.log(`  POST http://localhost:${PORT}/trigger-otp`);
  console.log(`  GET  http://localhost:${PORT}/get-loan-accounts`);
  console.log(`  GET  http://localhost:${PORT}/get-loan-details?accountId=LA123456`);
  console.log(`\n📝 Header format:`);
  console.log(`   Authorization: Bearer ${API_KEY.substring(0, 20)}...`);
  console.log(`\n✅ Ready to test!\n`);
});

module.exports = server;
