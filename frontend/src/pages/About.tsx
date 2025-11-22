import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Shield, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">About</h1>
        <p className="text-muted-foreground">
          Learn how our verifiable AI system works
        </p>
      </motion.div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">System Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Our Verifiable AI System combines three powerful technologies to ensure complete
            transparency and verifiability of AI training datasets and models:
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary h-fit">
                <Database className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Sui Blockchain</h3>
                <p className="text-muted-foreground">
                  Provides the decentralized registry for datasets and models. Smart contracts
                  ensure immutable records and enable on-chain verification of proofs.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary h-fit">
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Walrus Storage</h3>
                <p className="text-muted-foreground">
                  Decentralized storage network that hosts the actual dataset files. Large files
                  are chunked and distributed across the network with content-addressable storage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-accent/10 text-accent h-fit">
                <GitBranch className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Nautilus zk-Proofs</h3>
                <p className="text-muted-foreground">
                  Generates zero-knowledge proofs that verify dataset integrity and model training
                  lineage without revealing sensitive data. These proofs are verified on-chain.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>The Verification Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
            <li>Dataset is chunked and uploaded to Walrus storage</li>
            <li>A Merkle tree is generated from the chunks for integrity verification</li>
            <li>Nautilus generates a zk-proof of the dataset structure and content</li>
            <li>The proof is verified on-chain via Sui smart contracts</li>
            <li>Dataset metadata, blob ID, and Merkle root are registered on Sui</li>
            <li>Models trained on verified datasets maintain their lineage proof</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Why This Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Transparency:</strong> Anyone can verify the provenance of AI models</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Compliance:</strong> Regulatory requirements for AI can be met with cryptographic proof</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Trust:</strong> Eliminate uncertainty about training data quality and sources</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Immutability:</strong> Once verified, records cannot be tampered with</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
