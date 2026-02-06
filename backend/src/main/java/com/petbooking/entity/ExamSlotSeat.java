package com.petbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "exam_slot_seats", indexes = {
        @Index(name = "idx_exam_dept_cat_date", columnList = "exam_id, dept_id, category_type, slot_date"),
        @Index(name = "idx_roll_number", columnList = "roll_number"),
        @Index(name = "idx_exam_book", columnList = "exam_id, book")
})
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

    @Column(name = "book", nullable = false)
    private Boolean book = false; // false = unpublished, true = published/bookable
}
