import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Shield, FileText, Key, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ModelProvenanceUI() {
  const [activeTab, setActiveTab] = useState('train');
  
  // Training state
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetFilePath, setDatasetFilePath] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload');
  const [trainingResponse, setTrainingResponse] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  
  // Verification state
  const [verifyDatasetPath, setVerifyDatasetPath] = useState('');
  const [verifyDatasetFile, setVerifyDatasetFile] = useState(null);
  const [verifyMethod, setVerifyMethod] = useState('filepath');
  const [selectedModel, setSelectedModel] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCurrentPage, setVerifyCurrentPage] = useState(1);

  // Recent training requests
  const [recentRequests, setRecentRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const itemsPerPage = 10;

  React.useEffect(() => {
    fetchTrainingHistory();
  }, []);

  const fetchTrainingHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/training-history');
      if (response.ok) {
        const data = await response.json();
        setRecentRequests(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch training history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleTrain = async () => {
    const datasetSource = uploadMethod === 'upload' ? selectedFile?.name : datasetFilePath;
    
    if (!datasetSource) {
      alert('Please provide a dataset file or file path');
      return;
    }

    setIsTraining(true);
    
    try {
      const formData = new FormData();
      if (uploadMethod === 'upload' && selectedFile) {
        formData.append('dataset', selectedFile);
      } else {
        formData.append('datasetPath', datasetFilePath);
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/train', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setTrainingResponse(data);
      await fetchTrainingHistory();
      
    } catch (error) {
      console.error('Training error:', error);
      alert(`Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleVerifyFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVerifyDatasetFile(file);
    }
  };

  const handleVerify = async () => {
    const hasDataset = verifyMethod === 'upload' ? verifyDatasetFile : verifyDatasetPath;
    
    if (!hasDataset || !selectedModel) {
      alert('Please provide dataset and select a model from recent requests');
      return;
    }

    setIsVerifying(true);
    
    try {
      const formData = new FormData();
      
      if (verifyMethod === 'upload' && verifyDatasetFile) {
        formData.append('dataset', verifyDatasetFile);
      } else {
        formData.append('datasetPath', verifyDatasetPath);
      }
      
      formData.append('requestHash', selectedModel.requestHash);
      
      const response = await fetch('http://127.0.0.1:8000/api/verify', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setVerificationResult({
        isValid: data.isValid,
        requestHash: data.requestHash,
        message: data.message
      });
      
    } catch (error) {
      console.error('Verification error:', error);
      alert(`Verification failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const selectModelForVerification = (model) => {
    setSelectedModel(model);
    setVerifyDatasetPath('');
    setVerifyDatasetFile(null);
    setVerificationResult(null);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Model Provenance</h1>
        <p className="text-muted-foreground">
          Secure, verifiable model training with enclave attestation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('train')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'train'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Train Model
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'verify'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Verify Provenance
        </button>
      </div>

      {/* Training Tab */}
      {activeTab === 'train' && (
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-card border border-border/50 rounded-lg shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Dataset & Train
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Upload Method Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadMethod('upload')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    uploadMethod === 'upload'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod('filepath')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    uploadMethod === 'filepath'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  File Path
                </button>
              </div>

              <div className="space-y-4">
                {uploadMethod === 'upload' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select File</label>
                    <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="dataset-upload"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".csv,.json,.txt,.parquet"
                      />
                      <div className="text-center pointer-events-none">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">
                          {selectedFile ? selectedFile.name : 'Click to upload dataset'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports CSV, JSON, TXT, Parquet files
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dataset File Path</label>
                    <input
                      type="text"
                      value={datasetFilePath}
                      onChange={(e) => setDatasetFilePath(e.target.value)}
                      placeholder="e.g., /path/to/dataset.csv or s3://bucket/dataset.csv"
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <button
                  onClick={handleTrain}
                  disabled={(!selectedFile && !datasetFilePath) || isTraining}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {isTraining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      Training in Enclave...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Train Model in Secure Enclave
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Training Response */}
          {trainingResponse && (
            <div className="bg-accent/10 border border-accent rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-accent">
                <CheckCircle className="w-5 h-5" />
                Training Complete
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Model Weights</p>
                  <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                    {trainingResponse.modelWeights}
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Enclave Signature</p>
                  <code className="block bg-background px-3 py-2 rounded text-xs break-all">
                    {trainingResponse.signature}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Recent Requests */}
          {recentRequests.length > 0 && (
            <div className="bg-card border border-border/50 rounded-lg shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Training Requests
                </h3>
              </div>
              <div className="p-6">
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading history...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {recentRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Dataset</p>
                              <p className="font-medium">{request.datasetSource}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatTimestamp(request.timestamp)}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Weights: </span>
                              <code className="text-xs">{request.modelWeights}</code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Signature: </span>
                              <code className="text-xs">{request.signature}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {recentRequests.length > itemsPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {Math.ceil(recentRequests.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(recentRequests.length / itemsPerPage), prev + 1))}
                          disabled={currentPage === Math.ceil(recentRequests.length / itemsPerPage)}
                          className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === 'verify' && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-lg shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Verify Model Provenance
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Verification Result */}
              {verificationResult && (
                <div className={`rounded-lg p-6 border ${
                  verificationResult.isValid
                    ? 'bg-accent/10 border-accent'
                    : 'bg-destructive/10 border-destructive'
                }`}>
                  <div className="flex items-start gap-3">
                    {verificationResult.isValid ? (
                      <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        verificationResult.isValid ? 'text-accent' : 'text-destructive'
                      }`}>
                        {verificationResult.isValid ? 'Verification Passed' : 'Verification Failed'}
                      </h3>
                      <p className="text-sm">{verificationResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dataset Input Method Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVerifyMethod('filepath')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    verifyMethod === 'filepath'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  File Path
                </button>
                <button
                  onClick={() => setVerifyMethod('upload')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    verifyMethod === 'upload'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Upload File
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dataset to Verify</label>
                {verifyMethod === 'upload' ? (
                  <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="verify-dataset-upload"
                      onChange={handleVerifyFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".csv,.json,.txt,.parquet"
                    />
                    <div className="text-center pointer-events-none">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">
                        {verifyDatasetFile ? verifyDatasetFile.name : 'Click to upload dataset'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports CSV, JSON, TXT, Parquet files
                      </p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={verifyDatasetPath}
                    onChange={(e) => setVerifyDatasetPath(e.target.value)}
                    placeholder="Enter the dataset path used for training"
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                {selectedModel && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Expected: {selectedModel.datasetSource}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={(!verifyDatasetPath && !verifyDatasetFile) || !selectedModel || isVerifying}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify Provenance
                  </>
                )}
              </button>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Model from Recent Requests</label>
                {recentRequests.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {recentRequests.slice((verifyCurrentPage - 1) * itemsPerPage, verifyCurrentPage * itemsPerPage).map((request, index) => (
                        <button
                          key={index}
                          onClick={() => selectModelForVerification(request)}
                          className={`w-full text-left p-4 rounded-lg transition-all border-2 ${
                            selectedModel?.requestHash === request.requestHash
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/50 border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{request.modelWeights}</span>
                            <span className="text-xs text-muted-foreground">{formatTimestamp(request.timestamp)}</span>
                          </div>
                          {/* <div className="text-xs font-mono text-muted-foreground">
                            {request.modelWeights}
                          </div> */}
                        </button>
                      ))}
                    </div>
                    
                    {recentRequests.length > itemsPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button
                          onClick={() => setVerifyCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={verifyCurrentPage === 1}
                          className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-muted-foreground">
                          Page {verifyCurrentPage} of {Math.ceil(recentRequests.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => setVerifyCurrentPage(prev => Math.min(Math.ceil(recentRequests.length / itemsPerPage), prev + 1))}
                          disabled={verifyCurrentPage === Math.ceil(recentRequests.length / itemsPerPage)}
                          className="p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-muted/50 p-6 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No recent training requests. Train a model first!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}