-- ==============================================================================
-- KAIZENQ AI LMS SAAS - V4 SUBSCRIPTION PLANS & TENANT SUBSCRIPTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
    billing_cycle VARCHAR(32) NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, ANNUAL, LIFETIME
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_students INT NOT NULL DEFAULT 500,
    max_courses INT NOT NULL DEFAULT 20,
    max_storage_gb NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    features TEXT DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL REFERENCES subscription_plans(id),
    billing_cycle VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, TRIALING, PAST_DUE, CANCELLED, EXPIRED
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(32) DEFAULT 'RAZORPAY',
    subscription_external_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id, status);

-- Seed Default Subscription Plans
INSERT INTO subscription_plans (id, name, tier, billing_cycle, price_inr, max_students, max_courses, max_storage_gb, features, is_active)
VALUES
('plan_free_starter', 'Starter Free', 'FREE', 'MONTHLY', 0.00, 100, 5, 2.00,
 '["5 Active Courses", "100 Students", "Community Support", "Basic Analytics"]', TRUE),

('plan_pro_monthly', 'Growth Pro (Monthly)', 'PRO', 'MONTHLY', 1999.00, 1000, 50, 25.00,
 '["Unlimited Courses", "1,000 Students", "AI Mentor Integration", "Custom Domain", "Verified Certificates", "Priority Support"]', TRUE),

('plan_pro_annual', 'Growth Pro (Annual)', 'PRO', 'ANNUAL', 19990.00, 1000, 50, 25.00,
 '["Unlimited Courses", "1,000 Students", "2 Months Free", "AI Mentor Integration", "Custom Domain", "Verified Certificates"]', TRUE),

('plan_enterprise_scale', 'Enterprise Scale', 'ENTERPRISE', 'ANNUAL', 49999.00, 10000, 500, 200.00,
 '["Custom Tenant Isolation", "Unlimited Students", "Dedicated Database Option", "SLA 99.9%", "Dedicated Account Architect"]', TRUE)
ON CONFLICT (id) DO NOTHING;

