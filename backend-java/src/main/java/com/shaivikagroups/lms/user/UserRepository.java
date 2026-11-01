package com.shaivikagroups.lms.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByTenantIdAndEmail(String tenantId, String email);

    Optional<UserEntity> findByIdAndTenantId(String id, String tenantId);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByTenantIdAndEmail(String tenantId, String email);

    List<UserEntity> findAllByTenantId(String tenantId);

    long countByTenantId(String tenantId);
}

