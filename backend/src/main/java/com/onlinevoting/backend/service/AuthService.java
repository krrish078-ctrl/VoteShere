package com.onlinevoting.backend.service;

import com.onlinevoting.backend.dto.request.AuthRequest;
import com.onlinevoting.backend.dto.response.AuthResponse;
import com.onlinevoting.backend.entity.AdminUser;
import com.onlinevoting.backend.exception.BadRequestException;
import com.onlinevoting.backend.exception.ConflictException;
import com.onlinevoting.backend.exception.ForbiddenException;
import com.onlinevoting.backend.repository.AdminUserRepository;
import com.onlinevoting.backend.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        AdminUser user = adminUserRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new ForbiddenException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ForbiddenException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getUsername());
    }

    @Transactional
    public AuthResponse registerAdmin(AuthRequest request) {
        String username = request.username().trim();
        if (adminUserRepository.existsByUsername(username)) {
            throw new ConflictException("Username already exists");
        }

        if (request.fullName() == null || request.fullName().trim().isEmpty()) {
            throw new BadRequestException("Full name is required");
        }

        AdminUser user = new AdminUser();
        user.setUsername(username);
        user.setFullName(request.fullName().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ADMIN");

        AdminUser saved = adminUserRepository.save(user);
        String token = jwtService.generateToken(saved.getUsername(), saved.getRole());
        return new AuthResponse(token, saved.getRole(), saved.getUsername());
    }
}
