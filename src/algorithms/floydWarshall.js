/**
 * RouteX — Algorithm 2: Floyd–Warshall All-Pairs Shortest Path
 * Dynamic programming algorithm computing shortest path between all pairs of nodes in the road network.
 *
 * Recurrence:
 * dist[i][j]^(k) = min( dist[i][j]^(k-1), dist[i][k]^(k-1) + dist[k][j]^(k-1) )
 */

import { buildAdjacencyMatrix } from '../data/roadGraph.js';

export const FLOYD_WARSHALL_METADATA = {
  id: 'floyd-warshall',
  name: 'Floyd–Warshall (All-Pairs Shortest Path)',
  category: 'Dynamic Programming',
  timeComplexity: {
    worst: 'O(V³)',
    best: 'O(V³)',
    average: 'O(V³)',
  },
  spaceComplexity: 'O(V²) for distance & predecessor matrices',
  assumptions: 'Dense or sparse directed/undirected graphs without negative cycles. Operates in-place on V x V distance matrix.',
};

/**
 * Reconstructs the shortest path between u and v using the next-hop matrix.
 */
export function reconstructPath(next, i, j, nodeIds) {
  if (next[i][j] === null) return [];
  const path = [nodeIds[i]];
  let curr = i;
  while (curr !== j) {
    curr = next[curr][j];
    if (curr === null) return [];
    path.push(nodeIds[curr]);
  }
  return path;
}

/**
 * Runs the Floyd–Warshall algorithm and generates an execution trace.
 */
export function runFloydWarshall(roadGraph) {
  const { nodeIds, matrix: baseMatrix } = buildAdjacencyMatrix(roadGraph);
  const n = nodeIds.length;

  // Initialize distance matrix and next-hop matrix
  const dist = Array.from({ length: n }, (_, i) => [...baseMatrix[i]]); // [TAG: INIT_MATRIX]
  const next = Array.from({ length: n }, () => Array(n).fill(null));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && dist[i][j] !== Infinity) {
        next[i][j] = j;
      }
    }
  }

  const trace = [];

  trace.push({
    op: 'INIT',
    codeTag: 'INIT_MATRIX',
    title: 'Initialize Distance Matrix D⁽⁰⁾',
    k: null,
    i: null,
    j: null,
    nodeIds,
    kNode: null,
    iNode: null,
    jNode: null,
    oldDist: null,
    candidateDist: null,
    updated: false,
    comparisons: ['Constructed initial distance matrix from direct road edges.'],
    calculations: `Matrix dimensions: ${n} × ${n} (${n * n} potential paths)`,
    decision: 'Direct connected edges are initialized; all other non-diagonal pairs are set to ∞.',
    whatChanges: 'Base distance matrix D⁽⁰⁾ established.',
    whatNext: 'Begin triple-loop iterations considering intermediate node k = 0.',
    snapshot: {
      dist: JSON.parse(JSON.stringify(dist)),
      next: JSON.parse(JSON.stringify(next)),
    },
  });

  // Triple-loop of Floyd-Warshall
  for (let k = 0; k < n; k++) { // [TAG: LOOP_K]
    const kNode = nodeIds[k];

    trace.push({
      op: 'PHASE_K_START',
      codeTag: 'LOOP_K',
      title: `Evaluate Intermediate Hub k = ${k} ("${kNode}")`,
      k,
      i: null,
      j: null,
      nodeIds,
      kNode,
      iNode: null,
      jNode: null,
      oldDist: null,
      candidateDist: null,
      updated: false,
      comparisons: [`Testing if routing through "${kNode}" offers a shorter shortcut for any (i, j) pair.`],
      calculations: `Intermediate candidate: node ${k} (${kNode})`,
      decision: `Fix intermediate node k = "${kNode}". Iterate over all source nodes i and destination nodes j.`,
      whatChanges: `Active intermediate hub set to "${kNode}".`,
      whatNext: `Evaluate source node i = 0 with intermediate "${kNode}".`,
      snapshot: {
        dist: JSON.parse(JSON.stringify(dist)),
        next: JSON.parse(JSON.stringify(next)),
      },
    });

    for (let i = 0; i < n; i++) { // [TAG: LOOP_I]
      const iNode = nodeIds[i];

      // If source i cannot reach intermediate k, skip
      if (dist[i][k] === Infinity) {
        continue;
      }

      for (let j = 0; j < n; j++) { // [TAG: LOOP_J]
        const jNode = nodeIds[j];

        // Skip self loops
        if (i === j) continue;

        // If intermediate k cannot reach destination j, skip
        if (dist[k][j] === Infinity) {
          continue;
        }

        const oldDist = dist[i][j];
        const candidateDist = dist[i][k] + dist[k][j]; // [TAG: COMPUTE_CANDIDATE]
        const shouldUpdate = candidateDist < oldDist; // [TAG: COMPARE_DIST]

        if (shouldUpdate) {
          dist[i][j] = candidateDist; // [TAG: UPDATE_MATRIX]
          next[i][j] = next[i][k];
        }

        trace.push({
          op: shouldUpdate ? 'UPDATE_CELL' : 'CHECK_NO_UPDATE',
          codeTag: shouldUpdate ? 'UPDATE_MATRIX' : 'COMPARE_DIST',
          title: shouldUpdate
            ? `Shortcut Found: "${iNode}" → "${jNode}" via "${kNode}"`
            : `Evaluate Path: "${iNode}" → "${jNode}" via "${kNode}"`,
          k,
          i,
          j,
          nodeIds,
          kNode,
          iNode,
          jNode,
          oldDist,
          candidateDist,
          updated: shouldUpdate,
          comparisons: [
            `Current dist[${iNode}][${jNode}] = ${oldDist === Infinity ? '∞' : oldDist + ' km'}`,
            `Candidate via ${kNode}: dist[${iNode}][${kNode}] (${dist[i][k]}) + dist[${kNode}][${jNode}] (${dist[k][j]}) = ${candidateDist} km`,
          ],
          calculations: shouldUpdate
            ? `${candidateDist} km < ${oldDist === Infinity ? '∞' : oldDist} km (Shorter by ${(oldDist === Infinity ? Infinity : oldDist - candidateDist)} km)`
            : `${candidateDist} km ≥ ${oldDist} km (Current path is already optimal or equal)`,
          decision: shouldUpdate
            ? `Update dist[${iNode}][${jNode}] = ${candidateDist} km and update next-hop.`
            : `Keep existing distance of ${oldDist} km unchanged.`,
          whatChanges: shouldUpdate
            ? `dist[${i}][${j}] updated from ${oldDist === Infinity ? '∞' : oldDist} to ${candidateDist}`
            : 'Matrix cell unchanged.',
          whatNext: `Continue to next destination cell in matrix.`,
          snapshot: {
            dist: JSON.parse(JSON.stringify(dist)),
            next: JSON.parse(JSON.stringify(next)),
          },
        });
      }
    }
  }

  trace.push({
    op: 'COMPLETE',
    codeTag: 'INIT_MATRIX',
    title: 'Floyd–Warshall Algorithm Completed',
    k: null,
    i: null,
    j: null,
    nodeIds,
    kNode: null,
    iNode: null,
    jNode: null,
    oldDist: null,
    candidateDist: null,
    updated: false,
    comparisons: ['All intermediate vertices k ∈ [0, V-1] have been exhaustively evaluated.'],
    calculations: `Final all-pairs shortest path matrix D⁽${n}⁾ computed.`,
    decision: 'The matrix now holds the exact global shortest path distance between every reachable pair of nodes.',
    whatChanges: 'Simulation finished.',
    whatNext: 'Ready for path inspection or route queries.',
    snapshot: {
      dist: JSON.parse(JSON.stringify(dist)),
      next: JSON.parse(JSON.stringify(next)),
    },
  });

  return {
    trace,
    finalDistances: dist,
    nextMatrix: next,
    nodeIds,
  };
}
