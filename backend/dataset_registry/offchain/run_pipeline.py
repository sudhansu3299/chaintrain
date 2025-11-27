from .walrus_upload import upload_to_walrus
from .merkle import chunk_file, build_merkle
from .nautilus_proof import Nautilus
from .register_to_sui import register_dataset
import uuid
import os

def process_dataset(path: str):
    # Create dataset ID
    dataset_id = uuid.uuid4().bytes

    # Get file size
    file_size = os.path.getsize(path)

    # 1. Upload to Walrus
    blob_info = upload_to_walrus(path)
    print(f"[debug] blob_info type: {type(blob_info)}, value: {blob_info}")
    
    # Extract blob_id with multiple fallbacks
    blob_id = blob_info.get('blob_id') if isinstance(blob_info, dict) else ''
    print(f"[debug] blob_id after extraction type: {type(blob_id)}, value: {blob_id}")
    
    # Ensure blob_id is a string, not a dict or other type
    if isinstance(blob_id, dict):
        blob_id = blob_id.get('blobId') or blob_id.get('blob_id') or ''
    elif blob_id is None:
        blob_id = ''
    
    # Force to string
    blob_id = str(blob_id)
    
    # Final validation
    if not isinstance(blob_id, str):
        raise Exception(f"blob_id must be a string, got {type(blob_id)}: {blob_id}. blob_info: {blob_info}")
    
    if not blob_id or blob_id == '':
        raise Exception(f"Failed to extract blob_id from Walrus upload response. blob_info: {blob_info}")
    
    print(f"[debug] Final blob_id: {blob_id} (type: {type(blob_id)})")

    # 2. Merkle root
    chunks = list(chunk_file(path))
    root, tree = build_merkle(chunks)
    merkle_root_hex = root.hex()

    # 3. zk-Proof
    # zk = Nautilus()
    # zk_proof = zk.generate_dummy_proof(root, blob_id)

    # print("zk_proof: ", zk_proof)

    # # 4. Register to Sui
    # tx_digest = register_dataset(
    #     dataset_id,
    #     blob_id,
    #     root,
    #     zk_proof
    # )

    # print("tx_digest generated is: ",tx_digest)

    return {
        # 'tx_digest': tx_digest,
        'dataset_id': dataset_id.hex(),
        'blob_info': blob_info,
        'merkle_root': merkle_root_hex,
        'chunks': len(chunks),
        'file_size': file_size,
    }
