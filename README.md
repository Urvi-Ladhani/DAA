# RouteX — Simulation-First DAA Algorithm Simulator

**RouteX** is a simulation-first interactive educational control center demonstrating six core Design and Analysis of Algorithms (DAA) topics through real algorithm computation, continuous multi-stage animations, and synchronized JavaScript source code.

---

## 🌟 Simulation-First Architecture

- **Canvas-Focused Layout**: The central simulation canvas occupies **75–85% of the screen**, putting the animated algorithm execution front and center.
- **Light, Modern & Clean Aesthetic**: Crisp slate-50 background (`#f8fafc`), clean white canvas (`#ffffff`), subtle borders, high-contrast badges, smooth vector animations, and zero dashboard clutter.
- **14-Stage Continuous Logistics Journey**: A live end-to-end simulation that visibly animates the entire order dispatch pipeline:
  1. Five orders placed.
  2. Orders entering the shared binary heap priority queue.
  3. Heap bubble-up comparisons and swaps.
  4. Next highest-priority order extracted (`RX-103` Critical).
  5. Warehouse inventory checked.
  6. Central hub confirmed.
  7. Candidate fleet vehicles evaluated one by one.
  8. Payload capacity and route distance checks.
  9. Vehicle assigned (`VH-01`).
  10. Dijkstra single-source shortest path exploration.
  11. Optimal route highlighted.
  12. Delivery vehicle moving segment-by-segment along the computed road coordinates.
  13. Customer destination reached.
  14. Order status updated to **Delivered**.
- **Compact 5-Order Strip**: Displays the exact 5 deterministic demo orders (`RX-101` through `RX-105`) with priorities, deadlines, destinations, weights, live status pills, and instant edit triggers.
- **Minimal Playback Controls**: Compact footer bar with Previous Step, Play/Pause, Next Step, Run to Completion, Reset, Speed multipliers (0.5x, 1x, 2x, 4x), and step counter (`Step X / Y`).
- **Collapsible Source-Code Drawer**: Closed by default; opens via the "View Source Code" button to show the actual JavaScript implementation, line numbers, and live highlighted execution line.
- **Configurable Scenario Editor**: Modal for customizing the 5 demo orders, road network distances, vehicle fleet capacities, and knapsack packages with real-time recalculation.

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Navigate to: **[http://localhost:5173/](http://localhost:5173/)**

### 3. Run Automated Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🧠 Supported Algorithm Simulators

| Tab | Algorithm | Source File | Canvas Visualization |
|---|---|---|---|
| **Live Journey** | Full Logistics Pipeline (14 Stages) | `src/algorithms/fullLogisticsJourney.js` | Full-screen interactive road network, moving delivery van, live queue chips, and vehicle evaluation overlays. |
| **Priority Queue** | Binary Min-Heap | `src/algorithms/priorityQueue.js` | Full-size binary heap tree, active comparison halos, and contiguous 0-indexed array with parent-child pointers. |
| **Floyd–Warshall** | All-Pairs Shortest Path | `src/algorithms/floydWarshall.js` | Interactive road graph alongside dynamic distance matrix with $k, i, j$ cell updates and shortcut highlights. |
| **Greedy Assignment** | Fleet Selection Heuristic | `src/algorithms/greedyVehicleAssignment.js` | Fleet vehicles grid with payload gauges, distance leg breakdowns, and explicit rejection explanations. |
| **Dijkstra** | Single-Source Shortest Path | `src/algorithms/dijkstra.js` | Weighted graph with frontier queue, edge relaxations, progressive route drawing, and animated vehicle traversal. |
| **Branch & Bound** | Travelling Salesman Problem (TSP) | `src/algorithms/branchAndBoundTSP.js` | Dynamic state search tree showing branch expansions, lower bounds, incumbent updates, and pruned branches. |
| **0/1 Knapsack** | Dynamic Programming | `src/algorithms/knapsack.js` | Full $(N+1) \times (W+1)$ DP table filled cell-by-cell with candidate comparisons, animated backtracking, and cargo manifest. |

---

## 📦 Exact Five Demo Orders

| Order ID | Priority | Deadline | Destination | Weight | Customer |
|---|---|---|---|---|---|
| **RX-101** | High | 20 min | Navrangpura | 4 kg | Aarav Patel |
| **RX-102** | Low | 60 min | Satellite | 2 kg | Diya Shah |
| **RX-103** | Critical | 15 min | CG Road | 6 kg | Kabir Mehta |
| **RX-104** | Medium | 35 min | Maninagar | 3 kg | Ananya Joshi |
| **RX-105** | High | 25 min | Bopal | 5 kg | Rohan Verma |
