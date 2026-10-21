/**
 * RouteX — Algorithm 4: Dijkstra Single-Source Shortest Path
 * Shortest path calculation with priority queue edge relaxations and vehicle route progression.
 */

import { buildAdjacencyList } from '../data/roadGraph.js';

export const DIJKSTRA_METADATA = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm (Single-Source Shortest Path)",
  category: 'Graph Algorithms / Greedy',
  timeComplexity: {
    withMinHeap: 'O((V + E) log V)',
    withArray: 'O(V²)',
  },
  spaceComplexity: 'O(V + E) for adjacency list and distance tables',
  assumptions: 'Non-negative edge weights (w(u, v) ≥ 0). Guarantees optimal shortest paths from source to all reachable vertices.',
};

/**
 * Runs Dijkstra's algorithm and produces a step-by-step trace including route reconstruction and vehicle travel simulation.
 */
export function runDijkstra(roadGraph, sourceId = 'WH-Central', destinationId = 'Maninagar') {
  const adj = buildAdjacencyList(roadGraph);
  const nodes = roadGraph.nodes.map(n => n.id);

  // Data structures
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = []; // Array-based min priority queue: elements { node, dist }

  nodes.forEach(id => {
    dist[id] = Infinity;
    prev[id] = null;
  });

  dist[sourceId] = 0; // [TAG: INIT_SOURCE]
  pq.push({ node: sourceId, dist: 0 });

  const trace = [];

  const getSnapshot = (currentNode = null, currentEdge = null, vehicleStep = null) => ({
    dist: { ...dist },
    prev: { ...prev },
    visited: Array.from(visited),
    pq: [...pq].sort((a, b) => a.dist - b.dist),
    currentNode,
    currentEdge,
    vehicleStep,
  });

  trace.push({
    op: 'INIT',
    codeTag: 'INIT_SOURCE',
    title: `Initialize Dijkstra: Source "${sourceId}"`,
    sourceId,
    destinationId,
    currentNode: sourceId,
    currentEdge: null,
    comparisons: [`Set dist["${sourceId}"] = 0 km; all other ${nodes.length - 1} vertices set to ∞.`],
    calculations: `Priority queue seeded with start vertex { node: "${sourceId}", dist: 0 }`,
    decision: `Begin exploration from source hub "${sourceId}" seeking shortest path to "${destinationId}".`,
    whatChanges: `dist[${sourceId}] = 0`,
    whatNext: `Extract minimum-distance node from priority queue.`,
    snapshot: getSnapshot(sourceId),
  });

  let targetReached = false;

  while (pq.length > 0) { // [TAG: WHILE_PQ]
    // Extract min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = pq.shift(); // [TAG: EXTRACT_MIN]

    if (visited.has(u)) continue;
    visited.add(u);

    trace.push({
      op: 'VISIT_NODE',
      codeTag: 'EXTRACT_MIN',
      title: `Visit Node "${u}" (Distance: ${d} km)`,
      sourceId,
      destinationId,
      currentNode: u,
      currentEdge: null,
      comparisons: [`Node "${u}" has minimum tentative distance in frontier (${d} km).`],
      calculations: `Extract { node: "${u}", dist: ${d} } from priority queue.`,
      decision: `Mark "${u}" as visited (distance is now finalized). Inspect all outgoing edges.`,
      whatChanges: `visited.add("${u}")`,
      whatNext: u === destinationId ? `Destination reached! Reconstruct shortest path.` : `Inspect neighbors of "${u}".`,
      snapshot: getSnapshot(u),
    });

    if (u === destinationId) {
      targetReached = true;
      break;
    }

    // Inspect outgoing edges
    const neighbors = adj[u] || [];
    for (const edge of neighbors) {
      const v = edge.node;
      const weight = edge.weight;

      if (visited.has(v)) {
        continue;
      }

      const currentDistV = dist[v];
      const candidateDist = dist[u] + weight; // [TAG: CALC_CANDIDATE]
      const shouldRelax = candidateDist < currentDistV; // [TAG: RELAX_EDGE]

      trace.push({
        op: shouldRelax ? 'RELAX_EDGE_SUCCESS' : 'RELAX_EDGE_NO_CHANGE',
        codeTag: shouldRelax ? 'RELAX_EDGE' : 'CALC_CANDIDATE',
        title: shouldRelax
          ? `Relax Edge: ("${u}" → "${v}", ${weight} km)`
          : `Edge Check: ("${u}" → "${v}", ${weight} km)`,
        sourceId,
        destinationId,
        currentNode: u,
        currentEdge: { from: u, to: v, weight },
        comparisons: [
          `Current dist["${v}"] = ${currentDistV === Infinity ? '∞' : currentDistV + ' km'}`,
          `Path via "${u}": dist["${u}"] (${dist[u]} km) + weight (${weight} km) = ${candidateDist} km`,
        ],
        calculations: shouldRelax
          ? `${candidateDist} km < ${currentDistV === Infinity ? '∞' : currentDistV} km`
          : `${candidateDist} km ≥ ${currentDistV} km`,
        decision: shouldRelax
          ? `Shorter route discovered! Update dist["${v}"] = ${candidateDist} km and set predecessor = "${u}".`
          : `Current path to "${v}" is already shorter or equal. No relaxation.`,
        whatChanges: shouldRelax ? `dist["${v}"] = ${candidateDist}, prev["${v}"] = "${u}"` : 'No table changes.',
        whatNext: 'Continue examining remaining neighbors.',
        snapshot: getSnapshot(u, { from: u, to: v, weight }),
      });

      if (shouldRelax) {
        dist[v] = candidateDist;
        prev[v] = u;
        pq.push({ node: v, dist: candidateDist });
      }
    }
  }

  // Reconstruct path
  const path = []; // [TAG: RECONSTRUCT_PATH]
  let curr = destinationId;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }

  const isReachable = path.length > 0 && path[0] === sourceId;
  const finalDistance = isReachable ? dist[destinationId] : Infinity;

  trace.push({
    op: 'PATH_RECONSTRUCTED',
    codeTag: 'RECONSTRUCT_PATH',
    title: isReachable
      ? `Shortest Route Found: ${path.join(' → ')} (${finalDistance} km)`
      : `No Reachable Path from "${sourceId}" to "${destinationId}"`,
    sourceId,
    destinationId,
    currentNode: destinationId,
    currentEdge: null,
    path: isReachable ? path : [],
    totalDistance: finalDistance,
    comparisons: [
      `Total Path Distance: ${finalDistance} km`,
      `Route Waypoints: ${path.length} vertices`,
    ],
    calculations: `Path reconstructed by backtracking predecessors: ${path.join(' ← ')}`,
    decision: 'Shortest path proven optimal by Dijkstra greedy invariants.',
    whatChanges: 'Shortest path route finalized.',
    whatNext: 'Begin animated vehicle dispatch simulation along the computed route.',
    snapshot: getSnapshot(destinationId),
  });

  // Animated vehicle traversal along the reconstructed path
  if (isReachable && path.length > 1) {
    let accumulatedDist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edgeWeight = adj[from]?.find(e => e.node === to)?.weight ?? 0;
      accumulatedDist += edgeWeight;
      const remainingDist = finalDistance - accumulatedDist;

      trace.push({
        op: 'VEHICLE_TRANSIT',
        codeTag: 'RECONSTRUCT_PATH',
        title: `Vehicle In Transit: "${from}" → "${to}"`,
        sourceId,
        destinationId,
        currentNode: to,
        currentEdge: { from, to, weight: edgeWeight },
        path,
        totalDistance: finalDistance,
        vehicleStep: {
          fromNode: from,
          toNode: to,
          segmentIndex: i + 1,
          totalSegments: path.length - 1,
          coveredDistance: accumulatedDist,
          remainingDistance: remainingDist,
          progressPercent: Math.round((accumulatedDist / finalDistance) * 100),
        },
        comparisons: [
          `Traversal: Segment ${i + 1} of ${path.length - 1}`,
          `Segment Distance: ${edgeWeight} km`,
          `Covered: ${accumulatedDist} km | Remaining: ${remainingDist} km`,
        ],
        calculations: `Vehicle following true calculated road segment (${from} -> ${to})`,
        decision: `Moving vehicle safely along verified shortest path.`,
        whatChanges: `Vehicle position advanced to "${to}".`,
        whatNext: i + 1 < path.length - 1 ? `Proceed to next segment.` : `Arrive at destination "${destinationId}".`,
        snapshot: getSnapshot(to, { from, to, weight: edgeWeight }, {
          fromNode: from,
          toNode: to,
          progressPercent: Math.round((accumulatedDist / finalDistance) * 100),
        }),
      });
    }

    trace.push({
      op: 'VEHICLE_DELIVERED',
      codeTag: 'RECONSTRUCT_PATH',
      title: `Delivery Successfully Completed at "${destinationId}"`,
      sourceId,
      destinationId,
      currentNode: destinationId,
      currentEdge: null,
      path,
      totalDistance: finalDistance,
      vehicleStep: {
        fromNode: path[path.length - 2],
        toNode: destinationId,
        segmentIndex: path.length - 1,
        totalSegments: path.length - 1,
        coveredDistance: finalDistance,
        remainingDistance: 0,
        progressPercent: 100,
      },
      comparisons: [`Final route cost: ${finalDistance} km`],
      calculations: '100% route completed with zero deviation.',
      decision: `Package delivered to destination "${destinationId}".`,
      whatChanges: 'Vehicle arrived at customer destination.',
      whatNext: 'Route simulation finished.',
      snapshot: getSnapshot(destinationId),
    });
  }

  return {
    trace,
    distances: dist,
    predecessors: prev,
    path: isReachable ? path : [],
    totalDistance: finalDistance,
  };
}
