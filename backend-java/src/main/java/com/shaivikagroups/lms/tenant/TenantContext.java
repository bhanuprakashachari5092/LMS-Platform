package com.shaivikagroups.lms.tenant;

/**
 * Thread-safe context holder for the current resolved tenant ID.
 */
public final class TenantContext {

    public static final String DEFAULT_TENANT_ID = "tenant-kaizenq-default";

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
        // utility class
    }

    public static void setTenantId(String tenantId) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            CURRENT_TENANT.set(DEFAULT_TENANT_ID);
        } else {
            CURRENT_TENANT.set(tenantId.trim());
        }
    }

    public static String getTenantId() {
        String tenant = CURRENT_TENANT.get();
        return (tenant != null && !tenant.isEmpty()) ? tenant : DEFAULT_TENANT_ID;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}

