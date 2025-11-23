import { useQuery } from "@tanstack/react-query";
import { getDatasets, formatBytes, formatTimestamp } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { Dataset } from "@/lib/sui";

const columns: ColumnDef<Dataset>[] = [
  {
    accessorKey: "name",
    header: "Dataset Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "id",
    header: "Dataset ID",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-2 py-1 rounded">{row.original.id}</code>
    ),
  },
  {
    accessorKey: "blob_id",
    header: "Blob ID",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-2 py-1 rounded">
        {row.original.blob_id.slice(0, 12)}...
      </code>
    ),
  },
  {
    accessorKey: "merkle_root",
    header: "Merkle Root",
    cell: ({ row }) => {
      const merkleRoot = row.original.merkle_root || "";
      return (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {merkleRoot ? `${merkleRoot.slice(0, 10)}...` : "N/A"}
        </code>
      );
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => formatBytes(row.original.size),
  },
  {
    accessorKey: "verified",
    header: "Status",
    cell: ({ row }) => <StatusBadge verified={row.original.verified} />,
  },
  {
    accessorKey: "timestamp",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm">{formatTimestamp(row.original.timestamp)}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link to={`/datasets/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];

export default function Datasets() {
  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets,
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Datasets</h1>
        <p className="text-muted-foreground">
          Browse and manage your verified AI training datasets
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={datasets}
          searchKey="name"
          searchPlaceholder="Search datasets by name..."
        />
      )}
    </div>
  );
}
