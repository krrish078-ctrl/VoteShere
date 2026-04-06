package com.onlinevoting.backend.repository;

import com.onlinevoting.backend.entity.Voter;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VoterRepository extends JpaRepository<Voter, String> {

    boolean existsByElectionIdAndRollNoIgnoreCase(String electionId, String rollNo);

    boolean existsByToken(String token);

    Optional<Voter> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voter v where v.token = :token and v.election.id = :electionId")
    Optional<Voter> findForVotingByTokenAndElectionId(@Param("token") String token, @Param("electionId") String electionId);
}
