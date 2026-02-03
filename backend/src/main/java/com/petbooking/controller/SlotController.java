package com.petbooking.controller;

import com.petbooking.dto.Dtos;
import com.petbooking.entity.DeptQuota;
import com.petbooking.entity.Slot;
import com.petbooking.repository.DeptQuotaRepository;
import com.petbooking.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/slots")
@PreAuthorize("hasRole('ADMIN')")
public class SlotController {

    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private DeptQuotaRepository deptQuotaRepository;

    @Autowired
    private com.petbooking.repository.DepartmentRepository departmentRepository;

    @PostMapping
    public ResponseEntity<?> createSlot(@RequestBody Dtos.CreateSlotRequest request) {
        // 1. Map DTO to Slot
        Slot slot = new Slot();
        // Parse YYYY-MM-DD to YYYYMMDD integer
        String dateStr = request.getExamDate().replace("-", "");
        slot.setExamDate(Integer.parseInt(dateStr));
        slot.setStartTime(LocalTime.parse(request.getStartTime()));
        slot.setEndTime(LocalTime.parse(request.getEndTime()));
        slot.setCategory(com.petbooking.entity.Student.StudentCategory.valueOf(request.getCategory()));
        slot.setPurpose(request.getPurpose());
        slot.setBookingOpen(true); // Default open

        if (slot.getStartTime().isAfter(slot.getEndTime())) {
            return ResponseEntity.badRequest().body("Invalid time range");
        }

        Slot savedSlot = slotRepository.save(slot);

        // 2. Iterate Quotas
        if (request.getQuotas() != null) {
            for (Dtos.DeptQuotaRequest q : request.getQuotas()) {
                DeptQuota dq = new DeptQuota();
                dq.setSlot(savedSlot);
                com.petbooking.entity.Department dept = new com.petbooking.entity.Department();
                dept.setDeptId(q.getDeptId());
                dq.setDepartment(dept);
                dq.setQuotaCapacity(q.getQuota());
                dq.setBookedCount(0);
                deptQuotaRepository.save(dq);
            }
        }

        return ResponseEntity.ok(savedSlot);
    }

    @PutMapping("/{slotId}")
    public ResponseEntity<?> updateSlot(@PathVariable Long slotId, @RequestBody Dtos.CreateSlotRequest request) {
        return slotRepository.findById(slotId).map(slot -> {
            String dateStr = request.getExamDate().replace("-", "");
            slot.setExamDate(Integer.parseInt(dateStr));
            slot.setStartTime(LocalTime.parse(request.getStartTime()));
            slot.setEndTime(LocalTime.parse(request.getEndTime()));
            slot.setCategory(com.petbooking.entity.Student.StudentCategory.valueOf(request.getCategory()));
            slot.setPurpose(request.getPurpose());
            // Note: Not updating quotas here to keep it simple, can be added if requested
            return ResponseEntity.ok(slotRepository.save(slot));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotRepository.findAll());
    }

    @DeleteMapping("/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long slotId) {
        if (!slotRepository.existsById(slotId)) {
            return ResponseEntity.notFound().build();
        }
        try {
            slotRepository.deleteById(slotId);
            return ResponseEntity.ok("Slot deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete slot (likely has bookings/quotas)");
        }
    }

    @PatchMapping("/{slotId}/toggle")
    public ResponseEntity<?> toggleSlotStatus(@PathVariable Long slotId) {
        return slotRepository.findById(slotId).map(slot -> {
            slot.setBookingOpen(!slot.isBookingOpen());
            slotRepository.save(slot);
            return ResponseEntity.ok(slot);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{slotId}/quotas")
    public ResponseEntity<?> setQuota(@PathVariable Long slotId, @RequestBody DeptQuota quota) {
        // Validate slot exists, dept exists...
        // Simplified
        Slot s = new Slot();
        s.setSlotId(slotId);
        quota.setSlot(s);
        deptQuotaRepository.save(quota);
        return ResponseEntity.ok("Quota set");
    }
}
