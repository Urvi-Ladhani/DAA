import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Play,
  AlertCircle,
  Package,
  Truck,
  Network,
  Briefcase,
} from 'lucide-react';
import { validateScenario } from '../data/initialScenario.js';

export default function ScenarioEditor({
  isOpen,
  onClose,
  scenario,
  onApplyScenario,
  onResetToDefaults,
  initialTab = 'orders',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(scenario || {})));
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (scenario) {
      setFormData(JSON.parse(JSON.stringify(scenario)));
    }
    setActiveTab(initialTab);
  }, [scenario, initialTab, isOpen]);

  if (!isOpen) return null;

  // Handler for order field update
  function handleOrderChange(idx, field, value) {
    const nextOrders = [...formData.orders];
    nextOrders[idx] = {
      ...nextOrders[idx],
      [field]: field === 'deadline' || field === 'weight' || field === 'value' ? Number(value) : value,
    };
    setFormData({ ...formData, orders: nextOrders });
  }

  // Handler for vehicle update
  function handleVehicleChange(idx, field, value) {
    const nextVehicles = [...formData.vehicles];
    nextVehicles[idx] = {
      ...nextVehicles[idx],
      [field]: field === 'capacity' || field === 'currentLoad' ? Number(value) : field === 'available' ? Boolean(value) : value,
    };
    setFormData({ ...formData, vehicles: nextVehicles });
  }

  // Handler for edge weight update
  function handleEdgeWeightChange(idx, value) {
    const nextEdges = [...formData.roadGraph.edges];
    nextEdges[idx] = {
      ...nextEdges[idx],
      weight: Number(value),
    };
    setFormData({
      ...formData,
      roadGraph: { ...formData.roadGraph, edges: nextEdges },
    });
  }

  // Handler for package update
  function handlePackageChange(idx, field, value) {
    const nextPkgs = [...formData.packages];
    nextPkgs[idx] = {
      ...nextPkgs[idx],
      [field]: Number(value),
    };
    setFormData({ ...formData, packages: nextPkgs });
  }

  // Submit & Validate
  function handleSaveAndRun() {
    const validation = validateScenario(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    onApplyScenario(formData);
    onClose();
  }

  // Reset to default 5 orders & fleet
  function handleReset() {
    onResetToDefaults();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="clean-modal-header">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customize Scenario Inputs</h3>
            <span className="text-xs text-slate-500">Edit 5 demo orders, road graph, fleet &amp; packages</span>
          </div>

          <button className="clean-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Validation Errors Banner */}
        {validationErrors.length > 0 && (
          <div className="clean-error-banner">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <div className="text-xs text-rose-800">
              <strong className="block font-bold">Please correct the following errors:</strong>
              <ul className="list-disc list-inside mt-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="clean-modal-tabs">
          <button
            className={`modal-tab-pill ${activeTab === 'orders' ? 'tab-pill-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={14} />
            <span>5 Demo Orders</span>
          </button>
          <button
            className={`modal-tab-pill ${activeTab === 'vehicles' ? 'tab-pill-active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <Truck size={14} />
            <span>Vehicle Fleet</span>
          </button>
          <button
            className={`modal-tab-pill ${activeTab === 'graph' ? 'tab-pill-active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            <Network size={14} />
            <span>Road Graph</span>
          </button>
          <button
            className={`modal-tab-pill ${activeTab === 'knapsack' ? 'tab-pill-active' : ''}`}
            onClick={() => setActiveTab('knapsack')}
          >
            <Briefcase size={14} />
            <span>Knapsack</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="clean-modal-body">
          {activeTab === 'orders' && formData.orders && (
            <div className="space-y-3">
              {formData.orders.map((ord, idx) => (
                <div key={ord.id} className="clean-editor-subcard">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-indigo-700">{ord.id}</span>
                    <span className="text-[11px] text-slate-500">{ord.customer}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    <div>
                      <label className="clean-input-label">Priority</label>
                      <select
                        value={ord.priority}
                        onChange={(e) => handleOrderChange(idx, 'priority', e.target.value)}
                        className="clean-select"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="clean-input-label">Deadline (m)</label>
                      <input
                        type="number"
                        min="1"
                        value={ord.deadline}
                        onChange={(e) => handleOrderChange(idx, 'deadline', e.target.value)}
                        className="clean-input"
                      />
                    </div>

                    <div>
                      <label className="clean-input-label">Weight (kg)</label>
                      <input
                        type="number"
                        min="1"
                        value={ord.weight}
                        onChange={(e) => handleOrderChange(idx, 'weight', e.target.value)}
                        className="clean-input"
                      />
                    </div>

                    <div>
                      <label className="clean-input-label">Destination</label>
                      <input
                        type="text"
                        value={ord.destination}
                        onChange={(e) => handleOrderChange(idx, 'destination', e.target.value)}
                        className="clean-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vehicles' && formData.vehicles && (
            <div className="space-y-3">
              {formData.vehicles.map((v, idx) => (
                <div key={v.id} className="clean-editor-subcard">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{v.id} ({v.name})</span>
                    <span className="text-[11px] text-slate-500">{v.type}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    <div>
                      <label className="clean-input-label">Capacity (kg)</label>
                      <input
                        type="number"
                        min="1"
                        value={v.capacity}
                        onChange={(e) => handleVehicleChange(idx, 'capacity', e.target.value)}
                        className="clean-input"
                      />
                    </div>

                    <div>
                      <label className="clean-input-label">Load (kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={v.currentLoad}
                        onChange={(e) => handleVehicleChange(idx, 'currentLoad', e.target.value)}
                        className="clean-input"
                      />
                    </div>

                    <div>
                      <label className="clean-input-label">Location</label>
                      <select
                        value={v.location}
                        onChange={(e) => handleVehicleChange(idx, 'location', e.target.value)}
                        className="clean-select"
                      >
                        {formData.roadGraph?.nodes?.map(n => (
                          <option key={n.id} value={n.id}>{n.id}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="clean-input-label">Availability</label>
                      <select
                        value={v.available ? 'true' : 'false'}
                        onChange={(e) => handleVehicleChange(idx, 'available', e.target.value === 'true')}
                        className="clean-select"
                      >
                        <option value="true">Available</option>
                        <option value="false">Maintenance (Offline)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'graph' && formData.roadGraph && (
            <div className="space-y-2">
              <span className="text-xs text-slate-500 mb-2 block">Configure distance (km) between road intersections:</span>
              <div className="grid grid-cols-2 gap-2">
                {formData.roadGraph.edges.map((edge, idx) => (
                  <div key={`edge-${idx}`} className="clean-editor-subcard flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {edge.from.substring(0, 4)} ↔ {edge.to.substring(0, 4)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={edge.weight}
                        onChange={(e) => handleEdgeWeightChange(idx, e.target.value)}
                        className="clean-input w-20 text-right"
                      />
                      <span className="text-xs text-slate-400">km</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'knapsack' && formData.packages && (
            <div className="space-y-3">
              <div className="clean-editor-subcard flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-700">Carrier Payload Capacity Limit:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={formData.knapsackCapacity}
                    onChange={(e) => setFormData({ ...formData, knapsackCapacity: Number(e.target.value) })}
                    className="clean-input w-24 text-right"
                  />
                  <span className="text-xs text-slate-500">kg</span>
                </div>
              </div>

              {formData.packages.map((pkg, idx) => (
                <div key={pkg.id} className="clean-editor-subcard flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-800">{pkg.id}</span>
                    <span className="text-[11px] text-slate-500 block">{pkg.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Weight:</span>
                      <input
                        type="number"
                        min="1"
                        value={pkg.weight}
                        onChange={(e) => handlePackageChange(idx, 'weight', e.target.value)}
                        className="clean-input w-16 text-right"
                      />
                      <span className="text-xs text-slate-400">kg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Value:</span>
                      <input
                        type="number"
                        min="0"
                        value={pkg.value}
                        onChange={(e) => handlePackageChange(idx, 'value', e.target.value)}
                        className="clean-input w-16 text-right"
                      />
                      <span className="text-xs text-slate-400">$</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="clean-modal-footer">
          <button className="clean-btn-subtle" onClick={handleReset}>
            <RotateCcw size={14} className="inline mr-1 text-slate-400" />
            <span>Reset to 5 Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button className="clean-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="clean-btn-primary" onClick={handleSaveAndRun}>
              <Play size={14} className="inline mr-1" />
              <span>Apply &amp; Recalculate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
