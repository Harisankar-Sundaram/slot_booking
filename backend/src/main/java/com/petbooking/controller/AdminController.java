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
}
