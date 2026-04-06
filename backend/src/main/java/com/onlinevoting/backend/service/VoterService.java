package com.onlinevoting.backend.service;

import com.onlinevoting.backend.dto.request.RegisterVoterRequest;
import com.onlinevoting.backend.dto.response.VoterRegistrationResponse;
import com.onlinevoting.backend.entity.Election;
import com.onlinevoting.backend.entity.ElectionStatus;
import com.onlinevoting.backend.entity.Voter;
import com.onlinevoting.backend.exception.BadRequestException;
import com.onlinevoting.backend.exception.ConflictException;
import com.onlinevoting.backend.exception.NotFoundException;
import com.onlinevoting.backend.repository.ElectionRepository;
import com.onlinevoting.backend.repository.VoterRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class VoterService {

    private final VoterRepository voterRepository;
    private final ElectionRepository electionRepository;

    public VoterService(VoterRepository voterRepository, ElectionRepository electionRepository) {
        this.voterRepository = voterRepository;
        this.electionRepository = electionRepository;
    }

    @Transactional
    public VoterRegistrationResponse registerVoter(RegisterVoterRequest request) {
        Election election = resolveElection(request);

        if (election.getStatus() == ElectionStatus.CLOSED) {
            throw new BadRequestException("Election is closed");
        }

        String rollNo = request.rollNo().trim();
        if (voterRepository.existsByElectionIdAndRollNoIgnoreCase(election.getId(), rollNo)) {
            throw new ConflictException("Roll number is already registered for this election");
        }

        Voter voter = new Voter();
        voter.setElection(election);
        voter.setName(request.name().trim());
        voter.setRollNo(rollNo);
        voter.setToken(generateUniqueVoterToken());
        voter.setHasVoted(false);
        voter.setRegisteredAt(LocalDateTime.now());

        Voter saved = voterRepository.save(voter);
        return new VoterRegistrationResponse(saved.getToken(), saved.getId(), election.getId());
    }

    private Election resolveElection(RegisterVoterRequest request) {
        boolean hasElectionId = StringUtils.hasText(request.electionId());
        boolean hasElectionCode = StringUtils.hasText(request.electionCode());

        if (hasElectionId == hasElectionCode) {
            throw new BadRequestException("Provide either electionId or electionCode");
        }

        if (hasElectionId) {
            return electionRepository.findById(request.electionId().trim())
                    .orElseThrow(() -> new NotFoundException("Election not found"));
        }

        return electionRepository.findByCodeIgnoreCase(request.electionCode().trim())
                .orElseThrow(() -> new NotFoundException("Election not found"));
    }

    private String generateUniqueVoterToken() {
        for (int i = 0; i < 10; i++) {
            String token = UUID.randomUUID().toString();
            if (!voterRepository.existsByToken(token)) {
                return token;
            }
        }
        throw new IllegalStateException("Unable to generate unique voter token");
    }
}
