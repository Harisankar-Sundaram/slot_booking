package com.petbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "exam_slot_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ExamSlotSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id")
    private Long slotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Exam exam;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "roll_number")
    private String rollNumber; // NULL until booked

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Department department;

    @Column(name = "category_type")
    private Integer categoryType; // 1=Day, 2=HostelM, 3=HostelF

    @Column(name = "status", nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, BOOKED
}
