import { useQuery } from "@tanstack/react-query";
import { getDatasets, getModels, getProofs } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Governance() {
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

  const verifiedDatasets = datasets.filter((d) => d.verified).length;
  const verifiedModels = models.filter((m) => m.verified).length;
  const verifiedProofs = proofs.filter((p) => p.verified).length;

  const complianceData = [
    { name: "Verified", value: verifiedDatasets, color: "hsl(var(--accent))" },
    { name: "Unverified", value: datasets.length - verifiedDatasets, color: "hsl(var(--destructive))" },
  ];

  const overviewData = [
    { name: "Datasets", verified: verifiedDatasets, total: datasets.length },
    { name: "Models", verified: verifiedModels, total: models.length },
    { name: "Proofs", verified: verifiedProofs, total: proofs.length },
  ];

  const complianceScore = Math.round(
    ((verifiedDatasets + verifiedModels + verifiedProofs) /
      (datasets.length + models.length + proofs.length)) *
      100
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Governance Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor compliance and governance rules
        </p>
      </motion.div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-6xl font-bold gradient-text mb-2">{complianceScore}%</div>
              <p className="text-muted-foreground">System Compliance Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle>Dataset Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle>Verification Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="verified" fill="hsl(var(--accent))" name="Verified" />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-accent" />
              Compliance Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                <span className="text-sm font-medium">All Datasets Verified</span>
                <span className="text-accent text-sm">{verifiedDatasets}/{datasets.length} Passed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                <span className="text-sm font-medium">Models Have Lineage</span>
                <span className="text-accent text-sm">{verifiedModels}/{models.length} Passed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                <span className="text-sm font-medium">Proofs Valid</span>
                <span className="text-accent text-sm">{verifiedProofs}/{proofs.length} Passed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {datasets.filter((d) => !d.verified).map((dataset) => (
                <div key={dataset.id} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-destructive mb-1">Dataset {dataset.id}</p>
                  <p className="text-xs text-muted-foreground">Pending verification - no proof generated yet</p>
                </div>
              ))}
              {datasets.filter((d) => !d.verified).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  ✓ No issues detected - all datasets and models are compliant
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Governance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              Flag Dataset
            </Button>
            <Button variant="outline" className="w-full">
              Request Review
            </Button>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
