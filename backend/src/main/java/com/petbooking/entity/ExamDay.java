package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "exam_days")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "day_number")
    private Integer dayNumber;
}
