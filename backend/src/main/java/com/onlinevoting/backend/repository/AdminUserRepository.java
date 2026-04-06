package com.onlinevoting.backend.repository;

import com.onlinevoting.backend.entity.AdminUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository extends JpaRepository<AdminUser, String> {

    Optional<AdminUser> findByUsername(String username);

    boolean existsByUsername(String username);
}
