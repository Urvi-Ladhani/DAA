/**
 * RouteX — Default Demo Orders
 * Exactly five deterministic demo orders as per specification.
 */

export const PRIORITY_RANKS = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

export const DEFAULT_DEMO_ORDERS = [
  {
    id: 'RX-101',
    customer: 'Aarav Patel',
    priority: 'High',
    deadline: 20, // in minutes
    destination: 'Navrangpura',
    weight: 4, // in kg
    requiredItem: 'Medical Diagnostic Kits',
    packageId: 'PKG-101',
    value: 80,
  },
  {
    id: 'RX-102',
    customer: 'Diya Shah',
    priority: 'Low',
    deadline: 60,
    destination: 'Satellite',
    weight: 2,
    requiredItem: 'Office Supplies & Documents',
    packageId: 'PKG-102',
    value: 30,
  },
  {
    id: 'RX-103',
    customer: 'Kabir Mehta',
    priority: 'Critical',
    deadline: 15,
    destination: 'CG Road',
    weight: 6,
    requiredItem: 'Emergency Cardiac Stents',
    packageId: 'PKG-103',
    value: 140,
  },
  {
    id: 'RX-104',
    customer: 'Ananya Joshi',
    priority: 'Medium',
    deadline: 35,
    destination: 'Maninagar',
    weight: 3,
    requiredItem: 'Temperature Sensor Units',
    packageId: 'PKG-104',
    value: 50,
  },
  {
    id: 'RX-105',
    customer: 'Rohan Verma',
    priority: 'High',
    deadline: 25,
    destination: 'Bopal',
    weight: 5,
    requiredItem: 'Lithium Backup Battery Pack',
    packageId: 'PKG-105',
    value: 90,
  },
];

export function getDefaultOrders() {
  return JSON.parse(JSON.stringify(DEFAULT_DEMO_ORDERS));
}
