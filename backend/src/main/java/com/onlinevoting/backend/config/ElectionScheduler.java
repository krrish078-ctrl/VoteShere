package com.onlinevoting.backend.config;

import com.onlinevoting.backend.service.ElectionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ElectionScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ElectionScheduler.class);

    private final ElectionService electionService;

    public ElectionScheduler(ElectionService electionService) {
        this.electionService = electionService;
    }

    @Scheduled(fixedDelayString = "${app.election-autoclose-ms:10000}")
    public void autoCloseExpiredElections() {
        int updated = electionService.autoCloseExpiredElections();
        if (updated > 0) {
            LOGGER.info("Auto-closed {} expired election(s)", updated);
        }
    }
}
