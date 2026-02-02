package com.petbooking.service;

import com.petbooking.dto.StudentUploadResponse;
import com.petbooking.entity.StudentMasterUpload;
import com.petbooking.repository.StudentMasterUploadRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class StudentMasterUploadService {

    @Autowired
    private StudentMasterUploadRepository repository;

    public StudentUploadResponse processExcelFile(MultipartFile file, Long adminId) throws IOException {
        InputStream inputStream = file.getInputStream();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        int totalRows = 0;
        int insertedCount = 0;
        int skippedCount = 0;
        List<String> errors = new ArrayList<>();

        Iterator<Row> rowIterator = sheet.iterator();

        // Skip header
        if (rowIterator.hasNext()) {
            rowIterator.next();
        }

        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            totalRows++;
            int rowNum = row.getRowNum() + 1;

            try {
                String rollNo = getCellValue(row, 0);
                String name = getCellValue(row, 1);
                String email = getCellValue(row, 2);
                String deptCode = getCellValue(row, 3);
                String studentType = getCellValue(row, 4);
                String gender = getCellValue(row, 5);

                if (isEmpty(rollNo) || isEmpty(name) || isEmpty(email) || isEmpty(deptCode)) {
                    errors.add("Row " + rowNum + ": Missing required fields (RollNo, Name, Email, Dept)");
                    skippedCount++;
                    continue;
                }

                if (!"DAY".equalsIgnoreCase(studentType) && !"HOSTEL".equalsIgnoreCase(studentType)) {
                    errors.add("Row " + rowNum + ": Invalid Student Type (must be DAY or HOSTEL)");
                    skippedCount++;
                    continue;
                }

                if ("HOSTEL".equalsIgnoreCase(studentType)) {
                    if (!"MALE".equalsIgnoreCase(gender) && !"FEMALE".equalsIgnoreCase(gender)) {
                        errors.add("Row " + rowNum + ": Invalid Gender for Hosteller (must be MALE or FEMALE)");
                        skippedCount++;
                        continue;
                    }
                }

                // Check duplicates (in this upload table)
                if (repository.existsByRollNo(rollNo) || repository.existsByEmail(email)) {
                    errors.add("Row " + rowNum + ": Duplicate RollNo or Email");
                    skippedCount++;
                    continue;
                }

                StudentMasterUpload entity = new StudentMasterUpload();
                entity.setRollNo(rollNo);
                entity.setName(name);
                entity.setEmail(email);
                entity.setDeptCode(deptCode);
                entity.setStudentType(studentType.toUpperCase());
                entity.setGender(gender != null ? gender.toUpperCase() : "MALE"); // Default or strict? Prompt says
                                                                                  // Male/Female required. Assuming
                                                                                  // 'gender' read above.
                if (isEmpty(gender) && "DAY".equalsIgnoreCase(studentType)) {
                    // Gender strictly required? Prompt says "if HOSTEL then gender must be MALE or
                    // FEMALE".
                    // Implicitly, DAY scholars might not need gender for hostel logic, but DB has
                    // it nullable=false.
                    // I will enforce gender for all to be safe, or allow default if DAY.
                    // Prompt: "gender (MALE / FEMALE)". "if HOSTEL then gender must be MALE or
                    // FEMALE".
                    // I will assume M/F required for all.
                    if (isEmpty(gender)) {
                        errors.add("Row " + rowNum + ": Gender required");
                        skippedCount++;
                        continue;
                    }
                }

                entity.setUploadedByAdminId(adminId);
                repository.save(entity);
                insertedCount++;

            } catch (Exception e) {
                errors.add("Row " + rowNum + ": Error processing - " + e.getMessage());
                skippedCount++;
            }
        }
        workbook.close();

        return new StudentUploadResponse(totalRows, insertedCount, skippedCount, errors);
    }

    private String getCellValue(Row row, int index) {
        Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null)
            return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> String.valueOf((long) cell.getNumericCellValue()); // Handle numeric roll nos
                default -> "";
            };
        } catch (Exception e) {
            return "";
        }
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}
