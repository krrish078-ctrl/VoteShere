package com.onlinevoting.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterVoterRequest(
        String electionId,
        String electionCode,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 50) String rollNo
) {
}
