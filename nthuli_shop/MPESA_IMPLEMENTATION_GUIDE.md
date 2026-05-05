# M-Pesa STK Push Payment Integration

## Overview

This implementation provides a complete M-Pesa STK Push payment integration for the Nthuli Shop e-commerce platform. STK Push is a Safaricom Daraja API that enables merchants to initiate payment prompts on customer phones without requiring the customer to enter payment details manually.

## Features

- **STK Push Initiation**: Initiate payment prompts directly on customer phones
- **Automatic Callback Handling**: Process payment confirmations from M-Pesa
- **Payment Tracking**: Track payment status and transaction history
- **Phone Number Validation**: Automatic phone number sanitization and formatting
- **Secure Authentication**: Uses OAuth 2.0 for API authentication
- **Error Handling**: Comprehensive error handling and logging

## Project Structure

```
payment/
├── config/
│   ├── MpesaConfig.java          # M-Pesa configuration properties
│   └── PaymentConfiguration.java   # Bean configurations (RestTemplate, ObjectMapper)
├── controller/
│   └── PaymentController.java      # API endpoints
├── dto/
│   ├── MpesaStkPushRequest.java   # STK Push request DTO
│   ├── MpesaStkPushResponse.java  # STK Push response DTO
│   ├── MpesaCallbackResponse.java # Callback response DTO
│   └── PaymentResponseDto.java     # Payment details DTO
├── entity/
│   └── Payment.java                # Payment database entity
├── enums/
│   ├── PaymentStatus.java          # Payment status enum
│   └── PaymentMethod.java          # Payment method enum
├── repository/
│   └── PaymentRepository.java      # Payment data access layer
├── service/
│   ├── MpesaService.java           # M-Pesa API integration
│   └── PaymentService.java         # Business logic layer
└── util/
    └── MpesaUtil.java              # Utility functions
```

## Setup Instructions

### 1. Get M-Pesa Credentials

1. Visit [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
2. Create a developer account and login
3. Create a new application to get:
   - **Consumer Key** (`MPESA_CONSUMER_KEY`)
   - **Consumer Secret** (`MPESA_CONSUMER_SECRET`)
4. Get your M-Pesa credentials:
   - **Business Shortcode/Party B** (`MPESA_PARTY_B`)
   - **Initiator/Party A** (`MPESA_PARTY_A`) - Usually your phone number
   - **Pass Key** (`MPESA_PASS_KEY`)

### 2. Configure Environment Variables

Add the following to your `.env` file or system environment:

```bash
# M-Pesa Sandbox (for testing)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PARTY_B=174379  # Business shortcode
MPESA_PARTY_A=your_phone_number  # Initiator phone
MPESA_PASS_KEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_STK_PUSH_URL=https://api.sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
MPESA_ACCESS_TOKEN_URL=https://api.sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
```

### 3. Update application.properties

The `application.properties` file has been pre-configured to use environment variables:

```properties
mpesa.consumer-key=${MPESA_CONSUMER_KEY:YOUR_CONSUMER_KEY}
mpesa.consumer-secret=${MPESA_CONSUMER_SECRET:YOUR_CONSUMER_SECRET}
mpesa.stk-push-url=${MPESA_STK_PUSH_URL:https://api.sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest}
mpesa.access-token-url=${MPESA_ACCESS_TOKEN_URL:https://api.sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials}
mpesa.callback-url=${MPESA_CALLBACK_URL:http://localhost:8080/api/payments/mpesa/callback}
mpesa.party-a=${MPESA_PARTY_A:YOUR_PARTY_A}
mpesa.party-b=${MPESA_PARTY_B:YOUR_PARTY_B}
mpesa.pass-key=${MPESA_PASS_KEY:YOUR_PASS_KEY}
```

### 4. Dependencies Added to pom.xml

The following dependencies have been added:
- `spring-boot-starter-web` - For REST API support
- `spring-boot-starter-security` - Already present
- `lombok` - For reducing boilerplate
- `jackson-databind` - For JSON processing
- `httpclient5` - For HTTP requests

## API Endpoints

### 1. Initiate STK Push Payment

**Endpoint:** `POST /api/payments/mpesa/stk-push`

**Authentication:** Required (JWT Bearer Token)

**Request Body:**
```json
{
  "orderId": 1,
  "phoneNumber": "0712345678",
  "amount": 1000.00,
  "description": "Payment for Order #1"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "STK Push initiated successfully",
  "data": {
    "merchantRequestId": "27234-34324-3432",
    "checkoutRequestId": "ws_CO_DMZ_123456789",
    "responseCode": "0",
    "responseDescription": "Success. Request accepted for processing",
    "customerMessage": "Enter your M-Pesa PIN to complete this transaction"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to initiate STK Push: Invalid phone number format"
}
```

### 2. Handle M-Pesa Callback

**Endpoint:** `POST /api/payments/mpesa/callback`

**Authentication:** None (M-Pesa Server)

M-Pesa will POST payment status to this endpoint automatically.

### 3. Get Payment by ID

**Endpoint:** `GET /api/payments/{paymentId}`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": 1,
    "orderId": 1,
    "userId": 5,
    "amount": 1000.00,
    "paymentMethod": "MPESA_STK_PUSH",
    "paymentStatus": "COMPLETED",
    "transactionId": "ws_CO_DMZ_123456789",
    "phoneNumber": "254712345678",
    "description": "Payment for Order #1",
    "createdAt": "2026-05-04 10:30:45",
    "updatedAt": "2026-05-04 10:32:15"
  }
}
```

### 4. Get Payment by Order ID

**Endpoint:** `GET /api/payments/order/{orderId}`

**Authentication:** Required

### 5. Get All User Payments

**Endpoint:** `GET /api/payments/user/all`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "User payments retrieved successfully",
  "data": [
    { /* payment 1 */ },
    { /* payment 2 */ }
  ]
}
```

### 6. Get User Completed Payments

**Endpoint:** `GET /api/payments/user/completed`

**Authentication:** Required

## Payment Status Flow

```
PENDING → COMPLETED (Payment successful)
       → FAILED (User cancelled or error)
```

## Phone Number Format

The system automatically handles phone number formatting:
- `0712345678` → `254712345678`
- `712345678` → `254712345678`
- `254712345678` → `254712345678` (unchanged)

## Testing

### Test with Sandbox Credentials

Use the following test phone number for M-Pesa Sandbox:
- **Test Phone:** `254708374149`
- **PIN:** `123456`

### Using Postman

1. **Authenticate** (if required)
   - Get JWT token from `/api/auth/login`
   - Add token to Authorization header: `Bearer {token}`

2. **Initiate Payment**
   ```
   POST http://localhost:8080/api/payments/mpesa/stk-push
   Headers: Authorization: Bearer {token}
   Body: {
     "orderId": 1,
     "phoneNumber": "254708374149",
     "amount": 1000,
     "description": "Test payment"
   }
   ```

3. **Get Payment Status**
   ```
   GET http://localhost:8080/api/payments/user/all
   Headers: Authorization: Bearer {token}
   ```

## Database Schema

The `payments` table has the following structure:

```sql
CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  phone_number VARCHAR(20),
  mpesa_reference VARCHAR(255),
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Error Handling

The system handles various error scenarios:

1. **Invalid Phone Number** - Returns 400 Bad Request
2. **Invalid Amount** - Returns 400 Bad Request (must be > 0)
3. **User Not Authenticated** - Returns 401 Unauthorized
4. **M-Pesa API Error** - Returns 500 Internal Server Error with details
5. **Payment Not Found** - Returns 404 Not Found

## Security Considerations

1. **API Credentials**: Store in environment variables, never hardcode
2. **SSL/TLS**: Use HTTPS for callback URL in production
3. **Authentication**: All endpoints except callback require JWT token
4. **Rate Limiting**: Consider implementing rate limiting for production
5. **Logging**: All transactions are logged for audit trails

## Callback Webhook Configuration

For production, configure your callback URL in the M-Pesa Daraja portal:

1. Go to your application settings
2. Set OAuth Redirect URI to: `https://yourdomain.com/api/payments/mpesa/callback`
3. Make sure your server is publicly accessible and has valid SSL certificate

## Future Enhancements

- [ ] M-Pesa Online (WebCheckout) support
- [ ] Refund processing
- [ ] Payment confirmation emails
- [ ] Admin dashboard for payment management
- [ ] Recurring/subscription payments
- [ ] Multiple payment method aggregation
- [ ] Transaction reconciliation reports

## Troubleshooting

### "Failed to get access token"
- Verify Consumer Key and Consumer Secret are correct
- Check API credentials haven't expired
- Ensure credentials have sandbox access

### "Invalid phone number format"
- Ensure phone number starts with 0, 254, or 7
- Phone number should be 10-12 digits

### "STK Push not appearing on phone"
- Verify phone number is correct
- Check callback URL is correctly configured
- Ensure amount is within acceptable range

### "Callback not received"
- Verify callback URL is publicly accessible
- Check firewall/security group allows incoming requests
- Review M-Pesa logs in Daraja portal

## Support Resources

- [Safaricom Daraja Documentation](https://developer.safaricom.co.ke/documentation)
- [M-Pesa STK Push Guide](https://developer.safaricom.co.ke/docs?shell#lipa-na-m-pesa-online)
- [Sandbox Testing Guide](https://developer.safaricom.co.ke/docs?shell#sandbox)

## License

This implementation is part of the Nthuli Shop project.
