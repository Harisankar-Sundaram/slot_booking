package com.petbooking.service;

import com.petbooking.entity.Exam;
import com.petbooking.repository.ExamRepository;
import com.petbooking.repository.ExamSlotSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * Service for Admin operations on Exam Slots.
 * Handles publish/stop controls and dashboard stats.
 */
@Service
public class ExamAdminService {

    @Autowired
    private ExamSlotSeatRepository slotSeatRepository;

    @Autowired
    private ExamRepository examRepository;

    /**
     * Publish slots for a specific department.
     * Only that department's students can book after this.
     */
    @Transactional
    public Map<String, Object> publishSlotsForDepartment(Long examId, Long deptId) {
        int updated = slotSeatRepository.publishSlotsForDepartment(examId, deptId);
        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("deptId", deptId);
        result.put("slotsPublished", updated);
        result.put("message", "Published " + updated + " slots for department");
        return result;
    }

    /**
     * Publish ALL slots for an exam (all departments at once).
     */
    @Transactional
    public Map<String, Object> publishAllSlots(Long examId) {
        int updated = slotSeatRepository.publishAllSlots(examId);
        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("slotsPublished", updated);
        result.put("message", "Published all " + updated + " slots");
        return result;
    }

    /**
     * Stop all bookings for an exam.
     * Sets book=false so slots become invisible to students.
     * Already booked slots remain intact.
     */
    @Transactional
    public Map<String, Object> stopAllBookings(Long examId) {
        int updated = slotSeatRepository.stopAllBookings(examId);
        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("slotsStopped", updated);
        result.put("message", "Stopped bookings for " + updated + " slots");
        return result;
    }

    /**
     * Stop bookings for a specific department.
     */
    @Transactional
    public Map<String, Object> stopSlotsForDepartment(Long examId, Long deptId) {
        int updated = slotSeatRepository.stopSlotsForDepartment(examId, deptId);
        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("deptId", deptId);
        result.put("slotsStopped", updated);
        result.put("message", "Stopped " + updated + " slots for department");
        return result;
    }

    /**
     * Cancel a specific booking.
     */
    @Transactional
    public Map<String, Object> cancelBooking(Long slotId) {
        int updated = slotSeatRepository.cancelBooking(slotId);
        Map<String, Object> result = new HashMap<>();
        result.put("slotId", slotId);
        result.put("success", updated > 0);
        result.put("message", updated > 0 ? "Booking cancelled" : "Booking not found or already available");
        return result;
    }

    /**
     * Get day-wise slot summary for admin dashboard.
     * Shows total, booked, and available slots per day per category.
     */
    public List<Map<String, Object>> getDashboardStats(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));

        List<Object[]> stats = slotSeatRepository.getDashboardStats(examId);
        List<Map<String, Object>> result = new ArrayList<>();

        // Group by date
        Map<LocalDate, Map<String, Object>> byDate = new LinkedHashMap<>();

        for (Object[] row : stats) {
            LocalDate date = (LocalDate) row[0];
            Integer categoryType = (Integer) row[1];
            Long total = (Long) row[2];
            Long booked = (Long) row[3];

            byDate.putIfAbsent(date, new HashMap<>());
            Map<String, Object> dayStats = byDate.get(date);
            dayStats.put("slotDate", date.toString());

            String catName = categoryType == 1 ? "dayScholar" : categoryType == 2 ? "hostelBoys" : "hostelGirls";
            dayStats.put(catName + "Total", total);
            dayStats.put(catName + "Booked", booked);
            dayStats.put(catName + "Available", total - booked);
        }

        for (Map<String, Object> dayStats : byDate.values()) {
            // Calculate totals
            long totalSlots = ((Number) dayStats.getOrDefault("dayScholarTotal", 0L)).longValue() +
                    ((Number) dayStats.getOrDefault("hostelBoysTotal", 0L)).longValue() +
                    ((Number) dayStats.getOrDefault("hostelGirlsTotal", 0L)).longValue();
            long bookedSlots = ((Number) dayStats.getOrDefault("dayScholarBooked", 0L)).longValue() +
                    ((Number) dayStats.getOrDefault("hostelBoysBooked", 0L)).longValue() +
                    ((Number) dayStats.getOrDefault("hostelGirlsBooked", 0L)).longValue();

            dayStats.put("totalSlots", totalSlots);
            dayStats.put("bookedSlots", bookedSlots);
            dayStats.put("availableSlots", totalSlots - bookedSlots);
            result.add(dayStats);
        }

        return result;
    }

    /**
     * Get department-wise slot summary for admin.
     */
    public List<Map<String, Object>> getDepartmentStats(Long examId) {
        List<Object[]> stats = slotSeatRepository.getDepartmentStats(examId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : stats) {
            Map<String, Object> deptStats = new HashMap<>();
            deptStats.put("deptId", row[0]);
            deptStats.put("deptCode", row[1]);
            deptStats.put("totalSlots", row[2]);
            deptStats.put("bookedSlots", row[3]);
            deptStats.put("publishedSlots", row[4]);

            Long total = (Long) row[2];
            Long booked = (Long) row[3];
            deptStats.put("availableSlots", total - booked);

            result.add(deptStats);
        }

        return result;
    }
}
