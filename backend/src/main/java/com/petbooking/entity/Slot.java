package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDateTime;
import com.petbooking.entity.Student.StudentCategory;

@Entity
@Table(name = "slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id")
    private Long slotId;

    @Column(name = "exam_date", nullable = false)
    private Integer examDate; // Changed from LocalDate to Integer as requested

    @Column(name = "exam_id")
    private Long examId;

    @Column(name = "dept_code")
    private String deptCode;

    @Column(name = "roll_no")
    private String rollNo;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentCategory category;

    @Column(name = "booking_open", nullable = false)
    private boolean bookingOpen = false;

    @Column(name = "purpose")
    private String purpose;

    @OneToMany(mappedBy = "slot", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private java.util.List<DeptQuota> quotas;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
