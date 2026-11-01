package com.shaivikagroups.lms.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscriptionEntity, String> {

    Optional<TenantSubscriptionEntity> findFirstByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, SubscriptionStatus status);

    List<TenantSubscriptionEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}

