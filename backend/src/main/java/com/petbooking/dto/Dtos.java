package com.petbooking.dto;

import lombok.Data;

public class Dtos {
    
    @Data
    public static class LoginRequest {
        private String rollNo;
        private String email;
    }

    @Data
    public static class OtpVerificationRequest {
        private String email;
        private String otp;
    }

    @Data
    public static class AdminLoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class BookingRequest {
        private Long slotId;
    }
    
    @Data
    public static class CreateSlotRequest {
        private String examDate; // YYYY-MM-DD
        private String startTime; // HH:mm
        private String endTime; // HH:mm
        private String category;
        private String purpose;
        private java.util.List<DeptQuotaRequest> quotas;
    }

    @Data
    public static class DeptQuotaRequest {
        private Long deptId;
        private int quota;
    }

    @Data
    public static class SlotResponse {
        private Long slotId;
        private String examDate;
        private String startTime;
        private String endTime;
        private String category;
        private String purpose;
        private int remainingQuota;
        private boolean isOpen;
    }

    @Data
    public static class DeptStrengthRequest {
        private Long deptId;
        private int dayCount;
        private int hostelMaleCount;
        private int hostelFemaleCount;
    }
}
