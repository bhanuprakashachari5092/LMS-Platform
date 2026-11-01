package com.shaivikagroups.lms.tenant;

import com.shaivikagroups.lms.common.ConflictException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;

    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public TenantEntity getTenantById(String id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));
    }

    @Transactional(readOnly = true)
    public TenantEntity getTenantBySlug(String slug) {
        return tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "slug", slug));
    }

    @Transactional(readOnly = true)
    public TenantEntity resolveTenant(String slugOrDomain) {
        if (slugOrDomain == null || slugOrDomain.trim().isEmpty()) {
            return tenantRepository.findById(TenantContext.DEFAULT_TENANT_ID)
                    .orElseGet(this::createFallbackDefaultTenant);
        }

        String cleaned = slugOrDomain.trim().toLowerCase();

        return tenantRepository.findBySlug(cleaned)
                .or(() -> tenantRepository.findByDomain(cleaned))
                .or(() -> tenantRepository.findByCustomDomain(cleaned))
                .or(() -> tenantRepository.findById(cleaned))
                .orElseGet(() -> tenantRepository.findById(TenantContext.DEFAULT_TENANT_ID)
                        .orElseGet(this::createFallbackDefaultTenant));
    }

    @Transactional
    public TenantEntity createTenant(CreateTenantRequest request) {
        if (tenantRepository.existsBySlug(request.getSlug().toLowerCase())) {
            throw new ConflictException("Organization with slug '" + request.getSlug() + "' already exists");
        }

        TenantEntity tenant = new TenantEntity();
        tenant.setId("tenant-" + UUID.randomUUID().toString().substring(0, 12));
        tenant.setName(request.getName());
        tenant.setSlug(request.getSlug().toLowerCase());
        tenant.setDomain(request.getDomain());
        tenant.setCustomDomain(request.getCustomDomain());
        tenant.setLogoUrl(request.getLogoUrl());
        tenant.setFaviconUrl(request.getFaviconUrl());
        tenant.setBrandColor(request.getBrandColor() != null ? request.getBrandColor() : "#0284c7");
        tenant.setSecondaryColor(request.getSecondaryColor() != null ? request.getSecondaryColor() : "#2563eb");
        tenant.setPlanTier(request.getPlanTier() != null ? request.getPlanTier() : "FREE");
        tenant.setStatus("ACTIVE");

        return tenantRepository.save(tenant);
    }

    @Transactional
    public TenantEntity updateTenant(String id, UpdateTenantRequest request) {
        TenantEntity tenant = getTenantById(id);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            tenant.setName(request.getName().trim());
        }
        if (request.getDomain() != null) {
            tenant.setDomain(request.getDomain().trim().toLowerCase());
        }
        if (request.getCustomDomain() != null) {
            tenant.setCustomDomain(request.getCustomDomain().trim().toLowerCase());
        }
        if (request.getLogoUrl() != null) {
            tenant.setLogoUrl(request.getLogoUrl().trim());
        }
        if (request.getFaviconUrl() != null) {
            tenant.setFaviconUrl(request.getFaviconUrl().trim());
        }
        if (request.getBrandColor() != null) {
            tenant.setBrandColor(request.getBrandColor().trim());
        }
        if (request.getSecondaryColor() != null) {
            tenant.setSecondaryColor(request.getSecondaryColor().trim());
        }
        if (request.getPlanTier() != null) {
            tenant.setPlanTier(request.getPlanTier().trim());
        }
        if (request.getStatus() != null) {
            tenant.setStatus(request.getStatus().trim());
        }

        return tenantRepository.save(tenant);
    }

    @Transactional(readOnly = true)
    public List<TenantEntity> getAllTenants() {
        return tenantRepository.findAll();
    }

    private TenantEntity createFallbackDefaultTenant() {
        TenantEntity def = new TenantEntity();
        def.setId(TenantContext.DEFAULT_TENANT_ID);
        def.setName("KaizenQ AI LMS");
        def.setSlug("kaizenq");
        def.setDomain("kaizenq.in");
        def.setBrandColor("#0284c7");
        def.setSecondaryColor("#2563eb");
        def.setPlanTier("ENTERPRISE");
        def.setStatus("ACTIVE");
        return tenantRepository.save(def);
    }
}

