package com.onlinevoting.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VotingWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void endToEndVotingWorkflow_shouldSucceed() throws Exception {
        String loginBody = """
                {
                  "username": "admin",
                  "password": "admin123"
                }
                """;

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String adminToken = objectMapper.readTree(loginResponse).get("token").asText();

        String createElectionBody = """
                {
                  "title": "Integration Election",
                  "description": "Workflow test",
                  "endsAt": "%s"
                }
                """.formatted(LocalDateTime.now().plusHours(1));

        String electionResponse = mockMvc.perform(post("/api/admin/elections")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createElectionBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode electionJson = objectMapper.readTree(electionResponse);
        String electionId = electionJson.get("id").asText();
        String electionCode = electionJson.get("code").asText();

        mockMvc.perform(post("/api/admin/elections/{id}/candidates", electionId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{" +
                                "\"name\":\"Alice\"" +
                                "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Alice"));

        String electionAfterCandidate = mockMvc.perform(get("/api/admin/elections/{id}", electionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String candidateId = objectMapper.readTree(electionAfterCandidate)
                .get("candidates")
                .get(0)
                .get("id")
                .asText();

        mockMvc.perform(put("/api/admin/elections/{id}/start", electionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));

        String voterRegistrationBody = """
                {
                  "electionId": "%s",
                  "name": "Test Voter",
                  "rollNo": "CS001"
                }
                """.formatted(electionId);

        String registerResponse = mockMvc.perform(post("/api/voters/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voterRegistrationBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String voterToken = objectMapper.readTree(registerResponse).get("token").asText();

        String voteBody = """
                {
                  "electionId": "%s",
                  "candidateId": "%s"
                }
                """.formatted(electionId, candidateId);

        mockMvc.perform(post("/api/votes")
                        .header("X-Voter-Token", voterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voteBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(post("/api/votes")
                        .header("X-Voter-Token", voterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voteBody))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/elections/{id}/close", electionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));

        String publicResults = mockMvc.perform(get("/api/elections/{id}/results", electionId))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode results = objectMapper.readTree(publicResults);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).get("candidateName").asText()).isEqualTo("Alice");
        assertThat(results.get(0).get("voteCount").asLong()).isEqualTo(1L);

        mockMvc.perform(get("/api/elections/by-code/{code}", electionCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(electionId));
    }
}
