/**
 * RouteX — Default Packages Dataset
 * Package items derived directly from the five deterministic demo orders.
 * (Packages are items associated with orders, not separate demo orders).
 */

export const DEFAULT_PACKAGES = [
  {
    id: 'PKG-101',
    orderId: 'RX-101',
    name: 'Medical Diagnostic Kits',
    weight: 4, // kg
    value: 80, // USD / reward points
  },
  {
    id: 'PKG-102',
    orderId: 'RX-102',
    name: 'Office Supplies & Documents',
    weight: 2,
    value: 30,
  },
  {
    id: 'PKG-103',
    orderId: 'RX-103',
    name: 'Emergency Cardiac Stents',
    weight: 6,
    value: 140,
  },
  {
    id: 'PKG-104',
    orderId: 'RX-104',
    name: 'Temperature Sensor Units',
    weight: 3,
    value: 50,
  },
  {
    id: 'PKG-105',
    orderId: 'RX-105',
    name: 'Lithium Backup Battery Pack',
    weight: 5,
    value: 90,
  },
];

export const DEFAULT_KNAPSACK_CAPACITY = 10; // kg

export function getDefaultPackages() {
  return JSON.parse(JSON.stringify(DEFAULT_PACKAGES));
}
