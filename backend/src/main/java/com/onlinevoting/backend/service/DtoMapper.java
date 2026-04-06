package com.onlinevoting.backend.service;

import com.onlinevoting.backend.dto.response.CandidateResponse;
import com.onlinevoting.backend.dto.response.ElectionResponse;
import com.onlinevoting.backend.dto.response.VoteResultItemResponse;
import com.onlinevoting.backend.entity.Candidate;
import com.onlinevoting.backend.entity.Election;
import com.onlinevoting.backend.repository.VoteRepository;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public CandidateResponse toCandidateResponse(Candidate candidate) {
        return new CandidateResponse(candidate.getId(), candidate.getName(), candidate.getCreatedAt());
    }

    public ElectionResponse toElectionResponse(Election election, List<Candidate> candidates) {
        List<CandidateResponse> candidateResponses = candidates.stream()
                .map(this::toCandidateResponse)
                .toList();

        return new ElectionResponse(
                election.getId(),
                election.getCode(),
                election.getTitle(),
                election.getDescription(),
                election.getStatus(),
                candidateResponses,
                election.getStartsAt(),
                election.getEndsAt(),
                election.getCreatedAt(),
                election.getTotalVotes()
        );
    }

    public VoteResultItemResponse toVoteResultItemResponse(VoteRepository.CandidateVoteProjection projection, long totalVotes) {
        double percentage = totalVotes == 0 ? 0.0 : (projection.getVoteCount() * 100.0) / totalVotes;
        return new VoteResultItemResponse(
                projection.getCandidateId(),
                projection.getCandidateName(),
                projection.getVoteCount(),
                Math.round(percentage * 100.0) / 100.0
        );
    }
}
