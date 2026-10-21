/**
 * RouteX — Algorithm 3: Greedy Vehicle Assignment
 * Assigns a feasible delivery vehicle to an order using deterministic greedy heuristic.
 *
 * Greedy Policy:
 * 1. Reject unavailable vehicles (e.g. maintenance/offline).
 * 2. Reject vehicles with insufficient remaining payload capacity (capacity - currentLoad < order.weight).
 * 3. Calculate additional travel distance:
 *    Leg 1: Vehicle Location → Warehouse (Pickup)
 *    Leg 2: Warehouse → Customer Destination (Dropoff)
 *    Total Additional Distance = dist(vehicleLoc, WH) + dist(WH, dest)
 * 4. Choose feasible vehicle with minimum total additional distance.
 * 5. Break ties deterministically using Vehicle ID lexicographical order.
 */

import { buildAdjacencyMatrix } from '../data/roadGraph.js';

export const GREEDY_ASSIGNMENT_METADATA = {
  id: 'greedy-vehicle-assignment',
  name: 'Greedy Vehicle Assignment',
  category: 'Greedy Heuristics',
  timeComplexity: {
    perOrder: 'O(V_fleet · (V_nodes + E_edges))',
    fleetEvaluation: 'O(M · N)',
  },
  spaceComplexity: 'O(M) for fleet state snapshots',
  assumptions: 'Local greedy selection minimizing immediate additional travel distance. Does not guarantee globally optimal fleet scheduling across all future orders.',
};

/**
 * Computes shortest path distance between two nodes using Floyd-Warshall precomputed distances.
 */
function getGraphDistance(matrix, indexMap, fromNode, toNode) {
  if (fromNode === toNode) return 0;
  const u = indexMap.get(fromNode);
  const v = indexMap.get(toNode);
  if (u === undefined || v === undefined) return Infinity;
  return matrix[u][v];
}

/**
 * Runs the Greedy Vehicle Assignment algorithm for a target order.
 */
export function runGreedyVehicleAssignment(order, vehicles, roadGraph, warehouseId = 'WH-Central') {
  // Precompute all-pairs shortest distances on road graph for accurate distance evaluation
  const { nodeIds, matrix: rawMatrix, indexMap } = buildAdjacencyMatrix(roadGraph);
  const n = nodeIds.length;
  const dist = Array.from({ length: n }, (_, i) => [...rawMatrix[i]]);
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  const trace = [];
  const candidateEvaluations = [];
  let bestCandidate = null;

  // Snapshot of vehicles before assignment
  const fleetSnapshot = JSON.parse(JSON.stringify(vehicles));

  trace.push({
    op: 'START_ASSIGNMENT',
    codeTag: 'START_ASSIGNMENT',
    title: `Initiate Greedy Assignment for Order "${order.id}"`,
    order,
    currentVehicle: null,
    bestCandidate: null,
    candidateEvaluations: [],
    comparisons: [
      `Order Weight: ${order.weight} kg`,
      `Destination: ${order.destination}`,
      `Warehouse Pickup Hub: ${warehouseId}`,
      `Fleet Size: ${vehicles.length} vehicles`,
    ],
    calculations: `Greedy objective: min( additional_distance = dist(vehicle, WH) + dist(WH, "${order.destination}") )`,
    decision: 'Evaluate all vehicles in fleet sequentially against feasibility constraints.',
    whatChanges: 'Evaluations list initialized.',
    whatNext: `Begin evaluating candidate vehicle "${vehicles[0]?.id}".`,
    snapshot: {
      order,
      vehicles: fleetSnapshot,
      bestCandidate: null,
    },
  });

  for (let idx = 0; idx < vehicles.length; idx++) {
    const v = vehicles[idx]; // [TAG: EVALUATE_VEHICLE]
    const remainingCap = v.capacity - v.currentLoad;

    // Constraint 1: Availability
    if (!v.available) { // [TAG: CHECK_AVAILABILITY]
      const evalItem = {
        vehicleId: v.id,
        vehicleName: v.name,
        feasible: false,
        rejectionReason: 'Vehicle unavailable (offline or in maintenance)',
        remainingCapacity: remainingCap,
        additionalDistance: Infinity,
        leg1: Infinity,
        leg2: Infinity,
      };
      candidateEvaluations.push(evalItem);

      trace.push({
        op: 'REJECT_UNAVAILABLE',
        codeTag: 'CHECK_AVAILABILITY',
        title: `Vehicle "${v.id}" Rejected: Unavailable`,
        order,
        currentVehicle: v,
        bestCandidate,
        candidateEvaluations: [...candidateEvaluations],
        comparisons: [`Status: ${v.available ? 'Available' : 'UNAVAILABLE / MAINTENANCE'}`],
        calculations: `vehicle.available === false`,
        decision: `REJECT "${v.id}": Vehicle is currently offline.`,
        whatChanges: `Vehicle "${v.id}" marked infeasible.`,
        whatNext: idx + 1 < vehicles.length ? `Evaluate next vehicle "${vehicles[idx + 1].id}".` : 'Conclude assignment.',
        snapshot: {
          order,
          vehicles: fleetSnapshot,
          bestCandidate,
        },
      });
      continue;
    }

    // Constraint 2: Capacity Feasibility
    if (remainingCap < order.weight) { // [TAG: CHECK_CAPACITY]
      const evalItem = {
        vehicleId: v.id,
        vehicleName: v.name,
        feasible: false,
        rejectionReason: `Insufficient remaining capacity (${remainingCap} kg remaining < ${order.weight} kg required)`,
        remainingCapacity: remainingCap,
        additionalDistance: Infinity,
        leg1: Infinity,
        leg2: Infinity,
      };
      candidateEvaluations.push(evalItem);

      trace.push({
        op: 'REJECT_CAPACITY',
        codeTag: 'CHECK_CAPACITY',
        title: `Vehicle "${v.id}" Rejected: Capacity Exceeded`,
        order,
        currentVehicle: v,
        bestCandidate,
        candidateEvaluations: [...candidateEvaluations],
        comparisons: [
          `Remaining payload capacity: ${remainingCap} kg (Capacity: ${v.capacity} kg, Current Load: ${v.currentLoad} kg)`,
          `Order weight requirement: ${order.weight} kg`,
        ],
        calculations: `${remainingCap} kg < ${order.weight} kg (Short by ${order.weight - remainingCap} kg)`,
        decision: `REJECT "${v.id}": Overloading payload capacity is strictly prohibited.`,
        whatChanges: `Vehicle "${v.id}" marked infeasible.`,
        whatNext: idx + 1 < vehicles.length ? `Evaluate next vehicle "${vehicles[idx + 1].id}".` : 'Conclude assignment.',
        snapshot: {
          order,
          vehicles: fleetSnapshot,
          bestCandidate,
        },
      });
      continue;
    }

    // Feasible Candidate: Calculate Additional Distance
    // Leg 1: Current location -> Warehouse
    const leg1Dist = getGraphDistance(dist, indexMap, v.location, warehouseId); // [TAG: COMPUTE_DISTANCE]
    // Leg 2: Warehouse -> Order Destination
    const leg2Dist = getGraphDistance(dist, indexMap, warehouseId, order.destination);
    const totalAdditionalDist = leg1Dist + leg2Dist;

    const isBetter =
      bestCandidate === null ||
      totalAdditionalDist < bestCandidate.additionalDistance ||
      (totalAdditionalDist === bestCandidate.additionalDistance && String(v.id).localeCompare(String(bestCandidate.vehicleId)) < 0); // [TAG: COMPARE_CANDIDATE]

    const evalItem = {
      vehicleId: v.id,
      vehicleName: v.name,
      feasible: true,
      remainingCapacity: remainingCap,
      additionalDistance: totalAdditionalDist,
      leg1: leg1Dist,
      leg2: leg2Dist,
      isBetter,
    };
    candidateEvaluations.push(evalItem);

    if (isBetter) {
      const prevBest = bestCandidate;
      bestCandidate = {
        vehicleId: v.id,
        vehicleName: v.name,
        additionalDistance: totalAdditionalDist,
        leg1: leg1Dist,
        leg2: leg2Dist,
        remainingCapacity: remainingCap,
      };

      trace.push({
        op: 'UPDATE_BEST_CANDIDATE',
        codeTag: 'COMPARE_CANDIDATE',
        title: `Vehicle "${v.id}" is New Best Candidate (${totalAdditionalDist} km)`,
        order,
        currentVehicle: v,
        bestCandidate,
        candidateEvaluations: [...candidateEvaluations],
        comparisons: [
          `Leg 1 (${v.location} → ${warehouseId}): ${leg1Dist} km`,
          `Leg 2 (${warehouseId} → ${order.destination}): ${leg2Dist} km`,
          `Total Additional Distance: ${totalAdditionalDist} km`,
          prevBest ? `Previous Best: "${prevBest.vehicleId}" (${prevBest.additionalDistance} km)` : 'First feasible candidate.',
        ],
        calculations: `${totalAdditionalDist} km ${prevBest ? `< ${prevBest.additionalDistance} km` : '(initial baseline)'}`,
        decision: `Vehicle "${v.id}" selected as provisional best candidate (lowest additional travel distance).`,
        whatChanges: `bestCandidate = "${v.id}" (${totalAdditionalDist} km)`,
        whatNext: idx + 1 < vehicles.length ? `Evaluate next vehicle "${vehicles[idx + 1].id}".` : 'Conclude assignment.',
        snapshot: {
          order,
          vehicles: fleetSnapshot,
          bestCandidate,
        },
      });
    } else {
      trace.push({
        op: 'REJECT_SUBOPTIMAL',
        codeTag: 'COMPARE_CANDIDATE',
        title: `Vehicle "${v.id}" Feasible but Suboptimal (${totalAdditionalDist} km)`,
        order,
        currentVehicle: v,
        bestCandidate,
        candidateEvaluations: [...candidateEvaluations],
        comparisons: [
          `Candidate "${v.id}" total additional distance: ${totalAdditionalDist} km`,
          `Current best candidate "${bestCandidate.vehicleId}": ${bestCandidate.additionalDistance} km`,
        ],
        calculations: `${totalAdditionalDist} km ≥ ${bestCandidate.additionalDistance} km`,
        decision: `Keep "${bestCandidate.vehicleId}" as best candidate; "${v.id}" requires more travel distance.`,
        whatChanges: 'bestCandidate unchanged.',
        whatNext: idx + 1 < vehicles.length ? `Evaluate next vehicle "${vehicles[idx + 1].id}".` : 'Conclude assignment.',
        snapshot: {
          order,
          vehicles: fleetSnapshot,
          bestCandidate,
        },
      });
    }
  }

  // Final Assignment: Update fleet state
  const updatedVehicles = JSON.parse(JSON.stringify(vehicles));
  if (bestCandidate) { // [TAG: ASSIGN_VEHICLE]
    const assignedVehicle = updatedVehicles.find(v => v.id === bestCandidate.vehicleId);
    if (assignedVehicle) {
      assignedVehicle.currentLoad += order.weight;
      assignedVehicle.assignedOrders = assignedVehicle.assignedOrders || [];
      assignedVehicle.assignedOrders.push(order.id);
    }
  }

  trace.push({
    op: 'ASSIGNMENT_COMPLETE',
    codeTag: 'ASSIGN_VEHICLE',
    title: bestCandidate
      ? `Order "${order.id}" Assigned to Vehicle "${bestCandidate.vehicleId}"`
      : `No Feasible Vehicle Available for Order "${order.id}"`,
    order,
    currentVehicle: bestCandidate ? updatedVehicles.find(v => v.id === bestCandidate.vehicleId) : null,
    bestCandidate,
    candidateEvaluations: [...candidateEvaluations],
    comparisons: bestCandidate
      ? [
          `Assigned Vehicle: ${bestCandidate.vehicleId} (${bestCandidate.vehicleName})`,
          `Total Additional Route Distance: ${bestCandidate.additionalDistance} km`,
          `Updated Vehicle Load: ${(updatedVehicles.find(v => v.id === bestCandidate.vehicleId)?.currentLoad)} kg`,
        ]
      : ['All candidate vehicles failed feasibility checks (either offline or exceeded payload capacity).'],
    calculations: bestCandidate
      ? `Greedy decision verified: argmin_v (dist(v.loc, WH) + dist(WH, "${order.destination}"))`
      : 'Feasible set is empty: F = ∅',
    decision: bestCandidate
      ? `Dispatched order "${order.id}" via "${bestCandidate.vehicleId}". Note: Greedy decision is a local optimum and may not yield global fleet optimality.`
      : 'Order dispatch deferred until vehicle capacity frees up.',
    whatChanges: bestCandidate ? `Vehicle "${bestCandidate.vehicleId}" load increased by ${order.weight} kg.` : 'Fleet state unchanged.',
    whatNext: 'Ready for subsequent order assignments or fleet dispatch review.',
    snapshot: {
      order,
      vehicles: updatedVehicles,
      bestCandidate,
    },
  });

  return {
    trace,
    bestCandidate,
    candidateEvaluations,
    updatedVehicles,
  };
}
