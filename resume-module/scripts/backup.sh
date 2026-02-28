#!/bin/bash

# Configuration
CONTAINER_NAME="resume_postgres"
DB_NAME="resume_db"
DB_USER="postgres"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M")
FILENAME="backup_${TIMESTAMP}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup for $DB_NAME..."

# Execute pg_dump inside the container and compress the output
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"

# Check if the backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/$FILENAME"
    # Optional: Delete backups older than 30 days
    # find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
else
    echo "Backup failed!"
    exit 1
fi
