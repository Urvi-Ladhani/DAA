import React from 'react';
import {
  Layers,
  Truck,
  PlayCircle,
} from 'lucide-react';

const PRIORITY_BADGES = {
  Critical: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  High: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  Medium: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  Low: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
};

export default function FullJourneyVisualizer({
  currentStep,
  roadGraph,
  orders,
  selectedOrderId,
  onSelectOrder,
}) {
  const stage = currentStep?.stageNumber || 1;
  const stageTitle = currentStep?.stageTitle || 'Stage 1: Orders Placed';
  const explanation = currentStep?.activeExplanation || '';
  const highlightNode = currentStep?.highlightNode;
  const highlightOrder = currentStep?.highlightOrder;
  const routePath = currentStep?.routePath || [];
  const vehiclePos = currentStep?.vehiclePosition;
  const heapSnapshot = currentStep?.heapSnapshot || [];
  const evaluatedVehicles = currentStep?.evaluatedVehicles || [];

  // Node position coordinates lookup
  const nodePos = {};
  roadGraph?.nodes?.forEach(n => {
    nodePos[n.id] = { x: n.x, y: n.y, name: n.name, type: n.type };
  });

  // Calculate dynamic vehicle pixel coordinates
  let currentVehicleCoords = null;
  if (vehiclePos && nodePos[vehiclePos.from] && nodePos[vehiclePos.to]) {
    const from = nodePos[vehiclePos.from];
    const to = nodePos[vehiclePos.to];
    if (vehiclePos.arrived) {
      currentVehicleCoords = { x: to.x, y: to.y - 30 };
    } else {
      const t = 0.5;
      currentVehicleCoords = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t - 16,
      };
    }
  }

  return (
    <div className="rx-viz-card">
      {/* Simulation Stage Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <PlayCircle size={16} />
            <span>Stage {stage} of 14</span>
          </div>
          <h4 className="rx-step-summary-heading">{stageTitle}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      {/* Main SVG Road Network Canvas */}
      <div className="rx-journey-canvas-panel">
        <div className="rx-panel-header">
          <span className="rx-panel-title">City-Wide Logistics Network</span>
          <span className="rx-panel-hint">
            Watch continuous interaction between Heap, Floyd–Warshall, Greedy, and Dijkstra
          </span>
        </div>

        <div className="rx-svg-wrapper">
          <svg viewBox="0 0 680 470" className="rx-network-svg">
            <defs>
              <linearGradient id="rxJourneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Road Edges */}
            {roadGraph?.edges?.map((edge, idx) => {
              const u = nodePos[edge.from];
              const v = nodePos[edge.to];
              if (!u || !v) return null;

              let isRouteEdge = false;
              if (routePath.length > 1) {
                for (let i = 0; i < routePath.length - 1; i++) {
                  if (
                    (routePath[i] === edge.from && routePath[i + 1] === edge.to) ||
                    (routePath[i] === edge.to && routePath[i + 1] === edge.from)
                  ) {
                    isRouteEdge = true;
                    break;
                  }
                }
              }

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={`journey-edge-${idx}`}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isRouteEdge ? 'url(#rxJourneyGrad)' : '#cbd5e1'}
                    strokeWidth={isRouteEdge ? 5 : 2}
                    strokeLinecap="round"
                  />
                  <rect
                    x={midX - 12}
                    y={midY - 9}
                    width={24}
                    height={18}
                    rx={4}
                    fill="#ffffff"
                    stroke={isRouteEdge ? '#10b981' : '#e2e8f0'}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isRouteEdge ? '#065f46' : '#64748b'}
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="Fira Code, monospace"
                  >
                    {edge.weight}k
                  </text>
                </g>
              );
            })}

            {/* Road Nodes */}
            {roadGraph?.nodes?.map(node => {
              const pos = nodePos[node.id];
              if (!pos) return null;

              const isWarehouse = node.type === 'warehouse';
              const isHighlight =
                node.id === highlightNode ||
                (selectedOrderId && orders.find(o => o.id === selectedOrderId)?.destination === node.id);
              const matchedOrder = orders.find(o => o.destination === node.id);

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => matchedOrder && onSelectOrder(matchedOrder.id)}
                >
                  {isHighlight && (
                    <circle
                      r={28}
                      fill="none"
                      stroke={isWarehouse ? '#10b981' : '#4f46e5'}
                      strokeWidth={2.5}
                      className="animate-pulse"
                    />
                  )}

                  <circle
                    r={isWarehouse ? 20 : 18}
                    fill={isWarehouse ? '#ecfdf5' : isHighlight ? '#eef2ff' : '#ffffff'}
                    stroke={isWarehouse ? '#10b981' : isHighlight ? '#4f46e5' : '#94a3b8'}
                    strokeWidth={isHighlight || isWarehouse ? 2.5 : 1.5}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />

                  {isWarehouse ? (
                    <text textAnchor="middle" dy="4" fill="#059669" fontSize="10" fontWeight="800">
                      WH
                    </text>
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={isHighlight ? '#4f46e5' : '#475569'}
                      fontSize="10"
                      fontWeight="700"
                    >
                      {node.id.substring(0, 3)}
                    </text>
                  )}

                  <text
                    textAnchor="middle"
                    dy={isWarehouse ? 34 : 32}
                    fill={isHighlight ? '#0f172a' : '#334155'}
                    fontSize="11"
                    fontWeight={isHighlight ? '700' : '600'}
                  >
                    {node.id}
                  </text>

                  {/* Destination Order Tag */}
                  {matchedOrder && (
                    <g transform="translate(0, -28)">
                      <rect
                        x={-24}
                        y={-8}
                        width={48}
                        height={16}
                        rx={8}
                        fill={matchedOrder.id === highlightOrder ? '#4f46e5' : '#f1f5f9'}
                        stroke={matchedOrder.id === highlightOrder ? '#4338ca' : '#cbd5e1'}
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill={matchedOrder.id === highlightOrder ? '#ffffff' : '#475569'}
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="Fira Code, monospace"
                      >
                        {matchedOrder.id}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Moving Vehicle */}
            {currentVehicleCoords && (
              <g transform={`translate(${currentVehicleCoords.x}, ${currentVehicleCoords.y})`}>
                <circle r={18} fill="#10b981" opacity={0.25} className="animate-pulse" />
                <circle r={14} fill="#ffffff" stroke="#10b981" strokeWidth={2} filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))" />
                <path d="M-5 -2 L-3 -6 L3 -6 L5 -2 L5 4 L-5 4 Z" fill="#10b981" />
                <circle cx="-3" cy="4" r="1.5" fill="#ffffff" />
                <circle cx="3" cy="4" r="1.5" fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* Dynamic Contextual Overlay Card: Min-Heap (Stages 2-4) */}
          {stage >= 2 && stage <= 4 && heapSnapshot.length > 0 && (
            <div className="rx-journey-overlay-card">
              <div className="rx-overlay-header">
                <Layers size={14} className="text-primary" />
                <span className="text-xs font-bold text-slate-800">Priority Queue Min-Heap</span>
              </div>
              <div className="rx-overlay-chips-list">
                {heapSnapshot.map((ord, idx) => {
                  const b = PRIORITY_BADGES[ord.priority] || PRIORITY_BADGES.Low;
                  return (
                    <div key={`heap-${ord.id}-${idx}`} className="rx-overlay-chip" style={{ borderColor: b.border }}>
                      <span className="font-mono text-muted text-xs">[{idx}]</span>
                      <strong className="font-mono text-xs">{ord.id}</strong>
                      <span className="rx-chip-badge" style={{ backgroundColor: b.bg, color: b.text }}>
                        {ord.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Contextual Overlay Card: Vehicle Evaluation (Stages 7-9) */}
          {stage >= 7 && stage <= 9 && evaluatedVehicles.length > 0 && (
            <div className="rx-journey-overlay-card">
              <div className="rx-overlay-header">
                <Truck size={14} className="text-success" />
                <span className="text-xs font-bold text-slate-800">Fleet Evaluation</span>
              </div>
              <div className="rx-overlay-chips-list">
                {evaluatedVehicles.map(evalItem => (
                  <div key={`veh-eval-${evalItem.vehicleId}`} className="rx-overlay-eval-row">
                    <strong className="font-mono text-xs">{evalItem.vehicleId}</strong>
                    <span className={`rx-status-badge text-xs ${evalItem.feasible ? 'rx-status-available' : 'rx-status-offline'}`}>
                      {evalItem.feasible ? `+${evalItem.additionalDistance} km` : 'Infeasible'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
