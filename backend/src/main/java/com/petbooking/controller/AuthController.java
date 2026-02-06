package com.petbooking.controller;

import com.petbooking.dto.Dtos;
import com.petbooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend access
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody Dtos.LoginRequest request) {
        try {
            String token = authService.studentLogin(request);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Removed /student/verify as it is no longer needed

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Dtos.AdminLoginRequest request) {
        String token = authService.adminLogin(request);
        return ResponseEntity.ok(Map.of("token", token));
    }
}