package com.petbooking.controller;

import com.petbooking.dto.Dtos;
import com.petbooking.entity.Booking;
import com.petbooking.entity.DeptExamStrength;
import com.petbooking.repository.BookingRepository;
import com.petbooking.repository.DeptExamStrengthRepository;
import com.petbooking.repository.ExamQuotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private DeptExamStrengthRepository deptExamStrengthRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private com.petbooking.repository.DepartmentRepository departmentRepository;
    @Autowired
    private ExamQuotaRepository quotaRepository;
    @Autowired
    private com.petbooking.repository.ExamSlotSeatRepository slotSeatRepository;

    @GetMapping("/departments")
    public ResponseEntity<?> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/sync-departments")
    public ResponseEntity<?> syncDepartmentsFromStudentMaster() {
        // Get all unique deptCodes from student_master_upload
        var allStudents = studentMasterUploadRepository.findAll();
        java.util.Set<String> deptCodes = new java.util.HashSet<>();
        for (var student : allStudents) {
            if (student.getDeptCode() != null && !student.getDeptCode().trim().isEmpty()) {
                deptCodes.add(student.getDeptCode().trim().toUpperCase());
            }
        }

        int created = 0;
        for (String code : deptCodes) {
            if (!departmentRepository.existsByDeptCode(code)) {
                com.petbooking.entity.Department dept = new com.petbooking.entity.Department();
                dept.setDeptCode(code);
                departmentRepository.save(dept);
                created++;
            }
        }

        return ResponseEntity.ok("Synced departments. Created " + created + " new departments. Total deptCodes found: "
                + deptCodes.size());
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
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) Long slotId,
            @RequestParam(required = false) Long deptId) {

        // Fetch booked seats from ExamSlotSeat (Where rollNumber is not null)
        // We ignore slotId/deptId filters for now or implement them if needed
        List<com.petbooking.entity.ExamSlotSeat> bookedSeats = slotSeatRepository.findAll().stream()
                .filter(s -> s.getRollNumber() != null)
                .collect(java.util.stream.Collectors.toList());

        // Map to response format expected by BookingViewer
        // Frontend expects: bookingId, student(rollNo, name), department(deptCode),
        // slot(slotDate, startTime, category)
        List<java.util.Map<String, Object>> response = bookedSeats.stream().map(seat -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("bookingId", seat.getSlotId());

            // Fetch student name lazily or just show rollNo if costly
            // Ideally we should use a join query, but for now we have rollNumber in seat
            java.util.Map<String, Object> studentMap = new java.util.HashMap<>();
            studentMap.put("rollNo", seat.getRollNumber());
            // We can try to fetch name if we have StudentRepository injected
            studentRepository.findById(seat.getRollNumber()).ifPresent(s -> studentMap.put("name", s.getName()));
            map.put("student", studentMap);

            java.util.Map<String, Object> deptMap = new java.util.HashMap<>();
            deptMap.put("deptCode", seat.getDepartment().getDeptCode());
            map.put("department", deptMap);

            java.util.Map<String, Object> slotMap = new java.util.HashMap<>();
            slotMap.put("slotDate", seat.getSlotDate());
            // Determine time/category
            Integer cat = seat.getCategoryType();
            String catStr = cat == 1 ? "DAY" : cat == 2 ? "HOSTEL_MALE" : "HOSTEL_FEMALE";
            slotMap.put("category", catStr);

            // Get time from Exam
            com.petbooking.entity.Exam exam = seat.getExam();
            if (cat == 1) {
                slotMap.put("startTime",
                        exam.getDayScholarStartTime() != null ? exam.getDayScholarStartTime().toString() : "TBD");
            } else {
                slotMap.put("startTime",
                        exam.getHostelStartTime() != null ? exam.getHostelStartTime().toString() : "TBD");
            }

            map.put("slot", slotMap);

            // Legacy support
            map.put("examQuota", java.util.Map.of("categoryType", cat));

            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(response);
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

    @DeleteMapping("/exams/{examId}")
    public ResponseEntity<?> deleteExam(@PathVariable Long examId) {
        try {
            examInitService.deleteExam(examId);
            return ResponseEntity.ok("Exam deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Delete failed: " + e.getMessage());
        }
    }

    @PatchMapping("/quotas/{quotaId}")
    public ResponseEntity<?> updateQuota(@PathVariable Long quotaId,
            @RequestBody java.util.Map<String, Object> updates) {
        try {
            var quota = quotaRepository.findById(quotaId).orElseThrow(() -> new RuntimeException("Quota not found"));
            if (updates.containsKey("maxCount")) {
                quota.setMaxCount(Integer.parseInt(updates.get("maxCount").toString()));
            }
            quotaRepository.save(quota);
            return ResponseEntity.ok(quota);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Update failed: " + e.getMessage());
        }
    }

    @PatchMapping("/quotas/{quotaId}/toggle")
    public ResponseEntity<?> toggleQuota(@PathVariable Long quotaId) {
        try {
            var quota = quotaRepository.findById(quotaId).orElseThrow(() -> new RuntimeException("Quota not found"));
            quota.setIsClosed(!quota.getIsClosed());
            quotaRepository.save(quota);
            return ResponseEntity.ok(quota);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Toggle failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/quotas/{quotaId}")
    public ResponseEntity<?> deleteQuota(@PathVariable Long quotaId) {
        try {
            quotaRepository.deleteById(quotaId);
            return ResponseEntity.ok("Quota deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Delete failed: " + e.getMessage());
        }
    }

    // ========== NEW: Publish/Stop Controls (OUR LOGIC) ==========
    @Autowired
    private com.petbooking.service.ExamAdminService examAdminService;

    /**
     * Publish slots for a specific department.
     * Only that department's students can book after this.
     */
    @PostMapping("/exams/{examId}/publish")
    public ResponseEntity<?> publishSlots(@PathVariable Long examId,
            @RequestBody java.util.Map<String, Long> request) {
        try {
            Long deptId = request.get("deptId");
            if (deptId == null) {
                // Publish all departments
                var result = examAdminService.publishAllSlots(examId);
                return ResponseEntity.ok(result);
            }
            var result = examAdminService.publishSlotsForDepartment(examId, deptId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Publish failed: " + e.getMessage());
        }
    }

    /**
     * Stop bookings for an exam or specific department.
     */
    @PostMapping("/exams/{examId}/stop")
    public ResponseEntity<?> stopBookings(@PathVariable Long examId,
            @RequestBody(required = false) java.util.Map<String, Long> request) {
        try {
            Long deptId = request != null ? request.get("deptId") : null;
            if (deptId == null) {
                var result = examAdminService.stopAllBookings(examId);
                return ResponseEntity.ok(result);
            }
            var result = examAdminService.stopSlotsForDepartment(examId, deptId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Stop failed: " + e.getMessage());
        }
    }

    /**
     * Cancel/Delete a specific booking.
     */
    @DeleteMapping("/bookings/{slotId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long slotId) {
        try {
            var result = examAdminService.cancelBooking(slotId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cancel failed: " + e.getMessage());
        }
    }

    /**
     * Get day-wise slot summary for admin dashboard.
     */
    @GetMapping("/exams/{examId}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable Long examId) {
        try {
            var stats = examAdminService.getDashboardStats(examId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dashboard failed: " + e.getMessage());
        }
    }

    /**
     * Get department-wise slot summary.
     */
    @GetMapping("/exams/{examId}/department-stats")
    public ResponseEntity<?> getDepartmentStats(@PathVariable Long examId) {
        try {
            var stats = examAdminService.getDepartmentStats(examId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Stats failed: " + e.getMessage());
        }
    }
}
