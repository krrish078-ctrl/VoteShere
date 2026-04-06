package com.onlinevoting.backend.config;

import com.onlinevoting.backend.entity.AdminUser;
import com.onlinevoting.backend.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataSeeder.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin.username:admin}")
    private String seedUsername;

    @Value("${app.seed-admin.password:admin123}")
    private String seedPassword;

    public DataSeeder(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername(seedUsername);
        admin.setFullName("Default Admin");
        admin.setPassword(passwordEncoder.encode(seedPassword));
        admin.setRole("ADMIN");
        adminUserRepository.save(admin);
        LOGGER.info("Seeded default admin user: {}", seedUsername);
    }
}
