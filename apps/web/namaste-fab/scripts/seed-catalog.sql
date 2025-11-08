-- ============================================================================
-- Namaste Fab - Catalog Database Seed Script
-- ============================================================================
-- This script creates:
-- 1. Categories and subcategories for sarees
-- 2. Sample products with free images
-- ============================================================================
-- Database: ecom_catalog
-- ============================================================================

-- ============================================================================
-- 1. CREATE CATEGORIES AND SUBCATEGORIES
-- ============================================================================
-- Using marketplace tenant ID for public browsing
-- ============================================================================

-- Main Categories
INSERT INTO categories (id, name, description, parent_id, tenant_id, created_at, updated_at)
VALUES
    -- Odia Sarees (Main Category)
    ('c1111111-1111-1111-1111-111111111111'::uuid, 'Odia Sarees', 'Traditional sarees from Odisha featuring unique weaving techniques and motifs', NULL, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Other Indian States (Main Category)
    ('c2222222-2222-2222-2222-222222222222'::uuid, 'Other Indian States', 'Beautiful sarees from various Indian states', NULL, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name, tenant_id) DO NOTHING;

-- Subcategories for Odia Sarees
INSERT INTO categories (id, name, description, parent_id, tenant_id, created_at, updated_at)
VALUES
    ('c1111111-1111-1111-1111-111111111112'::uuid, 'Sambalpuri Ikat', 'Traditional ikat sarees from Sambalpur with geometric patterns', 'c1111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('c1111111-1111-1111-1111-111111111113'::uuid, 'Bomkai', 'Elegant Bomkai sarees with intricate thread work and temple borders', 'c1111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('c1111111-1111-1111-1111-111111111114'::uuid, 'Khandua', 'Traditional Khandua sarees with temple motifs and vibrant colors', 'c1111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('c1111111-1111-1111-1111-111111111115'::uuid, 'Pasapalli', 'Classic Pasapalli sarees with checkered patterns', 'c1111111-1111-1111-1111-111111111111'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name, tenant_id) DO NOTHING;

-- Subcategories for Other Indian States
INSERT INTO categories (id, name, description, parent_id, tenant_id, created_at, updated_at)
VALUES
    ('c2222222-2222-2222-2222-222222222223'::uuid, 'Banarasi', 'Luxurious Banarasi silk sarees from Varanasi', 'c2222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('c2222222-2222-2222-2222-222222222224'::uuid, 'Kanjeevaram', 'Traditional Kanjeevaram silk sarees from Tamil Nadu', 'c2222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('c2222222-2222-2222-2222-222222222225'::uuid, 'Bandhani', 'Colorful Bandhani tie-dye sarees from Gujarat and Rajasthan', 'c2222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('c2222222-2222-2222-2222-222222222226'::uuid, 'Chanderi', 'Lightweight Chanderi sarees from Madhya Pradesh', 'c2222222-2222-2222-2222-222222222222'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name, tenant_id) DO NOTHING;

-- ============================================================================
-- 2. CREATE PRODUCTS
-- ============================================================================
-- Using free images from Unsplash
-- Seller ID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Tenant ID: 11111111-1111-1111-1111-111111111111 (seller tenant)
-- ============================================================================

-- Sambalpuri Ikat Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Traditional Sambalpuri Ikat Saree - Red & Black',
        'SF-SAMBALPURI-001',
        'Handwoven Sambalpuri ikat saree featuring traditional geometric patterns in vibrant red and black. Perfect for festivals and special occasions.',
        3500.00,
        'INR',
        'c1111111-1111-1111-1111-111111111112'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'Elegant Sambalpuri Ikat Saree - Blue & White',
        'SF-SAMBALPURI-002',
        'Beautiful blue and white Sambalpuri ikat saree with intricate patterns. Lightweight and comfortable for daily wear.',
        2800.00,
        'INR',
        'c1111111-1111-1111-1111-111111111112'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Bomkai Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Royal Bomkai Saree - Gold & Maroon',
        'SF-BOMKAI-001',
        'Exquisite Bomkai saree with temple borders and intricate thread work in gold and maroon. Ideal for weddings and grand celebrations.',
        5500.00,
        'INR',
        'c1111111-1111-1111-1111-111111111113'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1601925260368-ae2f83d34e48?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'Classic Bomkai Saree - Green & Yellow',
        'SF-BOMKAI-002',
        'Traditional Bomkai saree with beautiful green and yellow color combination. Features traditional motifs and temple borders.',
        4800.00,
        'INR',
        'c1111111-1111-1111-1111-111111111113'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Khandua Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Traditional Khandua Saree - Orange & Red',
        'SF-KHANDUA-001',
        'Vibrant Khandua saree with temple motifs in orange and red. Handwoven with traditional techniques.',
        3200.00,
        'INR',
        'c1111111-1111-1111-1111-111111111114'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1601925260368-ae2f83d34e48?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Pasapalli Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Classic Pasapalli Saree - Black & White',
        'SF-PASAPALLI-001',
        'Timeless Pasapalli saree with checkered patterns in black and white. Versatile and elegant for any occasion.',
        2900.00,
        'INR',
        'c1111111-1111-1111-1111-111111111115'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Banarasi Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Luxurious Banarasi Silk Saree - Gold',
        'SF-BANARASI-001',
        'Exquisite Banarasi silk saree with intricate zari work in gold. Perfect for weddings and special occasions.',
        12000.00,
        'INR',
        'c2222222-2222-2222-2222-222222222223'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1601925260368-ae2f83d34e48?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(),
        'Elegant Banarasi Saree - Maroon & Gold',
        'SF-BANARASI-002',
        'Beautiful Banarasi saree in maroon with gold zari work. Traditional design with modern appeal.',
        9500.00,
        'INR',
        'c2222222-2222-2222-2222-222222222223'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Kanjeevaram Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Traditional Kanjeevaram Silk Saree - Red',
        'SF-KANJEEVARAM-001',
        'Classic Kanjeevaram silk saree in vibrant red with gold borders. Handwoven with pure silk threads.',
        15000.00,
        'INR',
        'c2222222-2222-2222-2222-222222222224'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1601925260368-ae2f83d34e48?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Bandhani Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Colorful Bandhani Saree - Multi Color',
        'SF-BANDHANI-001',
        'Vibrant Bandhani tie-dye saree with multiple colors. Traditional Rajasthani design with modern patterns.',
        2500.00,
        'INR',
        'c2222222-2222-2222-2222-222222222225'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Chanderi Products
INSERT INTO products (id, name, sku, description, price, currency, category_id, seller_id, tenant_id, images, status, deleted, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'Lightweight Chanderi Saree - Peach',
        'SF-CHANDERI-001',
        'Elegant Chanderi saree in soft peach color. Lightweight and perfect for summer wear.',
        3200.00,
        'INR',
        'c2222222-2222-2222-2222-222222222226'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop", "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop"]',
        'ACTIVE',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT * FROM categories WHERE tenant_id = '00000000-0000-0000-0000-000000000000' ORDER BY parent_id NULLS FIRST, name;
-- SELECT COUNT(*) FROM products WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
-- SELECT p.name, p.sku, p.price, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.tenant_id = '11111111-1111-1111-1111-111111111111' ORDER BY c.name, p.name;
-- ============================================================================

