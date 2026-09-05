package com.rentrobe.config;

import com.rentrobe.entity.Product;
import com.rentrobe.entity.Profile;
import com.rentrobe.entity.UserCredential;
import com.rentrobe.repository.ProductRepository;
import com.rentrobe.repository.ProfileRepository;
import com.rentrobe.repository.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@rentrobe.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeProducts();
    }

    private void initializeUsers() {
        if (userCredentialRepository.count() == 0) {
            // Create Admin
            UUID adminId = UUID.fromString("11111111-1111-1111-1111-111111111111");
            UserCredential adminCreds = UserCredential.builder()
                    .userId(adminId)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .fullName("Admin User")
                    .role("ADMIN")
                    .build();
            userCredentialRepository.save(adminCreds);

            Profile adminProfile = Profile.builder()
                    .userId(adminId)
                    .fullName("Admin User")
                    .build();
            profileRepository.save(adminProfile);

            // Create Regular User
            UUID userId = UUID.fromString("22222222-2222-2222-2222-222222222222");
            UserCredential userCreds = UserCredential.builder()
                    .userId(userId)
                    .email("user@rentrobe.com")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .fullName("John Doe")
                    .role("USER")
                    .build();
            userCredentialRepository.save(userCreds);

            Profile userProfile = Profile.builder()
                    .userId(userId)
                    .fullName("John Doe")
                    .build();
            profileRepository.save(userProfile);
        }
    }

    private void initializeProducts(){

    }
}
