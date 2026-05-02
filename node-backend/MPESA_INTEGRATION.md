# M-Pesa Integration Guide

## Overview
This Node.js backend includes M-Pesa payment integration using the M-Pesa Daraja API. The implementation supports STK push payments, status queries, and callback handling.

## Configuration

### Environment Variables
Add the following to your `.env` file:

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_API_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=http://localhost:8080/api/payments/mpesa/callback
```

### Getting M-Pesa Credentials

1. **For Sandbox Testing:**
   - Visit [Safaricom Daraja API](https://developer.safaricom.co.ke/)
   - Create an account and register your app
   - Get Consumer Key and Consumer Secret
   - Request for API testing credentials
   - Use test phone numbers: 254708374149, 254701729424

2. **For Production:**
   - Submit your app for live testing
   - Get live credentials from Safaricom
   - Update environment variables with production credentials
   - Change `MPESA_API_BASE_URL` to `https://api.safaricom.co.ke` (remove sandbox)

## API Endpoints

### 1. Initiate M2U Payment
**Endpoint:** `POST /api/payments/initiate-m2u`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "phoneNumber": "254708374149",
  "amount": 100,
  "description": "Payment for Order #123"
}
```

**Response (Success):**
```json
{
  "paymentId": 1,
  "checkoutRequestId": "ws_CO_DMZ_123456789",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "customerMessage": "Enter your M-Pesa PIN to complete this transaction."
}
```

**Response (Error):**
```json
{
  "message": "Invalid phone number format. Use format: 254XXXXXXXXX"
}
```

### 2. Query Payment Status
**Endpoint:** `GET /api/payments/:id/status`

**Authentication:** Required (Bearer token)

**Response (Success):**
```json
{
  "paymentId": 1,
  "status": "COMPLETED",
  "resultCode": "0",
  "resultDescription": "The service request has been processed successfully.",
  "amount": 100
}
```

**Response (Error):**
```json
{
  "message": "Payment not found"
}
```

### 3. Get Payment Details
**Endpoint:** `GET /api/payments/:id`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "id": 1,
  "userId": 5,
  "amount": 100,
  "currency": "KES",
  "status": "COMPLETED",
  "method": "MPESA",
  "transactionId": "MPG45Q5J63",
  "description": "Payment for Order #123",
  "createdAt": "2026-05-02T10:30:00.000Z",
  "updatedAt": "2026-05-02T10:35:00.000Z",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 4. Get User Payments
**Endpoint:** `GET /api/payments/user/:userId`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:** Array of payment objects

### 5. Get All Payments (Admin Only)
**Endpoint:** `GET /api/payments`

**Authentication:** Required (Bearer token + Admin role)

**Query Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:** Array of payment objects

### 6. Cancel Payment
**Endpoint:** `POST /api/payments/:id/cancel`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "message": "Payment cancelled successfully",
  "payment": { ... }
}
```

### 7. Refund Payment (Admin Only)
**Endpoint:** `POST /api/payments/:id/refund`

**Authentication:** Required (Bearer token + Admin role)

**Request Body:**
```json
{
  "reason": "Duplicate transaction"
}
```

**Response:**
```json
{
  "message": "Payment refunded successfully",
  "payment": { ... }
}
```

### 8. M-Pesa Callback
**Endpoint:** `POST /api/payments/mpesa/callback`

**Authentication:** None (Public endpoint for M-Pesa webhooks)

**Note:** This endpoint is called by M-Pesa servers when payment is completed. No client-side action needed.

## Payment Status Types

- **PENDING**: Payment initiated, awaiting user action or confirmation
- **COMPLETED**: Payment successfully completed
- **FAILED**: Payment failed or was rejected
- **CANCELLED**: Payment cancelled by user

## Phone Number Format

M-Pesa requires phone numbers in the format: `254XXXXXXXXX`
- **254** is the country code for Kenya
- **XXXXXXXXX** is the 9-digit phone number

Examples:
- ✅ Valid: `254708374149`
- ❌ Invalid: `0708374149` (missing country code)
- ❌ Invalid: `+254708374149` (has + sign)

## Testing with Sandbox

### Test Credentials
- Short Code: `174379`
- Consumer Key: Get from Daraja dashboard
- Consumer Secret: Get from Daraja dashboard

### Test Phone Numbers
- `254708374149` - Sandbox user 1
- `254701729424` - Sandbox user 2

### Testing Flow

1. **Register a test user:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

2. **Login to get access token:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Initiate payment:**
   ```bash
   curl -X POST http://localhost:8080/api/payments/initiate-m2u \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "254708374149",
       "amount": 100,
       "description": "Test payment"
     }'
   ```

4. **On your test phone, accept the M-Pesa prompt** (or use sandbox test flow)

5. **Query payment status:**
   ```bash
   curl -X GET http://localhost:8080/api/payments/1/status \
     -H "Authorization: Bearer <your_access_token>"
   ```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid phone number format` | Phone number not in 254XXXXXXXXX format | Use correct format |
| `Amount must be greater than 0` | Amount is zero or negative | Use positive amount |
| `Access denied for user 'root'@'localhost'` | Wrong MySQL credentials | Update DB_USER, DB_PASSWORD in .env |
| `M-Pesa error: INVALID_INITIATOR_IDENTITY` | Short code mismatch | Verify MPESA_SHORT_CODE in .env |
| `Cannot cancel completed payment` | Trying to cancel completed payment | Only cancel pending/failed payments |

## Database

### Payments Table
```sql
CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  method ENUM('MPESA', 'STRIPE') NOT NULL,
  transactionId VARCHAR(255) UNIQUE,
  description TEXT,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES Users(id)
);
```

## Security Considerations

1. **API Credentials:** Never commit `.env` with real credentials to version control
2. **Callback Validation:** Always validate callback signatures from M-Pesa in production
3. **HTTPS:** Use HTTPS in production for all M-Pesa communications
4. **Rate Limiting:** Implement rate limiting on payment endpoints
5. **Access Control:** Ensure proper authorization checks on sensitive endpoints

## Implementation Files

- `config/mpesa.js` - M-Pesa configuration loader
- `services/mpesaService.js` - M-Pesa API client (OAuth, STK push, status queries)
- `services/paymentService.js` - Payment business logic
- `controllers/paymentController.js` - Payment request handlers
- `routes/payments.js` - Payment route definitions
- `models/Payment.js` - Payment database model

## Troubleshooting

### "Access denied for user 'root'@'localhost'"
- Ensure MySQL is running: `mysql -u brian -ppassword -e "SELECT 1"`
- Update DB credentials in `.env`

### M-Pesa STK Push Not Appearing
- Verify phone number is correct format (254XXXXXXXXX)
- Check M-Pesa API credentials in `.env`
- Verify callback URL is accessible by M-Pesa (use ngrok in development)
- Check M-Pesa sandbox dashboard for errors

### Payment Status Always PENDING
- Verify `MPESA_CALLBACK_URL` is correct
- For local development, use ngrok: `ngrok http 8080`
- Update callback URL in `.env`: `http://your-ngrok-url/api/payments/mpesa/callback`
- Restart server and try again

## Next Steps

1. Get M-Pesa sandbox credentials from Safaricom Daraja
2. Update `.env` with credentials
3. Test with sandbox endpoints
4. Integrate with order management system
5. Deploy to production with live credentials

## References

- [Safaricom Daraja API Documentation](https://developer.safaricom.co.ke/apis)
- [M-Pesa STK Push API](https://developer.safaricom.co.ke/docs?javascript#stk-push)
- [M-Pesa Query Request API](https://developer.safaricom.co.ke/docs?javascript#query-request)
