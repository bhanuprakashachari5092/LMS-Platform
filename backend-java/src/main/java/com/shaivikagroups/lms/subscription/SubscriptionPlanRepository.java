package com.shaivikagroups.lms.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, String> {

    List<SubscriptionPlanEntity> findByIsActiveTrueOrderByPriceInrAsc();

    Optional<SubscriptionPlanEntity> findByTierAndBillingCycle(PlanTier tier, BillingCycle billingCycle);
}

