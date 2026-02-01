package com.petbooking.repository;

import com.petbooking.entity.DeptExamStrength;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DeptExamStrengthRepository extends JpaRepository<DeptExamStrength, Long> {
    Optional<DeptExamStrength> findByDepartmentDeptId(Long deptId);
}
