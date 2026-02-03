package com.petbooking.service;

import com.petbooking.dto.StudentUploadResponse;
import com.petbooking.entity.Department;
import com.petbooking.entity.StudentMasterUpload;
import com.petbooking.repository.DepartmentRepository;
import com.petbooking.repository.StudentMasterUploadRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class StudentMasterUploadService {

    @Autowired
    private StudentMasterUploadRepository repository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public StudentUploadResponse processExcelFile(MultipartFile file, Long adminId) throws IOException {
        InputStream inputStream = file.getInputStream();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        int totalRows = 0;
        int insertedCount = 0;
        int skippedCount = 0;
        List<String> errors = new ArrayList<>();
        Set<String> deptCodesProcessed = new HashSet<>();

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
                // Excel columns: Name(0), RollNo(1), EmailID(2), Gender(3), Department(4),
                // Hosteller/Dayscholar(5)
                String name = getCellValue(row, 0);
                String rollNo = getCellValue(row, 1);
                String email = getCellValue(row, 2);
                String gender = getCellValue(row, 3);
                String deptCode = getCellValue(row, 4);
                String studentTypeRaw = getCellValue(row, 5);

                if (isEmpty(rollNo) || isEmpty(name) || isEmpty(email) || isEmpty(deptCode)) {
                    errors.add("Row " + rowNum + ": Missing required fields (RollNo, Name, Email, Dept)");
                    skippedCount++;
                    continue;
                }

                // Auto-create department if not exists
                if (!deptCodesProcessed.contains(deptCode.toUpperCase())) {
                    if (!departmentRepository.existsByDeptCode(deptCode)) {
                        Department newDept = new Department();
                        newDept.setDeptCode(deptCode.toUpperCase());
                        departmentRepository.save(newDept);
                    }
                    deptCodesProcessed.add(deptCode.toUpperCase());
                }

                // Map "Hosteller" -> "HOSTEL", "Dayscholar" -> "DAY"
                String studentType;
                if ("HOSTELLER".equalsIgnoreCase(studentTypeRaw) || "HOSTEL".equalsIgnoreCase(studentTypeRaw)) {
                    studentType = "HOSTEL";
                } else if ("DAYSCHOLAR".equalsIgnoreCase(studentTypeRaw) || "DAY".equalsIgnoreCase(studentTypeRaw)) {
                    studentType = "DAY";
                } else {
                    errors.add("Row " + rowNum + ": Invalid Student Type '" + studentTypeRaw
                            + "' (must be Hosteller/Hostel or Dayscholar/Day)");
                    skippedCount++;
                    continue;
                }

                if ("HOSTEL".equals(studentType)) {
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
                entity.setDeptCode(deptCode.toUpperCase());
                entity.setStudentType(studentType.toUpperCase());
                entity.setGender(gender != null ? gender.toUpperCase() : "MALE");
                if (isEmpty(gender) && "DAY".equalsIgnoreCase(studentType)) {
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
