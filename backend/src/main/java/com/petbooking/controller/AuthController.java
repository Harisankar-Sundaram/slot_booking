package com.petbooking.controller;

import com.petbooking.dto.Dtos;
import com.petbooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody Dtos.LoginRequest request) {
        System.out.println("Login Request Received: " + request); // Debug
        authService.initiateStudentLogin(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to email"));
    }

    @PostMapping("/student/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Dtos.OtpVerificationRequest request) {
        String token = authService.verifyStudentOtp(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Dtos.AdminLoginRequest request) {
        String token = authService.adminLogin(request);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
