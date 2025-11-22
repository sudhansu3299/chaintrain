import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProofById, formatTimestamp } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Shield, ExternalLink, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ProofDetail() {
  const { id } = useParams();

  const { data: proof, isLoading } = useQuery({
    queryKey: ["proof", id],
    queryFn: () => getProofById(id!),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Proof Not Found</h1>
        <p className="text-muted-foreground mb-4">The proof you're looking for doesn't exist.</p>
        <Link to="/proofs">
          <Button>Back to Proofs</Button>
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
        <Link to="/proofs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proofs
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-accent/10 text-accent">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Proof {proof.id}</h1>
              <p className="text-muted-foreground">
                {proof.dataset_id ? "Dataset Verification Proof" : "Model Training Proof"}
              </p>
            </div>
          </div>
          <StatusBadge verified={proof.verified} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle>Proof Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Proof ID</p>
              <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
                {proof.id}
              </code>
            </div>
            {proof.dataset_id && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Dataset ID</p>
                <Link to={`/datasets/${proof.dataset_id}`}>
                  <code className="block bg-muted px-3 py-2 rounded text-sm break-all hover:bg-muted/70 transition-colors cursor-pointer">
                    {proof.dataset_id}
                  </code>
                </Link>
              </div>
            )}
            {proof.model_id && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Model ID</p>
                <Link to={`/models/${proof.model_id}`}>
                  <code className="block bg-muted px-3 py-2 rounded text-sm break-all hover:bg-muted/70 transition-colors cursor-pointer">
                    {proof.model_id}
                  </code>
                </Link>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Generated</span>
              <span className="font-medium text-sm">{formatTimestamp(proof.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Verification Status</span>
              <StatusBadge verified={proof.verified} />
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle>Nautilus zk-Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Proof Data (Compressed)</p>
              <code className="block bg-muted px-3 py-2 rounded text-xs break-all max-h-32 overflow-y-auto">
                {proof.proof_data}
              </code>
            </div>
            {proof.nautilus_proof_url && (
              <a href={proof.nautilus_proof_url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" variant="outline">
                  View Full Proof on Nautilus
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>On-Chain Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proof.verified ? (
              <div className="bg-accent/10 border border-accent/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-accent" />
                  <div>
                    <h3 className="font-bold text-accent">Proof Verified Successfully</h3>
                    <p className="text-sm text-muted-foreground">
                      This proof has been verified on the Sui blockchain
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Verification Details:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>zk-Proof validated using Nautilus verification algorithm</li>
                    <li>On-chain verification completed on Sui testnet</li>
                    <li>Proof permanently stored in blockchain state</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">Verification pending or failed</p>
                <Button variant="outline" className="mt-4">
                  Re-verify Proof
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
