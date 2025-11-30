import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatBytes, addUploadedDataset } from "@/lib/api";
import { Dataset } from "@/lib/sui";
import { useQueryClient } from "@tanstack/react-query";
import {BACKEND_URL} from "@/config"

type UploadStep = "idle" | "chunking" | "uploading" | "merkle" | "proof" | "registering" | "complete";

const steps = [
  { id: "chunking", label: "Chunking file" },
  { id: "uploading", label: "Uploading to Walrus" },
  { id: "merkle", label: "Generating Merkle tree" },
  { id: "proof", label: "Generating zk-proof" },
  { id: "registering", label: "Registering on Sui" },
];

interface UploadResult {
  tx: string;
  dataset_id: string;
  blob_id: string;
  blob_object_id: string;
  merkle_root: string;
  chunks: number;
  file_size: number;
  storage: {
    id: string;
    start_epoch: number;
    end_epoch: number;
    storage_size: number;
  };
  registered_epoch: number;
  encoding_type: string;
  cost: number;
  encoded_length: number;
}

export default function UploadDataset() {
  const [currentStep, setCurrentStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [datasetName, setDatasetName] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (!datasetName) {
        setDatasetName(selectedFile.name.split(".")[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !datasetName) {
      toast({
        title: "Missing Information",
        description: "Please select a file and provide a dataset name.",
        variant: "destructive",
      });
      return;
    }

    // Start upload process
    setCurrentStep("chunking");
    setProgress(10);

    try {
      // Create FormData with the file
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress through steps while backend processes
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 2;
        });
      }, 500);

      // Cycle through steps to show activity
      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        stepIndex = (stepIndex + 1) % steps.length;
        setCurrentStep(steps[stepIndex].id as UploadStep);
      }, 2000);

      // Make the actual API call to backend
      const response = await fetch(`${BACKEND_URL}/upload-dataset`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);

      const result = await response.json();
      console.log("Result received from backend: ", result)

      if (result.success) {
        setCurrentStep("complete");
        setProgress(100);
        
        const uploadResultData: UploadResult = {
          tx: result.tx || "",
          dataset_id: result.dataset_id,
          blob_id: result.blob_id,
          blob_object_id: result.blob_object_id,
          merkle_root: result.merkle_root || "",
          chunks: result.chunks || 0,
          file_size: result.file_size,
          storage: result.storage,
          registered_epoch: result.registered_epoch,
          encoding_type: result.encoding_type,
          cost: result.cost,
          encoded_length: result.encoded_length,
        };
        
        setUploadResult(uploadResultData);
        
        // Create Dataset object and save to localStorage
        const dataset: Dataset = {
          id: result.dataset_id,
          blob_id: result.blob_id,
          merkle_root: result.merkle_root || `0x${result.dataset_id}`,
          name: datasetName || fileName.split(".")[0] || "Untitled Dataset",
          size: result.file_size,
          chunks: result.chunks || Math.ceil(result.file_size / (1024 * 1024)), // Estimate chunks if not provided
          verified: true, // Mark as verified since upload succeeded
          timestamp: Date.now(),
          filename: result.filename
        };
        
        // Save to localStorage
        addUploadedDataset(dataset);
        
        // Invalidate and refetch datasets query to update the list
        queryClient.invalidateQueries({ queryKey: ["datasets"] });
        
        toast({
          title: "Upload Complete!",
          description: `Your dataset has been successfully uploaded and verified.`,
        });
      } else {
        setCurrentStep("idle");
        setProgress(0);
        toast({
          title: "Upload Failed",
          description: result.error || "An error occurred during upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setCurrentStep("idle");
      setProgress(0);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to connect to backend server.",
        variant: "destructive",
      });
    }
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (currentStep === "complete") return "complete";
    if (currentStep === "idle") return "pending";
    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Upload Dataset</h1>
        <p className="text-muted-foreground">
          Upload and verify your AI training dataset with blockchain-backed proof
        </p>
      </motion.div>

      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Dataset Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="datasetName">Dataset Name</Label>
            <Input
              id="datasetName"
              placeholder="Enter dataset name..."
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              disabled={currentStep !== "idle" && currentStep !== "complete"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                disabled={currentStep !== "idle" && currentStep !== "complete"}
                className="cursor-pointer"
              />
            </div>
            {fileName && (
              <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
            )}
          </div>

          {currentStep === "idle" && (
            <Button onClick={handleUpload} className="w-full" size="lg">
              <Upload className="h-5 w-5 mr-2" />
              Start Upload
            </Button>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {currentStep !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="card-gradient border-border/50">
              <CardHeader>
                <CardTitle>Upload Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={progress} className="h-2" />
                
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-all
                          ${status === "complete" ? "bg-accent text-accent-foreground" : ""}
                          ${status === "active" ? "bg-primary text-primary-foreground animate-pulse-glow" : ""}
                          ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                        `}>
                          {status === "complete" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : status === "active" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <span className={`
                          transition-colors
                          ${status === "complete" ? "text-accent" : ""}
                          ${status === "active" ? "text-primary font-medium" : ""}
                          ${status === "pending" ? "text-muted-foreground" : ""}
                        `}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {currentStep === "complete" && uploadResult && (
                  <div className="pt-4 border-t border-border">
                    <div className="bg-accent/10 border border-accent/50 rounded-lg p-4 mb-4 space-y-4">
                      <p className="text-accent font-medium flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Dataset uploaded and verified successfully!
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Blob ID</p>
                          <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                            {uploadResult.blob_id}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Blob Object ID</p>
                          <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                            {uploadResult.blob_object_id || "N/A"}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Merkle Root</p>
                          <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                            0x{uploadResult.merkle_root}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Transaction Digest</p>
                          <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                            {uploadResult.tx}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Storage ID</p>
                          <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                            {uploadResult.storage.id || "N/A"}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Storage Size</p>
                          <p className="text-foreground">
                            {formatBytes(uploadResult.storage.storage_size || uploadResult.file_size)}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Chunks</p>
                          <p className="text-foreground">{uploadResult.chunks}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Encoding Type</p>
                          <p className="text-foreground">{uploadResult.encoding_type || "N/A"}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Registered Epoch</p>
                          <p className="text-foreground">{uploadResult.registered_epoch}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-medium">Storage Epoch Range</p>
                          <p className="text-foreground">
                            {uploadResult.storage.start_epoch} - {uploadResult.storage.end_epoch}
                          </p>
                        </div>
                        
                        {uploadResult.cost > 0 && (
                          <div className="space-y-2">
                            <p className="text-muted-foreground font-medium">Cost</p>
                            <p className="text-foreground">{uploadResult.cost.toLocaleString()} MIST</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => window.location.href = "/datasets"}>
                      View Dataset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
