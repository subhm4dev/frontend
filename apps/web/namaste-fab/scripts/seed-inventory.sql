-- ============================================================================
-- Namaste Fab - Inventory Database Seed Script
-- ============================================================================
-- This script creates:
-- 1. A main warehouse location
-- 2. Stock records for all products
-- ============================================================================
-- Database: ecom_inventory
-- ============================================================================

-- ============================================================================
-- 1. CREATE MAIN WAREHOUSE LOCATION
-- ============================================================================
-- Using a fixed UUID so we can reference it in stock records
-- ============================================================================

INSERT INTO locations (id, name, type, address, tenant_id, active, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Main Warehouse',
    'WAREHOUSE',
    '123 Industrial Area, Bhubaneswar, Odisha 751001',
    '00000000-0000-0000-0000-000000000000'::uuid,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (name, tenant_id) DO UPDATE
SET 
    type = EXCLUDED.type,
    address = EXCLUDED.address,
    active = EXCLUDED.active,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. CREATE STOCK RECORDS FOR ALL PRODUCTS
-- ============================================================================
-- Stock records for each SKU at the main warehouse
-- Initial stock: 50 units per product (adjust as needed)
-- ============================================================================

-- Traditional Sambalpuri Ikat Saree - Red & Black
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-SAMBALPURI-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Elegant Sambalpuri Ikat Saree - Blue & White
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-SAMBALPURI-002',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Royal Bomkai Saree - Gold & Maroon
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-BOMKAI-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Classic Bomkai Saree - Green & Yellow
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-BOMKAI-002',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Traditional Khandua Saree - Orange & Red
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-KHANDUA-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Classic Pasapalli Saree - Black & White
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-PASAPALLI-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Luxurious Banarasi Silk Saree - Gold
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-BANARASI-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    30,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Elegant Banarasi Saree - Maroon & Gold
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-BANARASI-002',
    '11111111-1111-1111-1111-111111111111'::uuid,
    30,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Traditional Kanjeevaram Silk Saree - Red
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-KANJEEVARAM-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    25,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Colorful Bandhani Saree - Multi Color
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-BANDHANI-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- Lightweight Chanderi Saree - Peach
INSERT INTO stock (id, sku, location_id, qty_on_hand, reserved_qty, tenant_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'SF-CHANDERI-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    50,
    0,
    '00000000-0000-0000-0000-000000000000'::uuid,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (sku, location_id, tenant_id) DO UPDATE
SET 
    qty_on_hand = EXCLUDED.qty_on_hand,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - uncomment to verify)
-- ============================================================================
-- SELECT * FROM locations WHERE tenant_id = '00000000-0000-0000-0000-000000000000'::uuid;
-- SELECT sku, qty_on_hand, reserved_qty FROM stock WHERE tenant_id = '00000000-0000-0000-0000-000000000000'::uuid ORDER BY sku;
-- ============================================================================

