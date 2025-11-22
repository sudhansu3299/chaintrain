import { useQuery } from "@tanstack/react-query";
import { getModels } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/lib/api";
import { motion } from "framer-motion";

export default function Models() {
  const { data: models, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Model Registry</h1>
        <p className="text-muted-foreground">
          Browse AI models with verified training lineage
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
          {models?.map((model) => (
            <Card key={model.id} className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {model.dataset_ids.length} dataset(s)
                      </p>
                    </div>
                  </div>
                  <StatusBadge verified={model.verified} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Model Hash:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {model.hash.slice(0, 12)}...
                    </code>
                  </div>
                  {model.blob_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Blob ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {model.blob_id}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="text-xs">{formatTimestamp(model.timestamp)}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Details
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
