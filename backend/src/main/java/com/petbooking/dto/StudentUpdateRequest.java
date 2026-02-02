package com.petbooking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentUpdateRequest {
    private String name;
    private String email;
    private Long deptId;
    private String category; // DAY, HOSTEL_MALE, HOSTEL_FEMALE
}
