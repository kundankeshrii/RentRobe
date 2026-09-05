package com.rentrobe.service;

import com.rentrobe.dto.AuthRequest;
import com.rentrobe.dto.AuthResponse;
import com.rentrobe.entity.Profile;
import com.rentrobe.entity.UserCredential;
import com.rentrobe.repository.ProfileRepository;
import com.rentrobe.repository.UserCredentialRepository;
import com.rentrobe.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserCredentialRepository userCredentialRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (userCredentialRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        UUID userId = UUID.randomUUID();
        String role = "USER";

        UserCredential credential = UserCredential.builder()
                .userId(userId)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .build();
        userCredentialRepository.save(credential);

        // Create profile
        Profile profile = Profile.builder()
                .userId(userId)
                .fullName(request.getFullName() != null ? request.getFullName() : "")
                .build();
        profileRepository.save(profile);

        String token = jwtUtil.generateToken(userId, request.getEmail(), role);
        return AuthResponse.builder()
                .token(token)
                .userId(userId.toString())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(role)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        UserCredential credential = userCredentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), credential.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(credential.getUserId(), credential.getEmail(), credential.getRole());
        return AuthResponse.builder()
                .token(token)
                .userId(credential.getUserId().toString())
                .email(credential.getEmail())
                .fullName(credential.getFullName())
                .role(credential.getRole())
                .build();
    }

    public void requestPasswordReset(String email) {
        UserCredential credential = userCredentialRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));
        
        String token = jwtUtil.generateToken(credential.getUserId(), credential.getEmail(), credential.getRole());
        
        System.out.println("==================================================");
        System.out.println("MOCK PASSWORD RESET LINK:");
        System.out.println("http://localhost:8081/reset-password?token=" + token);
        System.out.println("==================================================");
    }

    @Transactional
    public void updatePasswordWithToken(String token, String newPassword) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        
        UUID userId = jwtUtil.extractUserId(token);
        UserCredential credential = userCredentialRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        credential.setPasswordHash(passwordEncoder.encode(newPassword));
        userCredentialRepository.save(credential);
    }
}
