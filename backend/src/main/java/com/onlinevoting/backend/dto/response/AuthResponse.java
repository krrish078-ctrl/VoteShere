package com.onlinevoting.backend.dto.response;

public record AuthResponse(
        String token,
        String role,
        String username
) {
}
