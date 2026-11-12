package com.daymate.backend.auth;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthService.AuthResult result = authService.signup(
                request.fullName(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(toAuthResponse(result));
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return toAuthResponse(authService.login(request.email(), request.password()));
    }

    @GetMapping("/me")
    UserResponse currentUser(@AuthenticationPrincipal Jwt jwt) {
        return toUserResponse(authService.currentUser(jwt.getSubject()));
    }

    private AuthResponse toAuthResponse(AuthService.AuthResult result) {
        return new AuthResponse(
                result.accessToken(),
                "Bearer",
                result.expiresInSeconds(),
                toUserResponse(result.user()));
    }

    private UserResponse toUserResponse(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCreatedAt());
    }

    record SignupRequest(
            @NotBlank(message = "Full name is required.")
            @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters.")
            String fullName,

            @NotBlank(message = "Email is required.")
            @Email(message = "Email must be valid.")
            @Size(max = 320, message = "Email is too long.")
            String email,

            @NotBlank(message = "Password is required.")
            @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters.")
            String password) {
    }

    record LoginRequest(
            @NotBlank(message = "Email is required.")
            @Email(message = "Email must be valid.")
            @Size(max = 320, message = "Email is too long.")
            String email,

            @NotBlank(message = "Password is required.")
            @Size(max = 72, message = "Password is too long.")
            String password) {
    }

    record AuthResponse(
            String accessToken,
            String tokenType,
            long expiresIn,
            UserResponse user) {
    }

    record UserResponse(
            UUID id,
            String fullName,
            String email,
            Instant createdAt) {
    }
}
