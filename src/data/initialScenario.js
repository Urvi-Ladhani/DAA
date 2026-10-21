/**
 * RouteX — Scenario State Management & Validation
 */

import { getDefaultOrders } from './demoOrders.js';
import { getDefaultRoadGraph } from './roadGraph.js';
import { getDefaultVehicles } from './vehicles.js';
import { getDefaultPackages, DEFAULT_KNAPSACK_CAPACITY } from './packages.js';

export function createDefaultScenario() {
  return {
    orders: getDefaultOrders(),
    roadGraph: getDefaultRoadGraph(),
    vehicles: getDefaultVehicles(),
    packages: getDefaultPackages(),
    knapsackCapacity: DEFAULT_KNAPSACK_CAPACITY,
    selectedDijkstraSource: 'WH-Central',
    selectedDijkstraDestination: 'Maninagar',
    selectedTSPStops: ['Navrangpura', 'CG Road', 'Satellite', 'Bopal'],
    selectedGreedyOrderId: 'RX-103',
  };
}

export function validateScenario(scenario) {
  const errors = [];

  // 1. Orders validation: Exactly 5 demo orders required!
  if (!Array.isArray(scenario.orders) || scenario.orders.length !== 5) {
    errors.push(`Default scenario requires exactly 5 demo orders (found ${scenario.orders?.length || 0}).`);
  } else {
    const seenIds = new Set();
    const validPriorities = ['Critical', 'High', 'Medium', 'Low'];
    scenario.orders.forEach((ord, i) => {
      if (!ord.id || typeof ord.id !== 'string') {
        errors.push(`Order #${i + 1} has an invalid or missing ID.`);
      } else if (seenIds.has(ord.id)) {
        errors.push(`Duplicate Order ID: "${ord.id}".`);
      } else {
        seenIds.add(ord.id);
      }

      if (!validPriorities.includes(ord.priority)) {
        errors.push(`Order "${ord.id}" has invalid priority "${ord.priority}". Must be Critical, High, Medium, or Low.`);
      }

      if (typeof ord.deadline !== 'number' || ord.deadline <= 0) {
        errors.push(`Order "${ord.id}" deadline must be a positive number of minutes.`);
      }

      if (typeof ord.weight !== 'number' || ord.weight <= 0) {
        errors.push(`Order "${ord.id}" weight must be a positive number of kg.`);
      }
    });
  }

  // 2. Road Graph validation
  if (!scenario.roadGraph || !Array.isArray(scenario.roadGraph.nodes) || scenario.roadGraph.nodes.length < 2) {
    errors.push('Road graph must contain at least 2 nodes.');
  } else {
    const nodeIds = new Set(scenario.roadGraph.nodes.map(n => n.id));
    if (nodeIds.size !== scenario.roadGraph.nodes.length) {
      errors.push('Road graph contains duplicate node IDs.');
    }
    if (!nodeIds.has('WH-Central')) {
      errors.push('Road graph must contain the warehouse node "WH-Central".');
    }

    if (!Array.isArray(scenario.roadGraph.edges) || scenario.roadGraph.edges.length < 1) {
      errors.push('Road graph must contain at least one edge.');
    } else {
      scenario.roadGraph.edges.forEach((edge, idx) => {
        if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
          errors.push(`Edge #${idx + 1} connects unknown node(s): "${edge.from}" -> "${edge.to}".`);
        }
        if (typeof edge.weight !== 'number' || edge.weight < 0) {
          errors.push(`Edge "${edge.from}" <-> "${edge.to}" has invalid weight (must be non-negative).`);
        }
      });
    }
  }

  // 3. Vehicles validation
  if (!Array.isArray(scenario.vehicles) || scenario.vehicles.length === 0) {
    errors.push('Fleet must contain at least one vehicle.');
  } else {
    scenario.vehicles.forEach(v => {
      if (typeof v.capacity !== 'number' || v.capacity <= 0) {
        errors.push(`Vehicle "${v.id}" capacity must be positive.`);
      }
      if (typeof v.currentLoad !== 'number' || v.currentLoad < 0) {
        errors.push(`Vehicle "${v.id}" current load must be >= 0.`);
      }
      if (v.currentLoad > v.capacity) {
        errors.push(`Vehicle "${v.id}" current load (${v.currentLoad} kg) exceeds its capacity (${v.capacity} kg).`);
      }
    });
  }

  // 4. Knapsack validation
  if (typeof scenario.knapsackCapacity !== 'number' || scenario.knapsackCapacity <= 0) {
    errors.push('Knapsack capacity must be a positive integer.');
  }
  if (!Array.isArray(scenario.packages) || scenario.packages.length === 0) {
    errors.push('Knapsack requires at least one package item.');
  } else {
    scenario.packages.forEach(p => {
      if (typeof p.weight !== 'number' || p.weight <= 0) {
        errors.push(`Package "${p.id}" weight must be a positive number.`);
      }
      if (typeof p.value !== 'number' || p.value < 0) {
        errors.push(`Package "${p.id}" value must be a non-negative number.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
