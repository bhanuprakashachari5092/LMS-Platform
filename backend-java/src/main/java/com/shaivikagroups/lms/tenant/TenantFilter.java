package com.shaivikagroups.lms.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that resolves and sets the tenant context for each incoming HTTP request.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantFilter extends OncePerRequestFilter {

    private final TenantService tenantService;

    public TenantFilter(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String tenantIdOrSlug = extractTenantIdentifier(request);
            if (tenantIdOrSlug != null && !tenantIdOrSlug.trim().isEmpty()) {
                TenantEntity tenant = tenantService.resolveTenant(tenantIdOrSlug);
                TenantContext.setTenantId(tenant.getId());
            } else {
                TenantContext.setTenantId(TenantContext.DEFAULT_TENANT_ID);
            }

            // Expose the resolved tenant ID as a response header for debugging / UI inspection
            response.setHeader("X-Resolved-Tenant-ID", TenantContext.getTenantId());

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String extractTenantIdentifier(HttpServletRequest request) {
        // 1. Direct Tenant ID header
        String headerTenantId = request.getHeader("X-Tenant-ID");
        if (headerTenantId != null && !headerTenantId.trim().isEmpty()) {
            return headerTenantId.trim();
        }

        // 2. Organization Slug header
        String headerOrgSlug = request.getHeader("X-Organization-Slug");
        if (headerOrgSlug != null && !headerOrgSlug.trim().isEmpty()) {
            return headerOrgSlug.trim();
        }

        String headerTenantSlug = request.getHeader("X-Tenant-Slug");
        if (headerTenantSlug != null && !headerTenantSlug.trim().isEmpty()) {
            return headerTenantSlug.trim();
        }

        // 3. Subdomain inspection from Host header (e.g. acme.kaizenq.in -> acme)
        String host = request.getHeader("Host");
        if (host != null) {
            String hostname = host.split(":")[0];
            String[] parts = hostname.split("\\.");
            if (parts.length >= 3 && !"www".equalsIgnoreCase(parts[0]) && !"api".equalsIgnoreCase(parts[0])) {
                return parts[0];
            }
        }

        return null;
    }
}

