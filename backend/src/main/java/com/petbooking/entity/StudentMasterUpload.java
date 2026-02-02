package com.petbooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_master_upload")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentMasterUpload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_no", unique = true, nullable = false)
    private String rollNo;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "dept_code", nullable = false)
    private String deptCode;

    @Column(name = "student_type", nullable = false)
    private String studentType; // DAY / HOSTEL

    @Column(nullable = false)
    private String gender; // MALE / FEMALE

    @Column(name = "uploaded_by_admin_id")
    private Long uploadedByAdminId;
}
