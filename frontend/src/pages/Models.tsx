import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Shield, FileText, Key, Hash, Clock, Download } from 'lucide-react';

export default function ModelProvenanceUI() {
  const [activeTab, setActiveTab] = useState('train');
  
  // Training state
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetFilePath, setDatasetFilePath] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'filepath'
  const [trainingResponse, setTrainingResponse] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  
  // Verification state
  const [verifyDatasetPath, setVerifyDatasetPath] = useState('');
  const [verifyDatasetFile, setVerifyDatasetFile] = useState(null);
  const [verifyMethod, setVerifyMethod] = useState('filepath'); // 'filepath' or 'upload'
  const [selectedModel, setSelectedModel] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCurrentPage, setVerifyCurrentPage] = useState(1);

  // Recent training requests
  const [recentRequests, setRecentRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const itemsPerPage = 10;

  // Load training history on mount
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
      
      // Call backend API
      const response = await fetch('http://127.0.0.1:8000/api/train', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setTrainingResponse(data);
      
      // Refresh training history from backend
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
      
      // Call backend verification API
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold">Model Provenance</h1>
          </div>
          <p className="text-slate-400 text-lg">Secure, verifiable model training with enclave attestation</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('train')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'train'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Train Model
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'verify'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Verify Provenance
          </button>
        </div>

        {/* Training Tab */}
        {activeTab === 'train' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-blue-400" />
                Upload Dataset & Train
              </h2>
              
              {/* Upload Method Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setUploadMethod('upload')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    uploadMethod === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod('filepath')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    uploadMethod === 'filepath'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  File Path
                </button>
              </div>

              <div className="space-y-4">
                {uploadMethod === 'upload' ? (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="dataset-upload"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".csv,.json,.txt,.parquet"
                    />
                    <label htmlFor="dataset-upload" className="cursor-pointer">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                      <p className="text-base mb-1">
                        {selectedFile ? selectedFile.name : 'Click to upload dataset'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Supports CSV, JSON, TXT, Parquet files
                      </p>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">
                      Dataset File Path
                    </label>
                    <input
                      type="text"
                      value={datasetFilePath}
                      onChange={(e) => setDatasetFilePath(e.target.value)}
                      placeholder="e.g., /path/to/dataset.csv or s3://bucket/dataset.csv"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <button
                  onClick={handleTrain}
                  disabled={(!selectedFile && !datasetFilePath) || isTraining}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isTraining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Training in Enclave...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Train Model in Secure Enclave
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Training Response */}
            {trainingResponse && (
              <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center text-green-400">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Training Complete
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 mr-2 mt-1 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-400 mb-1">Model Weights</p>
                        <p className="font-mono text-sm break-all">{trainingResponse.modelWeights}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Key className="w-5 h-5 mr-2 mt-1 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-400 mb-1">Enclave Signature</p>
                        <p className="font-mono text-sm break-all">{trainingResponse.signature}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Requests */}
            {recentRequests.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-400" />
                  Recent Training Requests
                </h3>
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading history...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {recentRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-slate-400">Dataset</p>
                              <p className="font-medium text-white">{request.datasetSource}</p>
                            </div>
                            <span className="text-xs text-slate-400">{formatTimestamp(request.timestamp)}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <span className="text-slate-400">Weights: </span>
                              <span className="font-mono text-xs text-purple-300">{request.modelWeights}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Signature: </span>
                              <span className="font-mono text-xs text-amber-300">{request.signature}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {recentRequests.length > itemsPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                        >
                          Previous
                        </button>
                        <span className="text-slate-400 text-sm">
                          Page {currentPage} of {Math.ceil(recentRequests.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(recentRequests.length / itemsPerPage), prev + 1))}
                          disabled={currentPage === Math.ceil(recentRequests.length / itemsPerPage)}
                          className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-400" />
                Verify Model Provenance
              </h2>
              
              <div className="space-y-4">

                {/* Verification Result */}
                {verificationResult && (
                  <div className={`rounded-xl p-6 shadow-xl border ${
                    verificationResult.isValid
                      ? 'bg-green-900 bg-opacity-30 border-green-600'
                      : 'bg-red-900 bg-opacity-30 border-red-600'
                  }`}>
                    <div className="flex items-start">
                      {verificationResult.isValid ? (
                        <CheckCircle className="w-8 h-8 mr-3 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 mr-3 text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${
                          verificationResult.isValid ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {verificationResult.isValid ? 'Verification Passed' : 'Verification Failed'}
                        </h3>
                        <p className="text-slate-300 mb-3">{verificationResult.message}</p>
                        {/* <div className="bg-slate-800 p-3 rounded-lg"> */}
                          {/* <p className="text-sm text-slate-400 mb-1">Request Hash</p>
                          <p className="font-mono text-sm">{verificationResult.requestHash}</p> */}
                        {/* </div> */}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dataset Input Method Selection */}
                <div className="flex gap-4 mb-2">
                  <button
                    onClick={() => setVerifyMethod('filepath')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      verifyMethod === 'filepath'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    File Path
                  </button>
                  <button
                    onClick={() => setVerifyMethod('upload')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      verifyMethod === 'upload'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Dataset to Verify
                  </label>
                  {verifyMethod === 'upload' ? (
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                      <input
                        type="file"
                        id="verify-dataset-upload"
                        onChange={handleVerifyFileSelect}
                        className="hidden"
                        accept=".csv,.json,.txt,.parquet"
                      />
                      <label htmlFor="verify-dataset-upload" className="cursor-pointer">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                        <p className="text-base mb-1">
                          {verifyDatasetFile ? verifyDatasetFile.name : 'Click to upload dataset'}
                        </p>
                        <p className="text-xs text-slate-400">
                          Supports CSV, JSON, TXT, Parquet files
                        </p>
                      </label>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={verifyDatasetPath}
                      onChange={(e) => setVerifyDatasetPath(e.target.value)}
                      placeholder="Enter the dataset path used for training"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  )}
                  {selectedModel && (
                    <p className="text-xs text-slate-400 mt-2">
                      Expected: {selectedModel.datasetSource}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={(!verifyDatasetPath && !verifyDatasetFile) || !selectedModel || isVerifying}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify Provenance
                    </>
                  )}
                </button>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Select Model from Recent Requests
                  </label>
                  {recentRequests.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {recentRequests.slice((verifyCurrentPage - 1) * itemsPerPage, verifyCurrentPage * itemsPerPage).map((request, index) => (
                          <button
                            key={index}
                            onClick={() => selectModelForVerification(request)}
                            className={`w-full text-left p-4 rounded-lg transition-all ${
                              selectedModel?.requestHash === request.requestHash
                                ? 'bg-purple-600 border-2 border-purple-400'
                                : 'bg-slate-700 border-2 border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{request.datasetSource}</span>
                              <span className="text-xs text-slate-400">{formatTimestamp(request.timestamp)}</span>
                            </div>
                            <div className="text-xs font-mono text-slate-300">
                              {request.modelWeights}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Pagination for Verify */}
                      {recentRequests.length > itemsPerPage && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            onClick={() => setVerifyCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={verifyCurrentPage === 1}
                            className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                          >
                            Previous
                          </button>
                          <span className="text-slate-400 text-sm">
                            Page {verifyCurrentPage} of {Math.ceil(recentRequests.length / itemsPerPage)}
                          </span>
                          <button
                            onClick={() => setVerifyCurrentPage(prev => Math.min(Math.ceil(recentRequests.length / itemsPerPage), prev + 1))}
                            disabled={verifyCurrentPage === Math.ceil(recentRequests.length / itemsPerPage)}
                            className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-700 p-6 rounded-lg text-center text-slate-400">
                      <p>No recent training requests. Train a model first!</p>
                    </div>
                  )}
                </div>

                
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}