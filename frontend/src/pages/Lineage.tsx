import React, { useState, useEffect } from 'react';
import { Shield, Database, Activity, Clock, ChevronLeft, ZoomIn, ZoomOut, Maximize2, Archive } from 'lucide-react';

export default function LineageGraph() {
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchTrainingHistory();
  }, []);

  const fetchTrainingHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/training-history');
      if (response.ok) {
        const data = await response.json();
        setTrainingHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch training history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate node positions with hierarchical tree layout
  const calculateNodePositions = () => {
    // Historical/ancestor nodes (mock data before current root)
    const ancestorNodes = [
      {
        id: 'ancestor-2',
        x: 200,
        y: 100,
        label: 'Foundation Model',
        isAncestor: true,
        dataset: 'public-corpus-v1',
      },
      {
        id: 'ancestor-1',
        x: 500,
        y: 100,
        label: 'Pre-trained Base',
        isAncestor: true,
        dataset: 'internal-data-2023',
      },
    ];

    // Current base node (root in enclave)
    const baseNode = {
      id: 'base',
      x: 500,
      y: 300,
      label: 'Base Model',
      isBase: true,
      dataset: 'initial-training-set',
    };

    // Calculate positions for trained models in a wider tree structure
    const modelNodes = trainingHistory.map((record, index) => {
      const totalModels = trainingHistory.length;
      const horizontalSpacing = 300; // Increased spacing
      const verticalSpacing = 200;
      
      // Calculate width needed and center the models
      const totalWidth = (totalModels - 1) * horizontalSpacing;
      const startX = 500 - totalWidth / 2;
      
      return {
        id: record.requestHash,
        x: startX + index * horizontalSpacing,
        y: 500,
        label: record.modelWeights,
        hash: record.requestHash,
        timestamp: record.timestamp,
        dataset: record.datasetSource,
        signature: record.signature,
        isBase: false,
      };
    });

    return { ancestorNodes, baseNode, modelNodes };
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.closest('.pan-area')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleResetView = () => {
    setZoom(0.7);
    setPan({ x: 100, y: 100 });
  };

  const { ancestorNodes, baseNode, modelNodes } = calculateNodePositions();

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading training history...</p>
        </div>
      </div>
    );
  }

  if (trainingHistory.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Training Data</h2>
          <p className="text-slate-400">Train some models first to see the lineage graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Model Lineage Graph</h1>
              <p className="text-xs text-slate-400">{ancestorNodes.length + 1 + trainingHistory.length} models in lineage</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-slate-300">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Base (Enclave)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-slate-300">Trained</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 bg-slate-800 border border-slate-600 rounded-lg p-2 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-slate-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-slate-300" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* SVG Graph */}
        <svg
          className="w-full h-full pan-area cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
            
            <marker
              id="arrowhead-amber"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#fbbf24" />
            </marker>
            
            {/* Glow filter for base node */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Gradients */}
            <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="modelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="ancestorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid Background */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3"/>
            </pattern>
            <rect width="4000" height="2000" fill="url(#grid)" />

            {/* Draw edges from ancestors to base */}
            {ancestorNodes.map((node, index) => (
              <g key={`ancestor-edge-${node.id}`}>
                <line
                  x1={node.x}
                  y1={node.y + 40}
                  x2={baseNode.x}
                  y2={baseNode.y - 40}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  markerEnd="url(#arrowhead-amber)"
                  opacity="0.5"
                />
                
                {/* Edge label */}
                <g>
                  <rect
                    x={(node.x + baseNode.x) / 2 - 60}
                    y={(node.y + 40 + baseNode.y - 40) / 2 - 12}
                    width="120"
                    height="24"
                    fill="#78350f"
                    rx="4"
                    opacity="0.9"
                  />
                  <text
                    x={(node.x + baseNode.x) / 2}
                    y={(node.y + 40 + baseNode.y - 40) / 2 + 4}
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {node.dataset}
                  </text>
                </g>
              </g>
            ))}

            {/* Draw edges from base to trained models */}
            {modelNodes.map((node) => (
              <g key={`edge-${node.id}`}>
                <line
                  x1={baseNode.x}
                  y1={baseNode.y + 40}
                  x2={node.x}
                  y2={node.y - 35}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                  opacity="0.6"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="10"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </line>
                
                {/* Edge label (dataset name) */}
                <g>
                  <rect
                    x={(baseNode.x + node.x) / 2 - 60}
                    y={(baseNode.y + 40 + node.y - 35) / 2 - 12}
                    width="120"
                    height="24"
                    fill="#1e293b"
                    rx="4"
                    opacity="0.9"
                  />
                  <text
                    x={(baseNode.x + node.x) / 2}
                    y={(baseNode.y + 40 + node.y - 35) / 2 + 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {node.dataset.length > 18 ? node.dataset.substring(0, 15) + '...' : node.dataset}
                  </text>
                </g>
              </g>
            ))}

            {/* Draw ancestor nodes */}
            {ancestorNodes.map((node) => (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
                className="hover:opacity-90 transition-opacity"
              >
                <rect
                  x={node.x - 80}
                  y={node.y - 40}
                  width="160"
                  height="80"
                  fill="url(#ancestorGradient)"
                  rx="10"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  opacity="0.8"
                />
                <foreignObject x={node.x - 12} y={node.y - 22} width="24" height="24">
                  <Archive className="w-6 h-6 text-amber-400" />
                </foreignObject>
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="13"
                  fontWeight="600"
                >
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 22}
                  textAnchor="middle"
                  fill="#fde68a"
                  fontSize="10"
                >
                  (Historical)
                </text>
              </g>
            ))}

            {/* Draw base node */}
            <g
              onClick={() => setSelectedNode({ ...baseNode, isCurrentBase: true })}
              style={{ cursor: 'pointer' }}
              filter="url(#glow)"
            >
              <rect
                x={baseNode.x - 90}
                y={baseNode.y - 40}
                width="180"
                height="80"
                fill="url(#baseGradient)"
                rx="12"
                stroke="#4ade80"
                strokeWidth="3"
              />
              <foreignObject x={baseNode.x - 12} y={baseNode.y - 22} width="24" height="24">
                <Activity className="w-6 h-6 text-green-400 animate-pulse" />
              </foreignObject>
              <text
                x={baseNode.x}
                y={baseNode.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                Base Model
              </text>
              <text
                x={baseNode.x}
                y={baseNode.y + 22}
                textAnchor="middle"
                fill="#bbf7d0"
                fontSize="11"
              >
                (Current Enclave)
              </text>
            </g>

            {/* Draw model nodes */}
            {modelNodes.map((node) => (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
                className="hover:opacity-90 transition-opacity"
              >
                <rect
                  x={node.x - 90}
                  y={node.y - 35}
                  width="180"
                  height="70"
                  fill="url(#modelGradient)"
                  rx="10"
                  stroke={selectedNode?.id === node.id ? "#60a5fa" : "#3b82f6"}
                  strokeWidth={selectedNode?.id === node.id ? "3" : "2"}
                />
                <foreignObject x={node.x - 10} y={node.y - 20} width="20" height="20">
                  <Shield className="w-5 h-5 text-blue-400" />
                </foreignObject>
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                >
                  {node.label.length > 22 ? node.label.substring(0, 19) + '...' : node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {new Date(node.timestamp).toLocaleDateString()}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Side Panel for Selected Node */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {selectedNode.isAncestor ? 'Historical Model' : selectedNode.isCurrentBase ? 'Current Base Model' : 'Model Details'}
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">
                  {selectedNode.isAncestor ? 'Model Name' : 'Model Weights'}
                </p>
                <p className="text-sm font-mono bg-slate-900 p-2 rounded break-all">{selectedNode.label}</p>
              </div>
              {selectedNode.dataset && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Training Dataset</p>
                  <p className="text-sm font-medium text-blue-300">{selectedNode.dataset}</p>
                </div>
              )}
              {/* {selectedNode.hash && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Request Hash</p>
                  <p className="text-xs font-mono bg-slate-900 p-2 rounded break-all">{selectedNode.hash}</p>
                </div>
              )} */}
              {selectedNode.signature && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Signature</p>
                  <p className="text-xs font-mono bg-slate-900 p-2 rounded break-all">{selectedNode.signature}</p>
                </div>
              )}
              {selectedNode.timestamp && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                  <p className="text-sm">{formatTimestamp(selectedNode.timestamp)}</p>
                </div>
              )}
              {selectedNode.isAncestor && (
                <div className="mt-4 p-3 bg-amber-900/20 border border-amber-600/30 rounded">
                  <p className="text-xs text-amber-300">
                    This is a historical model that was used to derive the current base model.
                  </p>
                </div>
              )}
              {selectedNode.isCurrentBase && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded">
                  <p className="text-xs text-green-300">
                    This is the current base model running in the secure enclave.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}