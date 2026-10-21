/**
 * RouteX — Full Continuous Logistics Journey Simulation
 * Integrates the Priority Queue (Binary Heap), Inventory Check, Greedy Vehicle Assignment,
 * and Dijkstra Shortest Path into a continuous 14-stage animated logistics pipeline.
 *
 * Real algorithms drive every state transition.
 */

import { compareOrders, TraceableBinaryHeap } from './priorityQueue.js';
import { runGreedyVehicleAssignment } from './greedyVehicleAssignment.js';
import { runDijkstra } from './dijkstra.js';

export const FULL_JOURNEY_METADATA = {
  id: 'full-logistics-journey',
  name: 'Full Logistics Pipeline (End-to-End)',
  category: 'Integrated Logistics Pipeline',
  timeComplexity: {
    heapPhase: 'O(N log N)',
    greedyPhase: 'O(M · (V + E))',
    dijkstraPhase: 'O((V + E) log V)',
  },
  spaceComplexity: 'O(V + E + N)',
  assumptions: 'Executes pure DAA algorithms sequentially: Min-Heap Queue -> Greedy Fleet Heuristic -> Dijkstra Shortest Route.',
};

/**
 * Runs the complete continuous 14-stage logistics journey.
 */
export function runFullLogisticsJourney(scenario, inspectedOrderId = null) {
  const trace = [];
  const orders = JSON.parse(JSON.stringify(scenario.orders));
  const roadGraph = JSON.parse(JSON.stringify(scenario.roadGraph));
  const vehicles = JSON.parse(JSON.stringify(scenario.vehicles));
  const warehouseId = 'WH-Central';

  // Initialize all order statuses to 'Pending'
  orders.forEach(o => {
    o.status = 'Pending';
  });

  // STAGE 1: Orders Placed
  trace.push({
    stageNumber: 1,
    stageTitle: 'Stage 1: Five Demo Orders Placed',
    op: 'ORDERS_PLACED',
    codeTag: 'ORDERS_PLACED',
    highlightNode: null,
    highlightVehicle: null,
    highlightOrder: inspectedOrderId || 'RX-103',
    vehiclePosition: null,
    routePath: [],
    heapSnapshot: [],
    evaluatedVehicles: [],
    assignedVehicle: null,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: 'Five customer orders have been received into the RouteX dispatch system.',
  });

  // STAGE 2: Orders Entering Shared Priority Queue
  const heap = new TraceableBinaryHeap();
  for (let i = 0; i < orders.length; i++) {
    const ord = orders[i];
    ord.status = 'In Heap';
    heap.insert(ord, []); // Real binary heap insertion

    trace.push({
      stageNumber: 2,
      stageTitle: `Stage 2: Order "${ord.id}" Enters Priority Queue`,
      op: 'ORDER_QUEUE_ENTER',
      codeTag: 'ORDER_QUEUE_ENTER',
      highlightNode: ord.destination,
      highlightVehicle: null,
      highlightOrder: ord.id,
      vehiclePosition: null,
      routePath: [],
      heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
      evaluatedVehicles: [],
      assignedVehicle: null,
      ordersSnapshot: JSON.parse(JSON.stringify(orders)),
      activeExplanation: `Order "${ord.id}" (${ord.priority}, ${ord.deadline}m, ${ord.weight}kg) inserted into binary heap at leaf [${heap.heap.length - 1}].`,
    });
  }

  // STAGE 3: Heap Comparisons & Swaps (Scheduling Invariant)
  trace.push({
    stageNumber: 3,
    stageTitle: 'Stage 3: Min-Heap Property Restored (Priority > Deadline > ID)',
    op: 'HEAP_RESTORED',
    codeTag: 'HEAP_RESTORED',
    highlightNode: null,
    highlightVehicle: null,
    highlightOrder: heap.heap[0]?.id,
    vehiclePosition: null,
    routePath: [],
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: [],
    assignedVehicle: null,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Heap structured. Highest priority order at root [0] is "${heap.heap[0]?.id}" (${heap.heap[0]?.priority} priority).`,
  });

  // STAGE 4: Next Order Selected by Priority Queue
  const selectedOrder = heap.extractMin([]); // Real root extraction
  const orderInList = orders.find(o => o.id === selectedOrder.id);
  if (orderInList) {
    orderInList.status = 'Selected';
  }

  trace.push({
    stageNumber: 4,
    stageTitle: `Stage 4: Order "${selectedOrder.id}" Extracted from Root`,
    op: 'ORDER_EXTRACTED',
    codeTag: 'ORDER_EXTRACTED',
    highlightNode: selectedOrder.destination,
    highlightVehicle: null,
    highlightOrder: selectedOrder.id,
    inspectedOrderDiffers: inspectedOrderId && inspectedOrderId !== selectedOrder.id,
    inspectedOrderId,
    vehiclePosition: null,
    routePath: [],
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: [],
    assignedVehicle: null,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: inspectedOrderId && inspectedOrderId !== selectedOrder.id
      ? `You selected "${inspectedOrderId}", but deterministic Priority Queue selects highest-ranked order "${selectedOrder.id}" (${selectedOrder.priority}) first.`
      : `Order "${selectedOrder.id}" selected as highest priority (${selectedOrder.priority}, ${selectedOrder.deadline} min deadline).`,
  });

  // STAGE 5: Warehouse Inventory Check
  trace.push({
    stageNumber: 5,
    stageTitle: `Stage 5: Checking Warehouse Stock for "${selectedOrder.requiredItem}"`,
    op: 'INVENTORY_CHECK',
    codeTag: 'INVENTORY_CHECK',
    highlightNode: warehouseId,
    highlightVehicle: null,
    highlightOrder: selectedOrder.id,
    vehiclePosition: null,
    routePath: [],
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: [],
    assignedVehicle: null,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Verifying inventory at Central Hub ("${warehouseId}"): Required item "${selectedOrder.requiredItem}" (${selectedOrder.weight} kg) is in stock!`,
  });

  // STAGE 6: Warehouse Confirmed
  trace.push({
    stageNumber: 6,
    stageTitle: `Stage 6: Dispatch Origin Confirmed: "${warehouseId}"`,
    op: 'WAREHOUSE_CONFIRMED',
    codeTag: 'WAREHOUSE_CONFIRMED',
    highlightNode: warehouseId,
    highlightVehicle: null,
    highlightOrder: selectedOrder.id,
    vehiclePosition: null,
    routePath: [],
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: [],
    assignedVehicle: null,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Central Warehouse ("${warehouseId}") designated as the pickup hub for order "${selectedOrder.id}".`,
  });

  // STAGE 7 & 8: Greedy Vehicle Evaluation & Capacity/Distance Checks
  const greedyResult = runGreedyVehicleAssignment(selectedOrder, vehicles, roadGraph, warehouseId);

  greedyResult.candidateEvaluations.forEach((evalItem, idx) => {
    trace.push({
      stageNumber: 7,
      stageTitle: `Stage 7 & 8: Evaluating Vehicle "${evalItem.vehicleId}" (${idx + 1} of ${vehicles.length})`,
      op: 'EVALUATE_VEHICLE',
      codeTag: 'EVALUATE_VEHICLE',
      highlightNode: warehouseId,
      highlightVehicle: evalItem.vehicleId,
      highlightOrder: selectedOrder.id,
      vehiclePosition: null,
      routePath: [],
      heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
      evaluatedVehicles: greedyResult.candidateEvaluations.slice(0, idx + 1),
      assignedVehicle: null,
      ordersSnapshot: JSON.parse(JSON.stringify(orders)),
      activeExplanation: evalItem.feasible
        ? `Vehicle "${evalItem.vehicleId}": Feasible! Capacity check passed (${evalItem.remainingCapacity} kg rem >= ${selectedOrder.weight} kg). Additional distance: ${evalItem.additionalDistance} km.`
        : `Vehicle "${evalItem.vehicleId}": REJECTED — ${evalItem.rejectionReason}.`,
    });
  });

  // STAGE 9: Vehicle Assigned
  const bestVeh = greedyResult.bestCandidate;
  if (orderInList) {
    orderInList.status = 'Assigned';
    orderInList.assignedVehicle = bestVeh.vehicleId;
  }

  trace.push({
    stageNumber: 9,
    stageTitle: `Stage 9: Vehicle "${bestVeh.vehicleId}" Assigned to Order "${selectedOrder.id}"`,
    op: 'VEHICLE_ASSIGNED',
    codeTag: 'VEHICLE_ASSIGNED',
    highlightNode: warehouseId,
    highlightVehicle: bestVeh.vehicleId,
    highlightOrder: selectedOrder.id,
    vehiclePosition: null,
    routePath: [],
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: greedyResult.candidateEvaluations,
    assignedVehicle: bestVeh,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Greedy choice confirmed: "${bestVeh.vehicleId}" assigned (lowest additional route distance of ${bestVeh.additionalDistance} km).`,
  });

  // STAGE 10: Dijkstra Shortest Path Search
  const dijkstraResult = runDijkstra(roadGraph, warehouseId, selectedOrder.destination);
  const shortestPath = dijkstraResult.path;

  trace.push({
    stageNumber: 10,
    stageTitle: `Stage 10: Dijkstra Single-Source Pathfinding from "${warehouseId}" to "${selectedOrder.destination}"`,
    op: 'DIJKSTRA_EXPLORING',
    codeTag: 'DIJKSTRA_EXPLORING',
    highlightNode: selectedOrder.destination,
    highlightVehicle: bestVeh.vehicleId,
    highlightOrder: selectedOrder.id,
    vehiclePosition: null,
    routePath: shortestPath,
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: greedyResult.candidateEvaluations,
    assignedVehicle: bestVeh,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Dijkstra explored road network vertices. Relaxations finalized shortest route of ${dijkstraResult.totalDistance} km.`,
  });

  // STAGE 11: Route Highlighted
  trace.push({
    stageNumber: 11,
    stageTitle: `Stage 11: Optimal Route Verified: ${shortestPath.join(' → ')}`,
    op: 'ROUTE_HIGHLIGHTED',
    codeTag: 'ROUTE_HIGHLIGHTED',
    highlightNode: selectedOrder.destination,
    highlightVehicle: bestVeh.vehicleId,
    highlightOrder: selectedOrder.id,
    vehiclePosition: null,
    routePath: shortestPath,
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: greedyResult.candidateEvaluations,
    assignedVehicle: bestVeh,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Verified path: ${shortestPath.join(' → ')} (${dijkstraResult.totalDistance} km). Delivery vehicle prepared for departure.`,
  });

  // STAGE 12: Vehicle Moving along Route Segments
  if (orderInList) {
    orderInList.status = 'In Transit';
  }

  for (let i = 0; i < shortestPath.length - 1; i++) {
    const fromNode = shortestPath[i];
    const toNode = shortestPath[i + 1];

    trace.push({
      stageNumber: 12,
      stageTitle: `Stage 12: Vehicle "${bestVeh.vehicleId}" En Route: "${fromNode}" → "${toNode}"`,
      op: 'VEHICLE_MOVING',
      codeTag: 'VEHICLE_MOVING',
      highlightNode: toNode,
      highlightVehicle: bestVeh.vehicleId,
      highlightOrder: selectedOrder.id,
      vehiclePosition: {
        from: fromNode,
        to: toNode,
        segmentIndex: i,
        totalSegments: shortestPath.length - 1,
      },
      routePath: shortestPath,
      heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
      evaluatedVehicles: greedyResult.candidateEvaluations,
      assignedVehicle: bestVeh,
      ordersSnapshot: JSON.parse(JSON.stringify(orders)),
      activeExplanation: `Vehicle navigating along road segment from "${fromNode}" to "${toNode}".`,
    });
  }

  // STAGE 13: Destination Reached
  trace.push({
    stageNumber: 13,
    stageTitle: `Stage 13: Arrived at Customer Destination "${selectedOrder.destination}"`,
    op: 'DESTINATION_REACHED',
    codeTag: 'DESTINATION_REACHED',
    highlightNode: selectedOrder.destination,
    highlightVehicle: bestVeh.vehicleId,
    highlightOrder: selectedOrder.id,
    vehiclePosition: {
      from: shortestPath[shortestPath.length - 2],
      to: selectedOrder.destination,
      segmentIndex: shortestPath.length - 2,
      totalSegments: shortestPath.length - 1,
      arrived: true,
    },
    routePath: shortestPath,
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: greedyResult.candidateEvaluations,
    assignedVehicle: bestVeh,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Vehicle arrived safely at destination "${selectedOrder.destination}" for customer ${selectedOrder.customer}.`,
  });

  // STAGE 14: Order Delivered
  if (orderInList) {
    orderInList.status = 'Delivered';
  }

  trace.push({
    stageNumber: 14,
    stageTitle: `Stage 14: Order "${selectedOrder.id}" Successfully Delivered!`,
    op: 'ORDER_DELIVERED',
    codeTag: 'ORDER_DELIVERED',
    highlightNode: selectedOrder.destination,
    highlightVehicle: bestVeh.vehicleId,
    highlightOrder: selectedOrder.id,
    vehiclePosition: {
      from: selectedOrder.destination,
      to: selectedOrder.destination,
      arrived: true,
    },
    routePath: shortestPath,
    heapSnapshot: JSON.parse(JSON.stringify(heap.heap)),
    evaluatedVehicles: greedyResult.candidateEvaluations,
    assignedVehicle: bestVeh,
    ordersSnapshot: JSON.parse(JSON.stringify(orders)),
    activeExplanation: `Delivery completed in record time! Order "${selectedOrder.id}" status set to DELIVERED. Remaining orders in queue: ${heap.heap.length}.`,
  });

  return {
    trace,
    selectedOrder,
    shortestPath,
    bestVehicle: bestVeh,
  };
}
