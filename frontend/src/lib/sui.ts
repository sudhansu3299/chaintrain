import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export const PACKAGE_ID = "0x..."; // Replace with actual package ID

export interface Dataset {
  id: string;
  blob_id: string;
  merkle_root: string;
  name: string;
  size: number;
  chunks: number;
  verified: boolean;
  timestamp: number;
  proof_id?: string;
  filename: string;
}

export interface Model {
  id: string;
  hash: string;
  name: string;
  dataset_ids: string[];
  verified: boolean;
  timestamp: number;
  blob_id?: string;
}

export interface ZkProof {
  id: string;
  dataset_id?: string;
  model_id?: string;
  proof_data: string;
  verified: boolean;
  timestamp: number;
  nautilus_proof_url?: string;
}
