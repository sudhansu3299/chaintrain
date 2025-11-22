class Nautilus:
  def generate_dummy_proof(self, merkle_root, blob_id):
    # Hackathon simple proof
    # Ensure blob_id is a string before encoding
    if isinstance(blob_id, dict):
      blob_id = blob_id.get('blobId') or blob_id.get('blob_id') or ''
    blob_id_str = str(blob_id) if blob_id else ''
    
    # Ensure merkle_root is bytes
    if isinstance(merkle_root, bytes):
      merkle_bytes = merkle_root[:8]
    else:
      merkle_bytes = bytes(merkle_root)[:8] if merkle_root else b''
    
    return b"proof-" + merkle_bytes + blob_id_str.encode('utf-8')[:8]
