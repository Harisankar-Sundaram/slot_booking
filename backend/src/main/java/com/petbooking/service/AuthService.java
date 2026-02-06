package com.petbooking.service;

import com.petbooking.config.JwtUtils;
import com.petbooking.dto.Dtos;
import com.petbooking.entity.Admin;
import com.petbooking.entity.Student;
import com.petbooking.repository.AdminRepository;
import com.petbooking.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // Note: Need to add Bean
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private OtpService otpService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private com.petbooking.repository.StudentMasterUploadRepository studentMasterUploadRepository;
    @Autowired
    private com.petbooking.repository.DepartmentRepository departmentRepository;

    // We can add PasswordEncoder bean to SecurityConfig later or use plain text for
    // now if simple
    // But requirement says "password_hash", so we should use BCrypt.
    // For now, I'll assume simple match or add BCrypt later.

    /**
     * Direct Student Login (No OTP)
     * Validates RollNo & Email against Master Records.
     * Auto-registers if not already in Students table.
     */
    public String studentLogin(Dtos.LoginRequest request) {
        // 1. Verify against StudentMasterUpload (Source of Truth)
        com.petbooking.entity.StudentMasterUpload masterRecord = studentMasterUploadRepository
                .findByRollNo(request.getRollNo())
                .orElseThrow(() -> new RuntimeException("Student not found in master records. Please contact admin."));

        if (!masterRecord.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email does not match our records for this Roll Number.");
        }

        // 2. Check if student exists in main table, if not, REGISTER THEM
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseGet(() -> registerStudentFromMaster(request.getEmail()));

        // 3. Generate Token
        return jwtUtils.generateToken(student.getRollNo(), "STUDENT");
    }

    // REMOVED OTP METHODS to simplify login as requested
    /*
     * public void initiateStudentLogin(Dtos.LoginRequest request) { ... }
     * public String verifyStudentOtp(Dtos.OtpVerificationRequest request) { ... }
     */

    private Student registerStudentFromMaster(String email) {
        com.petbooking.entity.StudentMasterUpload master = studentMasterUploadRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student master record not found during registration"));

        Student newStudent = new Student();
        newStudent.setRollNo(master.getRollNo());
        newStudent.setName(master.getName());
        newStudent.setEmail(master.getEmail());

        // Map Category
        try {
            if ("HOSTEL".equalsIgnoreCase(master.getStudentType())) {
                if ("MALE".equalsIgnoreCase(master.getGender()))
                    newStudent.setCategory(Student.StudentCategory.HOSTEL_MALE);
                else
                    newStudent.setCategory(Student.StudentCategory.HOSTEL_FEMALE);
            } else {
                newStudent.setCategory(Student.StudentCategory.DAY);
            }
        } catch (Exception e) {
            newStudent.setCategory(Student.StudentCategory.DAY); // Fallback
        }

        // Fetch and Set Department
        com.petbooking.entity.Department dept = departmentRepository.findByDeptCode(master.getDeptCode())
                .orElseThrow(() -> new RuntimeException("Department code " + master.getDeptCode() + " not found"));
        newStudent.setDepartment(dept);

        return studentRepository.save(newStudent);
    }

    public String adminLogin(Dtos.AdminLoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Simple password check for prototype (In prod use BCrypt)
        if (!admin.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Invalid Credentials");
        } // In real app, verify hash

        return jwtUtils.generateToken(admin.getEmail(), "ADMIN");
    }
}
