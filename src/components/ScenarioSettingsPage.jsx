import React, { useState } from 'react';
import {
  Package,
  Truck,
  Network,
  Briefcase,
  Building2,
  AlertCircle,
  RotateCcw,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { validateScenario, createDefaultScenario } from '../data/initialScenario.js';

export default function ScenarioSettingsPage({
  scenario,
  onSaveScenario,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(scenario)));
  const [validationErrors, setValidationErrors] = useState([]);

  // Handlers for Order fields
  function handleOrderChange(idx, field, value) {
    const updatedOrders = [...formData.orders];
    updatedOrders[idx] = {
      ...updatedOrders[idx],
      [field]: field === 'deadline' || field === 'weight' || field === 'value' ? Number(value) : value,
    };
    setFormData({ ...formData, orders: updatedOrders });
  }

  // Handlers for Vehicle fields
  function handleVehicleChange(idx, field, value) {
    const updatedVehicles = [...formData.vehicles];
    updatedVehicles[idx] = {
      ...updatedVehicles[idx],
      [field]:
        field === 'capacity' || field === 'currentLoad'
          ? Number(value)
          : field === 'available'
          ? Boolean(value)
          : value,
    };
    setFormData({ ...formData, vehicles: updatedVehicles });
  }

  // Handlers for Road Graph Edge weight
  function handleEdgeWeightChange(idx, value) {
    const updatedEdges = [...formData.roadGraph.edges];
    updatedEdges[idx] = {
      ...updatedEdges[idx],
      weight: Number(value),
    };
    setFormData({
      ...formData,
      roadGraph: { ...formData.roadGraph, edges: updatedEdges },
    });
  }

  // Handlers for Package fields
  function handlePackageChange(idx, field, value) {
    const updatedPkgs = [...formData.packages];
    updatedPkgs[idx] = {
      ...updatedPkgs[idx],
      [field]: Number(value),
    };
    setFormData({ ...formData, packages: updatedPkgs });
  }

  // Save changes
  function handleSave() {
    const validation = validateScenario(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setSuccessToast(true);
    setTimeout(() => {
      onSaveScenario(formData);
    }, 400);
  }

  // Reset to default scenario
  function handleResetDefaults() {
    const defaults = createDefaultScenario();
    setFormData(defaults);
    setValidationErrors([]);
  }

  return (
    <div className="rx-settings-page-container">
      {/* Page Header */}
      <div className="rx-settings-header-banner">
        <div className="rx-settings-header-content">
          <button
            className="rx-back-btn"
            onClick={onCancel}
            title="Return to Algorithm Simulation"
          >
            <ArrowLeft size={18} />
            <span>Back to Simulation</span>
          </button>

          <h1 className="rx-settings-main-title">Scenario Settings</h1>
          <p className="rx-settings-subtitle">
            Configure the orders, road network, warehouses, vehicles, and package data used by the simulations.
          </p>
        </div>
      </div>

      {/* Main Settings Body */}
      <main className="rx-settings-main-body">
        {/* Validation Errors Notice */}
        {validationErrors.length > 0 && (
          <div className="rx-error-notice" role="alert">
            <AlertCircle size={22} className="rx-error-icon shrink-0" />
            <div>
              <strong className="rx-error-title">Cannot Save Scenario: Validation Issues Found</strong>
              <ul className="rx-error-list">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 1: ORDERS */}
        <section className="rx-settings-section" aria-labelledby="section-orders-title">
          <div className="rx-section-header">
            <div className="rx-section-icon-box">
              <Package size={22} className="text-primary" />
            </div>
            <div>
              <h2 id="section-orders-title" className="rx-section-title">
                1. Demo Orders (Exact Five Records)
              </h2>
              <p className="rx-section-desc">
                The scenario contains exactly five demo orders. Adjust deadlines, priorities, and weights to test priority queue scheduling and vehicle capacity allocation.
              </p>
            </div>
          </div>

          <div className="rx-orders-edit-grid">
            {formData.orders.map((ord, idx) => (
              <div key={ord.id} className="rx-order-edit-card">
                <div className="rx-order-edit-card-header">
                  <div className="flex items-center gap-2">
                    <span className="rx-order-edit-id font-mono">{ord.id}</span>
                    <span className="rx-order-edit-customer">{ord.customer}</span>
                  </div>
                  <span className="text-muted text-sm">{ord.requiredItem}</span>
                </div>

                <div className="rx-form-fields-grid">
                  {/* Priority */}
                  <div className="rx-form-group">
                    <label className="rx-form-label">Priority</label>
                    <select
                      value={ord.priority}
                      onChange={(e) => handleOrderChange(idx, 'priority', e.target.value)}
                      className="rx-form-select"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Deadline */}
                  <div className="rx-form-group">
                    <label className="rx-form-label">Deadline (min)</label>
                    <input
                      type="number"
                      min="1"
                      value={ord.deadline}
                      onChange={(e) => handleOrderChange(idx, 'deadline', e.target.value)}
                      className="rx-form-input"
                    />
                  </div>

                  {/* Weight */}
                  <div className="rx-form-group">
                    <label className="rx-form-label">Weight (kg)</label>
                    <input
                      type="number"
                      min="1"
                      value={ord.weight}
                      onChange={(e) => handleOrderChange(idx, 'weight', e.target.value)}
                      className="rx-form-input"
                    />
                  </div>

                  {/* Destination */}
                  <div className="rx-form-group">
                    <label className="rx-form-label">Destination</label>
                    <select
                      value={ord.destination}
                      onChange={(e) => handleOrderChange(idx, 'destination', e.target.value)}
                      className="rx-form-select"
                    >
                      {formData.roadGraph.nodes
                        .filter(n => n.type === 'destination')
                        .map(n => (
                          <option key={n.id} value={n.id}>
                            {n.id}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: ROAD NETWORK */}
        <section className="rx-settings-section" aria-labelledby="section-network-title">
          <div className="rx-section-header">
            <div className="rx-section-icon-box">
              <Network size={22} className="text-primary" />
            </div>
            <div>
              <h2 id="section-network-title" className="rx-section-title">
                2. Urban Road Network
              </h2>
              <p className="rx-section-desc">
                Tune road edge distances (in kilometers) connecting warehouse hubs, transit junctions, and destinations.
              </p>
            </div>
          </div>

          <div className="rx-edges-edit-grid">
            {formData.roadGraph.edges.map((edge, idx) => (
              <div key={`edge-${idx}`} className="rx-edge-edit-card">
                <div className="rx-edge-nodes-label font-mono">
                  <span className="font-bold text-primary">{edge.from}</span>
                  <span className="text-muted"> ↔ </span>
                  <span className="font-bold text-slate-800">{edge.to}</span>
                </div>

                <div className="rx-edge-weight-input-wrap">
                  <input
                    type="number"
                    min="1"
                    value={edge.weight}
                    onChange={(e) => handleEdgeWeightChange(idx, e.target.value)}
                    className="rx-form-input rx-edge-input font-mono"
                  />
                  <span className="rx-unit-tag">km</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: WAREHOUSES */}
        <section className="rx-settings-section" aria-labelledby="section-warehouse-title">
          <div className="rx-section-header">
            <div className="rx-section-icon-box">
              <Building2 size={22} className="text-primary" />
            </div>
            <div>
              <h2 id="section-warehouse-title" className="rx-section-title">
                3. Warehouses &amp; Fulfillment Hub
              </h2>
              <p className="rx-section-desc">
                Primary supply node initiating deliveries and housing inventory for urban parcel distribution.
              </p>
            </div>
          </div>

          <div className="rx-warehouse-card">
            <div className="rx-warehouse-header">
              <div>
                <h3 className="text-lg font-bold text-slate-900">WH-Central (Main Distribution Hub)</h3>
                <span className="text-sm text-muted">Primary Origin Node • City Center Coordinates (360, 240)</span>
              </div>
              <span className="rx-status-badge rx-status-available">Active Hub</span>
            </div>

            <div className="rx-warehouse-details-grid">
              <div className="rx-detail-item">
                <span className="rx-detail-label">Staging Capacity</span>
                <strong className="rx-detail-val">4 Vehicle Bays</strong>
              </div>
              <div className="rx-detail-item">
                <span className="rx-detail-label">Inventory Categories</span>
                <strong className="rx-detail-val">5 Package Item Types</strong>
              </div>
              <div className="rx-detail-item">
                <span className="rx-detail-label">Connected Arterials</span>
                <strong className="rx-detail-val">4 Direct Highway Roads</strong>
              </div>
              <div className="rx-detail-item">
                <span className="rx-detail-label">Dispatch Protocol</span>
                <strong className="rx-detail-val">Priority Min-Heap</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: VEHICLES FLEET */}
        <section className="rx-settings-section" aria-labelledby="section-vehicles-title">
          <div className="rx-section-header">
            <div className="rx-section-icon-box">
              <Truck size={22} className="text-primary" />
            </div>
            <div>
              <h2 id="section-vehicles-title" className="rx-section-title">
                4. Vehicle Fleet
              </h2>
              <p className="rx-section-desc">
                Configure candidate vehicles for the Greedy Assignment algorithm, including payload capacity, current load, and availability.
              </p>
            </div>
          </div>

          <div className="rx-vehicles-edit-grid">
            {formData.vehicles.map((veh, idx) => (
              <div key={veh.id} className="rx-vehicle-edit-card">
                <div className="rx-vehicle-edit-top">
                  <div>
                    <span className="rx-vehicle-id font-mono">{veh.id}</span>
                    <strong className="rx-vehicle-name">{veh.name}</strong>
                  </div>
                  <span className="rx-vehicle-type-tag">{veh.type}</span>
                </div>

                <div className="rx-form-fields-grid mt-3">
                  <div className="rx-form-group">
                    <label className="rx-form-label">Max Capacity (kg)</label>
                    <input
                      type="number"
                      min="1"
                      value={veh.capacity}
                      onChange={(e) => handleVehicleChange(idx, 'capacity', e.target.value)}
                      className="rx-form-input"
                    />
                  </div>

                  <div className="rx-form-group">
                    <label className="rx-form-label">Current Load (kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={veh.currentLoad}
                      onChange={(e) => handleVehicleChange(idx, 'currentLoad', e.target.value)}
                      className="rx-form-input"
                    />
                  </div>

                  <div className="rx-form-group">
                    <label className="rx-form-label">Current Location</label>
                    <select
                      value={veh.location}
                      onChange={(e) => handleVehicleChange(idx, 'location', e.target.value)}
                      className="rx-form-select"
                    >
                      {formData.roadGraph.nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.id}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rx-form-group">
                    <label className="rx-form-label">Status</label>
                    <select
                      value={veh.available ? 'true' : 'false'}
                      onChange={(e) => handleVehicleChange(idx, 'available', e.target.value === 'true')}
                      className="rx-form-select"
                    >
                      <option value="true">Available (Ready for Dispatch)</option>
                      <option value="false">Maintenance (Offline)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: PACKAGE SELECTION (KNAPSACK) */}
        <section className="rx-settings-section" aria-labelledby="section-knapsack-title">
          <div className="rx-section-header">
            <div className="rx-section-icon-box">
              <Briefcase size={22} className="text-primary" />
            </div>
            <div>
              <h2 id="section-knapsack-title" className="rx-section-title">
                5. Package Selection (0/1 Knapsack)
              </h2>
              <p className="rx-section-desc">
                Tune the carrier capacity limit and package weights and values used to populate the dynamic programming table.
              </p>
            </div>
          </div>

          {/* Knapsack Capacity Control */}
          <div className="rx-capacity-control-card">
            <label className="rx-capacity-label">
              Carrier Payload Capacity Limit:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={formData.knapsackCapacity}
                onChange={(e) => setFormData({ ...formData, knapsackCapacity: Number(e.target.value) })}
                className="rx-form-input rx-capacity-input font-mono"
              />
              <span className="rx-unit-tag">kg</span>
            </div>
          </div>

          <div className="rx-packages-edit-grid mt-4">
            {formData.packages.map((pkg, idx) => (
              <div key={pkg.id} className="rx-pkg-edit-card">
                <div>
                  <span className="rx-pkg-id font-mono">{pkg.id}</span>
                  <div className="rx-pkg-name">{pkg.name}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rx-form-group">
                    <label className="rx-form-label">Weight</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={pkg.weight}
                        onChange={(e) => handlePackageChange(idx, 'weight', e.target.value)}
                        className="rx-form-input w-24 font-mono"
                      />
                      <span className="rx-unit-tag">kg</span>
                    </div>
                  </div>

                  <div className="rx-form-group">
                    <label className="rx-form-label">Value</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={pkg.value}
                        onChange={(e) => handlePackageChange(idx, 'value', e.target.value)}
                        className="rx-form-input w-24 font-mono"
                      />
                      <span className="rx-unit-tag">$</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="rx-settings-bottom-bar" role="region" aria-label="Settings Action Bar">
        <div className="rx-settings-bar-content">
          <button
            className="rx-btn-reset-defaults"
            onClick={handleResetDefaults}
            title="Restore default 5 demo orders, road network, and vehicles"
          >
            <RotateCcw size={16} />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              className="rx-btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              className="rx-btn-primary"
              onClick={handleSave}
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
