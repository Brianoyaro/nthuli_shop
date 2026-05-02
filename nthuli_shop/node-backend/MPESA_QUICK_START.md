# M-Pesa Payment API - Quick Reference

## Setup

1. **Configure M-Pesa credentials in `.env`:**
   ```bash
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORT_CODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=http://localhost:8080/api/payments/mpesa/callback
   ```

2. **Get Sandbox Credentials:**
   - Visit https://developer.safaricom.co.ke/
   - Create app and get credentials
   - Use test phone: `254708374149`

## API Endpoints

### 1. Initiate Payment (STK Push)
```bash
POST /api/payments/initiate-m2u
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phoneNumber": "254708374149",
  "amount": 100,
  "description": "Order payment"
}

# Response
{
  "paymentId": 1,
  "checkoutRequestId": "ws_CO_DMZ_123456789",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "customerMessage": "Enter M-Pesa PIN..."
}
```

### 2. Query Payment Status
```bash
GET /api/payments/:id/status
Authorization: Bearer <access_token>

# Response
{
  "paymentId": 1,
  "status": "COMPLETED",
  "resultCode": "0",
  "resultDescription": "Success",
  "amount": 100
}
```

### 3. Get Payment Details
```bash
GET /api/payments/:id
Authorization: Bearer <access_token>

# Response
{
  "id": 1,
  "userId": 5,
  "amount": 100,
  "currency": "KES",
  "status": "COMPLETED",
  "method": "MPESA",
  "transactionId": "MPG45Q5J63",
  "description": "Order payment",
  "createdAt": "2026-05-02T10:30:00Z",
  "updatedAt": "2026-05-02T10:35:00Z",
  "user": { "id": 5, "email": "user@example.com", ... }
}
```

### 4. Get User Payments
```bash
GET /api/payments/user/:userId?limit=50&offset=0
Authorization: Bearer <access_token>

# Response: [{ payment1 }, { payment2 }, ...]
```

### 5. Get All Payments (Admin Only)
```bash
GET /api/payments?limit=50&offset=0
Authorization: Bearer <admin_token>
X-Role: ADMIN

# Response: [{ payment1 }, { payment2 }, ...]
```

### 6. Cancel Payment
```bash
POST /api/payments/:id/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}

# Response
{
  "message": "Payment cancelled successfully",
  "payment": { ... }
}
```

### 7. Refund Payment (Admin Only)
```bash
POST /api/payments/:id/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Duplicate charge"
}

# Response
{
  "message": "Payment refunded successfully",
  "payment": { ... }
}
```

## Payment Status Values

| Status | Meaning |
|--------|---------|
| PENDING | Awaiting payment confirmation |
| COMPLETED | Successfully paid |
| FAILED | Payment declined or failed |
| CANCELLED | User cancelled payment |

## cURL Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes accessToken - save this for next requests
```

### Initiate M-Pesa Payment
```bash
curl -X POST http://localhost:8080/api/payments/initiate-m2u \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254708374149",
    "amount": 100,
    "description": "Order #123 payment"
  }'
```

### Check Payment Status
```bash
curl -X GET http://localhost:8080/api/payments/1/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Cancel Payment
```bash
curl -X POST http://localhost:8080/api/payments/1/cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my mind"
  }'
```

## Key Points

- Phone numbers must be in format: `254XXXXXXXXX`
- Amount must be > 0
- Payments are created immediately in PENDING status
- M-Pesa callback updates payment status automatically
- Only admins can refund completed payments
- Only payment owner can cancel pending payments

## Database Fields

| Field | Type | Notes |
|-------|------|-------|
| id | INT | Primary key |
| userId | INT | References Users.id |
| amount | DECIMAL(10,2) | In KES |
| currency | VARCHAR(3) | Default: KES |
| status | ENUM | PENDING, COMPLETED, FAILED, CANCELLED |
| method | ENUM | MPESA (STRIPE coming soon) |
| transactionId | VARCHAR | M-Pesa receipt or checkout ID |
| description | TEXT | Order/payment description |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last update timestamp |

## Testing Payment Flow

1. **Start server:** `npm start`
2. **Register account:** POST /api/auth/register
3. **Login:** POST /api/auth/login (save accessToken)
4. **Initiate payment:** POST /api/payments/initiate-m2u
5. **Accept M-Pesa prompt** on test phone (or simulate in sandbox)
6. **Query status:** GET /api/payments/1/status (should be COMPLETED)

## Troubleshooting

**No M-Pesa prompt appears:**
- Verify phone number format (254XXXXXXXXX)
- Check M-Pesa credentials in .env
- Ensure server can reach M-Pesa API

**Payment stuck in PENDING:**
- Ensure callback URL is accessible by M-Pesa
- Use ngrok for local testing: `ngrok http 8080`
- Update MPESA_CALLBACK_URL with ngrok URL

**Database errors:**
- Check MySQL is running: `mysql -u brian -ppassword -e "SELECT 1"`
- Verify DB credentials in .env
- Run seeder if tables don't exist: `node seed.js`

See [MPESA_INTEGRATION.md](./MPESA_INTEGRATION.md) for detailed documentation.
