# Namaste Fab Database Seed Scripts

## Overview

This directory contains SQL scripts to seed the database with initial data for the Namaste Fab e-commerce application.

## Files

- `seed-data.sql` - Main seed script that creates admin user, seller, categories, subcategories, and products

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and the following databases exist:
   - `ecom_iam` - For user accounts and authentication
   - `ecom_catalog` - For categories and products

2. **Services Running**: 
   - IAM Service (port 8081)
   - Catalog Service (port 8084)

## Important Notes

### Password Hashing

⚠️ **The password hashes in the SQL script are placeholders!**

The IAM service uses Argon2id with salt+pepper for password hashing. The hashes in the SQL script are test values and **will not work** for actual login.

### Recommended Approach

**Option 1: Use Registration API (Recommended)**
1. Start the IAM service
2. Register users via the API:
   ```bash
   # Register Admin
   curl -X POST http://localhost:8080/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@namastefab.com",
       "phone": "+919876543210",
       "password": "Admin@123",
       "tenantId": "00000000-0000-0000-0000-000000000000"
     }'
   
   # Then grant ADMIN role via database:
   INSERT INTO role_grants (id, user_id, role, granted_at)
   SELECT gen_random_uuid(), id, 'ADMIN', CURRENT_TIMESTAMP
   FROM user_accounts WHERE email = 'admin@namastefab.com';
   ```

**Option 2: Generate Proper Hashes**
Create a Java utility to generate Argon2 hashes with the correct pepper from `application.yml`.

## Running the Scripts

The scripts are split into two files:
- `seed-iam.sql` - For IAM database (users, tenants, roles)
- `seed-catalog.sql` - For Catalog database (categories, products)

### Option 1: Using psql Command Line

```bash
# Run IAM seed script
psql -U postgres -d ecom_iam -f seed-iam.sql

# Run Catalog seed script
psql -U postgres -d ecom_catalog -f seed-catalog.sql

# Or using connection string
psql postgresql://postgres:postgres@localhost:5432/ecom_iam -f seed-iam.sql
psql postgresql://postgres:postgres@localhost:5432/ecom_catalog -f seed-catalog.sql
```

### Option 2: Using Database GUI Tools

1. **pgAdmin**:
   - Open pgAdmin
   - Connect to your PostgreSQL server
   - Right-click on `ecom_iam` database → Query Tool
   - Open and run `seed-iam.sql`
   - Repeat for `ecom_catalog` database with `seed-catalog.sql`

2. **DBeaver**:
   - Connect to PostgreSQL
   - Open SQL Editor
   - Select `ecom_iam` database
   - Open and execute `seed-iam.sql`
   - Repeat for `ecom_catalog` database

3. **VS Code with PostgreSQL Extension**:
   - Install "PostgreSQL" extension
   - Connect to database
   - Open SQL file and execute

## What Gets Created

### Users
- **Admin User**
  - Email: `admin@namastefab.com`
  - Phone: `+919876543210`
  - Role: `ADMIN`
  - Tenant: Marketplace (00000000-0000-0000-0000-000000000000)

- **Seller User**
  - Email: `seller@namastefab.com`
  - Phone: `+919876543211`
  - Role: `SELLER`
  - Tenant: Namaste Fab Seller (11111111-1111-1111-1111-111111111111)

### Categories

**Odia Sarees** (Main Category)
- Sambalpuri Ikat
- Bomkai
- Khandua
- Pasapalli

**Other Indian States** (Main Category)
- Banarasi
- Kanjeevaram
- Bandhani
- Chanderi

### Products

The script creates 10 sample products across different categories:
- 2 Sambalpuri Ikat sarees
- 2 Bomkai sarees
- 1 Khandua saree
- 1 Pasapalli saree
- 2 Banarasi sarees
- 1 Kanjeevaram saree
- 1 Bandhani saree
- 1 Chanderi saree

All products include:
- Free images from Unsplash
- Descriptions
- Prices in INR
- SKU codes
- Active status

## Verification

After running the script, verify the data:

```sql
-- Check users
SELECT u.email, u.phone, r.role, t.name as tenant_name
FROM user_accounts u
JOIN role_grants r ON u.id = r.user_id
JOIN tenants t ON u.tenant_id = t.id
WHERE u.email IN ('admin@namastefab.com', 'seller@namastefab.com');

-- Check categories
SELECT c.name, c.parent_id, p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.tenant_id = '00000000-0000-0000-0000-000000000000'
ORDER BY c.parent_id NULLS FIRST, c.name;

-- Check products
SELECT p.name, p.sku, p.price, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.tenant_id = '11111111-1111-1111-1111-111111111111'
ORDER BY c.name, p.name;
```

## Troubleshooting

### Password Hash Issues

If you can't login with the seeded users:
1. Use the registration API to create users with proper password hashes
2. Or create a Java utility to generate Argon2 hashes

### Foreign Key Violations

If you get foreign key errors:
1. Ensure the marketplace tenant exists (should be created by migration V2)
2. Run migrations first: `mvn flyway:migrate` in both IAM and Catalog services

### Duplicate Key Errors

The script uses `ON CONFLICT DO NOTHING` to prevent duplicate insertions. If you need to re-run:
- The script is idempotent and safe to run multiple times
- Existing data will not be overwritten

## Next Steps

1. **Create Users Properly**: Use the registration API to create users with valid password hashes
2. **Add More Products**: Extend the script with more products as needed
3. **Update Images**: Replace Unsplash URLs with your own hosted images
4. **Set Inventory**: Add inventory records for the products (if using inventory service)

