from walrus_client import WalrusClient

def upload_to_walrus(path: str) -> str:
  client = WalrusClient()
  blob_id = client.upload_file(path)
  print("Uploaded to Walrus:", blob_id)
  return blob_id
