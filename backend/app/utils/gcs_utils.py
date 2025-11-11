from flask import current_app
from google.cloud import storage
from datetime import timedelta
import os
import uuid
import threading

# GCS Configure
GCS_BUCKET_NAME = os.environ.get('GCS_BUCKET_NAME', '')

if not GCS_BUCKET_NAME:
    raise ValueError("GCS_BUCKET_NAME environment variable not set")

# Cached client/bucket for reuse across uploads
_storage_client = None
_bucket = None

def get_storage_client():
    """Return a cached GCS storage client."""
    
    global _storage_client
    
    if _storage_client is None:
        _storage_client = storage.Client()
    return _storage_client

def get_bucket():
    """Return a cached GCS bucket instance."""
    
    global _bucket
    
    if _bucket is None:
        client = get_storage_client()
        _bucket = client.bucket(GCS_BUCKET_NAME)
    return _bucket

# Mapping Form type to folder structure
FOLDER_MAP = {
    'arrival_check': 'arrival-check',
    'storage_maintenance': 'storage-maintenance',
    'pdi': 'pre-delivery-inspection',
    'commissioning': 'commissioning',
    'ibc': 'ibc-forms',
    'kho': 'kho-documents',
}

def get_folder_prefix(form_type, brand, user_id):
    """Generate folder prefix for GCS Path
    
    Args:
        form_type (str): Type of form (e.g., 'arrival_check', 'storage_maintenance')
        brand (str): Brand name (e.g., 'renault', 'manitou', 'sdlg')
        user_id (str): User ID for organization
        
    Returns:
        str: Folder prefix (e.g., 'arrival-check/renault/a1b2c3'
    """

    base_path = FOLDER_MAP.get(form_type, 'other')
    return f"{base_path}/{brand.lower()}/{user_id}"

def upload_file_to_gcs_sync(file, folder_prefix):
    """Synchronous upload to GCS - used internally by async wrapper.

    Args:
        file: FileStorage object from Flask request.files
        folder_prefix (str): Folder prefix for the file
        
    Returns:
        str or None: Blob name if successful, None if failed
    """

    if not file or not hasattr(file, 'filename'):
        current_app.logger.warning("Invalid file Object provided for GCS upload")
        return None
    
    try:
        # reuse cached bucket
        bucket = get_bucket()

        # generate Unique filename
        safe_filename = file.filename.replace(' ', '_').replace('/', '_')
        filename = f"{folder_prefix}/{uuid.uuid4()}_{safe_filename}"
        blob = bucket.blob(filename)

        # upload file
        blob.upload_from_file(file, content_type=file.content_type)

        current_app.logger.info(f"Successfully uploaded file to GCS: {filename}")
        return filename
    
    except Exception as e:
        current_app.logger.error(f"Failed to upload file to GCS: {str(e)}")
        return None

def upload_file_to_gcs_async(file, folder_prefix, callback=None):
    """Asynchronous upload to GCS using threading.
    
    Args:
        file: FileStorage object from Flask request.files
        folder_prefix (str): Folder prefix for the file
        callback (function): Optional callback function to handle result
        
    Returns:
        None: Upload happens in background thread
    """

    def upload_task():
        try:
            blob_name = upload_file_to_gcs_sync(file, folder_prefix)
            if callback:
                callback(blob_name)
        
        except Exception as e:
            current_app.logger.error(f"Async upload failed: {str(e)}")
            if callback:
                callback(None)
    
    # start upload in background thread
    upload_thread = threading.Thread(target=upload_task)
    upload_thread.daemon = True 
    upload_thread.start()

def upload_file_to_gcs(file, folder_prefix, async_upload=False, callback=None):
    """Main upload function - can be sync or async.

    Args:
        file: FileStorage object from Flask request.files
        folder_prefix (str): Folder prefix for the file
        async_upload (bool): If True, upload asynchronously
        callback (function): Callback for async upload (blob_name or None)
        
    Returns:
        str or None: Blob name if sync upload successful, None otherwise
    """ 

    if async_upload:
        upload_file_to_gcs_async(file, folder_prefix, callback)
        return None
    else:
        return upload_file_to_gcs_sync(file, folder_prefix)

def upload_blob_with_bucket(file, bucket, folder_prefix):
    """Upload using a provided bucket (avoids re-creating client per file).

    Args:
        file: FileStorage object
        bucket: google.cloud.storage.bucket.Bucket
        folder_prefix (str): folder prefix

    Returns:
        str or None: blob name
    """
    if not file or not hasattr(file, 'filename'):
        try:
            current_app.logger.warning("Invalid file Object provided for GCS upload")
        except Exception:
            pass
        return None
    try:
        safe_filename = file.filename.replace(' ', '_').replace('/', '_')
        filename = f"{folder_prefix}/{uuid.uuid4()}_{safe_filename}"
        blob = bucket.blob(filename)
        blob.upload_from_file(file, content_type=file.content_type)
        try:
            current_app.logger.info(f"Successfully uploaded file to GCS: {filename}")
        except Exception:
            pass
        return filename
    except Exception as e:
        try:
            current_app.logger.error(f"Failed to upload file to GCS (with bucket): {str(e)}")
        except Exception:
            pass
        return None

def generate_signed_url(blob_name, expiration_hours=1):
    """Generate signed URL for secure file access.
    
    Args:
        blob_name (str): Full blob name in GCS (e.g., 'arrival-check/renault/a1b2c3/file.jpg')
        expiration_hours (int): URL expiration time in hours
        
    Returns:
        str or None: Signed URL if successful, None if failed
    """

    if not blob_name:
        current_app.logger.warning("Cannot generate signed URL: blob_name is empty")
        return None

    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(GCS_BUCKET_NAME)
        blob = bucket.blob(blob_name)

        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(hours=expiration_hours),
            method="GET",
        )
        return url
    
    except Exception as e:
        current_app.logger.error(f"Failed to generate signed URL for {blob_name}: {str(e)}")
        return None

def delete_file_from_gcs(blob_name):
    """Delete file from GCS (useful for cleanup).
    
    Args:
        blob_name (str): Full blob name in GCS
        
    Returns:
        bool: True if successful, False otherwise
    """

    if not blob_name:
        return False
    
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(GCS_BUCKET_NAME)
        blob = bucket.blob(blob_name)
        blob.delete()
        current_app.logger.info(f"Successfully deleted file from GCS: {blob_name}")
        return True
    
    except Exception as e:
        current_app.logger.error(f"Failed to delete file from GCS {blob_name}: {str(e)}")
        return False
    
# Helper functions for common use cases
def upload_arrival_check_file(file, brand, user_id, async_upload=False, callback=None):
    """Helper for Arrival Check form uploads"""
    
    folder_prefix = get_folder_prefix('arrival_check', brand, user_id)
    return upload_file_to_gcs(file, folder_prefix, async_upload, callback)

def upload_storage_maintenance_file(file, brand, user_id, async_upload=False, callback=None):
    """Helper for Storage Maintenance form uploads"""
    
    folder_prefix = get_folder_prefix('storage_maintenance', brand, user_id)
    return upload_file_to_gcs(file, folder_prefix, async_upload, callback)

def upload_pdi_file(file, brand, user_id, async_upload=False, callback=None):
    """Helper for Pre-Delivery Inspection form uploads"""
    
    folder_prefix = get_folder_prefix('pdi', brand, user_id)
    return upload_file_to_gcs(file, folder_prefix, async_upload, callback)

def upload_commissioning_file(file, brand, user_id, async_upload=False, callback=None):
    """Helper for Commissioning form uploads"""
    
    folder_prefix = get_folder_prefix('commissioning', brand, user_id)
    return upload_file_to_gcs(file, folder_prefix, async_upload, callback)

def upload_ibc_file(file, brand, user_id, async_upload=False, callback=None):
    """Helper for IBC form uploads"""
    
    folder_prefix = get_folder_prefix('ibc', brand, user_id)
    return upload_file_to_gcs(file, folder_prefix, async_upload, callback)

def upload_kho_file(file, brand, user_id, async_upload=False, callback=None):
    """Helper for KHO document uploads"""
    
    folder_prefix = get_folder_prefix('kho', brand, user_id)
    return upload_file_to_gcs(file, folder_prefix, async_upload, callback)
