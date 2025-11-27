import json
from .config import SUI_PACKAGE_ID
from pysui import SuiConfig, SyncClient
from pysui.sui.sui_txn.transaction_builder import ProgrammableTransactionBuilder


def register_dataset(dataset_id, blob_id, merkle_root, zk_proof):
  """
  Register a dataset on Sui blockchain.
  
  Args:
    dataset_id: bytes - UUID bytes for the dataset
    blob_id: str - Walrus blob ID
    merkle_root: bytes - Merkle root hash
    zk_proof: bytes - Zero-knowledge proof
  
  Returns:
    str - Transaction digest
  """
  print(f"[debug register_to_sui] blob_id type: {type(blob_id)}, value: {blob_id}")
  
  # Ensure blob_id is a string - handle all cases
  if isinstance(blob_id, dict):
    # If it's a dict, try to extract the blobId
    blob_id = blob_id.get('blobId') or blob_id.get('blob_id') or ''
  
  # Force conversion to string, handle None and empty cases
  if blob_id is None:
    blob_id_str = ''
  elif isinstance(blob_id, dict):
    # If still a dict after extraction, convert to string representation
    blob_id_str = str(blob_id.get('blobId', '') or blob_id.get('blob_id', ''))
  else:
    blob_id_str = str(blob_id)
  
  # Final safety check - ensure it's actually a string
  if not isinstance(blob_id_str, str):
    blob_id_str = str(blob_id_str)
  
  print(f"[debug register_to_sui] blob_id_str: {blob_id_str} (type: {type(blob_id_str)})")
  
  # Validate before encoding
  if not isinstance(blob_id_str, str):
    raise Exception(f"blob_id_str must be a string, got {type(blob_id_str)}: {blob_id_str}")
  
  # Try to encode - catch any errors
  try:
    blob_id_bytes = blob_id_str.encode('utf-8')
  except AttributeError as e:
    raise Exception(f"Cannot encode blob_id_str: type={type(blob_id_str)}, value={blob_id_str}, original_blob_id={blob_id}. Error: {e}")
  
  # Validate package ID
  if not SUI_PACKAGE_ID or SUI_PACKAGE_ID == "REPLACE_WITH_DEPLOYED_PACKAGE":
    raise Exception("SUI_PACKAGE_ID is not set. Please update config.py with your deployed package ID.")
  
  # Initialize SuiConfig - use default config which reads from ~/.sui/sui_config/
  # This requires Sui CLI to be installed and configured
  try:
    config = SuiConfig.default_config()
  except Exception as e:
    raise Exception(
      f"Failed to load Sui config. Make sure:\n"
      f"1. Sui CLI is installed (https://docs.sui.io/build/install)\n"
      f"2. Sui CLI is configured: run 'sui client' to set up\n"
      f"3. You have an active address: run 'sui client active-address'\n"
      f"Error: {e}"
    )
  
  # Create SyncClient
  client = SyncClient(config)
  
  # Get active address (signer)
  signer = config.active_address
  print(f"Using signer address: {signer}")

  # print(dir(ProgrammableTransactionBuilder()))
  
  # Verify signer is set
  if not signer:
    raise Exception("No active address found. Run 'sui client active-address' to set an active address.")
  
  # Prepare arguments - all need to be hex strings with 0x prefix
  args = [
    dataset_id,            # bytes
    blob_id_bytes,         # bytes
    merkle_root,           # bytes
    zk_proof,              # bytes
    b"nautilus-dummy"
]


  print(f"Calling move_call with package: {SUI_PACKAGE_ID}")
  # print(f"Arguments: {[arg[:20] + '...' if len(arg) > 20 else arg for arg in args]}")
  
  try:
    ptb = ProgrammableTransactionBuilder()
    ptb_args = [ptb.input_pure(a) for a in args]
    print("ptb args: ", ptb_args)


    ptb.move_call(
        target=f"{SUI_PACKAGE_ID}::dataset_registry::register_dataset",
        arguments=ptb_args,
        type_arguments=[]
    )

    ptb.set_gas_budget(20000000)
    result = client.execute(ptb)
    print("Transaction result:", result)
    
  except Exception as e:
    error_msg = f"Failed to execute transaction: {str(e)}"
    print(f"ERROR: {error_msg}")
    raise Exception(error_msg)
