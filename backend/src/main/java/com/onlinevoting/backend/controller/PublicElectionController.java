package com.onlinevoting.backend.controller;

import com.onlinevoting.backend.dto.response.ElectionResponse;
import com.onlinevoting.backend.dto.response.VoteResultItemResponse;
import com.onlinevoting.backend.service.ElectionService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/elections")
public class PublicElectionController {

    private final ElectionService electionService;

    public PublicElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @GetMapping("/by-code/{code}")
    public ElectionResponse getElectionByCode(@PathVariable String code) {
        return electionService.getElectionByCode(code);
    }

    @GetMapping("/{id}/results")
    public List<VoteResultItemResponse> getPublicResults(@PathVariable("id") String electionId) {
        return electionService.getPublicResults(electionId);
    }
}
