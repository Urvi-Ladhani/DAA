import React from 'react';
import { Package, Clock, Scale, MapPin, CheckCircle2 } from 'lucide-react';

const PRIORITY_THEME = {
  Critical: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  High: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  Medium: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  Low: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
};

const STATUS_THEME = {
  'Pending': { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
  'In Heap': { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
  'Selected': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'Assigned': { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
  'In Transit': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  'Delivered': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
};

export default function OrdersStrip({
  orders,
  selectedOrderId,
  onSelectOrder,
}) {
  return (
    <section className="rx-orders-section" aria-label="Demo Orders Selector">
      {/* Header bar */}
      <div className="rx-orders-header">
        <div className="rx-orders-title-row">
          <div className="rx-orders-icon-wrap">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="rx-orders-heading">5 Shared Demo Orders</h3>
            <p className="rx-orders-subheading">
              Select an order to inspect route allocation, destination node, and payload properties.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive 5-card grid */}
      <div className="rx-orders-grid">
        {orders.map(order => {
          const isSelected = order.id === selectedOrderId;
          const pTheme = PRIORITY_THEME[order.priority] || PRIORITY_THEME.Low;
          const sTheme = STATUS_THEME[order.status] || STATUS_THEME.Pending;

          return (
            <div
              key={order.id}
              role="button"
              tabIndex={0}
              className={`rx-order-card ${isSelected ? 'rx-order-card-selected' : ''}`}
              onClick={() => onSelectOrder(order.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectOrder(order.id)}
              title={`Click to select ${order.id}`}
            >
              {/* Top row: Order ID + Priority Badge */}
              <div className="rx-order-card-top">
                <span className="rx-order-id font-mono">
                  {order.id}
                </span>
                <span
                  className="rx-priority-badge"
                  style={{
                    backgroundColor: pTheme.bg,
                    color: pTheme.text,
                    borderColor: pTheme.border,
                  }}
                >
                  {order.priority}
                </span>
              </div>

              {/* Customer / Item info */}
              <div className="rx-order-customer">
                {order.customer}
              </div>

              {/* Destination */}
              <div className="rx-order-dest-row">
                <MapPin size={16} className="rx-order-dest-icon" />
                <span className="rx-order-dest-name">{order.destination}</span>
              </div>

              {/* Specs: Deadline & Weight */}
              <div className="rx-order-specs-row">
                <span className="rx-order-spec-item" title="Delivery Deadline">
                  <Clock size={14} className="text-muted" />
                  <span>{order.deadline} min</span>
                </span>
                <span className="rx-order-spec-item" title="Payload Weight">
                  <Scale size={14} className="text-muted" />
                  <span>{order.weight} kg</span>
                </span>
              </div>

              {/* Status Footer */}
              <div className="rx-order-status-row">
                <span
                  className="rx-status-badge"
                  style={{
                    backgroundColor: sTheme.bg,
                    color: sTheme.text,
                    borderColor: sTheme.border,
                  }}
                >
                  {order.status === 'Delivered' && (
                    <CheckCircle2 size={13} className="inline mr-1" />
                  )}
                  {order.status || 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
