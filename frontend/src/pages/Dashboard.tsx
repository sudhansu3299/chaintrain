import { useQuery } from "@tanstack/react-query";
import { Database, Brain, Shield, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { DatasetCard } from "@/components/DatasetCard";
import { getDatasets, getModels, getProofs } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: datasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets,
  });

  const { data: models } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  const { data: proofs } = useQuery({
    queryKey: ["proofs"],
    queryFn: getProofs,
  });

  const verifiedDatasets = datasets?.filter((d) => d.verified).length || 0;
  const verifiedModels = models?.filter((m) => m.verified).length || 0;
  const verifiedProofs = proofs?.filter((p) => p.verified).length || 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your verifiable AI datasets, models, and proofs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Datasets"
          value={datasets?.length || 0}
          icon={<Database className="h-6 w-6" />}
          trend="+12%"
          index={0}
        />
        <StatsCard
          title="Verified Datasets"
          value={verifiedDatasets}
          icon={<Shield className="h-6 w-6" />}
          trend="+8%"
          index={1}
        />
        <StatsCard
          title="Models Registered"
          value={models?.length || 0}
          icon={<Brain className="h-6 w-6" />}
          trend="+15%"
          index={2}
        />
        <StatsCard
          title="Proofs Generated"
          value={proofs?.length || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          trend="+20%"
          index={3}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Datasets</h2>
        </div>

        {datasetsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets?.slice(0, 3).map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
