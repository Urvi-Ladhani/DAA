/**
 * RouteX — Central Algorithm Registry
 * Direct imports of real JavaScript implementations, raw code strings, and execution runners.
 */

import {
  runPriorityQueueSimulation,
  PRIORITY_QUEUE_METADATA,
} from './priorityQueue.js';
import priorityQueueSource from './priorityQueue.js?raw';

import {
  runFloydWarshall,
  FLOYD_WARSHALL_METADATA,
} from './floydWarshall.js';
import floydWarshallSource from './floydWarshall.js?raw';

import {
  runGreedyVehicleAssignment,
  GREEDY_ASSIGNMENT_METADATA,
} from './greedyVehicleAssignment.js';
import greedyVehicleAssignmentSource from './greedyVehicleAssignment.js?raw';

import {
  runDijkstra,
  DIJKSTRA_METADATA,
} from './dijkstra.js';
import dijkstraSource from './dijkstra.js?raw';

import {
  runBranchAndBoundTSP,
  TSP_METADATA,
} from './branchAndBoundTSP.js';
import branchAndBoundTSPSource from './branchAndBoundTSP.js?raw';

import {
  runKnapsack,
  KNAPSACK_METADATA,
} from './knapsack.js';
import knapsackSource from './knapsack.js?raw';

import {
  runFullLogisticsJourney,
  FULL_JOURNEY_METADATA,
} from './fullLogisticsJourney.js';
import fullLogisticsJourneySource from './fullLogisticsJourney.js?raw';

export const ALGORITHMS = {
  'priority-queue': {
    ...PRIORITY_QUEUE_METADATA,
    primaryName: 'Order Scheduling',
    secondaryName: 'Binary Heap / Priority Queue',
    name: 'Order Scheduling — Binary Heap / Priority Queue',
    shortDescription: 'Prioritize dispatch of urgent customer orders using a deterministic binary min-heap.',
    fileName: 'priorityQueue.js',
    sourceCode: priorityQueueSource,
    run: (scenario) => runPriorityQueueSimulation(scenario.orders),
  },
  'floyd-warshall': {
    ...FLOYD_WARSHALL_METADATA,
    primaryName: 'Warehouse Distance Analysis',
    secondaryName: 'Floyd–Warshall',
    name: 'Warehouse Distance Analysis — Floyd–Warshall',
    shortDescription: 'Compute all-pairs shortest paths across every warehouse hub and delivery intersection.',
    fileName: 'floydWarshall.js',
    sourceCode: floydWarshallSource,
    run: (scenario) => runFloydWarshall(scenario.roadGraph),
  },
  'greedy-vehicle-assignment': {
    ...GREEDY_ASSIGNMENT_METADATA,
    primaryName: 'Vehicle Assignment',
    secondaryName: 'Greedy Algorithm',
    name: 'Vehicle Assignment — Greedy Algorithm',
    shortDescription: 'Assign the optimal fleet vehicle minimizing detour distance while enforcing payload constraints.',
    fileName: 'greedyVehicleAssignment.js',
    sourceCode: greedyVehicleAssignmentSource,
    run: (scenario) => {
      const targetOrder = scenario.orders.find(o => o.id === scenario.selectedGreedyOrderId) || scenario.orders[0];
      return runGreedyVehicleAssignment(targetOrder, scenario.vehicles, scenario.roadGraph);
    },
  },
  'dijkstra': {
    ...DIJKSTRA_METADATA,
    primaryName: 'Shortest Delivery Route',
    secondaryName: 'Dijkstra’s Algorithm',
    name: 'Shortest Delivery Route — Dijkstra’s Algorithm',
    shortDescription: 'Calculate the fastest path from the central warehouse to the destination node along urban roads.',
    fileName: 'dijkstra.js',
    sourceCode: dijkstraSource,
    run: (scenario) => runDijkstra(
      scenario.roadGraph,
      scenario.selectedDijkstraSource || 'WH-Central',
      scenario.selectedDijkstraDestination || 'Maninagar'
    ),
  },
  'branch-and-bound-tsp': {
    ...TSP_METADATA,
    primaryName: 'Multi-Stop Route Optimization',
    secondaryName: 'Branch and Bound / TSP',
    name: 'Multi-Stop Route Optimization — Branch and Bound / TSP',
    shortDescription: 'Find the minimum-distance Hamiltonian tour visiting multiple stops using matrix lower bounds.',
    fileName: 'branchAndBoundTSP.js',
    sourceCode: branchAndBoundTSPSource,
    run: (scenario) => runBranchAndBoundTSP(scenario.roadGraph, scenario.selectedTSPStops),
  },
  'knapsack-01': {
    ...KNAPSACK_METADATA,
    primaryName: 'Package Selection',
    secondaryName: '0/1 Knapsack / Dynamic Programming',
    name: 'Package Selection — 0/1 Knapsack / Dynamic Programming',
    shortDescription: 'Maximize loaded package value under carrier vehicle payload capacity via dynamic programming.',
    fileName: 'knapsack.js',
    sourceCode: knapsackSource,
    run: (scenario) => runKnapsack(scenario.packages, scenario.knapsackCapacity),
  },
  'full-journey': {
    ...FULL_JOURNEY_METADATA,
    primaryName: 'Live Logistics Journey',
    secondaryName: '14-Stage Unified Pipeline',
    name: 'Live Logistics Journey — 14-Stage Unified Pipeline',
    shortDescription: 'Complete end-to-end trace integrating order scheduling, vehicle dispatch, routing, and delivery.',
    fileName: 'fullLogisticsJourney.js',
    sourceCode: fullLogisticsJourneySource,
    run: (scenario, inspectedOrderId) => runFullLogisticsJourney(scenario, inspectedOrderId),
  },
};

export const SIX_CORE_ALGORITHMS = [
  ALGORITHMS['priority-queue'],
  ALGORITHMS['floyd-warshall'],
  ALGORITHMS['greedy-vehicle-assignment'],
  ALGORITHMS['dijkstra'],
  ALGORITHMS['branch-and-bound-tsp'],
  ALGORITHMS['knapsack-01'],
];

export const ALGORITHM_LIST = [
  ...SIX_CORE_ALGORITHMS,
  ALGORITHMS['full-journey'],
];
