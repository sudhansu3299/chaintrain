import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getModelById, getDatasetById, formatTimestamp } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Brain, Database, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ModelDetail() {
  const { id } = useParams();

  const { data: model, isLoading } = useQuery({
    queryKey: ["model", id],
    queryFn: () => getModelById(id!),
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

  if (!model) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Model Not Found</h1>
        <p className="text-muted-foreground mb-4">The model you're looking for doesn't exist.</p>
        <Link to="/models">
          <Button>Back to Models</Button>
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
        <Link to="/models">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-secondary/10 text-secondary">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{model.name}</h1>
              <p className="text-muted-foreground">Model ID: {model.id}</p>
            </div>
          </div>
          <StatusBadge verified={model.verified} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle>Model Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Model Hash</p>
              <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
                {model.hash}
              </code>
            </div>
            {model.blob_id && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Blob ID</p>
                <code className="block bg-muted px-3 py-2 rounded text-sm break-all">
                  {model.blob_id}
                </code>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Registered</span>
              <span className="font-medium text-sm">{formatTimestamp(model.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Training Datasets</span>
              <span className="font-medium">{model.dataset_ids.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Training Datasets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {model.dataset_ids.map((datasetId) => (
              <DatasetLink key={datasetId} datasetId={datasetId} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Model Lineage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-secondary" />
              </div>
              <p className="text-muted-foreground">Training lineage visualization</p>
              <p className="text-sm text-muted-foreground mt-2">
                This model was trained on {model.dataset_ids.length} verified dataset(s)
              </p>
              <Link to="/lineage">
                <Button variant="outline" className="mt-4">
                  View in Lineage Explorer
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DatasetLink({ datasetId }: { datasetId: string }) {
  const { data: dataset } = useQuery({
    queryKey: ["dataset", datasetId],
    queryFn: () => getDatasetById(datasetId),
  });

  if (!dataset) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg">
        <code className="text-sm">{datasetId}</code>
      </div>
    );
  }

  return (
    <Link to={`/datasets/${datasetId}`}>
      <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{dataset.name}</p>
            <code className="text-xs text-muted-foreground">{datasetId}</code>
          </div>
          <StatusBadge verified={dataset.verified} />
        </div>
      </div>
    </Link>
  );
}
