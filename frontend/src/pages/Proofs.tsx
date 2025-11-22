import { useQuery } from "@tanstack/react-query";
import { getProofs } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/lib/api";
import { motion } from "framer-motion";

export default function Proofs() {
  const { data: proofs, isLoading } = useQuery({
    queryKey: ["proofs"],
    queryFn: getProofs,
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Proof Explorer</h1>
        <p className="text-muted-foreground">
          View all zk-proofs for datasets and models
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proofs?.map((proof) => (
            <Card key={proof.id} className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Proof {proof.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {proof.dataset_id ? "Dataset Proof" : "Model Proof"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge verified={proof.verified} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proof.dataset_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dataset ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {proof.dataset_id}
                      </code>
                    </div>
                  )}
                  {proof.model_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Model ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {proof.model_id}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generated:</span>
                    <span className="text-xs">{formatTimestamp(proof.timestamp)}</span>
                  </div>
                  {proof.nautilus_proof_url && (
                    <a href={proof.nautilus_proof_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full mt-4">
                        View Nautilus Proof
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
