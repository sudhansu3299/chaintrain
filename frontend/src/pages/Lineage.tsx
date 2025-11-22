import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDatasets, getModels, getProofs } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Database, Brain, Shield } from "lucide-react";

const nodeTypes = {
  dataset: DatasetNode,
  model: ModelNode,
  proof: ProofNode,
};

function DatasetNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 bg-card border-2 border-primary rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-primary" />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">Dataset</div>
        </div>
      </div>
    </div>
  );
}

function ModelNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 bg-card border-2 border-secondary rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-secondary" />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">Model</div>
        </div>
      </div>
    </div>
  );
}

function ProofNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 bg-card border-2 border-accent rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-accent" />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">Proof</div>
        </div>
      </div>
    </div>
  );
}

export default function Lineage() {
  const navigate = useNavigate();
  
  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets,
  });

  const { data: models = [] } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  const { data: proofs = [] } = useQuery({
    queryKey: ["proofs"],
    queryFn: getProofs,
  });

  // Build nodes and edges from data
  const initialNodes: Node[] = [
    ...datasets.map((ds, i) => ({
      id: `dataset-${ds.id}`,
      type: "dataset",
      position: { x: 100, y: i * 150 },
      data: { label: ds.name, id: ds.id },
    })),
    ...models.map((model, i) => ({
      id: `model-${model.id}`,
      type: "model",
      position: { x: 400, y: i * 150 + 50 },
      data: { label: model.name, id: model.id },
    })),
    ...proofs.map((proof, i) => ({
      id: `proof-${proof.id}`,
      type: "proof",
      position: { x: 700, y: i * 150 + 25 },
      data: { label: proof.id, id: proof.id },
    })),
  ];

  const initialEdges: Edge[] = [
    // Dataset to Model connections
    ...models.flatMap((model) =>
      model.dataset_ids.map((dsId) => ({
        id: `edge-${dsId}-${model.id}`,
        source: `dataset-${dsId}`,
        target: `model-${model.id}`,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }))
    ),
    // Dataset/Model to Proof connections
    ...proofs.map((proof) => {
      if (proof.dataset_id) {
        return {
          id: `edge-${proof.dataset_id}-${proof.id}`,
          source: `dataset-${proof.dataset_id}`,
          target: `proof-${proof.id}`,
          animated: true,
          style: { stroke: "hsl(var(--accent))" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "hsl(var(--accent))",
          },
        };
      } else if (proof.model_id) {
        return {
          id: `edge-${proof.model_id}-${proof.id}`,
          source: `model-${proof.model_id}`,
          target: `proof-${proof.id}`,
          animated: true,
          style: { stroke: "hsl(var(--accent))" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "hsl(var(--accent))",
          },
        };
      }
      return null;
    }).filter(Boolean) as Edge[],
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const [type, id] = node.id.split("-");
      if (type === "dataset") navigate(`/datasets/${id}`);
      else if (type === "model") navigate(`/models/${id}`);
      else if (type === "proof") navigate(`/proofs/${id}`);
    },
    [navigate]
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Lineage Explorer</h1>
        <p className="text-muted-foreground">
          Visualize the complete lineage from datasets to models and proofs
        </p>
      </motion.div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Interactive Lineage Graph</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] bg-muted/20 rounded-b-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="rounded-b-lg"
            >
              <Background />
              <Controls />
              <MiniMap nodeColor={(node) => {
                if (node.type === "dataset") return "hsl(var(--primary))";
                if (node.type === "model") return "hsl(var(--secondary))";
                return "hsl(var(--accent))";
              }} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="card-gradient border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold">{datasets.length}</p>
                <p className="text-sm text-muted-foreground">Datasets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-secondary/10">
                <Brain className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="font-bold">{models.length}</p>
                <p className="text-sm text-muted-foreground">Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-bold">{proofs.length}</p>
                <p className="text-sm text-muted-foreground">Proofs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
