package com.onlinevoting.backend.repository;

import com.onlinevoting.backend.entity.Election;
import com.onlinevoting.backend.entity.ElectionStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ElectionRepository extends JpaRepository<Election, String> {

    Optional<Election> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    List<Election> findByStatusAndEndsAtLessThanEqual(ElectionStatus status, LocalDateTime endsAt);
}
