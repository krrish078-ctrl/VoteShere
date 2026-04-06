package com.onlinevoting.backend.service;

import com.onlinevoting.backend.dto.request.AddCandidateRequest;
import com.onlinevoting.backend.dto.request.CreateElectionRequest;
import com.onlinevoting.backend.dto.response.CandidateResponse;
import com.onlinevoting.backend.dto.response.ElectionResponse;
import com.onlinevoting.backend.dto.response.VoteResultItemResponse;
import com.onlinevoting.backend.exception.BadRequestException;
import com.onlinevoting.backend.exception.ConflictException;
import com.onlinevoting.backend.exception.ForbiddenException;
import com.onlinevoting.backend.exception.NotFoundException;
import com.onlinevoting.backend.entity.Candidate;
import com.onlinevoting.backend.entity.Election;
import com.onlinevoting.backend.entity.ElectionStatus;
import com.onlinevoting.backend.repository.CandidateRepository;
import com.onlinevoting.backend.repository.ElectionRepository;
import com.onlinevoting.backend.repository.VoteRepository;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ElectionService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;
    private final DtoMapper mapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.voting-link-base:http://localhost:3000/e}")
    private String votingLinkBase;

    public ElectionService(
            ElectionRepository electionRepository,
            CandidateRepository candidateRepository,
            VoteRepository voteRepository,
            DtoMapper mapper
    ) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ElectionResponse createElection(CreateElectionRequest request) {
        LocalDateTime now = LocalDateTime.now();
        if (!request.endsAt().isAfter(now.plusMinutes(1))) {
            throw new BadRequestException("endsAt must be at least 1 minute in the future");
        }

        Election election = new Election();
        election.setCode(generateUniqueCode());
        election.setTitle(request.title().trim());
        election.setDescription(request.description() == null ? null : request.description().trim());
        election.setStatus(ElectionStatus.DRAFT);
        election.setEndsAt(request.endsAt());
        election.setCreatedAt(now);
        election.setTotalVotes(0);

        Election saved = electionRepository.save(election);
        return mapper.toElectionResponse(saved, List.of());
    }

    public List<ElectionResponse> getAllElections() {
        return electionRepository.findAll().stream()
                .map(election -> mapper.toElectionResponse(election, candidateRepository.findByElectionIdOrderByCreatedAtAsc(election.getId())))
                .toList();
    }

    public ElectionResponse getElectionById(String electionId) {
        Election election = findElectionById(electionId);
        List<Candidate> candidates = candidateRepository.findByElectionIdOrderByCreatedAtAsc(electionId);
        return mapper.toElectionResponse(election, candidates);
    }

    @Transactional
    public CandidateResponse addCandidate(String electionId, AddCandidateRequest request) {
        Election election = findElectionById(electionId);
        if (election.getStatus() == ElectionStatus.CLOSED) {
            throw new BadRequestException("Cannot add candidate to a closed election");
        }

        String normalizedName = request.name().trim();
        if (candidateRepository.existsByElectionIdAndNameIgnoreCase(electionId, normalizedName)) {
            throw new ConflictException("Candidate already exists in this election");
        }

        Candidate candidate = new Candidate();
        candidate.setElection(election);
        candidate.setName(normalizedName);

        Candidate saved = candidateRepository.save(candidate);
        return mapper.toCandidateResponse(saved);
    }

    @Transactional
    public ElectionResponse startElection(String electionId) {
        Election election = findElectionById(electionId);
        if (election.getStatus() != ElectionStatus.DRAFT) {
            throw new BadRequestException("Only draft elections can be started");
        }
        if (election.getEndsAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Election end time has already passed");
        }

        List<Candidate> candidates = candidateRepository.findByElectionIdOrderByCreatedAtAsc(electionId);
        if (candidates.isEmpty()) {
            throw new BadRequestException("Cannot start election without candidates");
        }

        if (election.getStartsAt() == null) {
            election.setStartsAt(LocalDateTime.now());
        }
        election.setStatus(ElectionStatus.OPEN);
        Election saved = electionRepository.save(election);
        return mapper.toElectionResponse(saved, candidates);
    }

    @Transactional
    public ElectionResponse closeElection(String electionId) {
        Election election = findElectionById(electionId);
        if (election.getStatus() != ElectionStatus.OPEN) {
            throw new BadRequestException("Only open elections can be closed");
        }
        election.setStatus(ElectionStatus.CLOSED);
        Election saved = electionRepository.save(election);
        List<Candidate> candidates = candidateRepository.findByElectionIdOrderByCreatedAtAsc(electionId);
        return mapper.toElectionResponse(saved, candidates);
    }

    @Transactional
    public void deleteElection(String electionId) {
        Election election = findElectionById(electionId);
        electionRepository.delete(election);
    }

    public List<VoteResultItemResponse> getAdminResults(String electionId) {
        Election election = findElectionById(electionId);
        long totalVotes = election.getTotalVotes();
        return voteRepository.findCandidateVotesByElectionId(electionId).stream()
                .map(item -> mapper.toVoteResultItemResponse(item, totalVotes))
                .toList();
    }

    public ElectionResponse getElectionByCode(String code) {
        Election election = electionRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new NotFoundException("Election not found for code: " + code));
        List<Candidate> candidates = candidateRepository.findByElectionIdOrderByCreatedAtAsc(election.getId());
        return mapper.toElectionResponse(election, candidates);
    }

    public List<VoteResultItemResponse> getPublicResults(String electionId) {
        Election election = findElectionById(electionId);
        if (election.getStatus() != ElectionStatus.CLOSED) {
            throw new ForbiddenException("Results are available only after election closes");
        }

        long totalVotes = election.getTotalVotes();
        return voteRepository.findCandidateVotesByElectionId(electionId).stream()
                .map(item -> mapper.toVoteResultItemResponse(item, totalVotes))
                .toList();
    }

    public String getVotingLink(String electionId) {
        Election election = findElectionById(electionId);
        return votingLinkBase + "/" + election.getCode();
    }

    @Transactional
    public int autoCloseExpiredElections() {
        List<Election> expired = electionRepository.findByStatusAndEndsAtLessThanEqual(ElectionStatus.OPEN, LocalDateTime.now());
        expired.forEach(election -> election.setStatus(ElectionStatus.CLOSED));
        electionRepository.saveAll(expired);
        return expired.size();
    }

    public Election findElectionById(String electionId) {
        return electionRepository.findById(electionId)
                .orElseThrow(() -> new NotFoundException("Election not found: " + electionId));
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = randomCode(CODE_LENGTH);
            if (!electionRepository.existsByCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Unable to generate unique election code");
    }

    private String randomCode(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            builder.append(CODE_CHARS.charAt(secureRandom.nextInt(CODE_CHARS.length())));
        }
        return builder.toString();
    }
}
