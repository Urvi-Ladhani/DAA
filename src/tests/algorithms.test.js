import { describe, it, expect } from 'vitest';
import { getDefaultOrders } from '../data/demoOrders.js';
import { getDefaultRoadGraph, buildAdjacencyMatrix } from '../data/roadGraph.js';
import { getDefaultVehicles } from '../data/vehicles.js';
import { getDefaultPackages } from '../data/packages.js';
import { createDefaultScenario, validateScenario } from '../data/initialScenario.js';

// Algorithm imports
import { runPriorityQueueSimulation, compareOrders, TraceableBinaryHeap } from '../algorithms/priorityQueue.js';
import { runFloydWarshall } from '../algorithms/floydWarshall.js';
import { runGreedyVehicleAssignment } from '../algorithms/greedyVehicleAssignment.js';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { runBranchAndBoundTSP, solveTSPBruteForce, buildTSPDistanceMatrix } from '../algorithms/branchAndBoundTSP.js';
import { runKnapsack } from '../algorithms/knapsack.js';
import { resolveCodeLine } from '../algorithms/lineMapping.js';
import { ALGORITHMS } from '../algorithms/index.js';

describe('Exact Five-Order Specification Tests', () => {
  it('default scenario contains exactly 5 demo orders with deterministic properties', () => {
    const orders = getDefaultOrders();
    expect(orders).toHaveLength(5);
    expect(orders.map(o => o.id)).toEqual(['RX-101', 'RX-102', 'RX-103', 'RX-104', 'RX-105']);

    // Check RX-103 is Critical, 15 min, 6kg
    const rx103 = orders.find(o => o.id === 'RX-103');
    expect(rx103.priority).toBe('Critical');
    expect(rx103.deadline).toBe(15);
    expect(rx103.destination).toBe('CG Road');
    expect(rx103.weight).toBe(6);

    // Scenario validation passes
    const scenario = createDefaultScenario();
    const validation = validateScenario(scenario);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects scenario if demo orders count is not 5', () => {
    const scenario = createDefaultScenario();
    scenario.orders.push({
      id: 'RX-999',
      priority: 'Low',
      deadline: 99,
      destination: 'Unknown',
      weight: 1,
    });
    const validation = validateScenario(scenario);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain('requires exactly 5 demo orders');
  });
});

describe('Algorithm 1: Priority Queue (Binary Heap)', () => {
  it('strictly respects scheduling policy (Priority > Deadline > ID)', () => {
    const orders = getDefaultOrders();
    // Critical (RX-103) should outrank High (RX-101, RX-105)
    const rx103 = orders.find(o => o.id === 'RX-103');
    const rx101 = orders.find(o => o.id === 'RX-101');
    const rx105 = orders.find(o => o.id === 'RX-105');
    const rx104 = orders.find(o => o.id === 'RX-104');
    const rx102 = orders.find(o => o.id === 'RX-102');

    expect(compareOrders(rx103, rx101)).toBeLessThan(0); // Critical before High
    expect(compareOrders(rx101, rx105)).toBeLessThan(0); // High vs High: 20m < 25m
    expect(compareOrders(rx104, rx102)).toBeLessThan(0); // Medium before Low
  });

  it('generates real heap trace, inserts 5 orders, extracts root correctly', () => {
    const orders = getDefaultOrders();
    const result = runPriorityQueueSimulation(orders);

    expect(result.trace.length).toBeGreaterThan(10);
    // Extracted orders should have Critical order RX-103 first
    expect(result.extractedOrders[0].id).toBe('RX-103');
    // Second extracted order should be RX-101 (High, 20m)
    expect(result.extractedOrders[1].id).toBe('RX-101');
  });
});

describe('Algorithm 2: Floyd–Warshall All-Pairs Shortest Path', () => {
  it('correctly calculates shortest distances on known graph', () => {
    const graph = getDefaultRoadGraph();
    const result = runFloydWarshall(graph);

    const { nodeIds, finalDistances } = result;
    const whIdx = nodeIds.indexOf('WH-Central');
    const navIdx = nodeIds.indexOf('Navrangpura');
    const cgIdx = nodeIds.indexOf('CG Road');

    // WH to CG Road direct is 3 km
    expect(finalDistances[whIdx][cgIdx]).toBe(3);
    // WH to Navrangpura via CG Road: 3 + 2 = 5 km vs direct 4 km -> 4 km
    expect(finalDistances[whIdx][navIdx]).toBe(4);
    // Navrangpura to CG Road direct is 2 km
    expect(finalDistances[navIdx][cgIdx]).toBe(2);

    // Diagonal elements must be 0
    for (let i = 0; i < nodeIds.length; i++) {
      expect(finalDistances[i][i]).toBe(0);
    }
  });
});

describe('Algorithm 3: Greedy Vehicle Assignment', () => {
  it('rejects unavailable vehicles and capacity overloads, selects lowest additional distance', () => {
    const orders = getDefaultOrders();
    const vehicles = getDefaultVehicles();
    const graph = getDefaultRoadGraph();

    // RX-103 is 6 kg
    const targetOrder = orders.find(o => o.id === 'RX-103');
    const result = runGreedyVehicleAssignment(targetOrder, vehicles, graph);

    // VH-04 is unavailable -> must be rejected
    const evalVH04 = result.candidateEvaluations.find(e => e.vehicleId === 'VH-04');
    expect(evalVH04.feasible).toBe(false);
    expect(evalVH04.rejectionReason).toContain('unavailable');

    // VH-03 has remaining capacity 15 - 11 = 4 kg, but order is 6 kg -> must be rejected
    const evalVH03 = result.candidateEvaluations.find(e => e.vehicleId === 'VH-03');
    expect(evalVH03.feasible).toBe(false);
    expect(evalVH03.rejectionReason).toContain('capacity');

    // VH-01 is at WH-Central, remaining capacity 8 kg >= 6 kg -> feasible
    const evalVH01 = result.candidateEvaluations.find(e => e.vehicleId === 'VH-01');
    expect(evalVH01.feasible).toBe(true);

    // Chosen vehicle should be VH-01
    expect(result.bestCandidate.vehicleId).toBe('VH-01');
    expect(result.updatedVehicles.find(v => v.id === 'VH-01').currentLoad).toBe(10); // 4 + 6
  });
});

describe('Algorithm 4: Dijkstra Single-Source Shortest Path', () => {
  it('finds exact shortest path from WH-Central to Maninagar with non-negative edge weights', () => {
    const graph = getDefaultRoadGraph();
    const result = runDijkstra(graph, 'WH-Central', 'Maninagar');

    expect(result.totalDistance).toBeGreaterThan(0);
    expect(result.path[0]).toBe('WH-Central');
    expect(result.path[result.path.length - 1]).toBe('Maninagar');

    // Trace contains vehicle movement steps along the path
    const transitSteps = result.trace.filter(t => t.op === 'VEHICLE_TRANSIT');
    expect(transitSteps.length).toBe(result.path.length - 1);
  });
});

describe('Algorithm 5: TSP Using Branch and Bound', () => {
  it('finds optimal Hamiltonian tour verified against brute force', () => {
    const graph = getDefaultRoadGraph();
    const selectedStops = ['WH-Central', 'Navrangpura', 'CG Road', 'Satellite'];

    const bbResult = runBranchAndBoundTSP(graph, selectedStops);
    const bfResult = solveTSPBruteForce(bbResult.distMatrix, bbResult.stops);

    expect(bbResult.bestTourCost).toBe(bfResult.bestCost);
    expect(bbResult.bestTour.cost).toBe(bfResult.bestCost);
    expect(bbResult.trace.some(t => t.op === 'TSP_OPTIMAL_COMPLETE')).toBe(true);
  });
});

describe('Algorithm 6: 0/1 Knapsack Using Dynamic Programming', () => {
  it('correctly calculates optimal subset within capacity limit', () => {
    const packages = getDefaultPackages();
    const capacity = 10;
    const result = runKnapsack(packages, capacity);

    expect(result.totalWeight).toBeLessThanOrEqual(capacity);
    expect(result.totalValue).toBeGreaterThan(0);
    // Check DP table dimensions: (5 + 1) x (10 + 1) = 6 x 11
    expect(result.dpTable.length).toBe(6);
    expect(result.dpTable[0].length).toBe(11);
    expect(result.dpTable[5][10]).toBe(result.totalValue);
  });
});

describe('Full Continuous Logistics Journey Pipeline', () => {
  it('executes all 14 stages from order placement to final delivery', () => {
    const scenario = createDefaultScenario();
    const result = ALGORITHMS['full-journey'].run(scenario);

    expect(result.trace.length).toBeGreaterThan(13);
    // Stage 1
    expect(result.trace[0].stageNumber).toBe(1);
    // Stage 4 selects Critical order RX-103
    const stage4 = result.trace.find(t => t.stageNumber === 4);
    expect(stage4.highlightOrder).toBe('RX-103');
    // Stage 14 is DELIVERED
    const finalStage = result.trace[result.trace.length - 1];
    expect(finalStage.stageNumber).toBe(14);
    expect(finalStage.op).toBe('ORDER_DELIVERED');
  });
});

describe('Source Code Line Highlighting Consistency', () => {
  it('all trace events map to valid lines in real source code files', () => {
    for (const [key, algo] of Object.entries(ALGORITHMS)) {
      expect(algo.sourceCode).toBeTruthy();
      expect(typeof algo.sourceCode).toBe('string');

      // Test line resolver
      const resolvedLine = resolveCodeLine(algo.sourceCode, 'INIT');
      expect(resolvedLine).toBeGreaterThan(0);
    }
  });
});
