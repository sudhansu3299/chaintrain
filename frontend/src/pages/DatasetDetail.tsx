import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDatasetById, getProofById, formatBytes, formatTimestamp } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Download, ExternalLink, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function DatasetDetail() {
  const { id } = useParams();

  const { data: dataset, isLoading } = useQuery({
    queryKey: ["dataset", id],
    queryFn: () => getDatasetById(id!),
  });

  const { data: proof } = useQuery({
    queryKey: ["proof", dataset?.proof_id],
    queryFn: () => dataset?.proof_id ? getProofById(dataset.proof_id) : null,
    enabled: !!dataset?.proof_id,
  });

  const downloadDataset = async (blobId: string) => {
  try {
    // const blobId = "dyTuyMWuRFppX812a6n1ccCtnhhO2wgq51n2UYTZ4IY"; // replace or pass dynamically

    const res = await fetch(
      `${BACKEND_URL}/download-dataset?blob_id=${blobId}`
    );

    if (!res.ok) {
      throw new Error("Failed to download dataset");
    }

    const contentDisposition =
    res.headers.get("Content-Disposition") ||
    res.headers.get("content-disposition") ||
    "";

    console.log("Content-Disposition header:", contentDisposition);

    // 1. Extract filename from Content-Disposition header
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `${blobId}.bin`;

    // 2. Convert response to Blob
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // 3. Trigger download with correct filename
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;  // uses real filename from server
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Could not download dataset.");
  }
};


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Dataset Not Found</h1>
        <p className="text-muted-foreground mb-4">The dataset you're looking for doesn't exist.</p>
        <Link to="/datasets">
          <Button>Back to Datasets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/datasets">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{dataset.name}</h1>
            <p className="text-muted-foreground">Dataset ID: {dataset.id}</p>
          </div>
          <StatusBadge verified={dataset.verified} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle>Dataset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Blob ID</p>
              <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
                {dataset.blob_id}
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Merkle Root</p>
              <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
                {dataset.merkle_root}
              </code>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="font-medium">{formatBytes(dataset.size)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Chunks</span>
              <span className="font-medium">{dataset.chunks}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="font-medium text-sm">{formatTimestamp(dataset.timestamp)}</span>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => downloadDataset(dataset.blob_id)}>
              <Download className="h-4 w-4 mr-2" />
              Download Dataset
            </Button>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proof ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Proof ID</p>
                  <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
                    {proof.id}
                  </code>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge verified={proof.verified} />
                </div>
                <div className="flex justify-between items-center py-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Verified On</span>
                  <span className="font-medium text-sm">{formatTimestamp(proof.timestamp)}</span>
                </div>
                {proof.nautilus_proof_url && (
                  <a href={proof.nautilus_proof_url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full mt-4" variant="outline">
                      View Nautilus Proof
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No proof available for this dataset</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Merkle Tree Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Merkle tree visualization coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                Root: {dataset.merkle_root.slice(0, 20)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
