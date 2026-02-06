package com.petbooking.repository;

import com.petbooking.entity.ExamSlotSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSlotSeatRepository extends JpaRepository<ExamSlotSeat, Long> {

        // Find available slots for a student's exam, dept, and category
        @Query("SELECT s FROM ExamSlotSeat s WHERE s.exam.examId = :examId " +
                        "AND s.department.deptId = :deptId AND s.categoryType = :categoryType " +
                        "AND s.status = 'AVAILABLE' ORDER BY s.slotDate")
        List<ExamSlotSeat> findAvailableSlots(@Param("examId") Long examId,
                        @Param("deptId") Long deptId,
                        @Param("categoryType") Integer categoryType);

        // Atomic booking - find first available and lock
        @Query("SELECT s FROM ExamSlotSeat s WHERE s.exam.examId = :examId " +
                        "AND s.department.deptId = :deptId AND s.categoryType = :categoryType " +
                        "AND s.slotDate = :slotDate AND s.status = 'AVAILABLE'")
        List<ExamSlotSeat> findAvailableSlotForBooking(@Param("examId") Long examId,
                        @Param("deptId") Long deptId,
                        @Param("categoryType") Integer categoryType,
                        @Param("slotDate") LocalDate slotDate);

        // Count slots by exam
        long countByExamExamId(Long examId);

        // Check if student already booked
        boolean existsByRollNumber(String rollNumber);

        // Check if student already booked this specific exam
        boolean existsByExamExamIdAndRollNumber(Long examId, String rollNumber);

        // Delete all slots for an exam
        void deleteByExamExamId(Long examId);

        // ========== NEW: Atomic Booking (Race-Condition Safe) ==========
        // Uses FOR UPDATE SKIP LOCKED to handle concurrent requests
        @Modifying
        @Query(value = """
                        UPDATE exam_slot_seats
                        SET roll_number = :rollNo, status = 'BOOKED'
                        WHERE slot_id = (
                            SELECT slot_id FROM exam_slot_seats
                            WHERE exam_id = :examId
                            AND dept_id = :deptId
                            AND category_type = :categoryType
                            AND slot_date = :slotDate
                            AND roll_number IS NULL
                            AND book = true
                            LIMIT 1
                            FOR UPDATE SKIP LOCKED
                        )
                        """, nativeQuery = true)
        int atomicBookSlot(@Param("examId") Long examId,
                        @Param("deptId") Long deptId,
                        @Param("categoryType") Integer categoryType,
                        @Param("slotDate") LocalDate slotDate,
                        @Param("rollNo") String rollNo);

        // ========== NEW: Publish/Stop Controls ==========
        // Publish slots for a specific department
        @Modifying
        @Query("UPDATE ExamSlotSeat s SET s.book = true " +
                        "WHERE s.exam.examId = :examId AND s.department.deptId = :deptId")
        int publishSlotsForDepartment(@Param("examId") Long examId, @Param("deptId") Long deptId);

        // Publish slots for ALL departments in an exam
        @Modifying
        @Query("UPDATE ExamSlotSeat s SET s.book = true WHERE s.exam.examId = :examId")
        int publishAllSlots(@Param("examId") Long examId);

        // Stop all bookings for an exam (make slots invisible)
        @Modifying
        @Query("UPDATE ExamSlotSeat s SET s.book = false WHERE s.exam.examId = :examId")
        int stopAllBookings(@Param("examId") Long examId);

        // ========== NEW: Student Slot Queries ==========
        // Find PUBLISHED available slots for student (only where book=true)
        @Query("SELECT s FROM ExamSlotSeat s WHERE s.exam.examId = :examId " +
                        "AND s.department.deptId = :deptId AND s.categoryType = :categoryType " +
                        "AND s.book = true AND s.rollNumber IS NULL ORDER BY s.slotDate")
        List<ExamSlotSeat> findPublishedAvailableSlots(@Param("examId") Long examId,
                        @Param("deptId") Long deptId,
                        @Param("categoryType") Integer categoryType);

        // Get available dates with slot counts
        @Query("SELECT s.slotDate, COUNT(s) FROM ExamSlotSeat s WHERE s.exam.examId = :examId " +
                        "AND s.department.deptId = :deptId AND s.categoryType = :categoryType " +
                        "AND s.book = true AND s.rollNumber IS NULL GROUP BY s.slotDate ORDER BY s.slotDate")
        List<Object[]> findAvailableDatesWithCount(@Param("examId") Long examId,
                        @Param("deptId") Long deptId,
                        @Param("categoryType") Integer categoryType);

        // Get student's booked slot
        @Query("SELECT s FROM ExamSlotSeat s WHERE s.rollNumber = :rollNo")
        Optional<ExamSlotSeat> findByRollNumber(@Param("rollNo") String rollNo);

        // Get student's booked slot for specific exam
        @Query("SELECT s FROM ExamSlotSeat s WHERE s.exam.examId = :examId AND s.rollNumber = :rollNo")
        Optional<ExamSlotSeat> findByExamIdAndRollNumber(@Param("examId") Long examId,
                        @Param("rollNo") String rollNo);

        // ========== NEW: Admin Dashboard Stats ==========
        // Day-wise slot summary for dashboard
        @Query("SELECT s.slotDate, s.categoryType, COUNT(s), " +
                        "SUM(CASE WHEN s.rollNumber IS NOT NULL THEN 1 ELSE 0 END) " +
                        "FROM ExamSlotSeat s WHERE s.exam.examId = :examId " +
                        "GROUP BY s.slotDate, s.categoryType ORDER BY s.slotDate")
        List<Object[]> getDashboardStats(@Param("examId") Long examId);

        // Department-wise slot summary
        @Query("SELECT s.department.deptId, s.department.deptCode, COUNT(s), " +
                        "SUM(CASE WHEN s.rollNumber IS NOT NULL THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN s.book = true THEN 1 ELSE 0 END) " +
                        "FROM ExamSlotSeat s WHERE s.exam.examId = :examId " +
                        "GROUP BY s.department.deptId, s.department.deptCode")
        List<Object[]> getDepartmentStats(@Param("examId") Long examId);
}
