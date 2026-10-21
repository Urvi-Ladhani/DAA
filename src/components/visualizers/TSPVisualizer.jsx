import React from 'react';
import { GitFork, Trophy, ArrowRight } from 'lucide-react';

export default function TSPVisualizer({ currentStep }) {
  const stops = currentStep?.stops || [];
  const distMatrix = currentStep?.distMatrix || [];
  const searchTree = currentStep?.searchTree || currentStep?.snapshot?.searchTree || [];
  const currentNode = currentStep?.currentNode;
  const bestTour = currentStep?.bestTour || currentStep?.snapshot?.bestTour;
  const bestTourCost = currentStep?.bestTourCost ?? currentStep?.snapshot?.bestTourCost ?? Infinity;
  const title = currentStep?.title || 'Branch & Bound TSP Initialized';
  const explanation = currentStep?.decision || currentStep?.calculations || '';

  const treeWidth = 820;
  const treeHeight = 360;

  // Group nodes by depth
  const depthGroups = {};
  searchTree.forEach(node => {
    const d = node.depth;
    if (!depthGroups[d]) depthGroups[d] = [];
    depthGroups[d].push(node);
  });

  const nodePositions = {};
  const maxDepth = Math.max(1, ...Object.keys(depthGroups).map(Number));

  Object.entries(depthGroups).forEach(([depthStr, nodes]) => {
    const depth = Number(depthStr);
    const y = 45 + (depth / Math.max(1, maxDepth)) * (treeHeight - 90);
    const count = nodes.length;
    const spacing = treeWidth / (count + 1);

    nodes.forEach((node, idx) => {
      nodePositions[node.id] = {
        x: spacing * (idx + 1),
        y,
      };
    });
  });

  return (
    <div className="rx-viz-card">
      {/* Simulation Step Explanation Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <GitFork size={16} />
            <span>State Space Tree</span>
          </div>
          <h4 className="rx-step-summary-heading">{title}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      <div className="rx-tsp-split-layout">
        {/* Large SVG Search Tree Canvas */}
        <div className="rx-tsp-tree-panel">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Branch &amp; Bound State-Space Search Tree</span>
            <span className="rx-panel-hint">
              Nodes pruned when Lower Bound &ge; Incumbent Best Tour Cost ({bestTourCost === Infinity ? '∞' : `${bestTourCost} km`})
            </span>
          </div>

          <div className="rx-svg-wrapper">
            <svg viewBox={`0 0 ${treeWidth} ${treeHeight}`} className="rx-tsp-svg">
              {/* Tree Branch Edges */}
              {searchTree.map(node => {
                if (!node.parentId || !nodePositions[node.parentId] || !nodePositions[node.id]) return null;
                const pPos = nodePositions[node.parentId];
                const cPos = nodePositions[node.id];
                const isPruned = node.status === 'PRUNED';

                return (
                  <line
                    key={`line-${node.id}`}
                    x1={pPos.x}
                    y1={pPos.y}
                    x2={cPos.x}
                    y2={cPos.y}
                    stroke={isPruned ? '#fca5a5' : '#94a3b8'}
                    strokeWidth={isPruned ? 1.5 : 2}
                    strokeDasharray={isPruned ? '5 3' : 'none'}
                  />
                );
              })}

              {/* Tree Nodes */}
              {searchTree.map(node => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const isCurr = currentNode?.id === node.id;
                const isPruned = node.status === 'PRUNED';
                const isOptimal = node.status === 'OPTIMAL';
                const isFeasible = node.status === 'FEASIBLE';

                let stroke = isOptimal ? 'var(--success)' : isPruned ? 'var(--danger)' : isFeasible ? 'var(--warning)' : 'var(--primary)';
                let fill = isOptimal ? 'var(--success-subtle)' : isPruned ? 'var(--danger-subtle)' : isFeasible ? 'var(--warning-subtle)' : '#ffffff';

                const lastStop = node.pathNames[node.pathNames.length - 1];

                return (
                  <g key={`tree-node-${node.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                    {isCurr && (
                      <circle r={28} fill="none" stroke="var(--primary)" strokeWidth={2} className="animate-pulse" />
                    )}

                    <rect
                      x={-28}
                      y={-16}
                      width={56}
                      height={32}
                      rx={8}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isCurr || isOptimal ? 2.5 : 1.5}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                    />

                    <text
                      textAnchor="middle"
                      dy="-1"
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="Fira Code, monospace"
                    >
                      {lastStop.substring(0, 5)}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="11"
                      fill={isPruned ? 'var(--danger)' : isOptimal ? 'var(--success)' : '#64748b'}
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="Fira Code, monospace"
                    >
                      {isPruned ? 'PRUNED' : `LB:${node.bound}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Incumbent Best Tour & Distance Matrix */}
        <div className="rx-tsp-sidebar-panel">
          {/* Best Complete Tour Card */}
          <div className="rx-best-tour-card">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-warning shrink-0" />
              <span className="rx-panel-title">Incumbent Best Tour</span>
            </div>

            {bestTour ? (
              <div className="mt-2">
                <div className="rx-tour-stops-wrap font-mono mb-3">
                  {bestTour.pathNames.map((name, i) => (
                    <React.Fragment key={`tour-stop-${name}-${i}`}>
                      <span className="rx-tour-stop-chip">
                        {name.substring(0, 5)}
                      </span>
                      {i < bestTour.pathNames.length - 1 && (
                        <ArrowRight size={13} className="text-muted" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="text-sm text-secondary">
                  Optimal Distance: <strong className="text-success font-mono text-base ml-1">{bestTour.cost} km</strong>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted italic mt-2">
                Searching state-space tree branches...
              </div>
            )}
          </div>

          {/* Submatrix Table */}
          <div className="rx-table-scroll-container mt-4">
            <span className="rx-panel-title block mb-2">TSP Stops Distance Submatrix</span>
            <table className="rx-matrix-table">
              <thead>
                <tr>
                  <th>Stop</th>
                  {stops.map(s => (
                    <th key={`tsp-col-${s}`}>{s.substring(0, 5)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stops.map((s1, r) => (
                  <tr key={`tsp-row-${s1}`}>
                    <td className="rx-matrix-row-label">{s1.substring(0, 5)}</td>
                    {stops.map((s2, c) => (
                      <td
                        key={`tsp-cell-${r}-${c}`}
                        className={r === c ? 'rx-cell-diagonal' : 'rx-matrix-cell'}
                      >
                        <span className="font-mono font-semibold text-xs">
                          {distMatrix[r]?.[c]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
