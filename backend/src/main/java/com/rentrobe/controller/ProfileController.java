package com.rentrobe.controller;

import com.rentrobe.entity.Profile;
import com.rentrobe.repository.ProfileRepository;
import com.rentrobe.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;

    @GetMapping("/me")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal AuthenticatedUser user) {
        Profile profile = profileRepository.findByUserId(user.getUserId())
                .orElseGet(() -> {
                    Profile newProfile = Profile.builder()
                            .userId(user.getUserId())
                            .fullName("")
                            .build();
                    return profileRepository.save(newProfile);
                });
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<Profile> updateMyProfile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody Map<String, Object> updates) {
        
        Profile profile = profileRepository.findByUserId(user.getUserId())
                .orElseGet(() -> Profile.builder().userId(user.getUserId()).build());

        if (updates.containsKey("fullName")) {
            profile.setFullName((String) updates.get("fullName"));
        } else if (updates.containsKey("full_name")) {
            profile.setFullName((String) updates.get("full_name"));
        }

        if (updates.containsKey("phone")) {
            profile.setPhone((String) updates.get("phone"));
        }

        if (updates.containsKey("defaultSize")) {
            profile.setDefaultSize((String) updates.get("defaultSize"));
        } else if (updates.containsKey("default_size")) {
            profile.setDefaultSize((String) updates.get("default_size"));
        }

        return ResponseEntity.ok(profileRepository.save(profile));
    }
}
