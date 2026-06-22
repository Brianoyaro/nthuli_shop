# M-Pesa Integration Checklist

## Prerequisites
- [ ] Java 21+ installed
- [ ] Maven installed
- [ ] MySQL database running
- [ ] M-Pesa/Safaricom Daraja account created

## Step 1: Get M-Pesa Credentials
- [ ] Visit [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
- [ ] Create developer account
- [ ] Create new application to get Consumer Key and Consumer Secret
- [ ] Register callback URL
- [ ] Get Business Shortcode (Party B)
- [ ] Generate Pass Key

## Step 2: Build and Dependencies
- [ ] Run `mvn clean install` to download dependencies
- [ ] Verify no build errors occur
- [ ] Check pom.xml has all new dependencies

## Step 3: Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in M-Pesa credentials in `.env`:
  - MPESA_CONSUMER_KEY
  - MPESA_CONSUMER_SECRET
  - MPESA_PARTY_B
  - MPESA_PARTY_A
  - MPESA_PASS_KEY
- [ ] Update MPESA_CALLBACK_URL if not localhost

## Step 4: Database Setup
- [ ] Run `mvn spring-boot:run` to auto-create tables
- [ ] Verify `payments` table created in MySQL:
  ```sql
  SHOW TABLES;
  DESC payments;
  ```

## Step 5: Update User Entity Integration
- [ ] Update `PaymentController.extractUserIdFromAuth()` method
- [ ] Integrate with your existing User entity
- [ ] Test authentication flow

## Step 6: Testing with Postman
- [ ] Get JWT token from auth endpoint
- [ ] Test STK Push endpoint: `POST /api/payments/mpesa/stk-push`
- [ ] Use test phone: `254708374149`
- [ ] Verify paymentPayment record created in database
- [ ] Test callback processing

## Step 7: Production Setup (When Ready)
- [ ] Update M-Pesa URLs from sandbox to production
- [ ] Update MPESA_CALLBACK_URL to production domain
- [ ] Ensure HTTPS is enabled
- [ ] Register production callback URL in Daraja portal
- [ ] Test with production credentials
- [ ] Set up paymentPayment confirmation emails
- [ ] Implement admin dashboard for paymentPayment monitoring

## Troubleshooting

### Issue: Compilation errors
**Solution**: Run `mvn clean install` to ensure all dependencies are downloaded

### Issue: "Failed to get access token"
**Solution**: 
1. Verify Consumer Key and Secret are correct
2. Check credentials are for sandbox (for testing)
3. Ensure credentials haven't expired

### Issue: "Invalid phone number format"
**Solution**: Phone number should be 10 digits starting with 0, 7, or 254

### Issue: STK Push not appearing on phone
**Solution**:
1. Verify phone number is correct and active on M-Pesa
2. Check callback URL is configured in Daraja
3. Review M-Pesa logs in Daraja portal

## Quick Start Command
```bash
# Install dependencies
mvn clean install

# Load environment variables (Linux/Mac)
export $(cat .env | xargs)

# Start application
mvn spring-boot:run
```

## Success Indicators
- [ ] Application starts without errors
- [ ] `/api/payments/mpesa/stk-push` endpoint accepts requests
- [ ] STK popup appears on test phone within 10 seconds
- [ ] Payment record created in database with PENDING status
- [ ] Callback received and paymentPayment status updated to COMPLETED

## Support
- **Daraja Portal**: https://developer.safaricom.co.ke
- **Implementation Guide**: See `MPESA_IMPLEMENTATION_GUIDE.md`
- **API Documentation**: https://developer.safaricom.co.ke/documentation

---
Date Implemented: 2026-05-04
