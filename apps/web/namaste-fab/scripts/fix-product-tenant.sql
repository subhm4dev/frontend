-- ============================================================================
-- Fix Product Tenant ID
-- ============================================================================
-- Updates products to use marketplace tenant ID for public browsing
-- ============================================================================
-- Database: ecom_catalog
-- ============================================================================

-- Update all products to use marketplace tenant ID for public browsing
UPDATE products
SET tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- Verify the update
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN tenant_id = '00000000-0000-0000-0000-000000000000'::uuid THEN 1 END) as marketplace_products,
    COUNT(CASE WHEN tenant_id = '11111111-1111-1111-1111-111111111111'::uuid THEN 1 END) as seller_products
FROM products
WHERE deleted = false;

-- Show updated products
SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    p.tenant_id,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.deleted = false
ORDER BY c.name, p.name;

