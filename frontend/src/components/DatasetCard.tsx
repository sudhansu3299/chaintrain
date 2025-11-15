import React from "react";

export interface DatasetCardProps {
  datasetId: string;
  blobId: string;
  merkleRoot: string;
  createdAt: string;
}

export default function DatasetCard(props: DatasetCardProps) {
  return (
      <div className="dataset-card">
        <h3>Dataset {props.datasetId}</h3>

        <p><strong>Walrus Blob:</strong> {props.blobId}</p>
        <p><strong>Merkle Root:</strong> {props.merkleRoot}</p>
        <p><strong>Created:</strong> {props.createdAt}</p>
      </div>
  );
}
