package com.onlinevoting.backend.service;

import com.onlinevoting.backend.dto.request.CastVoteRequest;
import com.onlinevoting.backend.dto.response.VoteSuccessResponse;
import com.onlinevoting.backend.entity.Candidate;
import com.onlinevoting.backend.entity.Election;
import com.onlinevoting.backend.entity.ElectionStatus;
import com.onlinevoting.backend.entity.Vote;
import com.onlinevoting.backend.entity.Voter;
import com.onlinevoting.backend.exception.BadRequestException;
import com.onlinevoting.backend.exception.ForbiddenException;
import com.onlinevoting.backend.exception.NotFoundException;
import com.onlinevoting.backend.repository.CandidateRepository;
import com.onlinevoting.backend.repository.ElectionRepository;
import com.onlinevoting.backend.repository.VoteRepository;
import com.onlinevoting.backend.repository.VoterRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class VoteService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoterRepository voterRepository;
    private final VoteRepository voteRepository;

    public VoteService(
            ElectionRepository electionRepository,
            CandidateRepository candidateRepository,
            VoterRepository voterRepository,
            VoteRepository voteRepository
    ) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voterRepository = voterRepository;
        this.voteRepository = voteRepository;
    }

    @Transactional
    public VoteSuccessResponse castVote(CastVoteRequest request, String voterToken) {
        if (!StringUtils.hasText(voterToken)) {
            throw new BadRequestException("Missing X-Voter-Token header");
        }

        Election election = electionRepository.findById(request.electionId())
                .orElseThrow(() -> new NotFoundException("Election not found"));

        if (election.getStatus() != ElectionStatus.OPEN) {
            throw new ForbiddenException("Voting is not open for this election");
        }

        if (election.getEndsAt().isBefore(LocalDateTime.now())) {
            election.setStatus(ElectionStatus.CLOSED);
            electionRepository.save(election);
            throw new ForbiddenException("Voting has ended for this election");
        }

        Candidate candidate = candidateRepository.findByIdAndElectionId(request.candidateId(), request.electionId())
                .orElseThrow(() -> new NotFoundException("Candidate not found in this election"));

        Voter voter = voterRepository.findForVotingByTokenAndElectionId(voterToken.trim(), request.electionId())
                .orElseThrow(() -> new ForbiddenException("Invalid voter token for this election"));

        if (voter.isHasVoted()) {
            throw new ForbiddenException("Voter has already cast a vote");
        }

        Vote vote = new Vote();
        vote.setElection(election);
        vote.setCandidate(candidate);
        vote.setVotedAt(LocalDateTime.now());
        voteRepository.save(vote);

        voter.setHasVoted(true);
        voterRepository.save(voter);

        election.setTotalVotes(election.getTotalVotes() + 1);
        electionRepository.save(election);

        return new VoteSuccessResponse(true, "Vote cast successfully");
    }
}
