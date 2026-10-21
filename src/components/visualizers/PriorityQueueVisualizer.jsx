import React from 'react';
import { Layers } from 'lucide-react';

const PRIORITY_STYLES = {
  Critical: { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' },
  High: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },
  Medium: { bg: '#e0f2fe', border: '#0284c7', text: '#0369a1' },
  Low: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
};

export default function PriorityQueueVisualizer({ currentStep }) {
  const snapshot = currentStep?.snapshot || { heap: [], extracted: [] };
  const heap = snapshot.heap || [];
  const extracted = snapshot.extracted || [];
  const indices = currentStep?.indices || {};
  const title = currentStep?.title || 'Binary Heap Initialized';
  const explanation = currentStep?.decision || currentStep?.calculations || '';

  const treeWidth = 820;
  const treeHeight = 310;

  function getNodePosition(idx) {
    if (idx === 0) return { x: treeWidth / 2, y: 60 };
    const level = Math.floor(Math.log2(idx + 1));
    const itemsInLevel = Math.pow(2, level);
    const posInLevel = idx - (itemsInLevel - 1);
    const spacing = treeWidth / (itemsInLevel + 1);
    const x = spacing * (posInLevel + 1);
    const y = 60 + level * 80;
    return { x, y };
  }

  // Draw tree edges
  const edges = [];
  for (let i = 1; i < heap.length; i++) {
    const parentIdx = Math.floor((i - 1) / 2);
    const parentPos = getNodePosition(parentIdx, heap.length);
    const childPos = getNodePosition(i, heap.length);
    const isComparingEdge =
      (indices.current === i && indices.parent === parentIdx) ||
      (indices.target === i && indices.current === parentIdx);

    edges.push(
      <g key={`edge-${i}`}>
        <line
          x1={parentPos.x}
          y1={parentPos.y}
          x2={childPos.x}
          y2={childPos.y}
          stroke={isComparingEdge ? 'var(--warning)' : '#cbd5e1'}
          strokeWidth={isComparingEdge ? 3.5 : 2}
          strokeDasharray={isComparingEdge ? '5 3' : 'none'}
        />
      </g>
    );
  }

  return (
    <div className="rx-viz-card">
      {/* Simulation Step Explanation Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <Layers size={16} />
            <span>Heap State</span>
          </div>
          <h4 className="rx-step-summary-heading">{title}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      {/* Binary Heap Tree Viewport */}
      <div className="rx-pq-tree-wrapper">
        <div className="rx-panel-header">
          <span className="rx-panel-title">Binary Min-Heap Tree Structure</span>
          <span className="rx-panel-hint">
            Root node holds highest precedence dispatch order (Critical &gt; Earliest Deadline)
          </span>
        </div>

        <div className="rx-svg-tree-container">
          <svg viewBox={`0 0 ${treeWidth} ${treeHeight}`} className="rx-pq-tree-svg">
            {/* Edges */}
            {edges}

            {/* Nodes */}
            {heap.map((order, idx) => {
              const pos = getNodePosition(idx, heap.length);
              const isCurrent = indices.current === idx || indices.target === idx;
              const isParent = indices.parent === idx;
              const isRoot = idx === 0;
              const pStyle = PRIORITY_STYLES[order.priority] || PRIORITY_STYLES.Low;

              return (
                <g key={`node-${order.id}-${idx}`} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Active Comparison Halo */}
                  {(isCurrent || isParent) && (
                    <circle
                      r={32}
                      fill="none"
                      stroke={isCurrent ? '#f59e0b' : '#4f46e5'}
                      strokeWidth={2.5}
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={25}
                    fill="#ffffff"
                    stroke={isRoot ? '#10b981' : pStyle.border}
                    strokeWidth={isRoot ? 3 : 2}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />

                  {/* Order ID */}
                  <text
                    textAnchor="middle"
                    dy="-3"
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="Fira Code, monospace"
                  >
                    {order.id}
                  </text>

                  {/* Priority & Deadline */}
                  <text
                    textAnchor="middle"
                    dy="12"
                    fill={pStyle.text}
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    {order.priority} • {order.deadline}m
                  </text>

                  {/* Index Pill */}
                  <rect
                    x={-14}
                    y={-36}
                    width={28}
                    height={14}
                    rx={7}
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                  />
                  <text
                    textAnchor="middle"
                    y={-26}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="Fira Code, monospace"
                  >
                    [{idx}]
                  </text>
                </g>
              );
            })}

            {heap.length === 0 && (
              <text
                x={treeWidth / 2}
                y={treeHeight / 2}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="15"
                fontFamily="Inter, sans-serif"
              >
                Heap is empty. Ready for order insertion.
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* Heap Array & Extracted Dock Below */}
      <div className="rx-pq-bottom-grid">
        {/* Array representation */}
        <div className="rx-pq-array-card">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Contiguous 0-Indexed Heap Array</span>
            <span className="rx-panel-hint font-mono">parent = ⌊(i - 1)/2⌋ • left = 2i + 1 • right = 2i + 2</span>
          </div>

          <div className="rx-array-slots-row">
            {heap.map((ord, idx) => {
              const isCurrent = indices.current === idx || indices.target === idx;
              const isParent = indices.parent === idx;
              const pStyle = PRIORITY_STYLES[ord.priority] || PRIORITY_STYLES.Low;

              return (
                <div
                  key={`slot-${idx}`}
                  className={`rx-array-slot ${isCurrent ? 'rx-slot-current' : ''} ${isParent ? 'rx-slot-parent' : ''}`}
                  style={{
                    borderColor: isCurrent ? 'var(--warning)' : isParent ? 'var(--primary)' : 'var(--border-subtle)',
                  }}
                >
                  <span className="rx-slot-index font-mono">[{idx}]</span>
                  <strong className="rx-slot-id font-mono">{ord.id}</strong>
                  <span className="rx-slot-priority" style={{ color: pStyle.text }}>
                    {ord.priority}
                  </span>
                  <span className="rx-slot-deadline text-muted font-mono">{ord.deadline}m</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extracted Orders Sequence */}
        <div className="rx-pq-extracted-card">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Dispatched Orders Sequence ({extracted.length})</span>
            <span className="rx-panel-hint">Extracted via extractMin()</span>
          </div>

          <div className="rx-extracted-list">
            {extracted.length === 0 ? (
              <span className="text-muted text-sm italic">No orders dispatched from root yet</span>
            ) : (
              extracted.map((ord, i) => (
                <div key={`ext-${ord.id}-${i}`} className="rx-extracted-chip">
                  <span className="rx-chip-seq font-mono font-bold">#{i + 1}</span>
                  <strong className="rx-chip-id font-mono">{ord.id}</strong>
                  <span className="rx-chip-dest text-muted">{ord.destination}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
