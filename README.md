# ChainTrain — Verifiable Dataset & Model Lineage on Sui

ChainTrain is a full-stack framework that enables verifiable dataset and model lineage using the Sui blockchain, Walrus distributed storage, and Nautilus zero-knowledge proofs.

### Problem
- Today, AI models are built on datasets we cannot verify.

- We don’t know whether the dataset used for training has been tampered with.

- We cannot prove if the published model was actually trained on the dataset the creator claims.

- There is no transparent lineage showing how datasets and models evolve over time.

This creates huge risks in safety, governance, compliance, and trust.
The world is moving toward regulation and auditability, but AI data pipelines are still opaque and unverifiable.

In short, 
*ChainTrain makes AI datasets and models provably trustworthy.*

***We ensure that what you train is what you claim — and what you publish is what you actually trained.***

*Core Verifiable Infrastructure:*

. Dataset Registry Module
. Merkle tree hashing
. Walrus upload & download
. Off-chain → on-chain submission flow
. Simple lineage tracking
. zk-proof generation via Nautilus
. Proof submission to Sui
. On-chain full verification
. zk-circuit enhancements

*UI & Governance:*

. Dataset explorer
. Lineage viewer
. Models dashboard
. Governance

## Architecture: <br>
<img width="510" height="483" alt="image" src="https://github.com/user-attachments/assets/7dcc7111-d69c-45a3-9a5e-776d96c19762" />

# Flow
- User uploads/downloads datasets through ChainTrain.

- ChainTrain backend:
  - Computes Merkle root for dataset integrity.
  - Uploads dataset to Walrus → receives blobId.
  - Generates a zk-proof (Nautilus) for dataset correctness.

- ChainTrain commits metadata to Sui blockchain:
  - Merkle root
  - Walrus blobId
  - zk-proof reference
  - Lineage (parent dataset/model)

- User triggers model training:
  - Training algorithm is committed to GitHub.
  - Training code is deployed to a secure enclave (Nautilus on AWS).
  - Enclave downloads dataset from Walrus.
  - Enclave performs /process_data and trains the LLM.

- Training enclave returns:
  - Trained model
  - Certification/proof artifact

- ChainTrain registers trained model on Sui:
  - Links it to dataset version (lineage)
  - Stores proof metadata


- Frontend displays:
  - Dataset lineage
  - Model lineage
  - Governance


#### Model provenance: <br>
<img width="564" height="373" alt="image" src="https://github.com/user-attachments/assets/e1780725-8d5e-466b-88ec-5b6ea9cdb956" />

#### Data provenance: <br>
<img width="329" height="374" alt="image" src="https://github.com/user-attachments/assets/cbd865fc-55cc-477c-b418-22f068612ecb" />


## How to run this locally:

### Backend
``` bash
cd backend/dataset_registry/offchain
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload
```
### Frontend
``` bash
cd frontend
npm install
npm run dev
```


License

MIT License.
