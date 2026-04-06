package com.onlinevoting.backend.controller;

import com.onlinevoting.backend.dto.request.AddCandidateRequest;
import com.onlinevoting.backend.dto.request.CreateElectionRequest;
import com.onlinevoting.backend.dto.response.CandidateResponse;
import com.onlinevoting.backend.dto.response.ElectionResponse;
import com.onlinevoting.backend.dto.response.VoteResultItemResponse;
import com.onlinevoting.backend.dto.response.VotingLinkResponse;
import com.onlinevoting.backend.service.ElectionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/elections")
public class AdminElectionController {

    private final ElectionService electionService;

    public AdminElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ElectionResponse createElection(@Valid @RequestBody CreateElectionRequest request) {
        return electionService.createElection(request);
    }

    @GetMapping
    public List<ElectionResponse> getAllElections() {
        return electionService.getAllElections();
    }

    @GetMapping("/{id}")
    public ElectionResponse getElectionById(@PathVariable("id") String electionId) {
        return electionService.getElectionById(electionId);
    }

    @PostMapping("/{id}/candidates")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateResponse addCandidate(
            @PathVariable("id") String electionId,
            @Valid @RequestBody AddCandidateRequest request
    ) {
        return electionService.addCandidate(electionId, request);
    }

    @PutMapping("/{id}/start")
    public ElectionResponse startElection(@PathVariable("id") String electionId) {
        return electionService.startElection(electionId);
    }

    @PutMapping("/{id}/close")
    public ElectionResponse closeElection(@PathVariable("id") String electionId) {
        return electionService.closeElection(electionId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteElection(@PathVariable("id") String electionId) {
        electionService.deleteElection(electionId);
    }

    @GetMapping("/{id}/results")
    public List<VoteResultItemResponse> getAdminResults(@PathVariable("id") String electionId) {
        return electionService.getAdminResults(electionId);
    }

    @GetMapping("/{id}/voting-link")
    public VotingLinkResponse getVotingLink(@PathVariable("id") String electionId) {
        return new VotingLinkResponse(electionService.getVotingLink(electionId));
    }
}
