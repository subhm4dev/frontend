# Troubleshooting PostgreSQL Connection Issues

## Error: "too many clients already"

This error occurs when PostgreSQL has reached its maximum connection limit (default is usually 100).

## Solutions

### Option 1: Restart PostgreSQL (Quickest)

**If using Docker:**
```bash
# Restart PostgreSQL container
docker restart ecom-postgres

# Or if using docker-compose
cd ecom-infrastructure
docker compose restart postgres
```

**If using local PostgreSQL:**
```bash
# macOS (Homebrew)
brew services restart postgresql@18

# Or using launchctl
sudo launchctl unload /Library/LaunchDaemons/com.edb.launchd.postgresql-*.plist
sudo launchctl load /Library/LaunchDaemons/com.edb.launchd.postgresql-*.plist
```

### Option 2: Kill Idle Connections (Without Restart)

**Using psql with superuser (if you can connect):**
```sql
-- View current connections
SELECT pid, usename, application_name, state, query_start, state_change
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY state_change;

-- Kill idle connections (be careful!)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname IN ('ecom_iam', 'ecom_catalog')
  AND state = 'idle'
  AND state_change < now() - interval '5 minutes';
```

**Using command line (if you have superuser access):**
```bash
# Find PostgreSQL data directory
ps aux | grep postgres | grep -v grep

# Connect as superuser and terminate idle connections
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < now() - interval '5 minutes';"
```

### Option 3: Increase max_connections

**Find PostgreSQL config file:**
```bash
# macOS (Homebrew)
/opt/homebrew/var/postgresql@18/postgresql.conf

# Or find it
psql -U postgres -c "SHOW config_file;"
```

**Edit postgresql.conf:**
```conf
# Increase max_connections (default is 100)
max_connections = 200

# Also increase shared_buffers proportionally
shared_buffers = 256MB  # Should be ~25% of max_connections * 1MB
```

**Restart PostgreSQL after changes:**
```bash
brew services restart postgresql@18
```

### Option 4: Check for Connection Leaks

**Identify which services are holding connections:**
```sql
SELECT 
    application_name,
    COUNT(*) as connection_count,
    state
FROM pg_stat_activity
WHERE datname IN ('ecom_iam', 'ecom_catalog', 'ecom_inventory', 'ecom_order', 'ecom_payment', 'ecom_cart', 'ecom_checkout', 'ecom_user_profile', 'ecom_address_book', 'ecom_search', 'ecom_promo', 'ecom_fulfilment')
GROUP BY application_name, state
ORDER BY connection_count DESC;
```

**Common causes:**
- Spring Boot services not closing connections properly
- Connection pool size too large
- Services running but not properly shut down
- Database connection pool configuration issues

## After Resolving Connection Issues

Once you can connect again, run the seed scripts:

```bash
# Run IAM seed
/opt/homebrew/Cellar/libpq/18.0/bin/psql -U postgres -d ecom_iam -f seed-iam.sql

# Run Catalog seed
/opt/homebrew/Cellar/libpq/18.0/bin/psql -U postgres -d ecom_catalog -f seed-catalog.sql
```

## Prevention

1. **Configure connection pools in Spring Boot:**
   ```yaml
   spring:
     datasource:
       hikari:
         maximum-pool-size: 10  # Limit connections per service
         minimum-idle: 2
         connection-timeout: 30000
         idle-timeout: 600000
         max-lifetime: 1800000
   ```

2. **Monitor connections regularly:**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

3. **Set up connection limits per database:**
   ```sql
   ALTER DATABASE ecom_iam CONNECTION LIMIT 20;
   ALTER DATABASE ecom_catalog CONNECTION LIMIT 20;
   ```

