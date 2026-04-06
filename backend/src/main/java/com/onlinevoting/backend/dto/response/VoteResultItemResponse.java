package com.onlinevoting.backend.dto.response;

public record VoteResultItemResponse(
        String candidateId,
        String candidateName,
        long voteCount,
        double percentage
) {
}
