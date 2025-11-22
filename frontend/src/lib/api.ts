import { Dataset, Model, ZkProof, suiClient } from "./sui";

// Mock data for development
const mockDatasets: Dataset[] = [
  {
    id: "ds-001",
    blob_id: "walrus-blob-123abc",
    merkle_root: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    name: "ImageNet Training Set v1",
    size: 145000000000,
    chunks: 1450,
    verified: true,
    timestamp: Date.now() - 86400000 * 5,
    proof_id: "proof-001",
    filename: "Imagenet.csv"
  },
  {
    id: "ds-002",
    blob_id: "walrus-blob-456def",
    merkle_root: "0x3d3c1d8e7f9a2b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d",
    name: "Medical Imaging Dataset",
    size: 89000000000,
    chunks: 890,
    verified: true,
    timestamp: Date.now() - 86400000 * 3,
    proof_id: "proof-002",
    filename: "medical_imaging.csv"
  },
  {
    id: "ds-003",
    blob_id: "walrus-blob-789ghi",
    merkle_root: "0x9f2c8b1a5d7e3c6f4a9b2d1e8c5f3a7b6d4e9c2f1a8b5d7e3c6f4a9b2d1e8c5f",
    name: "Autonomous Vehicle Dataset",
    size: 234000000000,
    chunks: 2340,
    verified: false,
    timestamp: Date.now() - 86400000 * 1,
    filename: "Vehicle_dataset.txt"
  },
];

const mockModels: Model[] = [
  {
    id: "model-001",
    hash: "0xa7c5d3f1e9b2c4a6d8e0f2b4c6d8e0f2b4c6d8e0f2b4c6d8e0f2b4c6d8e0f2b4",
    name: "ResNet-50 Fine-tuned",
    dataset_ids: ["ds-001"],
    verified: true,
    timestamp: Date.now() - 86400000 * 2,
    blob_id: "walrus-model-abc123",
  },
  {
    id: "model-002",
    hash: "0xb8d6e4f2a0c3b5d7e9f1a3c5d7e9f1a3c5d7e9f1a3c5d7e9f1a3c5d7e9f1a3c5",
    name: "Medical Diagnosis CNN",
    dataset_ids: ["ds-002"],
    verified: true,
    timestamp: Date.now() - 86400000 * 1,
    blob_id: "walrus-model-def456",
  },
];

const mockProofs: ZkProof[] = [
  {
    id: "proof-001",
    dataset_id: "ds-001",
    proof_data: "nautilus_proof_v1_compressed_data...",
    verified: true,
    timestamp: Date.now() - 86400000 * 5,
    nautilus_proof_url: "https://nautilus.com/proof/001",
  },
  {
    id: "proof-002",
    dataset_id: "ds-002",
    proof_data: "nautilus_proof_v1_compressed_data...",
    verified: true,
    timestamp: Date.now() - 86400000 * 3,
    nautilus_proof_url: "https://nautilus.com/proof/002",
  },
  {
    id: "proof-003",
    model_id: "model-001",
    proof_data: "nautilus_proof_v1_compressed_data...",
    verified: true,
    timestamp: Date.now() - 86400000 * 2,
    nautilus_proof_url: "https://nautilus.com/proof/003",
  },
];

// LocalStorage key for storing uploaded datasets
const STORAGE_KEY = "chaintrain_uploaded_datasets";

// Helper functions for localStorage
function getStoredDatasets(): Dataset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading stored datasets:", error);
  }
  return [];
}

function saveDataset(dataset: Dataset): void {
  try {
    const stored = getStoredDatasets();
    // Check if dataset already exists (by id)
    const existingIndex = stored.findIndex((d) => d.id === dataset.id);
    if (existingIndex >= 0) {
      stored[existingIndex] = dataset; // Update existing
    } else {
      stored.push(dataset); // Add new
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error("Error saving dataset:", error);
  }
}

export function addUploadedDataset(dataset: Dataset): void {
  saveDataset(dataset);
}

export async function getDatasets(): Promise<Dataset[]> {
  // Get stored datasets from localStorage
  const storedDatasets = getStoredDatasets();
  
  // Merge with mock datasets, avoiding duplicates
  const allDatasets = [...mockDatasets];
  storedDatasets.forEach((stored) => {
    if (!allDatasets.find((d) => d.id === stored.id)) {
      allDatasets.push(stored);
    }
  });
  
  // Sort by timestamp (newest first)
  allDatasets.sort((a, b) => b.timestamp - a.timestamp);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(allDatasets), 500);
  });
}

export async function getDatasetById(id: string): Promise<Dataset | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check mock datasets first
      let dataset = mockDatasets.find((d) => d.id === id);
      
      // If not found, check stored datasets
      if (!dataset) {
        const storedDatasets = getStoredDatasets();
        dataset = storedDatasets.find((d) => d.id === id) || null;
      }
      
      resolve(dataset);
    }, 300);
  });
}

export async function getModels(): Promise<Model[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockModels), 500);
  });
}

export async function getModelById(id: string): Promise<Model | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const model = mockModels.find((m) => m.id === id);
      resolve(model || null);
    }, 300);
  });
}

export async function getProofs(): Promise<ZkProof[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProofs), 500);
  });
}

export async function getProofById(id: string): Promise<ZkProof | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const proof = mockProofs.find((p) => p.id === id);
      resolve(proof || null);
    }, 300);
  });
}

export async function verifyProofOnChain(proofId: string): Promise<boolean> {
  // TODO: Call Sui smart contract verification
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
