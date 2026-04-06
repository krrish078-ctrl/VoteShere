package com.onlinevoting.backend.dto.response;

import java.time.LocalDateTime;

public record CandidateResponse(
        String id,
        String name,
        LocalDateTime createdAt
) {
}
