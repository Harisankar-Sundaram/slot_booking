package com.petbooking.repository;

import com.petbooking.entity.ExamSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamSlotRepository extends JpaRepository<ExamSlot, Integer> {

    // Find slots available for a student based on their type, department, and
    // gender
    @Query("SELECT e FROM ExamSlot e WHERE e.department = :dept AND e.studentType = :studentType " +
            "AND (e.gender = 'ANY' OR e.gender = :gender) AND e.bookedCount < e.maxCapacity")
    List<ExamSlot> findAvailableSlots(@Param("dept") String department,
            @Param("studentType") String studentType,
            @Param("gender") String gender);

    // Atomic increment for booking (returns 1 if successful, 0 if slot full)
    @Modifying
    @Query("UPDATE ExamSlot e SET e.bookedCount = e.bookedCount + 1 " +
            "WHERE e.id = :slotId AND e.bookedCount < e.maxCapacity")
    int incrementBookedCount(@Param("slotId") Integer slotId);
}
