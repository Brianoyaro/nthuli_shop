package org.nthuli_shop.nthuli_shop.payment.util;

import java.util.Base64;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class MpesaUtil {

    public static String encodeBase64(String input) {
        return Base64.getEncoder().encodeToString(input.getBytes());
    }

    public static String generateTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    public static String generatePassword(String partyB, String passKey, String timestamp) {
        String rawPassword = partyB + passKey + timestamp;
        return Base64.getEncoder().encodeToString(rawPassword.getBytes());
    }

    public static String sanitizePhoneNumber(String phoneNumber) {
        // Remove all non-digit characters
        String cleaned = phoneNumber.replaceAll("[^0-9]", "");
        
        // If starts with 0, replace with country code 254
        if (cleaned.startsWith("0")) {
            cleaned = "254" + cleaned.substring(1);
        }
        // If doesn't start with 254, add it
        else if (!cleaned.startsWith("254")) {
            cleaned = "254" + cleaned;
        }
        
        return cleaned;
    }
}
