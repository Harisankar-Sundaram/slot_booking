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
        // Check if student already booked
        boolean existsByRollNumber(String rollNumber);

        // Delete all slots for an exam
        void deleteByExamExamId(Long examId);
}
