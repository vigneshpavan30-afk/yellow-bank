# Setup Instructions - Yellow Bank Agent

## 🎯 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `node-fetch` for API calls

### Step 2: Start Mock API Server

Open Terminal 1:
```bash
npm start
```

You should see:
```
🚀 Mock API Server running on http://localhost:3001

Available endpoints:
  POST http://localhost:3001/trigger-otp
  GET  http://localhost:3001/get-loan-accounts
  GET  http://localhost:3001/get-loan-details?accountId=LA123456

✅ Ready to test!
```

**Keep this terminal running!**

### Step 3: Test the Agent

Open Terminal 2:
```bash
npm test
```

You should see:
```
🏦 Yellow Bank - AI Banking Agent
==================================

Type your messages to interact with the agent.
Commands:
  - "reset" to restart the conversation
  - "state" to see current agent state
  - "exit" to quit

Example: "I want to check my loan details"
```

## 🧪 Test the Complete Flow

Try this conversation:

```
👤 You: I want to check my loan details

🤖 Agent: To access your loan details, I'll need to verify your identity. 
          Please provide your registered phone number.

👤 You: 9876543210

🤖 Agent: Thank you. Now, please provide your date of birth 
          (format: DD/MM/YYYY or DD-MM-YYYY).

👤 You: 15/01/1990

🤖 Agent: An OTP has been sent to your registered phone number. 
          Please provide the OTP you received.

🔐 [TEST MODE] Generated OTP: 1234

👤 You: 1234

🤖 Agent: Here are your loan accounts. Please select one to view details:

📋 Loan Accounts:
  1. Home Loan - LA123456 (20 years)
  2. Personal Loan - LA789012 (5 years)
  3. Car Loan - LA345678 (7 years)

💡 Tip: Type the account number (e.g., LA123456) or number (e.g., 1) to select

👤 You: 1

🤖 Agent: Your Loan Account Details:

📊 Loan Details:
  Account ID: LA123456
  Tenure: 20 years
  Interest Rate: 8.5%
  Principal Pending: ₹500000
  Interest Pending: ₹25000
  Nominee: John Doe

💡 Type "rate" or "feedback" to go to CSAT survey
```

## 🧪 Test Edge Cases

### Test Phone Number Correction
```
👤 You: I want to check my loan details
👤 You: 9876543210
👤 You: Wait, that's my old number
🤖 Agent: No problem! Let me update your information...
```

### Test Invalid OTP
```
👤 You: 9999
🤖 Agent: The OTP you entered is incorrect. Please try again.
```

### Test Language Restriction
```
👤 You: मुझे लोन देखना है
🤖 Agent: I apologize, but I'm restricted to operating in English only...
```

## 📁 Project Structure

```
yellow.ai/
├── agent/
│   ├── banking-agent.js      # Main agent implementation
│   ├── mock-api-server.js    # Local mock API server
│   └── test-agent.js         # Interactive CLI test
├── functions/                # Functions for Yellow.ai
├── config/                  # Configuration files
├── package.json             # Dependencies
└── README.md               # Main documentation
```

## 🔧 Troubleshooting

### Issue: "Cannot find module 'node-fetch'"
**Solution:** Run `npm install`

### Issue: "Port 3001 already in use"
**Solution:** 
- Stop any process using port 3001
- Or change PORT in `mock-api-server.js`

### Issue: API calls failing
**Solution:**
- Make sure mock API server is running
- Check `API_BASE_URL` in `test-agent.js` is `http://localhost:3001`

## 🚀 Next Steps

After testing locally:

1. **Deploy to Yellow.ai:**
   - Follow [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)
   - Use the tested code from `agent/banking-agent.js`
   - Copy functions from `functions/` directory

2. **Set up Beeceptor APIs:**
   - Follow [`MOCK_API_SETUP.md`](./MOCK_API_SETUP.md)
   - Use the same structure as the mock server

3. **Configure Yellow.ai Agent:**
   - Follow [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md)
   - Use tested configurations

## ✅ Verification Checklist

After setup, verify:

- [ ] Mock API server starts without errors
- [ ] Agent test CLI starts and responds
- [ ] Happy path flow works end-to-end
- [ ] Phone number correction works
- [ ] Invalid OTP handling works
- [ ] Language restriction works
- [ ] Token optimization reduces response size

---

**Ready to test!** Start with `npm start` and `npm test` in separate terminals.
