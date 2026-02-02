package com.petbooking.repository;

import com.petbooking.entity.ExamDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamDayRepository extends JpaRepository<ExamDay, Integer> {
}
