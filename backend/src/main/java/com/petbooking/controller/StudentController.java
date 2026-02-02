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
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private BookingService bookingService;

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

            System.out.println("Student Category: " + student.getCategory());

            // Filter by category
            List<Slot> slots = slotRepository.findByCategoryAndBookingOpenTrue(student.getCategory());
            System.out.println("Found " + slots.size() + " slots");

            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching slots: " + e.getMessage());
        }
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookSlot(@RequestBody Dtos.BookingRequest request, Authentication auth) {
        String rollNo = auth.getName();
        try {
            Booking booking = bookingService.bookSlot(rollNo, request.getSlotId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
