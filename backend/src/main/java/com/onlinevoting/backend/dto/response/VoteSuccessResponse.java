package com.onlinevoting.backend.dto.response;

public record VoteSuccessResponse(
        boolean success,
        String message
) {
}
