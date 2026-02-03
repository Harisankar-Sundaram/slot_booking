package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
}
