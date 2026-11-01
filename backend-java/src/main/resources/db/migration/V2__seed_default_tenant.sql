-- ==============================================================================
-- KAIZENQ AI LMS SAAS - V2 DEFAULT TENANT & SUPER ADMIN SEED
-- ==============================================================================

-- 1. Insert Default Canonical Organization (KaizenQ)
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    custom_domain,
    logo_url,
    brand_color,
    secondary_color,
    plan_tier,
    max_students,
    max_courses,
    status
) VALUES (
    'tenant-kaizenq-default',
    'KaizenQ AI LMS',
    'kaizenq',
    'kaizenq.in',
    'www.kaizenq.in',
    'https://res.cloudinary.com/kggovcsf/image/upload/f_auto,q_auto/v1787058675/Kaizen_Q_Symbol_Logo1.png',
    '#0284c7',
    '#2563eb',
    'ENTERPRISE',
    100000,
    500,
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Root Super Admin User (Placeholder / Default)
-- Default BCrypt password hash for initial setup (corresponds to secure onboarding flow)
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    display_name,
    role,
    status,
    email_verified
) VALUES (
    'user-root-super-admin',
    'tenant-kaizenq-default',
    'admin@kaizenq.in',
    '$2a$12$e8y2p21hS52Xk2h51gXv..cWfH7g9R90qX2gJzYF0Z9Q2vYpW.6q.', -- Admin default bcrypt hash
    'KaizenQ Super Admin',
    'Super Admin',
    'SUPER_ADMIN',
    'ACTIVE',
    TRUE
) ON CONFLICT (id) DO NOTHING;

