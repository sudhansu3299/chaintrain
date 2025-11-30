import requests
from fastapi.responses import FileResponse
from walrus import WalrusClient
import os
import re
import urllib.parse
import mimetypes
import magic

publisher_url = "https://publisher.walrus-testnet.walrus.space"
aggregator_url = "https://aggregator.walrus-testnet.walrus.space"
client = WalrusClient(publisher_base_url=publisher_url, aggregator_base_url=aggregator_url) 


def upload_to_walrus(path: str):
    blob_response = client.put_blob_from_file(path)
    print("[walrus] raw response:", blob_response)

    # Validate top-level shape
    if not isinstance(blob_response, dict) or "newlyCreated" not in blob_response:
        raise Exception("Unexpected Walrus upload response format")

    blob_info = blob_response["newlyCreated"]
    blob_object = blob_info.get("blobObject", {}) or {}
    storage = blob_object.get("storage", {}) or {}

    # Try multiple places for the real blob id (defensive)
    blob_id = None

    # 1) preferred: sometimes present directly under newlyCreated
    if isinstance(blob_info, dict):
        blob_id = blob_info.get("blobId")

    # 2) fallback: sometimes inside blobObject
    if not blob_id and isinstance(blob_object, dict):
        blob_id = blob_object.get("blobId") or blob_object.get("blob_id")

    # 3) final fallback: if the SDK returned a single string or other format
    if not blob_id:
        # try to coerce common fallbacks (e.g., SDK returning string)
        if isinstance(blob_response, str) and blob_response:
            blob_id = blob_response
        elif isinstance(blob_response, dict):
            # try to find any plausible id-like field for debugging
            blob_id = blob_response.get("id") or blob_response.get("blob_id") or None

    # If we still don't have it, print debug info and raise
    if not blob_id:
        print("[walrus] Failed to locate blobId in response. blob_info keys:", list(blob_info.keys()))
        print("[walrus] blob_object keys:", list(blob_object.keys()))
        raise Exception("blobId missing from Walrus upload response; raw response printed above")

    # Coerce to string
    blob_id = str(blob_id)

    print(f"[walrus_upload] Extracted blob_id: {blob_id}")

    return {
        "blob_id": blob_id,
        "blob_object_id": blob_object.get("id", ""),
        "size": blob_object.get("size", 0),
        "registered_epoch": blob_object.get("registeredEpoch", 0),
        "encoding_type": blob_object.get("encodingType", ""),
        "storage": {
            "id": storage.get("id", ""),
            "start_epoch": storage.get("startEpoch", 0),
            "end_epoch": storage.get("endEpoch", 0),
            "storage_size": storage.get("storageSize", 0),
        },
        "cost": blob_info.get("cost", 0),
        "encoded_length": (
            blob_info.get("resourceOperation", {})
            .get("registerFromScratch", {})
            .get("encodedLength", 0)
        ),
    }

    
def download_dataset_walrus(blob_id: str, destination_path: str | None = None):
    # Download blob from Walrus
    print("from the method inside download_dataset_walrus")
    url = f"{aggregator_url}/v1/blobs/{blob_id}"
    
    resp = requests.get(url, stream=True)
    resp.raise_for_status()

    # --- 1. Read first bytes to detect file type ---
    # You need a short peek buffer to detect content type
    first_chunk = next(resp.iter_content(chunk_size=2048))

    mime_type = magic.from_buffer(first_chunk, mime=True)
    print("mime type is ", mime_type)
    if mime_type is None:
        mime_type = "application/octet-stream"

    # --- 2. Determine extension from mime type ---
    ext = mimetypes.guess_extension(mime_type) or ""
    print("ext type is ", ext)

    # Handle annoying edge cases
    if ext == ".jpe":
        ext = ".jpg"

    filename = f"{blob_id}{ext}"
    print("filename is ", filename)

    # --- 3. Save the file to disk ---
    with open(filename, "wb") as f:
        f.write(first_chunk)  # write the initial chunk we peeked
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    # --- 4. Return file with correct headers ---
    return FileResponse(
        filename,
        media_type=mime_type,
        filename=filename
    )