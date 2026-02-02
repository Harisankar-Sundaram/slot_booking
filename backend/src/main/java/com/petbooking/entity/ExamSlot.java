package com.petbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "exam_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ExamSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_day_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private ExamDay examDay;

    @Column(name = "session")
    private String session; // DAY or NIGHT

    @Column(name = "department")
    private String department;

    @Column(name = "student_type")
    private String studentType; // DAY or HOSTEL

    @Column(name = "gender")
    private String gender; // M, F, or ANY

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "booked_count")
    private Integer bookedCount = 0;
}
