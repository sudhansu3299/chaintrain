import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Database, ExternalLink } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Dataset } from "@/lib/sui";
import { formatBytes, formatTimestamp } from "@/lib/api";
import { Link } from "react-router-dom";

interface DatasetCardProps {
  dataset: Dataset;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Card className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {dataset.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {dataset.chunks} chunks • {formatBytes(dataset.size)}
              </p>
            </div>
          </div>
          <StatusBadge verified={dataset.verified} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Blob ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{dataset.blob_id}</code>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Merkle Root:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {dataset.merkle_root.slice(0, 10)}...
            </code>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span className="text-xs">{formatTimestamp(dataset.timestamp)}</span>
          </div>
          <Link to={`/datasets/${dataset.id}`} className="block mt-4">
            <Button variant="outline" className="w-full group-hover:bg-primary/10 group-hover:border-primary/50">
              View Details
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
