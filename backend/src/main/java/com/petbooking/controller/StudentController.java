package com.petbooking.controller;

import com.petbooking.dto.Dtos;
import com.petbooking.entity.Booking;
import com.petbooking.entity.Slot;
import com.petbooking.entity.Student;
import com.petbooking.repository.SlotRepository;
import com.petbooking.repository.StudentRepository;
import com.petbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private BookingService bookingService;

    @Autowired
    private com.petbooking.repository.ExamQuotaRepository examQuotaRepository;

    @GetMapping("/slots")
    public ResponseEntity<?> getAvailableSlots(Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Not Authenticated");
            }
            String rollNo = auth.getName();
            System.out.println("Fetching slots for Student: " + rollNo);

            Student student = studentRepository.findById(rollNo)
                    .orElseThrow(() -> new RuntimeException("Student not found with RollNo: " + rollNo));

            // Map student category to categoryType: 1=Day, 2=HostelM, 3=HostelF
            Integer categoryType;
            switch (student.getCategory()) {
                case DAY:
                    categoryType = 1;
                    break;
                case HOSTEL_MALE:
                    categoryType = 2;
                    break;
                case HOSTEL_FEMALE:
                    categoryType = 3;
                    break;
                default:
                    categoryType = 1;
            }

            String deptCode = student.getDepartment().getDeptCode();
            System.out.println("Student Dept: " + deptCode + ", CategoryType: " + categoryType);

            // Get available exam quotas for student's department and category
            var quotas = examQuotaRepository.findAvailableForStudent(deptCode, categoryType);
            System.out.println("Found " + quotas.size() + " available quotas");

            // Transform quotas into response format the frontend expects
            var response = quotas.stream().map(q -> {
                var map = new java.util.HashMap<String, Object>();
                map.put("slotId", q.getId());
                map.put("examDate", q.getExam().getStartingDate().toString());
                map.put("examName", q.getExam().getExamName());
                map.put("startTime", "09:00");
                map.put("endTime", "17:00");
                map.put("maxCount", q.getMaxCount());
                map.put("bookedCount", q.getCurrentFill());
                map.put("available", q.getMaxCount() - q.getCurrentFill());
                map.put("department", deptCode);
                map.put("category",
                        categoryType == 1 ? "Day Scholar" : categoryType == 2 ? "Hostel Boys" : "Hostel Girls");

                // Add quotas array for frontend compatibility
                var quotaInfo = new java.util.HashMap<String, Object>();
                quotaInfo.put("quotaId", q.getId());
                quotaInfo.put("quotaCapacity", q.getMaxCount());
                quotaInfo.put("bookedCount", q.getCurrentFill());
                quotaInfo.put("department", java.util.Map.of("deptCode", deptCode));
                map.put("quotas", java.util.List.of(quotaInfo));

                return map;
            }).toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching slots: " + e.getMessage());
        }
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookSlot(@RequestBody Dtos.BookingRequest request, Authentication auth) {
        try {
            String rollNo = auth.getName();
            var result = bookingService.bookExamQuota(rollNo, request.getSlotId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get list of available exams for students.
     */
    @GetMapping("/exams")
    public ResponseEntity<?> getExams() {
        return ResponseEntity.ok(examRepository.findAll());
    }

    // ========== NEW: Exam Slot Endpoints ==========
    @Autowired
    private com.petbooking.repository.ExamSlotRepository examSlotRepository;

    @GetMapping("/exam-slots")
    public ResponseEntity<?> getAvailableExamSlots(Authentication auth) {
        try {
            String rollNo = auth.getName();
            Student student = studentRepository.findById(rollNo)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Map category to studentType and gender
            String studentType = student.getCategory() == Student.StudentCategory.DAY ? "DAY" : "HOSTEL";
            String gender = student.getCategory() == Student.StudentCategory.HOSTEL_MALE ? "M"
                    : student.getCategory() == Student.StudentCategory.HOSTEL_FEMALE ? "F" : "ANY";
            String dept = student.getDepartment().getDeptCode();

            var slots = examSlotRepository.findAvailableSlots(dept, studentType, gender);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching exam slots: " + e.getMessage());
        }
    }

    @PostMapping("/book-exam-slot")
    public ResponseEntity<?> bookExamSlot(@RequestBody java.util.Map<String, Integer> request, Authentication auth) {
        String rollNo = auth.getName();
        Integer examSlotId = request.get("examSlotId");
        if (examSlotId == null) {
            throw new RuntimeException("examSlotId is required");
        }
        Booking booking = bookingService.bookExamSlot(rollNo, examSlotId);
        return ResponseEntity.ok(booking);
    }

    // ========== NEW: Seat-Based Booking (OUR LOGIC) ==========
    @Autowired
    private com.petbooking.repository.ExamSlotSeatRepository slotSeatRepository;
    @Autowired
    private com.petbooking.repository.ExamRepository examRepository;

    /**
     * Get available exam dates with slot counts for student.
     * Only shows PUBLISHED slots (book=true) for student's dept/category.
     */
    @GetMapping("/available-dates/{examId}")
    public ResponseEntity<?> getAvailableDates(@PathVariable Long examId, Authentication auth) {
        try {
            String rollNo = auth.getName();
            Student student = studentRepository.findById(rollNo)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Integer categoryType = mapCategoryType(student.getCategory());
            Long deptId = student.getDepartment().getDeptId();

            var dates = slotSeatRepository.findAvailableDatesWithCount(examId, deptId, categoryType);

            // Get exam for time windows
            var exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));

            var result = new java.util.ArrayList<java.util.Map<String, Object>>();
            for (Object[] row : dates) {
                var item = new java.util.HashMap<String, Object>();
                item.put("slotDate", ((java.time.LocalDate) row[0]).toString());
                item.put("availableCount", row[1]);

                // Include time window based on category
                if (categoryType == 1) {
                    item.put("startTime",
                            exam.getDayScholarStartTime() != null ? exam.getDayScholarStartTime().toString() : "TBD");
                    item.put("endTime",
                            exam.getDayScholarEndTime() != null ? exam.getDayScholarEndTime().toString() : "TBD");
                } else {
                    item.put("startTime",
                            exam.getHostelStartTime() != null ? exam.getHostelStartTime().toString() : "TBD");
                    item.put("endTime", exam.getHostelEndTime() != null ? exam.getHostelEndTime().toString() : "TBD");
                }
                result.add(item);
            }

            return ResponseEntity.ok(java.util.Map.of(
                    "examId", examId,
                    "examName", exam.getExamName(),
                    "availableDates", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Book a seat using atomic UPDATE (race-condition safe).
     */
    @PostMapping("/book-seat")
    public ResponseEntity<?> bookSeat(@RequestBody java.util.Map<String, Object> request, Authentication auth) {
        try {
            String rollNo = auth.getName();
            Long examId = Long.parseLong(request.get("examId").toString());
            java.time.LocalDate slotDate = java.time.LocalDate.parse(request.get("slotDate").toString());

            var result = bookingService.bookSeat(rollNo, examId, slotDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get student's booked slot (if any).
     */
    @GetMapping("/my-booking")
    public ResponseEntity<?> getMyBooking(Authentication auth) {
        try {
            String rollNo = auth.getName();
            var booking = bookingService.getStudentBooking(rollNo);

            if (booking == null) {
                return ResponseEntity.ok(java.util.Map.of("hasBooking", false));
            }

            booking.put("hasBooking", true);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Helper to map category enum to type integer.
     */
    private Integer mapCategoryType(Student.StudentCategory category) {
        switch (category) {
            case DAY:
                return 1;
            case HOSTEL_MALE:
                return 2;
            case HOSTEL_FEMALE:
                return 3;
            default:
                return 1;
        }
    }
}
