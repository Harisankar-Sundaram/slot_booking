package com.petbooking.controller;

import com.petbooking.dto.Dtos;
import com.petbooking.entity.Booking;
import com.petbooking.entity.DeptExamStrength;
import com.petbooking.repository.BookingRepository;
import com.petbooking.repository.DeptExamStrengthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private DeptExamStrengthRepository deptExamStrengthRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private com.petbooking.repository.DepartmentRepository departmentRepository;

    @GetMapping("/departments")
    public ResponseEntity<?> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/strength")
    public ResponseEntity<?> getAllStrengths() {
        return ResponseEntity.ok(deptExamStrengthRepository.findAll());
    }

    @PostMapping("/strength")
    public ResponseEntity<?> updateDeptStrength(@RequestBody Dtos.DeptStrengthRequest request) {
        // Create or update strength for department
        DeptExamStrength strength = deptExamStrengthRepository.findByDepartmentDeptId(request.getDeptId())
                .orElse(new DeptExamStrength());

        com.petbooking.entity.Department dept = new com.petbooking.entity.Department();
        dept.setDeptId(request.getDeptId());
        strength.setDepartment(dept);
        strength.setDayCount(request.getDayCount());
        strength.setHostelMaleCount(request.getHostelMaleCount());
        strength.setHostelFemaleCount(request.getHostelFemaleCount());

        DeptExamStrength saved = deptExamStrengthRepository.save(strength);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) Long slotId,
            @RequestParam(required = false) Long deptId) {

        if (slotId != null) {
            return ResponseEntity.ok(bookingRepository.findBySlotSlotId(slotId));
        }
        if (deptId != null) {
            return ResponseEntity.ok(bookingRepository.findByDepartmentDeptId(deptId));
        }
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @Autowired
    private com.petbooking.repository.StudentRepository studentRepository;

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @Autowired
    private com.petbooking.service.StudentMasterUploadService uploadService;

    @PostMapping(value = "/student-master/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadStudentMaster(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            Long adminId = 1L; // TODO: Extract from SecurityContext
            return ResponseEntity.ok(uploadService.processExcelFile(file, adminId));
        } catch (java.io.IOException e) {
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        }
    }

    @PutMapping("/students/{rollNo}")
    public ResponseEntity<?> updateStudent(
            @PathVariable String rollNo,
            @RequestBody com.petbooking.dto.StudentUpdateRequest request) {

        try {
            com.petbooking.entity.Student student = studentRepository.findById(rollNo)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (request.getName() != null)
                student.setName(request.getName());
            if (request.getEmail() != null)
                student.setEmail(request.getEmail());
            if (request.getCategory() != null) {
                student.setCategory(com.petbooking.entity.Student.StudentCategory.valueOf(request.getCategory()));
            }
            if (request.getDeptId() != null) {
                com.petbooking.entity.Department dept = new com.petbooking.entity.Department();
                dept.setDeptId(request.getDeptId());
                student.setDepartment(dept);
            }

            return ResponseEntity.ok(studentRepository.save(student));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Update failed: " + e.getMessage());
        }
    }
}
