package com.shaivikagroups.lms.subscription;

import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.tenant.TenantEntity;
import com.shaivikagroups.lms.tenant.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final TenantRepository tenantRepository;

    public SubscriptionService(
            SubscriptionPlanRepository planRepository,
            TenantSubscriptionRepository tenantSubscriptionRepository,
            TenantRepository tenantRepository) {
        this.planRepository = planRepository;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlanDTO> listPlans() {
        return planRepository.findByIsActiveTrueOrderByPriceInrAsc().stream()
                .map(this::mapToPlanDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantSubscriptionDTO getCurrentTenantSubscription() {
        String tenantId = TenantContext.getTenantId();
        TenantEntity tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        Optional<TenantSubscriptionEntity> activeSub = tenantSubscriptionRepository
                .findFirstByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, SubscriptionStatus.ACTIVE);

        if (activeSub.isPresent()) {
            return mapToTenantSubDTO(activeSub.get(), tenant);
        }

        // Return virtual subscription reflecting tenant's current base plan
        TenantSubscriptionDTO dto = new TenantSubscriptionDTO();
        dto.setTenantId(tenantId);
        dto.setPlanId("plan_free_starter");
        dto.setPlanName(tenant.getPlanTier() + " Plan");
        dto.setTier(tenant.getPlanTier());
        dto.setBillingCycle("MONTHLY");
        dto.setStatus("ACTIVE");
        dto.setCurrentPeriodStart(tenant.getCreatedAt());
        dto.setCurrentPeriodEnd(tenant.getCreatedAt().plus(365, ChronoUnit.DAYS));
        dto.setMaxStudents(tenant.getMaxStudents());
        dto.setMaxCourses(tenant.getMaxCourses());
        return dto;
    }

    @Transactional
    public TenantSubscriptionDTO upgradeSubscription(UpgradeSubscriptionRequest req) {
        String tenantId = TenantContext.getTenantId();
        TenantEntity tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        SubscriptionPlanEntity plan = planRepository.findById(req.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found: " + req.getPlanId()));

        BillingCycle cycle;
        try {
            cycle = BillingCycle.valueOf(req.getBillingCycle().toUpperCase());
        } catch (Exception e) {
            cycle = plan.getBillingCycle();
        }

        Instant now = Instant.now();
        Instant periodEnd = cycle == BillingCycle.ANNUAL
                ? now.plus(365, ChronoUnit.DAYS)
                : now.plus(30, ChronoUnit.DAYS);

        // Update tenant limits
        tenant.setPlanTier(plan.getTier().name());
        tenant.setMaxStudents(plan.getMaxStudents());
        tenant.setMaxCourses(plan.getMaxCourses());
        tenant.setMaxStorageGb(plan.getMaxStorageGb());
        tenant.setUpdatedAt(now);
        tenantRepository.save(tenant);

        TenantSubscriptionEntity sub = new TenantSubscriptionEntity();
        sub.setId("tsub_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        sub.setTenantId(tenantId);
        sub.setPlanId(plan.getId());
        sub.setBillingCycle(cycle);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodStart(now);
        sub.setCurrentPeriodEnd(periodEnd);
        sub.setCancelAtPeriodEnd(false);
        sub.setPaymentMethod(req.getPaymentMethod());
        sub.setUpdatedAt(now);

        TenantSubscriptionEntity saved = tenantSubscriptionRepository.save(sub);
        return mapToTenantSubDTO(saved, tenant);
    }

    @Transactional
    public TenantSubscriptionDTO cancelSubscription() {
        String tenantId = TenantContext.getTenantId();
        TenantEntity tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        TenantSubscriptionEntity activeSub = tenantSubscriptionRepository
                .findFirstByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active subscription to cancel"));

        activeSub.setCancelAtPeriodEnd(true);
        activeSub.setUpdatedAt(Instant.now());
        TenantSubscriptionEntity saved = tenantSubscriptionRepository.save(activeSub);

        return mapToTenantSubDTO(saved, tenant);
    }

    private SubscriptionPlanDTO mapToPlanDTO(SubscriptionPlanEntity plan) {
        SubscriptionPlanDTO dto = new SubscriptionPlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setTier(plan.getTier().name());
        dto.setBillingCycle(plan.getBillingCycle().name());
        dto.setPriceInr(plan.getPriceInr());
        dto.setMaxStudents(plan.getMaxStudents());
        dto.setMaxCourses(plan.getMaxCourses());
        dto.setMaxStorageGb(plan.getMaxStorageGb());
        dto.setFeatures(plan.getFeatures());
        dto.setActive(plan.isActive());
        return dto;
    }

    private TenantSubscriptionDTO mapToTenantSubDTO(TenantSubscriptionEntity entity, TenantEntity tenant) {
        TenantSubscriptionDTO dto = new TenantSubscriptionDTO();
        dto.setId(entity.getId());
        dto.setTenantId(entity.getTenantId());
        dto.setPlanId(entity.getPlanId());
        planRepository.findById(entity.getPlanId()).ifPresent(p -> dto.setPlanName(p.getName()));
        dto.setTier(tenant.getPlanTier());
        dto.setBillingCycle(entity.getBillingCycle().name());
        dto.setStatus(entity.getStatus().name());
        dto.setCurrentPeriodStart(entity.getCurrentPeriodStart());
        dto.setCurrentPeriodEnd(entity.getCurrentPeriodEnd());
        dto.setCancelAtPeriodEnd(entity.isCancelAtPeriodEnd());
        dto.setMaxStudents(tenant.getMaxStudents());
        dto.setMaxCourses(tenant.getMaxCourses());
        return dto;
    }
}

