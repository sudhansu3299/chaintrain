class Nautilus:
  def generate_dummy_proof(self, merkle_root, blob_id):
    # Hackathon simple proof
    return b"dummy-proof-" + merkle_root[:8] + blob_id.encode()[:8]
