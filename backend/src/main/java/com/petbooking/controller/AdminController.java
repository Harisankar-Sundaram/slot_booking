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

    @Autowired
    private com.petbooking.repository.StudentMasterUploadRepository studentMasterUploadRepository;

    @GetMapping("/student-master")
    public ResponseEntity<?> getAllStudentMasterData() {
        return ResponseEntity.ok(studentMasterUploadRepository.findAll());
    }

    @GetMapping("/student-master/strength")
    public ResponseEntity<?> getCalculatedStrengthFromMaster() {
        var allStudents = studentMasterUploadRepository.findAll();

        // Group by deptCode and calculate counts
        java.util.Map<String, java.util.Map<String, Integer>> deptStats = new java.util.HashMap<>();

        for (var student : allStudents) {
            String deptCode = student.getDeptCode();
            deptStats.putIfAbsent(deptCode, new java.util.HashMap<>());
            var stats = deptStats.get(deptCode);

            String studentType = student.getStudentType();
            String gender = student.getGender();

            if ("DAY".equalsIgnoreCase(studentType)) {
                stats.put("dayCount", stats.getOrDefault("dayCount", 0) + 1);
            } else if ("HOSTEL".equalsIgnoreCase(studentType)) {
                if ("MALE".equalsIgnoreCase(gender)) {
                    stats.put("hostelMaleCount", stats.getOrDefault("hostelMaleCount", 0) + 1);
                } else if ("FEMALE".equalsIgnoreCase(gender)) {
                    stats.put("hostelFemaleCount", stats.getOrDefault("hostelFemaleCount", 0) + 1);
                }
            }
        }

        // Convert to list of objects
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (var entry : deptStats.entrySet()) {
            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("deptCode", entry.getKey());
            item.put("dayCount", entry.getValue().getOrDefault("dayCount", 0));
            item.put("hostelMaleCount", entry.getValue().getOrDefault("hostelMaleCount", 0));
            item.put("hostelFemaleCount", entry.getValue().getOrDefault("hostelFemaleCount", 0));
            int total = (int) item.get("dayCount") + (int) item.get("hostelMaleCount")
                    + (int) item.get("hostelFemaleCount");
            item.put("total", total);
            result.add(item);
        }

        // Sort by deptCode
        result.sort((a, b) -> ((String) a.get("deptCode")).compareTo((String) b.get("deptCode")));

        return ResponseEntity.ok(result);
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

    // ========== NEW: Slot Generation Endpoints ==========
    @Autowired
    private com.petbooking.service.SlotGenerationService slotGenerationService;
    @Autowired
    private com.petbooking.repository.ExamSlotRepository examSlotRepository;

    @PostMapping("/generate-slots")
    public ResponseEntity<?> generateSlots(@RequestBody java.util.Map<String, Object> request) {
        try {
            int systemsPerSession = (int) request.get("systemsPerSession");
            String startDateStr = (String) request.getOrDefault("startDate", java.time.LocalDate.now().toString());
            java.time.LocalDate startDate = java.time.LocalDate.parse(startDateStr);

            var result = slotGenerationService.generateSlots(systemsPerSession, startDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Slot generation failed: " + e.getMessage());
        }
    }

    @GetMapping("/exam-slots")
    public ResponseEntity<?> getAllExamSlots() {
        return ResponseEntity.ok(examSlotRepository.findAll());
    }

    // ========== NEW: Exam Initialization Endpoints ==========
    @Autowired
    private com.petbooking.service.ExamInitService examInitService;

    @PostMapping("/exam/initialize")
    public ResponseEntity<?> initializeExam(@RequestBody com.petbooking.dto.ExamDtos.ExamInitRequest request) {
        try {
            var response = examInitService.initializeExam(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Exam initialization failed: " + e.getMessage());
        }
    }

    @GetMapping("/exams")
    public ResponseEntity<?> getAllExams() {
        return ResponseEntity.ok(examInitService.getAllExams());
    }

    @GetMapping("/exams/{examId}")
    public ResponseEntity<?> getExamById(@PathVariable Long examId) {
        try {
            return ResponseEntity.ok(examInitService.getExamById(examId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/exams/{examId}/quotas")
    public ResponseEntity<?> getExamQuotas(@PathVariable Long examId) {
        return ResponseEntity.ok(examInitService.getQuotasForExam(examId));
    }
}
