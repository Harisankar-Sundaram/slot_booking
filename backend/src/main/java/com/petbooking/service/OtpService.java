package com.petbooking.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final Map<String, RateLimitEntry> rateLimitStore = new ConcurrentHashMap<>();
    
    private static class OtpEntry {
        String otp;
        long expiryTime;
        OtpEntry(String otp, long expiryTime) { this.otp = otp; this.expiryTime = expiryTime; }
    }

    private static class RateLimitEntry {
        int count;
        long expiryTime;
        RateLimitEntry(int count, long expiryTime) { this.count = count; this.expiryTime = expiryTime; }
    }

    public void saveOtp(String key, String otp) {
        // 5 minutes expiry
        long expiry = System.currentTimeMillis() + (5 * 60 * 1000); 
        otpStore.put(key, new OtpEntry(otp, expiry));
    }

    public String getOtp(String key) {
        OtpEntry entry = otpStore.get(key);
        if (entry != null) {
            if (System.currentTimeMillis() > entry.expiryTime) {
                otpStore.remove(key);
                return null;
            }
            return entry.otp;
        }
        return null;
    }

    public void deleteOtp(String key) {
        otpStore.remove(key);
    }

    public boolean checkRateLimit(String key, int limit, long durationSeconds) {
        long now = System.currentTimeMillis();
        RateLimitEntry entry = rateLimitStore.get(key);
        
        if (entry == null || now > entry.expiryTime) {
            rateLimitStore.put(key, new RateLimitEntry(1, now + (durationSeconds * 1000)));
            return true;
        }
        
        if (entry.count >= limit) {
            return false;
        }
        
        entry.count++;
        return true;
    }
}
