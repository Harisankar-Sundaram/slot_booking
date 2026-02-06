package com.petbooking.service;

import com.petbooking.entity.*;
import com.petbooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private DeptQuotaRepository deptQuotaRepository;
    @Autowired
    private ExamSlotRepository examSlotRepository;
    @Autowired
    private com.petbooking.repository.ExamQuotaRepository examQuotaRepository;

    // ========== OLD METHOD (Legacy) ==========
    @Transactional
    public Booking bookSlot(String rollNo, Long slotId) {
        // 1. Validate Student
        Student student = studentRepository.findById(rollNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Validate Slot
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.isBookingOpen()) {
            throw new RuntimeException("Booking is closed for this slot");
        }

        if (slot.getCategory() != student.getCategory()) {
            throw new RuntimeException("Student category mismatch");
        }

        // 3. Check existing booking (Duplicate Check)
        if (bookingRepository.existsByStudentRollNoAndSlotSlotId(rollNo, slotId)) {
            throw new RuntimeException("You have already booked this slot");
        }

        // 4. Lock Quota Row & Check Availability
        DeptQuota quota = deptQuotaRepository.findBySlotAndDeptWithLock(slotId, student.getDepartment().getDeptId())
                .orElseThrow(() -> new RuntimeException("Quota not defined for this department/slot"));

        if (quota.getBookedCount() >= quota.getQuotaCapacity()) {
            throw new RuntimeException("Slot full for your department");
        }

        // 5. Update Quota
        quota.setBookedCount(quota.getBookedCount() + 1);
        deptQuotaRepository.save(quota);

        // 6. Create Booking
        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setSlot(slot);
        booking.setDepartment(student.getDepartment());

        return bookingRepository.save(booking);
    }

    // ========== NEW METHOD: Atomic Exam Slot Booking ==========
    @Transactional
    public Booking bookExamSlot(String rollNo, Integer examSlotId) {
        // 1. Validate Student
        Student student = studentRepository.findById(rollNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Check if student already has a booking
        if (bookingRepository.existsByStudentRollNo(rollNo)) {
            throw new RuntimeException("You have already booked a slot");
        }

        // 3. Get student's type and gender for validation
        String studentType = student.getCategory() == Student.StudentCategory.DAY ? "DAY" : "HOSTEL";
        String gender = student.getCategory() == Student.StudentCategory.HOSTEL_MALE ? "M"
                : student.getCategory() == Student.StudentCategory.HOSTEL_FEMALE ? "F" : "ANY";
        String dept = student.getDepartment().getDeptCode();

        // 4. Get the slot
        ExamSlot slot = examSlotRepository.findById(examSlotId)
                .orElseThrow(() -> new RuntimeException("Exam slot not found"));

        // 5. Validate slot matches student profile
        if (!slot.getStudentType().equals(studentType)) {
            throw new RuntimeException("This slot is not for your student type");
        }
        if (!slot.getDepartment().equals(dept)) {
            throw new RuntimeException("This slot is not for your department");
        }
        if (!"ANY".equals(slot.getGender()) && !slot.getGender().equals(gender)) {
            throw new RuntimeException("This slot is not for your gender");
        }

        // 6. Atomic increment (CRITICAL - Race condition safe)
        int updated = examSlotRepository.incrementBookedCount(examSlotId);
        if (updated == 0) {
            throw new RuntimeException("Slot is full. Please choose another slot.");
        }

        // 7. Create Booking (new style - using student_id and exam_slot_id)
        Booking booking = new Booking();
        booking.setStudent(student);
        // Note: We're using the old booking table for now.
        // In production, consider a separate exam_bookings table.
        booking.setDepartment(student.getDepartment());

        return bookingRepository.save(booking);
    }

    // ========== NEW METHOD: Book via Exam Quota ==========
    @Transactional
    public java.util.Map<String, Object> bookExamQuota(String rollNo, Long quotaId) {
        // 1. Validate Student
        Student student = studentRepository.findById(rollNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Check if student already has a booking for any exam
        if (bookingRepository.existsByStudentRollNo(rollNo)) {
            throw new RuntimeException("You have already booked a slot");
        }

        // 3. Get the quota
        com.petbooking.entity.ExamQuota quota = examQuotaRepository.findById(quotaId)
                .orElseThrow(() -> new RuntimeException("Quota not found"));

        // 4. Check if quota is closed
        if (quota.getIsClosed() != null && quota.getIsClosed()) {
            throw new RuntimeException("Booking is closed for this slot");
        }

        // 5. Check if quota is full
        if (quota.getCurrentFill() >= quota.getMaxCount()) {
            throw new RuntimeException("No slots available - quota is full");
        }

        // 6. Map student category to categoryType
        Integer studentCategoryType;
        switch (student.getCategory()) {
            case DAY:
                studentCategoryType = 1;
                break;
            case HOSTEL_MALE:
                studentCategoryType = 2;
                break;
            case HOSTEL_FEMALE:
                studentCategoryType = 3;
                break;
            default:
                studentCategoryType = 1;
        }

        // 7. Validate quota matches student profile
        if (!quota.getCategoryType().equals(studentCategoryType)) {
            throw new RuntimeException("This slot is not for your category");
        }
        if (!quota.getDepartment().getDeptCode().equalsIgnoreCase(student.getDepartment().getDeptCode())) {
            throw new RuntimeException("This slot is not for your department");
        }

        // 8. Atomic increment (race-condition safe)
        int updated = examQuotaRepository.incrementCurrentFill(
                quota.getExam().getExamId(),
                quota.getDepartment().getDeptId(),
                quota.getCategoryType());
        if (updated == 0) {
            throw new RuntimeException("Slot is full. Please try another.");
        }

        // 9. Create Booking record
        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setDepartment(student.getDepartment());
        booking.setExamQuotaId(quotaId); // Store reference to exam quota
        Booking saved = bookingRepository.save(booking);

        // 10. Return booking confirmation data
        var result = new java.util.HashMap<String, Object>();
        result.put("bookingId", saved.getBookingId());
        result.put("rollNo", rollNo);
        result.put("examName", quota.getExam().getExamName());
        result.put("examDate", quota.getExam().getStartingDate().toString());
        result.put("department", student.getDepartment().getDeptCode());
        result.put("category",
                studentCategoryType == 1 ? "Day Scholar" : studentCategoryType == 2 ? "Hostel Boys" : "Hostel Girls");
        result.put("message", "Booking successful!");

        return result;
    }

    // ========== NEW: Atomic Seat-Based Booking (OUR LOGIC) ==========
    @Autowired
    private ExamSlotSeatRepository slotSeatRepository;
    @Autowired
    private ExamRepository examRepository;

    /**
     * Book a seat using atomic UPDATE (race-condition safe).
     * No SELECT-then-UPDATE race condition possible.
     * Uses FOR UPDATE SKIP LOCKED for concurrent request handling.
     */
    @Transactional
    public java.util.Map<String, Object> bookSeat(String rollNo, Long examId, java.time.LocalDate slotDate) {
        // 1. Validate Student
        Student student = studentRepository.findById(rollNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Check if student already booked this exam
        if (slotSeatRepository.existsByExamExamIdAndRollNumber(examId, rollNo)) {
            throw new RuntimeException("You have already booked this exam");
        }

        // 3. Map student category to categoryType
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
                throw new RuntimeException("Unknown student category");
        }

        Long deptId = student.getDepartment().getDeptId();

        // 4. Atomic booking - single UPDATE query, no race condition
        int updated = slotSeatRepository.atomicBookSlot(examId, deptId, categoryType, slotDate, rollNo);

        if (updated == 0) {
            throw new RuntimeException("No slots available for your selection. Please try another date.");
        }

        // 5. Get booked slot details for response
        ExamSlotSeat bookedSlot = slotSeatRepository.findByExamIdAndRollNumber(examId, rollNo)
                .orElseThrow(() -> new RuntimeException("Booking failed unexpectedly"));

        Exam exam = bookedSlot.getExam();

        // 6. Build response with slot details
        var result = new java.util.HashMap<String, Object>();
        result.put("slotId", bookedSlot.getSlotId());
        result.put("rollNo", rollNo);
        result.put("examId", examId);
        result.put("examName", exam.getExamName());
        result.put("slotDate", bookedSlot.getSlotDate().toString());
        result.put("department", student.getDepartment().getDeptCode());
        result.put("category", categoryType == 1 ? "Day Scholar" : categoryType == 2 ? "Hostel Boys" : "Hostel Girls");
        result.put("status", "BOOKED");
        result.put("message", "Booking successful!");

        // Include time window based on category
        if (categoryType == 1) {
            result.put("startTime",
                    exam.getDayScholarStartTime() != null ? exam.getDayScholarStartTime().toString() : "TBD");
            result.put("endTime", exam.getDayScholarEndTime() != null ? exam.getDayScholarEndTime().toString() : "TBD");
        } else {
            result.put("startTime", exam.getHostelStartTime() != null ? exam.getHostelStartTime().toString() : "TBD");
            result.put("endTime", exam.getHostelEndTime() != null ? exam.getHostelEndTime().toString() : "TBD");
        }

        return result;
    }

    /**
     * Get student's booked slot for an exam.
     */
    /**
     * Get student's booked slots for ALL exams.
     */
    public java.util.List<java.util.Map<String, Object>> getStudentBookings(String rollNo) {
        java.util.List<ExamSlotSeat> bookedSlots = slotSeatRepository.findByRollNumber(rollNo);

        if (bookedSlots.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        return bookedSlots.stream().map(slot -> {
            Exam exam = slot.getExam();
            Integer categoryType = slot.getCategoryType();

            var result = new java.util.HashMap<String, Object>();
            result.put("slotId", slot.getSlotId());
            result.put("examId", exam.getExamId());
            result.put("examName", exam.getExamName());
            result.put("slotDate", slot.getSlotDate().toString());
            result.put("deptCode", slot.getDepartment().getDeptCode());
            result.put("category",
                    categoryType == 1 ? "Day Scholar" : categoryType == 2 ? "Hostel Boys" : "Hostel Girls");
            result.put("status", slot.getStatus());
            result.put("hasBooking", true); // Helper flag

            // Include time window based on category
            if (categoryType == 1) {
                result.put("startTime",
                        exam.getDayScholarStartTime() != null ? exam.getDayScholarStartTime().toString() : "TBD");
                result.put("endTime",
                        exam.getDayScholarEndTime() != null ? exam.getDayScholarEndTime().toString() : "TBD");
            } else {
                result.put("startTime",
                        exam.getHostelStartTime() != null ? exam.getHostelStartTime().toString() : "TBD");
                result.put("endTime", exam.getHostelEndTime() != null ? exam.getHostelEndTime().toString() : "TBD");
            }

            return result;
        }).collect(java.util.stream.Collectors.toList());
    }
}
