package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "dept_exam_strength")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeptExamStrength {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "strength_id")
    private Long strengthId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dept_id", nullable = false, unique = true)
    private Department department;

    @Column(name = "day_count", nullable = false)
    private int dayCount = 0;

    @Column(name = "hostel_male_count", nullable = false)
    private int hostelMaleCount = 0;

    @Column(name = "hostel_female_count", nullable = false)
    private int hostelFemaleCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
