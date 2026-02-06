package com.petbooking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ExamDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamInitRequest {
        private String examName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalDays;
        private Integer perDeptCapacity;
        private String examPurpose;
        private List<DeptCategoryCount> deptCategories;

        // Time windows for different student types
        private LocalTime dayScholarStartTime;
        private LocalTime dayScholarEndTime;
        private LocalTime hostelStartTime;
        private LocalTime hostelEndTime;
        private Integer systemsPerSlot;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeptCategoryCount {
        private Long deptId;
        private Integer dayScholarCount; // Category Type 1
        private Integer hostellerBoysCount; // Category Type 2
        private Integer hostellerGirlsCount; // Category Type 3
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamInitResponse {
        private Long examId;
        private String examName;
        private Integer totalDays;
        private Integer totalSlotsGenerated;
        private Integer quotasCreated;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotBookingRequest {
        private Long examId;
        private LocalDate preferredDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotBookingResponse {
        private Long slotId;
        private LocalDate bookedDate;
        private String status;
        private String message;
    }
}
