# M-Pesa Implementation - Potential Issues & Solutions

## Build Issues

### Issue: `[ERROR] Failed to execute goal`
**Symptoms**: Compilation fails with unknown symbols

**Solutions**:
1. Run `mvn clean install` to ensure all dependencies download
2. Verify Java 21+ is installed: `java -version`
3. Check internet connection for Maven repository access
4. Clear Maven cache: `rm -rf ~/.m2/repository && mvn clean install`

### Issue: RestTemplate Bean Not Found
**Symptoms**: `Error creating bean 'restTemplate'`

**Solution**: 
- Ensure `PaymentConfiguration.java` is in a package scanned by Spring
- Verify `@Configuration` annotation is present
- Check Spring Boot version compatibility

## Runtime Issues

### Issue: Database Table Not Created
**Symptoms**: `Table 'payments' doesn't exist`

**Solutions**:
1. Verify `spring.jpa.hibernate.ddl-auto=update` in application.properties
2. Check MySQL user has CREATE privilege
3. Manually create table:
```sql
CREATE TABLE IF NOT EXISTS payments (
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
  completed_at TIMESTAMP
);
```

### Issue: Configuration Properties Not Loaded
**Symptoms**: `NullPointerException` in MpesaService

**Solutions**:
1. Check environment variables are set: `echo $MPESA_CONSUMER_KEY`
2. Restart application after setting env vars
3. Use `.env` file with proper loading mechanism
4. Verify property names match exactly (case-sensitive)
5. Check application.properties uses correct prefix: `mpesa.`

### Issue: "Failed to get access token"
**Symptoms**: 401 Unauthorized or invalid credentials error

**Solutions**:
1. Verify Consumer Key and Consumer Secret:
   - Login to [Daraja Portal](https://developer.safaricom.co.ke)
   - Go to Applications → Your App
   - Copy exact credentials (no spaces)
2. Check credentials are for sandbox (not production)
3. Ensure credentials are not expired
4. Verify credentials have required permissions
5. Test credentials with Postman first

## API Issues

### Issue: 400 Bad Request on STK Push
**Symptoms**: 
```json
{"success": false, "message": "Phone number is required"}
```

**Solutions**:
1. Ensure `phoneNumber` is included in request body
2. Format should be valid: `0712345678` or `254712345678`
3. Test with sandbox phone: `254708374149`

### Issue: "Invalid Amount"
**Symptoms**: 
```json
{"success": false, "message": "Amount must be greater than 0"}
```

**Solutions**:
1. Ensure `amount` > 0
2. Format: `"amount": 1000` (as number, not string)
3. Typical range: KES 1 - 1,000,000

### Issue: STK Push Initiated but No Popup
**Symptoms**:
- Response shows success but popup doesn't appear on phone
- `ResponseCode: 0` returned

**Solutions**:
1. Verify phone number:
   - Must be M-Pesa enabled
   - Must be active on network
   - Use sandbox test number if testing
2. Check callback URL:
   - Must be configured in Daraja portal
   - Must be publicly accessible (not localhost in production)
   - Must have valid SSL certificate
3. Wait 10-15 seconds for popup (can be delayed)
4. Check phone's M-Pesa app version is up to date
5. Check M-Pesa logs in Daraja portal

### Issue: 401 Unauthorized on Protected Endpoints
**Symptoms**: `{"success": false, "message": "User not authenticated"}`

**Solutions**:
1. Include JWT token in Authorization header:
   ```
   Authorization: Bearer your_jwt_token_here
   ```
2. Token format must be: `Bearer ` followed by actual token
3. Verify token hasn't expired
4. Get new token from `/api/auth/login` if expired
5. Ensure user is properly authenticated before calling endpoint

## Callback Issues

### Issue: Callback Not Received
**Symptoms**: Payment status stays PENDING after successful payment

**Solutions**:
1. Verify callback URL is correct in Daraja portal:
   - Should be: `https://yourdomain.com/api/payments/mpesa/callback`
   - Not `http://` (must be HTTPS in production)
2. Check firewall/security group allows incoming requests
3. Verify callback endpoint is not protected by authentication
4. Check M-Pesa IP addresses are whitelisted (if applicable)
5. Review M-Pesa logs in Daraja portal
6. Test callback manually with Postman

### Issue: Callback Processing Fails
**Symptoms**: Callback received but payment status not updated

**Solutions**:
1. Check server logs for exceptions
2. Verify callback JSON structure matches expected format
3. Ensure `handleMpesaCallback()` is handling all scenarios
4. Check database connection during callback processing
5. Add logging to troubleshoot callback flow

## Integration Issues

### Issue: User ID Cannot Be Extracted
**Symptoms**: Payment created with `userId: 1` for all users

**Solutions**:
1. Verify `extractUserIdFromAuth()` method is implemented correctly
2. Check User entity has `getId()` method (public getter)
3. Ensure Authentication principal is User instance
4. Add logging to debug principal type:
```java
log.info("Principal type: {}", authentication.getPrincipal().getClass());
```
5. Update implementation based on your authentication system

### Issue: Payment Not Associated with Correct Order
**Symptoms**: Payment created but `orderId` or `userId` incorrect

**Solutions**:
1. Verify request includes correct `orderId`
2. Ensure extracted `userId` is correct
3. Check order exists in orders table
4. Verify foreign key constraints if defined
5. Add validation in controller before calling service

## Transaction & Data Issues

### Issue: Duplicate Payments Created
**Symptoms**: Multiple payments for same transaction

**Solutions**:
1. Check for duplicate endpoints
2. Add idempotency key handling
3. Verify unique constraint on `transaction_id`
4. Implement transaction ID validation before creating payment
5. Add database constraint:
```sql
ALTER TABLE payments ADD UNIQUE KEY unique_transaction_id (transaction_id);
```

### Issue: Payment Data Inconsistency
**Symptoms**: Missing phone numbers or other fields

**Solutions**:
1. Verify all required fields populated before save
2. Check for null values in request
3. Ensure database columns allow nulls (if optional)
4. Add validation annotations (`@NotNull`, `@NotBlank`)
5. Add logging to verify data before persistence

## Performance Issues

### Issue: STK Push Takes Too Long
**Symptoms**: 30+ second response time

**Solutions**:
1. Check network connectivity
2. Verify Daraja API endpoints are responsive
3. Check server logs for timeout errors
4. Increase timeout values in `PaymentConfiguration`:
```java
.setConnectTimeout(Duration.ofSeconds(60))
.setReadTimeout(Duration.ofSeconds(60))
```
5. Implement async callback instead of waiting

### Issue: Database Queries Slow
**Symptoms**: Payment retrieval endpoints slow

**Solutions**:
1. Add database indexes on frequently queried columns:
```sql
CREATE INDEX idx_user_id ON payments(user_id);
CREATE INDEX idx_order_id ON payments(order_id);
CREATE INDEX idx_payment_status ON payments(payment_status);
```
2. Implement pagination for list endpoints
3. Add caching for frequently accessed data
4. Optimize database queries with proper joins

## Logging & Debugging

### Enable Debug Logging
Add to `application.properties`:
```properties
logging.level.org.nthuli_shop.nthuli_shop.payment=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
```

### View Logs
```bash
tail -f logs/application.log
```

### Common Log Patterns
```
INFO  ... STK Push initiated successfully for order
WARN  ... Payment failed with result code
ERROR ... Error getting M-Pesa access token
DEBUG ... Received M-Pesa callback
```

## Security Checklist

- [ ] Credentials stored in environment variables
- [ ] HTTPS enabled in production
- [ ] JWT tokens properly validated
- [ ] Sensitive data not logged
- [ ] SQL injection prevention (using JPA)
- [ ] CORS configured if needed
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

---

If issue not listed above:
1. Check full error message and stack trace
2. Search [Daraja Documentation](https://developer.safaricom.co.ke)
3. Review logs with DEBUG level enabled
4. Test components individually (API, Database, etc.)
