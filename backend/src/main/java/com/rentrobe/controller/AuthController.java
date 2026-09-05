package com.rentrobe.controller;

import com.rentrobe.dto.AuthRequest;
import com.rentrobe.dto.AuthResponse;
import com.rentrobe.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless — client removes the token
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        if (body.containsKey("email")) {
            authService.requestPasswordReset(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "If this email is registered, a reset link has been sent."));
        } else if (body.containsKey("password") && body.containsKey("token")) {
            authService.updatePasswordWithToken(body.get("token"), body.get("password"));
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid request format."));
        }
    }
}
