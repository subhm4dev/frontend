-- ============================================================================
-- Namaste Fab - Address Book Database Seed Script
-- ============================================================================
-- This script creates:
-- 1. Shipping addresses for test users
-- ============================================================================
-- Database: ecom_address_book
-- ============================================================================
-- 
-- NOTE: This script creates addresses for:
-- - Admin user (aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa) - Marketplace tenant
-- - Seller user (bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb) - Seller tenant
-- 
-- For other users, create addresses via the Address API:
-- POST /api/v1/addresses
-- ============================================================================

-- ============================================================================
-- 1. CREATE ADDRESSES FOR ADMIN USER (Marketplace Tenant)
-- ============================================================================
-- User ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Tenant ID: 00000000-0000-0000-0000-000000000000
-- ============================================================================

-- Home Address (Default)
INSERT INTO addresses (
    id,
    user_id,
    tenant_id,
    line1,
    line2,
    city,
    state,
    postcode,
    country,
    label,
    is_default,
    deleted,
    deleted_at,
    created_at,
    updated_at
)
VALUES (
    'aaaaaaaa-1111-1111-1111-111111111111'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    '123 Main Street',
    'Apartment 4B',
    'Bhubaneswar',
    'Odisha',
    '751001',
    'IN',
    'Home',
    true,
    false,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Work Address
INSERT INTO addresses (
    id,
    user_id,
    tenant_id,
    line1,
    line2,
    city,
    state,
    postcode,
    country,
    label,
    is_default,
    deleted,
    deleted_at,
    created_at,
    updated_at
)
VALUES (
    'aaaaaaaa-2222-2222-2222-222222222222'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    '456 Business Park',
    'Suite 200',
    'Bhubaneswar',
    'Odisha',
    '751002',
    'IN',
    'Work',
    false,
    false,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CREATE ADDRESSES FOR SELLER USER (Seller Tenant)
-- ============================================================================
-- User ID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Tenant ID: 11111111-1111-1111-1111-111111111111
-- ============================================================================

-- Home Address (Default)
INSERT INTO addresses (
    id,
    user_id,
    tenant_id,
    line1,
    line2,
    city,
    state,
    postcode,
    country,
    label,
    is_default,
    deleted,
    deleted_at,
    created_at,
    updated_at
)
VALUES (
    'bbbbbbbb-1111-1111-1111-111111111111'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '789 Seller Street',
    NULL,
    'Cuttack',
    'Odisha',
    '753001',
    'IN',
    'Home',
    true,
    false,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CREATE ADDRESSES FOR CUSTOMER USER
-- ============================================================================
-- Customer User ID: 782fbf6d-ad8c-46eb-a235-535297109985
-- Tenant ID: 00000000-0000-0000-0000-000000000000 (Marketplace)
-- ============================================================================

-- Customer Home Address (Default) - This matches the address ID used in checkout
INSERT INTO addresses (
    id,
    user_id,
    tenant_id,
    line1,
    line2,
    city,
    state,
    postcode,
    country,
    label,
    is_default,
    deleted,
    deleted_at,
    created_at,
    updated_at
)
VALUES (
    '76fbbf25-0c87-4e52-8fde-f1c13ac4c75b'::uuid,  -- Fixed ID to match checkout
    '782fbf6d-ad8c-46eb-a235-535297109985'::uuid,  -- Customer user ID
    '00000000-0000-0000-0000-000000000000'::uuid,  -- Marketplace tenant
    '123 Main Street',
    'Apartment 4B',
    'Bhubaneswar',
    'Odisha',
    '751001',
    'IN',
    'Home',
    true,
    false,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Customer Work Address (Optional)
INSERT INTO addresses (
    id,
    user_id,
    tenant_id,
    line1,
    line2,
    city,
    state,
    postcode,
    country,
    label,
    is_default,
    deleted,
    deleted_at,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '782fbf6d-ad8c-46eb-a235-535297109985'::uuid,  -- Customer user ID
    '00000000-0000-0000-0000-000000000000'::uuid,  -- Marketplace tenant
    '456 Business Park',
    'Suite 200',
    'Bhubaneswar',
    'Odisha',
    '751002',
    'IN',
    'Work',
    false,
    false,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - uncomment to verify)
-- ============================================================================
-- 
-- -- View all addresses for admin user
-- SELECT 
--     id,
--     user_id,
--     line1,
--     city,
--     state,
--     postcode,
--     country,
--     label,
--     is_default
-- FROM addresses 
-- WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid 
--   AND deleted = false
-- ORDER BY is_default DESC, created_at;
-- 
-- -- View all addresses for seller user
-- SELECT 
--     id,
--     user_id,
--     line1,
--     city,
--     state,
--     postcode,
--     country,
--     label,
--     is_default
-- FROM addresses 
-- WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid 
--   AND deleted = false
-- ORDER BY is_default DESC, created_at;
-- 
-- -- Count addresses by tenant
-- SELECT 
--     tenant_id,
--     COUNT(*) as address_count
-- FROM addresses 
-- WHERE deleted = false
-- GROUP BY tenant_id;
-- 
-- ============================================================================

