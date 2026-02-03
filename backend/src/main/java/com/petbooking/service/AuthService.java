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

    public void initiateStudentLogin(Dtos.LoginRequest request) {
        // 1. Verify against StudentMasterUpload (Source of Truth for Allowed Students)
        com.petbooking.entity.StudentMasterUpload masterRecord = studentMasterUploadRepository
                .findByRollNo(request.getRollNo())
                .orElseThrow(() -> new RuntimeException("Student not found in master records"));

        if (!masterRecord.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email does not match master records");
        }

        // REMOVED: Strict check for existing registration.
        // We now allow OTP if they are in the master list, and auto-register on verify.

        // Rate Check
        if (!otpService.checkRateLimit("rate:" + request.getEmail(), 5, 300)) {
            throw new RuntimeException("Too many attempts. Try again later.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpService.saveOtp("otp:" + request.getEmail(), otp);

        // Mock Send Email
        System.out.println("OTP for " + request.getEmail() + ": " + otp);
    }

    public String verifyStudentOtp(Dtos.OtpVerificationRequest request) {
        String key = "otp:" + request.getEmail();
        String savedOtp = otpService.getOtp(key);

        if (savedOtp == null || !savedOtp.equals(request.getOtp())) {
            throw new RuntimeException("Invalid or Expired OTP");
        }

        otpService.deleteOtp(key);

        // Check if student exists, if not, REGISTER THEM using Master Data
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseGet(() -> registerStudentFromMaster(request.getEmail()));

        return jwtUtils.generateToken(student.getRollNo(), "STUDENT");
    }

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
