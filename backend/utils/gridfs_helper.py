"""
gridfs_helper.py
────────────────
Central helper for all GridFS (MongoDB file storage) operations.

Replaces the local `uploads/` directory for:
  - Eye scan images (uploaded by the user)
  - Generated PDF reports

Usage:
    from utils.gridfs_helper import save_file, get_file, delete_file, file_exists
"""

import io
import logging
from bson import ObjectId
import gridfs

logger = logging.getLogger(__name__)


def _get_fs(db):
    """Return a GridFS instance for the given database."""
    return gridfs.GridFS(db)


# ── Write ────────────────────────────────────────────────────────────────────

def save_file(db, file_data, filename, content_type="application/octet-stream", metadata=None):
    """
    Save bytes or a file-like object to GridFS.

    Args:
        db:           pymongo Database instance
        file_data:    bytes or file-like object (e.g. BytesIO)
        filename:     logical filename stored in GridFS
        content_type: MIME type (e.g. "image/jpeg", "application/pdf")
        metadata:     optional dict of extra metadata to attach

    Returns:
        str — the GridFS file _id as a hex string
    """
    fs = _get_fs(db)

    if isinstance(file_data, (bytes, bytearray)):
        file_data = io.BytesIO(file_data)

    kwargs = {
        "filename": filename,
        "content_type": content_type,
    }
    if metadata:
        kwargs["metadata"] = metadata

    file_id = fs.put(file_data, **kwargs)
    logger.info(f"GridFS: saved '{filename}' → id={file_id}")
    return str(file_id)


# ── Read ─────────────────────────────────────────────────────────────────────

def get_file(db, file_id):
    """
    Retrieve a file from GridFS by its _id.

    Args:
        db:      pymongo Database instance
        file_id: str or ObjectId

    Returns:
        gridfs.GridOut object (file-like, with .read(), .content_type, .filename)
        or None if not found.
    """
    fs = _get_fs(db)
    try:
        oid = ObjectId(file_id) if isinstance(file_id, str) else file_id
        return fs.get(oid)
    except (gridfs.errors.NoFile, Exception) as e:
        logger.warning(f"GridFS: file not found for id={file_id} — {e}")
        return None


def get_file_bytes(db, file_id):
    """
    Retrieve file content as raw bytes.

    Returns bytes or None.
    """
    gf = get_file(db, file_id)
    if gf is None:
        return None
    return gf.read()


# ── Delete ───────────────────────────────────────────────────────────────────

def delete_file(db, file_id):
    """
    Delete a file from GridFS by its _id.

    Args:
        db:      pymongo Database instance
        file_id: str or ObjectId

    Returns:
        True if deleted, False if not found or error.
    """
    fs = _get_fs(db)
    try:
        oid = ObjectId(file_id) if isinstance(file_id, str) else file_id
        fs.delete(oid)
        logger.info(f"GridFS: deleted file id={file_id}")
        return True
    except Exception as e:
        logger.warning(f"GridFS: failed to delete id={file_id} — {e}")
        return False


# ── Existence check ───────────────────────────────────────────────────────────

def file_exists(db, file_id):
    """Return True if a GridFS file with the given _id exists."""
    fs = _get_fs(db)
    try:
        oid = ObjectId(file_id) if isinstance(file_id, str) else file_id
        return fs.exists(oid)
    except Exception:
        return False
