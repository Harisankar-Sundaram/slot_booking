package com.petbooking.repository;

import com.petbooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByStudentRollNo(String rollNo);
    boolean existsByStudentRollNoAndSlotSlotId(String rollNo, Long slotId);
    List<Booking> findBySlotSlotId(Long slotId);
    List<Booking> findByDepartmentDeptId(Long deptId);
}
