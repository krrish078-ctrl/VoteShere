package com.onlinevoting.backend.repository;

import com.onlinevoting.backend.entity.Vote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VoteRepository extends JpaRepository<Vote, String> {

    interface CandidateVoteProjection {
        String getCandidateId();

        String getCandidateName();

        long getVoteCount();
    }

    @Query("""
            select c.id as candidateId, c.name as candidateName, count(v.id) as voteCount
            from Candidate c
            left join Vote v on v.candidate.id = c.id
            where c.election.id = :electionId
            group by c.id, c.name
            order by count(v.id) desc, c.name asc
            """)
    List<CandidateVoteProjection> findCandidateVotesByElectionId(@Param("electionId") String electionId);
}
