import React from 'react';
import { Truck, Check, X, Navigation, Package, AlertTriangle, ShieldCheck, BatteryCharging } from 'lucide-react';

export default function VehicleAssignmentVisualizer({ currentStep, orders }) {
  const order = currentStep?.order;
  const currentVehicle = currentStep?.currentVehicle;
  const bestCandidate = currentStep?.bestCandidate;
  const candidateEvaluations = currentStep?.candidateEvaluations || [];
  const snapshotVehicles = currentStep?.snapshot?.vehicles || [];
  const title = currentStep?.title || 'Greedy Vehicle Assignment Initialized';
  const explanation = currentStep?.decision || currentStep?.calculations || '';

  return (
    <div className="rx-viz-card">
      {/* Simulation Step Explanation Banner */}
      <div className="rx-step-summary-banner">
        <div className="rx-step-summary-title-row">
          <div className="rx-step-badge">
            <Truck size={16} />
            <span>Greedy Evaluation</span>
          </div>
          <h4 className="rx-step-summary-heading">{title}</h4>
        </div>
        <p className="rx-step-summary-text">{explanation}</p>
      </div>

      {/* Target Dispatch Order Strip */}
      {order && (
        <div className="rx-target-order-banner">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-primary" />
            <span className="text-sm text-muted">Target Order to Assign:</span>
            <strong className="text-base font-mono font-bold text-primary">{order.id}</strong>
          </div>
          <div className="flex items-center flex-wrap gap-4 text-sm">
            <span>Destination: <strong className="text-slate-900">{order.destination}</strong></span>
            <span>Required Payload: <strong className="text-primary font-mono">{order.weight} kg</strong></span>
            <span>Priority: <strong className="text-warning font-semibold">{order.priority}</strong></span>
          </div>
        </div>
      )}

      {/* Candidate Fleet Grid */}
      <div className="rx-fleet-grid-section">
        <div className="rx-panel-header">
          <span className="rx-panel-title">Fleet Vehicles Evaluation Grid</span>
          <span className="rx-panel-hint">
            Greedy Criterion: min(additional distance) subject to capacity &ge; {order?.weight || 0} kg and status == Available
          </span>
        </div>

        <div className="rx-fleet-cards-grid">
          {snapshotVehicles.map(veh => {
            const evalItem = candidateEvaluations.find(e => e.vehicleId === veh.id);
            const isEvaluating = currentVehicle?.id === veh.id;
            const isBest = bestCandidate?.vehicleId === veh.id;
            const remainingCap = veh.capacity - veh.currentLoad;
            const loadPercent = Math.min(100, Math.round((veh.currentLoad / (veh.capacity || 1)) * 100));

            let cardClass = 'rx-fleet-card';
            if (isBest) cardClass += ' rx-fleet-card-best';
            else if (evalItem && !evalItem.feasible) cardClass += ' rx-fleet-card-rejected';
            else if (isEvaluating) cardClass += ' rx-fleet-card-active';

            return (
              <div key={veh.id} className={cardClass}>
                {/* Card Header */}
                <div className="rx-fleet-card-header">
                  <div className="flex items-center gap-2.5">
                    <div className="rx-veh-icon-wrap">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h4 className="rx-veh-id font-mono font-bold text-slate-900">{veh.id}</h4>
                      <span className="rx-veh-name text-xs text-muted block">{veh.name}</span>
                    </div>
                  </div>

                  <span className={`rx-status-badge ${veh.available ? 'rx-status-available' : 'rx-status-offline'}`}>
                    {veh.available ? 'Available' : 'Maintenance'}
                  </span>
                </div>

                {/* Payload Capacity Gauge */}
                <div className="rx-veh-payload-section mt-3">
                  <div className="flex justify-between text-xs text-secondary mb-1">
                    <span>Payload: {veh.currentLoad} / {veh.capacity} kg</span>
                    <strong className="font-mono text-slate-800">{remainingCap} kg free</strong>
                  </div>
                  <div className="rx-progress-track">
                    <div
                      className="rx-progress-bar"
                      style={{
                        width: `${loadPercent}%`,
                        backgroundColor: loadPercent > 80 ? 'var(--danger)' : loadPercent > 50 ? 'var(--warning)' : 'var(--success)',
                      }}
                    />
                  </div>
                </div>

                {/* Staging Location & Detour Distance */}
                <div className="rx-veh-meta-row mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-secondary">
                    <Navigation size={13} className="text-muted" />
                    <span>Stationed: <strong>{veh.location}</strong></span>
                  </span>

                  {evalItem?.feasible && (
                    <span className="font-mono text-success font-bold text-xs">
                      +{evalItem.additionalDistance} km detour
                    </span>
                  )}
                </div>

                {/* Evaluation Outcome Tag */}
                <div className="rx-veh-outcome-box mt-3">
                  {isBest ? (
                    <div className="rx-outcome-pill rx-outcome-best">
                      <Check size={14} className="inline mr-1" />
                      <span>Best Choice ({evalItem?.additionalDistance ?? bestCandidate.additionalDistance} km)</span>
                    </div>
                  ) : evalItem && !evalItem.feasible ? (
                    <div className="rx-outcome-pill rx-outcome-fail">
                      <X size={14} className="inline mr-1" />
                      <span>{evalItem.rejectionReason}</span>
                    </div>
                  ) : evalItem && evalItem.feasible ? (
                    <div className="rx-outcome-pill rx-outcome-suboptimal">
                      <AlertTriangle size={14} className="inline mr-1" />
                      <span>Suboptimal ({evalItem.additionalDistance} km detour)</span>
                    </div>
                  ) : (
                    <div className="rx-outcome-pill rx-outcome-pending">
                      <span>Pending evaluation</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
