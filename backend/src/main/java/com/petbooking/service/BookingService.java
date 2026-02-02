package com.petbooking.service;

import com.petbooking.entity.*;
import com.petbooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
