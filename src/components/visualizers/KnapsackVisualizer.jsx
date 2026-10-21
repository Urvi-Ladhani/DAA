import React from 'react';
import { Briefcase, CheckCircle2 } from 'lucide-react';

export default function KnapsackVisualizer({ currentStep }) {
  const snapshot = currentStep?.snapshot || {};
  const dp = snapshot.dp || [];
  const packages = snapshot.packages || [];
  const capacity = snapshot.capacity || 10;
  const isBacktracking = snapshot.isBacktracking;
  const selectedItems = snapshot.selectedItems || [];

  const currI = currentStep?.currI;
  const currW = currentStep?.currW;
  const item = currentStep?.item;
  const excludeVal = currentStep?.excludeVal;
  const includeVal = currentStep?.includeVal;
  const chosenVal = currentStep?.chosenVal;
  const title = currentStep?.title || '0/1 Knapsack Dynamic Programming';
  const explanation = currentStep?.decision || currentStep?.calculations || '';

  const totalSelectedWeight = selectedItems.reduce((acc, it) => acc + it.weight, 0);
  const totalSelectedValue = selectedItems.reduce((acc, it) => acc + it.value, 0);
  const percentCapacity = Math.min(100, Math.round((totalSelectedWeight / (capacity || 1)) * 100));

  return (
    <div className="rx-viz-card">
      {/* Simulation Step Explanation Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <Briefcase size={16} />
            <span>DP Step Analysis</span>
          </div>
          <h4 className="rx-step-summary-heading">{title}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      {/* Main Split Layout: Large Table + Cargo Manifest */}
      <div className="rx-knapsack-split-layout">
        {/* Left: Large DP Table */}
        <div className="rx-knapsack-table-panel">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Dynamic Programming Table: dp[i][w]</span>
            <span className="rx-panel-hint">
              Rows: Items (1..N) • Columns: Capacity (0..{capacity} kg)
            </span>
          </div>

          <div className="rx-table-scroll-container">
            <table className="rx-dp-matrix-table" aria-label="Knapsack DP Table">
              <thead>
                <tr>
                  <th className="rx-dp-corner-th">Item \ Cap</th>
                  {Array.from({ length: capacity + 1 }, (_, w) => (
                    <th
                      key={`th-cap-${w}`}
                      className={`rx-dp-col-th ${w === currW ? 'rx-col-active' : ''}`}
                    >
                      {w}k
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dp.map((row, i) => {
                  const pkg = i > 0 ? packages[i - 1] : null;
                  const isCurrentRow = i === currI;

                  return (
                    <tr key={`dp-row-${i}`} className={isCurrentRow ? 'rx-row-active' : ''}>
                      {/* Row Label */}
                      <td className="rx-dp-row-label">
                        {i === 0 ? (
                          <div className="rx-dp-base-label font-mono">Base (0)</div>
                        ) : (
                          <div className="rx-dp-item-label font-mono">
                            <span className="rx-dp-pkg-id font-bold">{pkg?.id}</span>
                            <span className="rx-dp-pkg-meta text-xs block text-muted">
                              {pkg?.weight}kg, ${pkg?.value}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* DP Cells */}
                      {row.map((val, w) => {
                        const isCurrentCell = i === currI && w === currW;
                        const itemWeight = pkg ? Math.floor(pkg.weight) : 0;
                        const isExcludeCell = i === currI - 1 && w === currW;
                        const isIncludeCell = i === currI - 1 && w === currW - itemWeight && itemWeight <= currW;
                        const isSelectedBacktrack =
                          isBacktracking &&
                          selectedItems.some(it => it.id === pkg?.id) &&
                          i === currI &&
                          w === currW;

                        let cellClass = 'rx-dp-cell';
                        if (isCurrentCell) cellClass += ' rx-cell-active';
                        else if (isSelectedBacktrack) cellClass += ' rx-cell-backtrack';
                        else if (isExcludeCell) cellClass += ' rx-cell-exclude';
                        else if (isIncludeCell) cellClass += ' rx-cell-include';

                        return (
                          <td key={`dp-cell-${i}-${w}`} className={cellClass}>
                            <span className="font-mono font-semibold">${val}</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Decision / Recurrence Formula Callout */}
          {currI > 0 && currW > 0 && (
            <div className="rx-formula-callout mt-4 font-mono">
              <span className="rx-formula-label">Recurrence:</span>
              {item?.weight > currW ? (
                <span className="text-danger font-semibold">
                  Item exceeds remaining capacity ({item.weight} kg &gt; {currW} kg) → Inherit dp[{currI - 1}][{currW}] = ${excludeVal}
                </span>
              ) : (
                <span className="text-secondary">
                  dp[{currI}][{currW}] = max( Exclude: ${excludeVal}, Include: ${includeVal - (item?.value || 0)} + ${item?.value} = ${includeVal} ) → <strong className="text-primary font-bold">${chosenVal}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Selected Cargo Manifest */}
        <div className="rx-knapsack-sidebar-panel">
          <div className="rx-panel-header">
            <span className="rx-panel-title">Selected Cargo Manifest</span>
            <span className="rx-total-value-pill font-mono">
              ${totalSelectedValue} Total Value
            </span>
          </div>

          {/* Capacity Progress Gauge */}
          <div className="rx-capacity-gauge-box">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-secondary font-medium">Payload Utilized</span>
              <span className="font-mono font-bold text-slate-800">
                {totalSelectedWeight} / {capacity} kg ({percentCapacity}%)
              </span>
            </div>
            <div className="rx-progress-track">
              <div
                className="rx-progress-bar"
                style={{
                  width: `${percentCapacity}%`,
                  backgroundColor: percentCapacity > 90 ? 'var(--success)' : 'var(--warning)',
                }}
              />
            </div>
          </div>

          {/* Item Chips List */}
          <div className="rx-manifest-list mt-4">
            <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Optimal Package Items ({selectedItems.length})
            </div>

            {selectedItems.length === 0 ? (
              <div className="rx-manifest-empty text-muted">
                {isBacktracking ? 'Tracing selected items through DP table...' : 'Awaiting algorithm calculation...'}
              </div>
            ) : (
              selectedItems.map((pkg, idx) => (
                <div key={`manifest-${pkg.id}-${idx}`} className="rx-manifest-item">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <div>
                      <strong className="rx-manifest-id font-mono">{pkg.id}</strong>
                      <span className="rx-manifest-name block text-xs text-muted">{pkg.name}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <strong className="text-success text-sm block">${pkg.value}</strong>
                    <span className="text-xs text-muted">{pkg.weight} kg</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
