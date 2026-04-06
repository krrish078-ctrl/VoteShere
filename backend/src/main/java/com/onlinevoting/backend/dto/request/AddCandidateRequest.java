package com.onlinevoting.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddCandidateRequest(
        @NotBlank @Size(max = 100) String name
) {
}
