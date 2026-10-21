/**
 * RouteX — Default Road Graph
 * Configurable weighted graph containing warehouses, intersections, and delivery destinations.
 */

export const DEFAULT_ROAD_GRAPH = {
  nodes: [
    { id: 'WH-Central', name: 'Central Warehouse (Hub)', type: 'warehouse', x: 360, y: 240 },
    { id: 'Navrangpura', name: 'Navrangpura (RX-101)', type: 'destination', x: 230, y: 130 },
    { id: 'CG Road', name: 'CG Road (RX-103)', type: 'destination', x: 420, y: 120 },
    { id: 'Satellite', name: 'Satellite (RX-102)', type: 'destination', x: 100, y: 250 },
    { id: 'Bopal', name: 'Bopal (RX-105)', type: 'destination', x: 120, y: 400 },
    { id: 'J-RingRoad', name: 'Ring Road Junction', type: 'junction', x: 280, y: 390 },
    { id: 'J-Riverfront', name: 'Riverfront Junction', type: 'junction', x: 530, y: 230 },
    { id: 'Maninagar', name: 'Maninagar (RX-104)', type: 'destination', x: 510, y: 390 },
  ],
  edges: [
    { from: 'WH-Central', to: 'Navrangpura', weight: 4 },
    { from: 'WH-Central', to: 'CG Road', weight: 3 },
    { from: 'WH-Central', to: 'J-Riverfront', weight: 3 },
    { from: 'WH-Central', to: 'J-RingRoad', weight: 5 },
    { from: 'Navrangpura', to: 'CG Road', weight: 2 },
    { from: 'Navrangpura', to: 'Satellite', weight: 5 },
    { from: 'Satellite', to: 'Bopal', weight: 6 },
    { from: 'Bopal', to: 'J-RingRoad', weight: 4 },
    { from: 'J-RingRoad', to: 'Maninagar', weight: 5 },
    { from: 'J-Riverfront', to: 'Maninagar', weight: 4 },
    { from: 'CG Road', to: 'J-Riverfront', weight: 4 },
  ],
};

export function getDefaultRoadGraph() {
  return JSON.parse(JSON.stringify(DEFAULT_ROAD_GRAPH));
}

/**
 * Builds an adjacency matrix representation of the road graph.
 * If no edge exists between i and j (where i != j), distance is Infinity.
 */
export function buildAdjacencyMatrix(graph) {
  const nodeIds = graph.nodes.map(n => n.id);
  const n = nodeIds.length;
  const indexMap = new Map();
  nodeIds.forEach((id, idx) => indexMap.set(id, idx));

  const matrix = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 0;
  }

  for (const edge of graph.edges) {
    const u = indexMap.get(edge.from);
    const v = indexMap.get(edge.to);
    if (u !== undefined && v !== undefined) {
      matrix[u][v] = Math.min(matrix[u][v], edge.weight);
      matrix[v][u] = Math.min(matrix[v][u], edge.weight); // undirected graph
    }
  }

  return { nodeIds, matrix, indexMap };
}

/**
 * Builds adjacency list for Dijkstra and path calculations
 */
export function buildAdjacencyList(graph) {
  const adj = {};
  for (const node of graph.nodes) {
    adj[node.id] = [];
  }
  for (const edge of graph.edges) {
    if (adj[edge.from] && adj[edge.to]) {
      adj[edge.from].push({ node: edge.to, weight: edge.weight });
      adj[edge.to].push({ node: edge.from, weight: edge.weight });
    }
  }
  return adj;
}
