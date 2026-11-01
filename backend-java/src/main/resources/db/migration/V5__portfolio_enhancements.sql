-- ==============================================================================
-- Flyway Migration V5: Portfolio Enhancements
-- Adds headline, template style, and accent color fields to portfolios
-- ==============================================================================

ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS headline VARCHAR(255);
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS template VARCHAR(64) DEFAULT 'modern_tech';
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS accent_color VARCHAR(32) DEFAULT '#4f46e5';

