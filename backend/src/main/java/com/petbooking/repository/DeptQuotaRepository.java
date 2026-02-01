package com.petbooking.repository;

import com.petbooking.entity.DeptQuota;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeptQuotaRepository extends JpaRepository<DeptQuota, Long> {
    
    Optional<DeptQuota> findBySlotSlotIdAndDepartmentDeptId(Long slotId, Long deptId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM DeptQuota d WHERE d.slot.slotId = :slotId AND d.department.deptId = :deptId")
    Optional<DeptQuota> findBySlotAndDeptWithLock(@Param("slotId") Long slotId, @Param("deptId") Long deptId);
}
