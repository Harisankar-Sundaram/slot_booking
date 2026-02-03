package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "roll_no", nullable = false)
    private Student student;

    // Made nullable for new exam quota booking system
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "slot_id", nullable = true)
    private Slot slot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    // New: Reference to exam quota for new booking system
    @Column(name = "exam_quota_id")
    private Long examQuotaId;

    @Column(name = "booked_at", nullable = false, updatable = false)
    private LocalDateTime bookedAt = LocalDateTime.now();
}
