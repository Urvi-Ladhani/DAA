/**
 * RouteX — Algorithm 5: Travelling Salesman Problem Using Branch and Bound
 * Finds minimum-cost Hamiltonian cycle starting and ending at the warehouse depot.
 *
 * Admissible Lower Bound Formula for Partial Path P = [v₀, v₁, ..., v_k]:
 * LB(P) = g(P) + min_{u ∈ U} dist(v_k, u) + ∑_{u ∈ U} min_{w ∈ (U \ {u}) ∪ {v₀}} dist(u, w)
 * where g(P) is current path cost, and U is the set of unvisited stops.
 *
 * Pruning Rule:
 * If LB(P) ≥ BestTourCostSoFar, PRUNE branch immediately (provably cannot improve incumbent).
 */

import { buildAdjacencyMatrix } from '../data/roadGraph.js';

export const TSP_METADATA = {
  id: 'branch-and-bound-tsp',
  name: 'Travelling Salesman Problem (Branch & Bound)',
  category: 'Exact Search / Pruning',
  timeComplexity: {
    worst: 'O(N!) without pruning',
    typicalWithPruning: 'O(2ᴺ · N²) on metric graphs',
  },
  spaceComplexity: 'O(N) for recursion stack and search tree nodes',
  assumptions: 'Metric symmetric or asymmetric distance matrix. Guarantees global optimality via mathematically admissible lower bounds.',
};

/**
 * Computes shortest distances between all selected TSP stops using Floyd-Warshall on the road graph.
 */
export function buildTSPDistanceMatrix(roadGraph, stops) {
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

  // Extract submatrix for selected stops
  const m = stops.length;
  const subMatrix = Array.from({ length: m }, () => Array(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      if (i === j) {
        subMatrix[i][j] = 0;
      } else {
        const u = indexMap.get(stops[i]);
        const v = indexMap.get(stops[j]);
        subMatrix[i][j] = dist[u][v];
      }
    }
  }

  return { stops, distMatrix: subMatrix };
}

/**
 * Calculates admissible lower bound for a partial tour.
 */
export function calculateLowerBound(path, costSoFar, unvisited, distMatrix, stops) { // [TAG: CALC_LOWER_BOUND]
  if (unvisited.length === 0) {
    // Return to start
    const returnCost = distMatrix[path[path.length - 1]][path[0]];
    return {
      bound: costSoFar + returnCost,
      breakdown: `Cost so far (${costSoFar}) + Return to ${stops[path[0]]} (${returnCost}) = ${costSoFar + returnCost}`,
    };
  }

  const lastNode = path[path.length - 1];
  let bound = costSoFar;
  const breakdownParts = [`Cost so far: ${costSoFar}`];

  // 1. Min outgoing edge from current head to any unvisited stop
  let minFromLast = Infinity;
  let minFromLastDest = '';
  for (const u of unvisited) {
    if (distMatrix[lastNode][u] < minFromLast) {
      minFromLast = distMatrix[lastNode][u];
      minFromLastDest = stops[u];
    }
  }
  bound += minFromLast;
  breakdownParts.push(`min_out(${stops[lastNode]} → ${minFromLastDest}): ${minFromLast}`);

  // 2. Min outgoing edge from each unvisited stop to other unvisited stops or start node
  const startNode = path[0];
  for (const u of unvisited) {
    let minFromU = Infinity;
    let minDest = '';
    // Candidate targets: other unvisited stops or start depot
    const targets = [...unvisited.filter(x => x !== u), startNode];
    for (const target of targets) {
      if (distMatrix[u][target] < minFromU) {
        minFromU = distMatrix[u][target];
        minDest = stops[target];
      }
    }
    bound += minFromU;
    breakdownParts.push(`min_out(${stops[u]} → ${minDest}): ${minFromU}`);
  }

  return {
    bound,
    breakdown: breakdownParts.join(' + ') + ` = ${bound} km`,
  };
}

/**
 * Solves TSP using genuine Branch and Bound and emits execution trace.
 */
export function runBranchAndBoundTSP(roadGraph, selectedStops = ['WH-Central', 'Navrangpura', 'CG Road', 'Satellite', 'Bopal']) {
  // Ensure warehouse is first stop
  const stops = [
    'WH-Central',
    ...selectedStops.filter(s => s !== 'WH-Central'),
  ];

  const { distMatrix } = buildTSPDistanceMatrix(roadGraph, stops);
  const n = stops.length;

  const trace = [];
  const searchTree = []; // Tree nodes for visualization
  let nodeIdCounter = 0;

  let bestTour = null;
  let bestTourCost = Infinity;

  // Root node: start at WH-Central (index 0)
  const initialUnvisited = Array.from({ length: n - 1 }, (_, i) => i + 1);
  const initialBoundInfo = calculateLowerBound([0], 0, initialUnvisited, distMatrix, stops);

  const rootTreeNode = {
    id: `node-${nodeIdCounter++}`,
    parentId: null,
    path: [0],
    pathNames: [stops[0]],
    costSoFar: 0,
    bound: initialBoundInfo.bound,
    status: 'EXPLORING', // 'EXPLORING' | 'PRUNED' | 'FEASIBLE' | 'OPTIMAL'
    unvisited: [...initialUnvisited],
    depth: 0,
  };
  searchTree.push(rootTreeNode);

  trace.push({
    op: 'INIT_TSP',
    codeTag: 'INIT_TSP',
    title: `Initialize Branch & Bound TSP (${n} Stops)`,
    stops,
    distMatrix,
    currentNode: rootTreeNode,
    searchTree: JSON.parse(JSON.stringify(searchTree)),
    bestTour: null,
    bestTourCost: Infinity,
    comparisons: [
      `Starting Depot: "${stops[0]}"`,
      `Customer Stops to Visit: ${stops.slice(1).join(', ')}`,
      `Initial Lower Bound: ${initialBoundInfo.bound} km`,
    ],
    calculations: `Root Lower Bound: ${initialBoundInfo.breakdown}`,
    decision: 'Root state initialized. Explore branches using best-first / depth-first search with admissible lower bound.',
    whatChanges: 'Search tree initialized with root node.',
    whatNext: 'Branch on next candidate destinations.',
    snapshot: {
      searchTree: JSON.parse(JSON.stringify(searchTree)),
      bestTour: null,
      bestTourCost: Infinity,
      currentPath: [stops[0]],
    },
  });

  // Stack/Queue for Branch & Bound search
  // To keep search tree clean, we prioritize branches with lower bounds (Best-First Search)
  const queue = [rootTreeNode];

  while (queue.length > 0) { // [TAG: SEARCH_LOOP]
    // Select node with smallest lower bound
    queue.sort((a, b) => a.bound - b.bound);
    const currNode = queue.shift();

    // Check if currNode bound already exceeds incumbent
    if (currNode.bound >= bestTourCost) { // [TAG: PRUNE_CHECK]
      currNode.status = 'PRUNED';

      trace.push({
        op: 'PRUNE_BRANCH',
        codeTag: 'PRUNE_CHECK',
        title: `Prune Branch: [${currNode.pathNames.join(' → ')}]`,
        stops,
        distMatrix,
        currentNode: currNode,
        searchTree: JSON.parse(JSON.stringify(searchTree)),
        bestTour,
        bestTourCost,
        comparisons: [
          `Branch Lower Bound: ${currNode.bound} km`,
          `Best Tour Cost Found: ${bestTourCost} km`,
        ],
        calculations: `LB (${currNode.bound} km) ≥ Incumbent (${bestTourCost} km)`,
        decision: `PRUNED: This branch is provably inferior to an already discovered complete tour.`,
        whatChanges: `Node "${currNode.id}" marked PRUNED.`,
        whatNext: 'Discard sub-tree and evaluate next branch.',
        snapshot: {
          searchTree: JSON.parse(JSON.stringify(searchTree)),
          bestTour,
          bestTourCost,
          currentPath: currNode.pathNames,
        },
      });
      continue;
    }

    // Check if all stops visited -> Complete tour!
    if (currNode.unvisited.length === 0) { // [TAG: COMPLETE_TOUR]
      const returnCost = distMatrix[currNode.path[currNode.path.length - 1]][currNode.path[0]];
      const totalCost = currNode.costSoFar + returnCost;
      const fullPath = [...currNode.path, currNode.path[0]];
      const fullPathNames = fullPath.map(idx => stops[idx]);

      const isNewIncumbent = totalCost < bestTourCost;

      if (isNewIncumbent) {
        bestTourCost = totalCost;
        bestTour = {
          path: fullPath,
          pathNames: fullPathNames,
          cost: totalCost,
        };
        currNode.status = 'FEASIBLE';

        trace.push({
          op: 'NEW_INCUMBENT_TOUR',
          codeTag: 'COMPLETE_TOUR',
          title: `New Best Tour Found: ${totalCost} km`,
          stops,
          distMatrix,
          currentNode: currNode,
          searchTree: JSON.parse(JSON.stringify(searchTree)),
          bestTour,
          bestTourCost,
          comparisons: [
            `Tour: ${fullPathNames.join(' → ')}`,
            `Total Tour Cost: ${totalCost} km`,
            `Previous Best: ${bestTourCost === totalCost ? 'None' : bestTourCost + ' km'}`,
          ],
          calculations: `Sum of cycle edges = ${currNode.costSoFar} + return ${returnCost} = ${totalCost} km`,
          decision: `Update incumbent solution to ${totalCost} km. All future branches with LB ≥ ${totalCost} will be pruned.`,
          whatChanges: `bestTour = [${fullPathNames.join(' → ')}], bestTourCost = ${totalCost}`,
          whatNext: 'Continue search to prove optimality.',
          snapshot: {
            searchTree: JSON.parse(JSON.stringify(searchTree)),
            bestTour,
            bestTourCost,
            currentPath: fullPathNames,
          },
        });
      }
      continue;
    }

    // Branching: expand all feasible next stops
    const lastStop = currNode.path[currNode.path.length - 1]; // [TAG: BRANCH_EXPANSION]

    for (const nextStop of currNode.unvisited) {
      const edgeCost = distMatrix[lastStop][nextStop];
      const newCostSoFar = currNode.costSoFar + edgeCost;
      const newPath = [...currNode.path, nextStop];
      const newPathNames = newPath.map(idx => stops[idx]);
      const newUnvisited = currNode.unvisited.filter(u => u !== nextStop);

      const boundInfo = calculateLowerBound(newPath, newCostSoFar, newUnvisited, distMatrix, stops);

      const childNode = {
        id: `node-${nodeIdCounter++}`,
        parentId: currNode.id,
        path: newPath,
        pathNames: newPathNames,
        costSoFar: newCostSoFar,
        bound: boundInfo.bound,
        status: boundInfo.bound >= bestTourCost ? 'PRUNED' : 'EXPLORING',
        unvisited: newUnvisited,
        depth: currNode.depth + 1,
      };

      searchTree.push(childNode);

      trace.push({
        op: childNode.status === 'PRUNED' ? 'BRANCH_PRUNED_IMMEDIATE' : 'BRANCH_EXPANDED',
        codeTag: childNode.status === 'PRUNED' ? 'PRUNE_CHECK' : 'BRANCH_EXPANSION',
        title: childNode.status === 'PRUNED'
          ? `Branch [${newPathNames.join(' → ')}] Pruned Immediately (LB: ${boundInfo.bound} km)`
          : `Expand Branch: Add Stop "${stops[nextStop]}" (LB: ${boundInfo.bound} km)`,
        stops,
        distMatrix,
        currentNode: childNode,
        searchTree: JSON.parse(JSON.stringify(searchTree)),
        bestTour,
        bestTourCost,
        comparisons: [
          `Partial Path: ${newPathNames.join(' → ')}`,
          `Edge Cost (${stops[lastStop]} → ${stops[nextStop]}): ${edgeCost} km`,
          `Lower Bound: ${boundInfo.bound} km`,
          `Best Incumbent: ${bestTourCost === Infinity ? 'None' : bestTourCost + ' km'}`,
        ],
        calculations: `LB Breakdown: ${boundInfo.breakdown}`,
        decision: childNode.status === 'PRUNED'
          ? `PRUNED: Lower bound (${boundInfo.bound} km) ≥ Incumbent (${bestTourCost} km). Subtree discarded.`
          : `Feasible branch with LB (${boundInfo.bound} km) < Incumbent (${bestTourCost} km). Added to search frontier.`,
        whatChanges: `searchTree appended node "${childNode.id}".`,
        whatNext: 'Continue branch expansion.',
        snapshot: {
          searchTree: JSON.parse(JSON.stringify(searchTree)),
          bestTour,
          bestTourCost,
          currentPath: newPathNames,
        },
      });

      if (childNode.status !== 'PRUNED') {
        queue.push(childNode);
      }
    }
  }

  // Mark optimal tour node in tree
  if (bestTour) {
    const optimalLeaf = searchTree.find(n => n.costSoFar === bestTour.cost - distMatrix[n.path[n.path.length - 1]][0] && n.unvisited.length === 0);
    if (optimalLeaf) {
      optimalLeaf.status = 'OPTIMAL';
    }
  }

  trace.push({
    op: 'TSP_OPTIMAL_COMPLETE',
    codeTag: 'COMPLETE_TOUR',
    title: `Branch & Bound TSP Complete — Optimal Tour: ${bestTour?.cost} km`,
    stops,
    distMatrix,
    currentNode: null,
    searchTree: JSON.parse(JSON.stringify(searchTree)),
    bestTour,
    bestTourCost,
    comparisons: [
      `Optimal Tour: ${bestTour?.pathNames.join(' → ')}`,
      `Minimum Tour Distance: ${bestTour?.cost} km`,
      `Total Search Tree Nodes: ${searchTree.length}`,
      `Pruned Sub-trees: ${searchTree.filter(n => n.status === 'PRUNED').length}`,
    ],
    calculations: 'All non-pruned search space exhaustively evaluated or proved suboptimal.',
    decision: 'The incumbent tour is guaranteed globally optimal for the chosen destination stops.',
    whatChanges: 'Optimal Hamiltonian tour verified.',
    whatNext: 'Search terminated successfully.',
    snapshot: {
      searchTree: JSON.parse(JSON.stringify(searchTree)),
      bestTour,
      bestTourCost,
      currentPath: bestTour?.pathNames,
    },
  });

  return {
    trace,
    bestTour,
    bestTourCost,
    searchTree,
    stops,
    distMatrix,
  };
}

/**
 * Brute force TSP for verification on small instances.
 */
export function solveTSPBruteForce(distMatrix, stops) {
  const n = stops.length;
  const indices = Array.from({ length: n - 1 }, (_, i) => i + 1);

  function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of getPermutations(remaining)) {
        result.push([current, ...p]);
      }
    }
    return result;
  }

  const allPerms = getPermutations(indices);
  let bestCost = Infinity;
  let bestPath = [];

  for (const p of allPerms) {
    const tour = [0, ...p, 0];
    let cost = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      cost += distMatrix[tour[i]][tour[i + 1]];
    }
    if (cost < bestCost) {
      bestCost = cost;
      bestPath = tour.map(idx => stops[idx]);
    }
  }

  return { bestCost, bestPath };
}
