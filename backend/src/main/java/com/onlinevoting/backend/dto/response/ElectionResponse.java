package com.onlinevoting.backend.dto.response;

import com.onlinevoting.backend.entity.ElectionStatus;
import java.time.LocalDateTime;
import java.util.List;

public record ElectionResponse(
        String id,
        String code,
        String title,
        String description,
        ElectionStatus status,
        List<CandidateResponse> candidates,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        LocalDateTime createdAt,
        int totalVotes
) {
}
