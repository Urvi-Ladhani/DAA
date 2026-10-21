/**
 * RouteX — Default Vehicles Fleet
 * Configurable fleet used for Greedy Vehicle Assignment.
 */

export const DEFAULT_VEHICLES = [
  {
    id: 'VH-01',
    name: 'Express Cargo Van',
    type: 'Van',
    location: 'WH-Central',
    capacity: 12, // kg
    currentLoad: 4, // kg (Remaining = 8 kg)
    available: true,
    speedKmh: 45,
  },
  {
    id: 'VH-02',
    name: 'EV Cargo Bike',
    type: 'Bike',
    location: 'Navrangpura',
    capacity: 6, // kg
    currentLoad: 1, // kg (Remaining = 5 kg)
    available: true,
    speedKmh: 25,
  },
  {
    id: 'VH-03',
    name: 'Heavy Reefer Truck',
    type: 'Truck',
    location: 'CG Road',
    capacity: 15, // kg
    currentLoad: 11, // kg (Remaining = 4 kg)
    available: true,
    speedKmh: 40,
  },
  {
    id: 'VH-04',
    name: 'Urban Express Drone',
    type: 'Drone',
    location: 'WH-Central',
    capacity: 4, // kg
    currentLoad: 0, // kg (Remaining = 4 kg)
    available: false, // In maintenance / offline
    speedKmh: 60,
  },
];

export function getDefaultVehicles() {
  return JSON.parse(JSON.stringify(DEFAULT_VEHICLES));
}
