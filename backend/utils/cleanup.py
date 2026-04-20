import os
import time
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def cleanup_old_files(directory='uploads', days=30, dry_run=False):
    """
    Delete files older than specified days from a directory.

    Args:
        directory: Directory to clean
        days: Delete files older than this many days
        dry_run: If True, only log what would be deleted

    Returns:
        Tuple of (files_deleted, bytes_freed)
    """
    if not os.path.exists(directory):
        logger.warning(f"Directory does not exist: {directory}")
        return 0, 0

    cutoff_time = time.time() - (days * 86400)
    files_deleted = 0
    bytes_freed = 0

    for root, dirs, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)

            try:
                file_mtime = os.path.getmtime(filepath)

                if file_mtime < cutoff_time:
                    file_size = os.path.getsize(filepath)

                    if dry_run:
                        logger.info(f"Would delete: {filepath} ({file_size} bytes)")
                    else:
                        os.remove(filepath)
                        logger.info(f"Deleted: {filepath} ({file_size} bytes)")

                    files_deleted += 1
                    bytes_freed += file_size

            except Exception as e:
                logger.error(f"Error processing {filepath}: {e}")

    if files_deleted > 0:
        mb_freed = bytes_freed / (1024 * 1024)
        logger.info(f"Cleanup complete: {files_deleted} files, {mb_freed:.2f} MB freed")
    else:
        logger.info(f"No files older than {days} days found in {directory}")

    return files_deleted, bytes_freed


def cleanup_orphaned_reports():
    """
    Delete PDF reports and QR codes that have no corresponding database record.
    """
    from app import app

    reports_dir = os.path.join('uploads', 'reports')
    if not os.path.exists(reports_dir):
        return 0

    deleted = 0

    for filename in os.listdir(reports_dir):
        if filename.startswith('qr_'):
            # Extract report_id from qr_REPORT_ID.png
            report_id = filename[3:-4]  # Remove 'qr_' prefix and '.png' suffix
        elif filename.endswith('.pdf'):
            # Extract report_id from REPORT_ID.pdf
            report_id = filename[:-4]  # Remove '.pdf' suffix
        else:
            continue

        # Check if report exists in database
        with app.app_context():
            record = app.db.history.find_one({"report_id": report_id})

            if not record:
                filepath = os.path.join(reports_dir, filename)
                try:
                    os.remove(filepath)
                    logger.info(f"Deleted orphaned file: {filename}")
                    deleted += 1
                except Exception as e:
                    logger.error(f"Failed to delete {filename}: {e}")

    if deleted > 0:
        logger.info(f"Orphaned cleanup complete: {deleted} files deleted")

    return deleted


if __name__ == '__main__':
    # Test cleanup (dry run)
    cleanup_old_files(days=30, dry_run=True)
