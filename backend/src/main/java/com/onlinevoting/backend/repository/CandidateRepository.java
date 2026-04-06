package com.onlinevoting.backend.repository;

import com.onlinevoting.backend.entity.Candidate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, String> {

    boolean existsByElectionIdAndNameIgnoreCase(String electionId, String name);

    List<Candidate> findByElectionIdOrderByCreatedAtAsc(String electionId);

    Optional<Candidate> findByIdAndElectionId(String id, String electionId);
}
