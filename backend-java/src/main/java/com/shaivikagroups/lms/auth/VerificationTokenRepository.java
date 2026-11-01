package com.shaivikagroups.lms.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, String> {

    Optional<VerificationTokenEntity> findByTokenHashAndType(String tokenHash, String type);

    Optional<VerificationTokenEntity> findByTokenHash(String tokenHash);
}

