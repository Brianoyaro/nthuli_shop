package org.nthuli_shop.nthuli_shop.payment.util;

import lombok.extern.slf4j.Slf4j;
import java.util.Base64;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
public class MpesaUtil {

    public static String encodeBase64(String input) {
        log.debug("[MPESA_UTIL] encodeBase64 - Encoding string of length: {}", input.length());
        return Base64.getEncoder().encodeToString(input.getBytes());
    }

    public static String generateTimestamp() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        log.debug("[MPESA_UTIL] generateTimestamp - Generated: {}", timestamp);
        return timestamp;
    }

    public static String generatePassword(String partyB, String passKey, String timestamp) {
        log.debug("[MPESA_UTIL] generatePassword - Generating password for PartyB: {}, Timestamp: {}", partyB, timestamp);
        String rawPassword = partyB + passKey + timestamp;
        String encodedPassword = Base64.getEncoder().encodeToString(rawPassword.getBytes());
        log.debug("[MPESA_UTIL] generatePassword - Password generated successfully");
        return encodedPassword;
    }

    public static String sanitizePhoneNumber(String phoneNumber) {
        log.info("[MPESA_UTIL] sanitizePhoneNumber START - Original: {}", phoneNumber);
        // Remove all non-digit characters
        String cleaned = phoneNumber.replaceAll("[^0-9]", "");
        log.debug("[MPESA_UTIL] sanitizePhoneNumber - After removing non-digits: {}", cleaned);
        
        // If starts with 0, replace with country code 254
        if (cleaned.startsWith("0")) {
            cleaned = "254" + cleaned.substring(1);
            log.debug("[MPESA_UTIL] sanitizePhoneNumber - Converted 0 prefix to 254");
        }
        // If doesn't start with 254, add it
        else if (!cleaned.startsWith("254")) {
            cleaned = "254" + cleaned;
            log.debug("[MPESA_UTIL] sanitizePhoneNumber - Added 254 country code");
        }
        
        log.info("[MPESA_UTIL] sanitizePhoneNumber SUCCESS - Sanitized: {}", cleaned);
        return cleaned;
    }
}
