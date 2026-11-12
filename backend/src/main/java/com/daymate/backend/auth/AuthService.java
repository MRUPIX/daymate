package com.daymate.backend.auth;

import java.util.Locale;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String dummyPasswordHash;

    public AuthService(
            UserAccountRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyPasswordHash = passwordEncoder.encode("daymate-invalid-password-placeholder");
    }

    @Transactional
    AuthResult signup(String fullName, String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyInUseException();
        }

        UserAccount user = new UserAccount(
                fullName.trim(),
                normalizedEmail,
                passwordEncoder.encode(password));

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new EmailAlreadyInUseException();
        }

        return authenticate(user);
    }

    @Transactional(readOnly = true)
    AuthResult login(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        UserAccount user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            passwordEncoder.matches(password, dummyPasswordHash);
            throw new InvalidCredentialsException();
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return authenticate(user);
    }

    @Transactional(readOnly = true)
    UserAccount currentUser(String subject) {
        UUID userId;
        try {
            userId = UUID.fromString(subject);
        } catch (IllegalArgumentException exception) {
            throw new InvalidCredentialsException();
        }
        return userRepository.findById(userId).orElseThrow(InvalidCredentialsException::new);
    }

    private AuthResult authenticate(UserAccount user) {
        JwtService.IssuedToken token = jwtService.issue(user);
        return new AuthResult(user, token.value(), token.expiresInSeconds());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    record AuthResult(UserAccount user, String accessToken, long expiresInSeconds) {
    }
}
