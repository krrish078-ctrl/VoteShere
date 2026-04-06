package com.onlinevoting.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CastVoteRequest(
        @NotBlank String candidateId,
        @NotBlank String electionId
) {
}
