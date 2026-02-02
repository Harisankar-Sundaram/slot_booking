package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "dept_quota", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "slot_id", "dept_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class DeptQuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quota_id")
    private Long quotaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Slot slot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    @Column(name = "quota_capacity", nullable = false)
    private int quotaCapacity;

    @Column(name = "booked_count", nullable = false)
    private int bookedCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
