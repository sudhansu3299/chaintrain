import { sui } from "./sui";

export async function getDatasets() {
  // TODO: Replace with Sui event query once your contract is deployed

  // Temporary mock data
  return [
    {
      datasetId: "0x1234",
      blobId: "walrus-blob-5678",
      merkleRoot: "0xabcd",
      createdAt: "2024-01-01",
    },
  ];
}
