import React from 'react';
import { Navigation, CheckCircle2 } from 'lucide-react';

export default function DijkstraVisualizer({ currentStep, roadGraph }) {
  const snapshot = currentStep?.snapshot || {};
  const dist = snapshot.dist || {};
  const prev = snapshot.prev || {};
  const visited = new Set(snapshot.visited || []);
  const pq = snapshot.pq || [];

  const sourceId = currentStep?.sourceId || 'WH-Central';
  const destinationId = currentStep?.destinationId || 'Maninagar';
  const currentNode = currentStep?.currentNode;
  const currentEdge = currentStep?.currentEdge;
  const path = currentStep?.path || [];
  const vehicleStep = currentStep?.vehicleStep || snapshot.vehicleStep;
  const title = currentStep?.title || 'Dijkstra Shortest Path Search';
  const explanation = currentStep?.decision || currentStep?.calculations || '';

  const nodePos = {};
  roadGraph?.nodes?.forEach(n => {
    nodePos[n.id] = { x: n.x, y: n.y, name: n.name, type: n.type };
  });

  // Calculate vehicle coordinates if currently in transit
  let vehicleCoords = null;
  if (vehicleStep && nodePos[vehicleStep.fromNode] && nodePos[vehicleStep.toNode]) {
    const from = nodePos[vehicleStep.fromNode];
    const to = nodePos[vehicleStep.toNode];
    const t = 0.5;
    vehicleCoords = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  } else if (currentNode && nodePos[currentNode]) {
    vehicleCoords = { x: nodePos[currentNode].x, y: nodePos[currentNode].y - 32 };
  }

  return (
    <div className="rx-viz-card">
      {/* Simulation Step Explanation Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <Navigation size={16} />
            <span>Shortest Path</span>
          </div>
          <h4 className="rx-step-summary-heading">{title}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      <div className="rx-dijkstra-split-layout">
        {/* Large Centered SVG Graph (70% space) */}
        <div className="rx-dijkstra-graph-panel">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Urban Road Network Graph</span>
            <span className="rx-panel-hint">
              Source: <strong className="text-primary">{sourceId}</strong> ➔ Target: <strong className="text-success">{destinationId}</strong>
            </span>
          </div>

          <div className="rx-svg-wrapper">
            <svg viewBox="0 0 640 450" className="rx-network-svg">
              <defs>
                <linearGradient id="rxDijkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Road Edges */}
              {roadGraph?.edges?.map((edge, idx) => {
                const u = nodePos[edge.from];
                const v = nodePos[edge.to];
                if (!u || !v) return null;

                let isPath = false;
                if (path.length > 1) {
                  for (let i = 0; i < path.length - 1; i++) {
                    if (
                      (path[i] === edge.from && path[i + 1] === edge.to) ||
                      (path[i] === edge.to && path[i + 1] === edge.from)
                    ) {
                      isPath = true;
                      break;
                    }
                  }
                }

                const isRelaxing =
                  currentEdge &&
                  ((currentEdge.from === edge.from && currentEdge.to === edge.to) ||
                    (currentEdge.from === edge.to && currentEdge.to === edge.from));

                let stroke = isPath ? 'url(#rxDijkGrad)' : isRelaxing ? 'var(--warning)' : '#cbd5e1';
                let strokeWidth = isPath ? 5 : isRelaxing ? 3.5 : 2;

                const midX = (u.x + v.x) / 2;
                const midY = (u.y + v.y) / 2;

                return (
                  <g key={`dijk-edge-${idx}`}>
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isRelaxing ? '5 3' : 'none'}
                      strokeLinecap="round"
                    />
                    <rect x={midX - 12} y={midY - 9} width={24} height={18} rx={4} fill="#ffffff" stroke="#e2e8f0" />
                    <text x={midX} y={midY + 4} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="Fira Code, monospace">
                      {edge.weight}k
                    </text>
                  </g>
                );
              })}

              {/* Road Nodes */}
              {roadGraph?.nodes?.map(node => {
                const pos = nodePos[node.id];
                if (!pos) return null;

                const isCurr = node.id === currentNode;
                const isSrc = node.id === sourceId;
                const isDst = node.id === destinationId;
                const isVis = visited.has(node.id);

                let stroke = isSrc ? '#4f46e5' : isDst ? '#10b981' : isVis ? '#8b5cf6' : '#94a3b8';
                let fill = isSrc ? '#e0e7ff' : isDst ? '#dcfce7' : isVis ? '#f3e8ff' : '#ffffff';

                if (isCurr) {
                  stroke = '#f59e0b';
                  fill = '#fef3c7';
                }

                return (
                  <g key={`dijk-node-${node.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                    {(isCurr || isSrc || isDst) && (
                      <circle r={28} fill="none" stroke={stroke} strokeWidth={2.5} className="animate-pulse" />
                    )}
                    <circle r={18} fill={fill} stroke={stroke} strokeWidth={2} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
                    <text textAnchor="middle" dy="4" fill="#0f172a" fontSize="10" fontWeight="700">
                      {node.id === 'WH-Central' ? 'WH' : node.id.substring(0, 3)}
                    </text>
                    <text textAnchor="middle" dy="32" fill="#334155" fontSize="11" fontWeight="600">
                      {node.id}
                    </text>
                  </g>
                );
              })}

              {/* Animated Vehicle Marker */}
              {vehicleCoords && (
                <g transform={`translate(${vehicleCoords.x}, ${vehicleCoords.y})`}>
                  <circle r={18} fill="#10b981" opacity={0.25} className="animate-pulse" />
                  <circle r={14} fill="#ffffff" stroke="#10b981" strokeWidth={2} filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))" />
                  <path d="M-5 -2 L-3 -6 L3 -6 L5 -2 L5 4 L-5 4 Z" fill="#10b981" />
                  <circle cx="-3" cy="4" r="1.5" fill="#ffffff" />
                  <circle cx="3" cy="4" r="1.5" fill="#ffffff" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right Sidebar: Priority Queue Frontier + Distance Table */}
        <div className="rx-dijkstra-sidebar-panel">
          {/* Priority Queue Frontier */}
          <div className="rx-frontier-box">
            <span className="rx-panel-title block mb-2">Priority Queue Frontier</span>
            <div className="rx-pq-chips-flex">
              {pq.length === 0 ? (
                <span className="text-muted text-xs">Queue empty</span>
              ) : (
                pq.map((it, idx) => (
                  <div key={`pq-${it.node}-${idx}`} className={`rx-pq-frontier-chip ${idx === 0 ? 'rx-frontier-min' : ''}`}>
                    <span className="font-mono font-bold text-slate-900">{it.node}</span>
                    <span className="font-mono text-muted text-xs">{it.dist} km</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Node Distance Table */}
          <div className="rx-table-scroll-container mt-4">
            <span className="rx-panel-title block mb-2">Node Distance &amp; State</span>
            <table className="rx-matrix-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Dist</th>
                  <th>Prev</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {roadGraph?.nodes?.map(node => (
                  <tr key={`tr-${node.id}`} className={node.id === currentNode ? 'rx-row-active' : ''}>
                    <td className="font-mono font-bold text-slate-900">{node.id}</td>
                    <td className="font-mono text-primary font-semibold">
                      {dist[node.id] === Infinity ? '∞' : `${dist[node.id]} km`}
                    </td>
                    <td className="font-mono text-muted">{prev[node.id] || '—'}</td>
                    <td>
                      <span className={`rx-status-badge ${visited.has(node.id) ? 'rx-status-available' : 'rx-status-offline'}`}>
                        {visited.has(node.id) ? 'Visited' : 'Unvisited'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reconstructed Path Banner */}
          {path.length > 0 && (
            <div className="rx-reconstructed-route-card mt-4">
              <CheckCircle2 size={18} className="text-success shrink-0" />
              <div>
                <span className="text-xs text-muted block font-medium">Reconstructed Shortest Route:</span>
                <strong className="text-sm font-mono text-slate-900">
                  {path.join(' → ')}
                </strong>
                <span className="text-xs text-success font-mono font-bold block mt-0.5">
                  Total Travel Distance: {dist[destinationId]} km
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
