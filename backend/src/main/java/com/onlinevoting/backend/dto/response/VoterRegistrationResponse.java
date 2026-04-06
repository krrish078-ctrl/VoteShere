package com.onlinevoting.backend.dto.response;

public record VoterRegistrationResponse(
        String token,
        String voterId,
        String electionId
) {
}
