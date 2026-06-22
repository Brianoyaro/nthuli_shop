# M-Pesa STK Push - Quick Reference Guide

## Quick Start

### 1. Set Environment Variables
```bash
export MPESA_CONSUMER_KEY=your_key
export MPESA_CONSUMER_SECRET=your_secret
export MPESA_PARTY_B=174379
export MPESA_PARTY_A=254712345678
export MPESA_PASS_KEY=your_passkey
```

### 2. Build & Run
```bash
mvn clean install
mvn spring-boot:run
```

### 3. Test Payment Flow
```bash
# 1. Get JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 2. Initiate STK Push
curl -X POST http://localhost:8080/api/payments/mpesa/stk-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "phoneNumber": "0712345678",
    "amount": 1000,
    "description": "Payment for Order"
  }'

# 3. Check paymentPayment status
curl -X GET http://localhost:8080/api/payments/user/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payments/mpesa/stk-push` | Yes | Initiate paymentPayment |
| POST | `/api/payments/mpesa/callback` | No | M-Pesa callback |
| GET | `/api/payments/{paymentId}` | Yes | Get paymentPayment |
| GET | `/api/payments/order/{orderId}` | Yes | Get order paymentPayment |
| GET | `/api/payments/user/all` | Yes | All payments |
| GET | `/api/payments/user/completed` | Yes | Completed payments |

## File Structure
```
paymentPayment/
├── config/           # Configuration classes
├── controller/       # REST endpoints
├── dto/              # Request/Response DTOs
├── entity/           # JPA entities
├── enums/            # Status/Method enums
├── repository/       # Data access layer
├── service/          # Business logic
└── util/             # Helper utilities
```

## Key Classes

| Class | Purpose |
|-------|---------|
| `MpesaService` | Core M-Pesa API integration |
| `PaymentService` | Business logic & DTO conversion |
| `PaymentController` | REST API endpoints |
| `Payment` | JPA entity for payments table |
| `MpesaConfig` | Configuration properties |
| `MpesaUtil` | Helper functions |

## Phone Number Formats Accepted
- `0712345678` → `254712345678`
- `712345678` → `254712345678`
- `254712345678` → `254712345678`

## Payment Status Flow
```
PENDING → COMPLETED (successful)
       → FAILED (user cancelled/error)
       → CANCELLED
       → REFUNDED
```

## Testing Phone Numbers
- **Sandbox**: `254708374149`
- **PIN**: `123456`
- **Amount**: Any amount in KES

## Common Errors

| Error | Solution |
|-------|----------|
| `Failed to get access token` | Check Consumer Key/Secret |
| `Invalid phone number format` | Ensure valid phone number |
| `STK not appearing` | Verify callback URL configured |
| `Payment not found` | Check if paymentPayment was saved to database |

## Database Queries

```sql
-- View all payments
SELECT * FROM payments;

-- Get user's payments
SELECT * FROM payments WHERE user_id = 1;

-- Get pending payments
SELECT * FROM payments WHERE payment_status = 'PENDING';

-- Get completed payments
SELECT * FROM payments WHERE payment_status = 'COMPLETED';

-- Get paymentPayment by transaction ID
SELECT * FROM payments WHERE transaction_id = 'ws_CO_DMZ_123456789';
```

## Important Notes

1. **Always use HTTPS** in production
2. **Store credentials** in environment variables
3. **Validate phone numbers** before sending to M-Pesa
4. **Test in sandbox** before production
5. **Monitor logs** for errors and debugging
6. **Handle timeouts** gracefully
7. **Implement retry logic** for failed transactions
8. **Keep callback URL public** and accessible

## Next Steps

- [ ] Integrate with order management
- [ ] Send confirmation emails
- [ ] Implement refund logic
- [ ] Add paymentPayment dashboard
- [ ] Set up alerts for failed payments
- [ ] Implement reconciliation
- [ ] Add admin management UI

## Useful Links

- [Safaricom Daraja](https://developer.safaricom.co.ke)
- [M-Pesa Documentation](https://developer.safaricom.co.ke/docs)
- [STK Push Guide](https://developer.safaricom.co.ke/docs?shell#lipa-na-m-pesa-online)
- [Testing Guide](https://developer.safaricom.co.ke/docs?shell#sandbox)

---
For detailed information, see `MPESA_IMPLEMENTATION_GUIDE.md`
