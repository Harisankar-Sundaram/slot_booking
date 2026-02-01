package com.petbooking.service;

import com.petbooking.dto.Dtos;
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
        // This query acquires a PESSIMISTIC_WRITE lock on the dept_quota row
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
}
