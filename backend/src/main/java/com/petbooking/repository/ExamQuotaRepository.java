package com.petbooking.repository;

import com.petbooking.entity.ExamQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamQuotaRepository extends JpaRepository<ExamQuota, Long> {

        // Find quota by exam, dept, and category
        Optional<ExamQuota> findByExamExamIdAndDepartmentDeptIdAndCategoryType(
                        Long examId, Long deptId, Integer categoryType);

        // Count quotas by exam
        long countByExamExamId(Long examId);

        // Atomic increment of current_fill (returns 1 if successful, 0 if quota full)
        @Modifying
        @Query("UPDATE ExamQuota q SET q.currentFill = q.currentFill + 1 " +
                        "WHERE q.exam.examId = :examId AND q.department.deptId = :deptId " +
                        "AND q.categoryType = :categoryType AND q.currentFill < q.maxCount")
        int incrementCurrentFill(@Param("examId") Long examId,
                        @Param("deptId") Long deptId,
                        @Param("categoryType") Integer categoryType);

        // Get all quotas for an exam
        // Get all quotas for an exam
        List<ExamQuota> findByExamExamId(Long examId);

        // Delete all quotas for an exam
        void deleteByExamExamId(Long examId);

        // Find open quotas by department and category type for student view
        @Query("SELECT q FROM ExamQuota q JOIN FETCH q.exam e JOIN FETCH q.department d " +
                        "WHERE d.deptCode = :deptCode AND q.categoryType = :categoryType " +
                        "AND (q.isClosed IS NULL OR q.isClosed = false) " +
                        "AND q.currentFill < q.maxCount " +
                        "AND e.endingDate >= CURRENT_DATE " +
                        "ORDER BY e.startingDate")
        List<ExamQuota> findAvailableForStudent(@Param("deptCode") String deptCode,
                        @Param("categoryType") Integer categoryType);
}
