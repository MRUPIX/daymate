package com.daymate.backend.auth;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validationFailed(MethodArgumentNotValidException exception) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ApiError(
                "validation_failed",
                "Request validation failed.",
                fieldErrors,
                Instant.now()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> malformedRequest() {
        return ResponseEntity.badRequest().body(new ApiError(
                "malformed_request",
                "The request body is missing or malformed.",
                Map.of(),
                Instant.now()));
    }

    @ExceptionHandler(EmailAlreadyInUseException.class)
    ResponseEntity<ApiError> emailAlreadyInUse(EmailAlreadyInUseException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError(
                "email_in_use",
                exception.getMessage(),
                Map.of(),
                Instant.now()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<ApiError> invalidCredentials(InvalidCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError(
                "invalid_credentials",
                exception.getMessage(),
                Map.of(),
                Instant.now()));
    }

    record ApiError(
            String code,
            String message,
            Map<String, String> fieldErrors,
            Instant timestamp) {
    }
}
