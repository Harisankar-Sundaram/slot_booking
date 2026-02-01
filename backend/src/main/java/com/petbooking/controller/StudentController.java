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
    public ResponseEntity<List<Slot>> getAvailableSlots(Authentication auth) {
        String rollNo = auth.getName();
        Student student = studentRepository.findById(rollNo).orElseThrow();
        
        // Filter by category
        List<Slot> slots = slotRepository.findByCategoryAndBookingOpenTrue(student.getCategory());
        // ideally add quota info to response
        return ResponseEntity.ok(slots);
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
