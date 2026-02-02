package com.petbooking.repository;

import com.petbooking.entity.StudentMasterUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentMasterUploadRepository extends JpaRepository<StudentMasterUpload, Long> {
    Optional<StudentMasterUpload> findByRollNo(String rollNo);

    Optional<StudentMasterUpload> findByEmail(String email);

    boolean existsByRollNo(String rollNo);

    boolean existsByEmail(String email);
}
