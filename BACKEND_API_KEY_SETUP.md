# Backend API Key Setup

## Overview

The mock API server now validates the API key for all endpoints. All requests must include the API key in the Authorization header.

## API Key

**Key**: `AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY`

## Authentication

All API endpoints require authentication via the `Authorization` header:

```
Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY
```

## Protected Endpoints

### 1. POST /trigger-otp
**Headers Required:**
```
Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY
Content-Type: application/json
```

**Request Body:**
```json
{
  "phoneNumber": "9876543210",
  "dob": "15/01/1990"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

**Response (Unauthorized - 401):**
```json
{
  "status": "error",
  "message": "Unauthorized. Invalid or missing API key.",
  "error_code": "AUTH_001"
}
```

### 2. GET /get-loan-accounts
**Headers Required:**
```
Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY
Content-Type: application/json
```

**Response (Success):**
```json
{
  "status": "success",
  "accounts": [...]
}
```

**Response (Unauthorized - 401):**
```json
{
  "status": "error",
  "message": "Unauthorized. Invalid or missing API key.",
  "error_code": "AUTH_001"
}
```

### 3. GET /get-loan-details
**Headers Required:**
```
Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY
Content-Type: application/json
```

**Query Parameters:**
- `accountId` (required): Loan account ID (e.g., `LA123456`)

**Response (Success):**
```json
{
  "status": "success",
  "account_id": "LA123456",
  "tenure": "20 years",
  ...
}
```

**Response (Unauthorized - 401):**
```json
{
  "status": "error",
  "message": "Unauthorized. Invalid or missing API key.",
  "error_code": "AUTH_001"
}
```

## Testing

### Using curl

**Trigger OTP:**
```bash
curl -X POST http://localhost:3001/trigger-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY" \
  -d '{"phoneNumber":"9876543210","dob":"15/01/1990"}'
```

**Get Loan Accounts:**
```bash
curl -X GET http://localhost:3001/get-loan-accounts \
  -H "Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY"
```

**Get Loan Details:**
```bash
curl -X GET "http://localhost:3001/get-loan-details?accountId=LA123456" \
  -H "Authorization: Bearer AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY"
```

### Using Postman

1. Set **Authorization** type to **Bearer Token**
2. Enter token: `AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY`
3. Add header: `Content-Type: application/json`
4. Make request

## Error Handling

### Missing API Key
If the `Authorization` header is missing:
- **Status Code**: 401 Unauthorized
- **Response**: Error message indicating missing API key

### Invalid API Key
If the API key doesn't match:
- **Status Code**: 401 Unauthorized
- **Response**: Error message indicating invalid API key

## Agent Configuration

The agent is already configured to send the API key automatically:

- ✅ `agent/banking-agent.js` - All API calls include Authorization header
- ✅ `agent/test-agent.js` - API key set for local testing
- ✅ Mock server validates the key

## Production Deployment

For production backend:

1. **Store API key securely** (environment variable, secrets manager)
2. **Validate on every request** (as implemented in mock server)
3. **Return 401 for invalid/missing keys**
4. **Log authentication failures** for security monitoring

## Security Notes

⚠️ **Important:**
- Never expose API key in client-side code
- Use HTTPS in production
- Rotate keys periodically
- Monitor for unauthorized access attempts
- Rate limit API endpoints

---

**Backend API key authentication is now active!** ✅
