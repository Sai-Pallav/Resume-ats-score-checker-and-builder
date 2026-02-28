# Database Recovery & Restore Guide

This guide provides instructions on how to restore your resume database from a compressed backup file.

## Prerequisites

- Docker and Docker Compose must be installed.
- The `resume_postgres` container must be running.

## Restore Steps

### 1. Identify the Backup File
Locate the `.sql.gz` file you wish to restore in the `/backups` directory.

### 2. Decompress the Backup
You can either decompress it manually or pipe it directly into `psql`.

**Decompress command:**
```bash
gunzip -c backups/backup_YYYY-MM-DD_HHMM.sql.gz > restore.sql
```

### 3. Execute the Restore
Run the following command to pipe the SQL into the running container:

```bash
cat restore.sql | docker exec -i resume_postgres psql -U postgres -d resume_db
```

**Alternative (Direct pipe):**
```bash
gunzip -c backups/backup_YYYY-MM-DD_HHMM.sql.gz | docker exec -i resume_postgres psql -U postgres -d resume_db
```

## Important Notes

- **Data Overwrite**: Running a restore will overwrite existing data. It is recommended to take a fresh backup *before* restoring if you want to preserve the current state.
- **Service Restart**: While not strictly necessary, it's good practice to restart the `app` container after a significant data restore:
  ```bash
  docker-compose restart app
  ```

## Scheduling Automatic Backups (Linux/macOS)

To automate backups daily at 2:00 AM, add a cron job:

1. Run `crontab -e`.
2. Add the following line:
   ```bash
   0 2 * * * /path/to/project/scripts/backup.sh >> /path/to/project/backups/backup.log 2>&1
   ```
