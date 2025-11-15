import subprocess
from config import SUI_PACKAGE_ID

def register_dataset(dataset_id, blob_id, merkle_root, zk_proof):
  subprocess.run([
    "sui", "client", "call",
    "--package", SUI_PACKAGE_ID,
    "--module", "dataset_registry",
    "--function", "register_dataset",
    "--args",
    f"0x{dataset_id.hex()}",
    f"0x{blob_id.encode().hex()}",
    f"0x{merkle_root.hex()}",
    f"0x{zk_proof.hex()}",
    f"0x{b'nautilus-dummy'.hex()}",
    "--gas-budget", "20000000"
  ])
