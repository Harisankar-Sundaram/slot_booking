package com.petbooking.repository;

import com.petbooking.entity.Slot;
import com.petbooking.entity.Student.StudentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByCategoryAndBookingOpenTrue(StudentCategory category);
}
