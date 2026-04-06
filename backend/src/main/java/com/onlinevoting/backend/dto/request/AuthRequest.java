package com.onlinevoting.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
        @Size(max = 100) String fullName,
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Size(min = 6, max = 100) String password
) {
}
