import React from 'react';
import { Network, Zap } from 'lucide-react';

export default function FloydWarshallVisualizer({ currentStep, roadGraph }) {
  const snapshot = currentStep?.snapshot || { dist: [], next: [] };
  const dist = snapshot.dist || [];
  const nodeIds = currentStep?.nodeIds || roadGraph?.nodes?.map(n => n.id) || [];

  const currK = currentStep?.k;
  const currI = currentStep?.i;
  const currJ = currentStep?.j;
  const kNode = currentStep?.kNode;
  const iNode = currentStep?.iNode;
  const jNode = currentStep?.jNode;
  const oldDist = currentStep?.oldDist;
  const candidateDist = currentStep?.candidateDist;
  const updated = currentStep?.updated;
  const title = currentStep?.title || 'Floyd–Warshall Algorithm Initialized';
  const explanation = currentStep?.decision || currentStep?.calculations || '';

  const nodePos = {};
  roadGraph?.nodes?.forEach(n => {
    nodePos[n.id] = { x: n.x, y: n.y, name: n.name, type: n.type };
  });

  return (
    <div className="rx-viz-card">
      {/* Simulation Step Explanation Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <Network size={16} />
            <span>Matrix Relaxation</span>
          </div>
          <h4 className="rx-step-summary-heading">{title}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      <div className="rx-fw-split-layout">
        {/* Left / Primary: Large All-Pairs Distance Matrix */}
        <div className="rx-fw-matrix-panel">
          <div className="rx-panel-header">
            <div className="flex items-center gap-2">
              <span className="rx-panel-title">All-Pairs Distance Matrix D[k]</span>
              {currK !== null && currK !== undefined && (
                <span className="rx-hub-indicator-pill font-mono">
                  Active Hub k = <strong>{kNode}</strong> ({currK + 1}/{nodeIds.length})
                </span>
              )}
            </div>
            <span className="rx-panel-hint">
              Matrix values show shortest transit distance (km)
            </span>
          </div>

          <div className="rx-table-scroll-container">
            <table className="rx-matrix-table" aria-label="Floyd-Warshall Distance Matrix">
              <thead>
                <tr>
                  <th className="rx-matrix-corner-th">From \ To</th>
                  {nodeIds.map((id, colIdx) => (
                    <th
                      key={`th-col-${id}`}
                      className={`rx-matrix-th ${colIdx === currJ ? 'rx-col-dest-active' : ''} ${colIdx === currK ? 'rx-col-hub-active' : ''}`}
                    >
                      {id.substring(0, 5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dist.map((row, rowIdx) => (
                  <tr key={`row-${nodeIds[rowIdx]}`}>
                    <td className={`rx-matrix-row-label ${rowIdx === currI ? 'rx-row-src-active' : ''} ${rowIdx === currK ? 'rx-row-hub-active' : ''}`}>
                      {nodeIds[rowIdx].substring(0, 5)}
                    </td>

                    {row.map((val, colIdx) => {
                      const isIJ = rowIdx === currI && colIdx === currJ;
                      const isIK = rowIdx === currI && colIdx === currK;
                      const isKJ = rowIdx === currK && colIdx === currJ;
                      const isDiag = rowIdx === colIdx;

                      let cellClass = 'rx-matrix-cell';
                      if (isIJ) cellClass += updated ? ' rx-cell-updated-green' : ' rx-cell-ij-active';
                      else if (isIK) cellClass += ' rx-cell-ik-helper';
                      else if (isKJ) cellClass += ' rx-cell-kj-helper';
                      else if (isDiag) cellClass += ' rx-cell-diagonal';

                      return (
                        <td key={`cell-${rowIdx}-${colIdx}`} className={cellClass}>
                          <span className="font-mono font-semibold">
                            {val === Infinity ? '∞' : val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recurrence Formula Callout */}
          {currI !== null && currJ !== null && currK !== null && (
            <div className="rx-formula-callout mt-4 font-mono">
              <Zap size={16} className="text-warning shrink-0" />
              <div className="text-sm">
                <span>dist[{nodeIds[currI]?.substring(0, 5)}][{nodeIds[currJ]?.substring(0, 5)}] = min( Direct: {oldDist === Infinity ? '∞' : oldDist}, Via {kNode}: {dist[currI]?.[currK]} + {dist[currK]?.[currJ]} = {candidateDist === Infinity ? '∞' : candidateDist} )</span>
                {updated && <strong className="text-success ml-2 font-bold">✓ Shortened to {candidateDist} km</strong>}
              </div>
            </div>
          )}
        </div>

        {/* Right / Complementary: Road Network SVG Graph */}
        <div className="rx-fw-graph-panel">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Active Arterial Network</span>
            <span className="rx-panel-hint">Highlights i → k and k → j legs</span>
          </div>

          <div className="rx-fw-svg-wrapper">
            <svg viewBox="0 0 600 440" className="rx-fw-svg">
              {/* Edges */}
              {roadGraph?.edges?.map((edge, idx) => {
                const u = nodePos[edge.from];
                const v = nodePos[edge.to];
                if (!u || !v) return null;

                const isIK = (edge.from === iNode && edge.to === kNode) || (edge.to === iNode && edge.from === kNode);
                const isKJ = (edge.from === kNode && edge.to === jNode) || (edge.to === kNode && edge.from === jNode);

                let strokeColor = '#cbd5e1';
                let strokeWidth = 2;
                if (isIK) {
                  strokeColor = 'var(--primary)';
                  strokeWidth = 3.5;
                } else if (isKJ) {
                  strokeColor = 'var(--warning)';
                  strokeWidth = 3.5;
                }

                const midX = (u.x + v.x) / 2;
                const midY = (u.y + v.y) / 2;

                return (
                  <g key={`fw-edge-${idx}`}>
                    <line x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke={strokeColor} strokeWidth={strokeWidth} />
                    <rect x={midX - 12} y={midY - 9} width={24} height={18} rx={4} fill="#ffffff" stroke="#e2e8f0" />
                    <text x={midX} y={midY + 4} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="Fira Code, monospace">
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {roadGraph?.nodes?.map(node => {
                const pos = nodePos[node.id];
                if (!pos) return null;

                const isK = node.id === kNode;
                const isI = node.id === iNode;
                const isJ = node.id === jNode;
                const isWarehouse = node.type === 'warehouse';

                let strokeColor = isWarehouse ? 'var(--success)' : '#94a3b8';
                let fillColor = '#ffffff';

                if (isK) {
                  strokeColor = 'var(--warning)';
                  fillColor = 'var(--warning-subtle)';
                } else if (isI) {
                  strokeColor = 'var(--primary)';
                  fillColor = 'var(--primary-subtle)';
                } else if (isJ) {
                  strokeColor = 'var(--success)';
                  fillColor = 'var(--success-subtle)';
                }

                return (
                  <g key={`fw-node-${node.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                    {(isK || isI || isJ) && (
                      <circle r={26} fill="none" stroke={strokeColor} strokeWidth={2.5} className="animate-pulse" />
                    )}
                    <circle r={18} fill={fillColor} stroke={strokeColor} strokeWidth={2} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
                    <text textAnchor="middle" dy="4" fill="#0f172a" fontSize="9.5" fontWeight="700">
                      {node.id === 'WH-Central' ? 'WH' : node.id.substring(0, 3)}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="32"
                      fill={isK ? 'var(--warning)' : isI ? 'var(--primary)' : isJ ? 'var(--success)' : '#334155'}
                      fontSize="11"
                      fontWeight="600"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
