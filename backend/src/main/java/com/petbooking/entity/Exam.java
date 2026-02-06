package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Long examId;

    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Column(name = "no_of_days", nullable = false)
    private Integer noOfDays;

    @Column(name = "starting_date", nullable = false)
    private LocalDate startingDate;

    @Column(name = "ending_date", nullable = false)
    private LocalDate endingDate;

    @Column(name = "exam_purpose")
    private String examPurpose;

    @Column(name = "total_day_scholars")
    private Integer totalDayScholars = 0;

    @Column(name = "total_hostel_boys")
    private Integer totalHostelBoys = 0;

    @Column(name = "total_hostel_girls")
    private Integer totalHostelGirls = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Time windows for different student categories
    @Column(name = "day_scholar_start_time")
    private LocalTime dayScholarStartTime;

    @Column(name = "day_scholar_end_time")
    private LocalTime dayScholarEndTime;

    @Column(name = "hostel_start_time")
    private LocalTime hostelStartTime;

    @Column(name = "hostel_end_time")
    private LocalTime hostelEndTime;

    @Column(name = "systems_per_slot")
    private Integer systemsPerSlot = 30;
}
