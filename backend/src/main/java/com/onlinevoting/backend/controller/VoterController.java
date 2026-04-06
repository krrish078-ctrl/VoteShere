package com.onlinevoting.backend.controller;

import com.onlinevoting.backend.dto.request.RegisterVoterRequest;
import com.onlinevoting.backend.dto.response.VoterRegistrationResponse;
import com.onlinevoting.backend.service.VoterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/voters")
public class VoterController {

    private final VoterService voterService;

    public VoterController(VoterService voterService) {
        this.voterService = voterService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public VoterRegistrationResponse registerVoter(@Valid @RequestBody RegisterVoterRequest request) {
        return voterService.registerVoter(request);
    }
}
