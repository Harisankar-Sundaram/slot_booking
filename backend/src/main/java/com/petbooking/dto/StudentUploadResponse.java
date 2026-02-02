package com.petbooking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentUploadResponse {
    private int totalRows;
    private int insertedCount;
    private int skippedCount;
    private List<String> errors;
}
