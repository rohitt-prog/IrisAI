import os
import time
import logging
from datetime import datetime, timedelta
from bson import ObjectId
import gridfs

logger = logging.getLogger(__name__)


def cleanup_old_files(directory='uploads', days=30, dry_run=False):
    """
    Delete files older than specified days from a local directory.
    (Used for legacy disk files and temp uploads.)

    Args:
        directory: Directory to clean
        days:      Delete files older than this many days
        dry_run:   If True, only log what would be deleted

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
        # Skip the tmp subfolder — those are cleaned up immediately after prediction
        if os.path.basename(root) == 'tmp':
            continue
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
        logger.info(f"Disk cleanup complete: {files_deleted} files, {mb_freed:.2f} MB freed")
    else:
        logger.info(f"No files older than {days} days found in {directory}")

    return files_deleted, bytes_freed


def cleanup_orphaned_reports():
    """
    Delete legacy PDF reports and QR codes on disk that have no DB record.
    (Only relevant for files created before the GridFS migration.)
    """
    from app import app

    reports_dir = os.path.join('uploads', 'reports')
    if not os.path.exists(reports_dir):
        return 0

    deleted = 0
    files_to_check = []
    for filename in os.listdir(reports_dir):
        if filename.startswith('qr_'):
            report_id = filename[3:-4]
        elif filename.endswith('.pdf'):
            report_id = filename[:-4]
        else:
            continue
        files_to_check.append((filename, report_id))

    if not files_to_check:
        return 0

    with app.app_context():
        for filename, report_id in files_to_check:
            record = app.db.history.find_one({"report_id": report_id})
            if not record:
                filepath = os.path.join(reports_dir, filename)
                try:
                    os.remove(filepath)
                    logger.info(f"Deleted orphaned disk file: {filename}")
                    deleted += 1
                except Exception as e:
                    logger.error(f"Failed to delete {filename}: {e}")

    if deleted > 0:
        logger.info(f"Orphaned disk cleanup complete: {deleted} files deleted")

    return deleted


def cleanup_orphaned_gridfs_images(dry_run=False):
    """
    Delete GridFS images (scan images) that have no corresponding history record.

    This is the GridFS equivalent of cleanup_orphaned_reports().
    Run this periodically to free up MongoDB storage.

    Args:
        dry_run: If True, only log what would be deleted.

    Returns:
        int — number of GridFS files deleted (or that would be deleted).
    """
    from app import app

    deleted = 0

    with app.app_context():
        db = app.db
        fs = gridfs.GridFS(db)

        # Collect all GridFS file IDs that are referenced in history records
        referenced_ids = set()
        for record in db.history.find({"image_gridfs_id": {"$exists": True, "$ne": None}},
                                       {"image_gridfs_id": 1}):
            referenced_ids.add(record['image_gridfs_id'])

        # Iterate all files in GridFS
        for grid_file in fs.find({"metadata.type": "scan_image"}):
            file_id_str = str(grid_file._id)
            if file_id_str not in referenced_ids:
                if dry_run:
                    logger.info(f"Would delete orphaned GridFS file: {grid_file.filename} (id={file_id_str})")
                else:
                    try:
                        fs.delete(grid_file._id)
                        logger.info(f"Deleted orphaned GridFS file: {grid_file.filename} (id={file_id_str})")
                    except Exception as e:
                        logger.error(f"Failed to delete GridFS file {file_id_str}: {e}")
                deleted += 1

    if deleted > 0:
        logger.info(f"GridFS orphan cleanup complete: {deleted} files {'would be ' if dry_run else ''}deleted")
    else:
        logger.info("GridFS cleanup: no orphaned files found")

    return deleted


def cleanup_tmp_folder(dry_run=False):
    """
    Force-delete all files in the uploads/tmp directory.
    These are temporary files created during AI model inference and
    should normally be cleaned up immediately, but this handles edge cases.
    """
    tmp_dir = os.path.join('uploads', 'tmp')
    if not os.path.exists(tmp_dir):
        return 0

    deleted = 0
    for filename in os.listdir(tmp_dir):
        filepath = os.path.join(tmp_dir, filename)
        if os.path.isfile(filepath):
            if dry_run:
                logger.info(f"Would delete tmp file: {filepath}")
            else:
                try:
                    os.remove(filepath)
                    logger.info(f"Deleted tmp file: {filepath}")
                except Exception as e:
                    logger.error(f"Failed to delete tmp file {filepath}: {e}")
            deleted += 1

    return deleted


if __name__ == '__main__':
    # Test cleanup (dry run)
    cleanup_old_files(days=30, dry_run=True)
    cleanup_orphaned_gridfs_images(dry_run=True)
    cleanup_tmp_folder(dry_run=True)
