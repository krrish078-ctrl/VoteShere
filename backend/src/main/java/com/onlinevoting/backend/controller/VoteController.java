package com.onlinevoting.backend.controller;

import com.onlinevoting.backend.dto.request.CastVoteRequest;
import com.onlinevoting.backend.dto.response.VoteSuccessResponse;
import com.onlinevoting.backend.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public VoteSuccessResponse castVote(
            @Valid @RequestBody CastVoteRequest request,
            @RequestHeader(name = "X-Voter-Token", required = false) String voterToken
    ) {
        return voteService.castVote(request, voterToken);
    }
}
