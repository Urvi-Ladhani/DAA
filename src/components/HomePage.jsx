import React from 'react';
import {
  Layers,
  Network,
  Truck,
  Navigation,
  GitFork,
  Briefcase,
  PlayCircle,
  ArrowRight,
  Sliders,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms/index.js';

const ALGO_METADATA_CARDS = [
  {
    id: 'priority-queue',
    icon: Layers,
    badgeColor: '#4f46e5',
    tag: 'Greedy / Heap Structures',
    complexity: 'O(log N) Insert & Extract',
    space: 'O(N) Space',
    highlight: 'Deterministic 3-tier comparator',
  },
  {
    id: 'floyd-warshall',
    icon: Network,
    badgeColor: '#0284c7',
    tag: 'Dynamic Programming',
    complexity: 'O(V³) All-Pairs',
    space: 'O(V²) Matrix Space',
    highlight: 'D[k][i][j] iterative matrix relaxation',
  },
  {
    id: 'greedy-vehicle-assignment',
    icon: Truck,
    badgeColor: '#d97706',
    tag: 'Greedy Optimization',
    complexity: 'O(K · V²) Nearest Feasible',
    space: 'O(K) Fleet State',
    highlight: 'Payload constraint & detour evaluation',
  },
  {
    id: 'dijkstra',
    icon: Navigation,
    badgeColor: '#10b981',
    tag: 'Graph Search',
    complexity: 'O((V + E) log V)',
    space: 'O(V) Frontier State',
    highlight: 'Priority-driven frontier relaxation',
  },
  {
    id: 'branch-and-bound-tsp',
    icon: GitFork,
    badgeColor: '#8b5cf6',
    tag: 'Branch & Bound',
    complexity: 'O(2ⁿ · n²) State Space',
    space: 'O(n!) Worst Case Queue',
    highlight: 'Matrix reduction & bounding pruning',
  },
  {
    id: 'knapsack-01',
    icon: Briefcase,
    badgeColor: '#059669',
    tag: 'Dynamic Programming',
    complexity: 'O(N · W) Table DP',
    space: 'O(N · W) 2D Grid',
    highlight: 'Optimal substructure & item backtracking',
  },
];

export default function HomePage({
  onSelectAlgo,
  onOpenSettings,
}) {
  return (
    <div className="rx-home-page-container">
      {/* 1. Hero Banner */}
      <section className="rx-home-hero" aria-label="RouteX Introduction">
        <div className="rx-hero-content">
          <div className="rx-hero-tag">
            <Sparkles size={16} />
            <span>Design &amp; Analysis of Algorithms (DAA) Interactive Laboratory</span>
          </div>

          <h1 className="rx-hero-title">
            Route<span className="rx-brand-accent">X</span> Algorithm Simulator
          </h1>

          <p className="rx-hero-subtitle">
            Experience real computer science algorithms solving mission-critical urban package logistics. Each algorithm features step-by-step interactive visualizations, synchronized JavaScript source code execution, and deterministic scenario data.
          </p>

          <div className="rx-hero-actions">
            <button
              className="rx-btn-hero-primary"
              onClick={() => onSelectAlgo('priority-queue')}
            >
              <span>Explore Algorithms</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="rx-btn-hero-secondary"
              onClick={onOpenSettings}
            >
              <Sliders size={18} />
              <span>Configure Scenario</span>
            </button>
          </div>

          {/* Quick Scenario Status Strip */}
          <div className="rx-hero-stats-row">
            <div className="rx-hero-stat">
              <span className="rx-stat-num">5</span>
              <span className="rx-stat-label">Shared Demo Orders</span>
            </div>
            <div className="rx-hero-stat-sep" />
            <div className="rx-hero-stat">
              <span className="rx-stat-num">6</span>
              <span className="rx-stat-label">Core DAA Algorithms</span>
            </div>
            <div className="rx-hero-stat-sep" />
            <div className="rx-hero-stat">
              <span className="rx-stat-num">8</span>
              <span className="rx-stat-label">Road Network Nodes</span>
            </div>
            <div className="rx-hero-stat-sep" />
            <div className="rx-hero-stat">
              <span className="rx-stat-num">100%</span>
              <span className="rx-stat-label">Real Algorithmic Logic</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Algorithm Library Grid */}
      <section className="rx-library-section" aria-labelledby="library-heading">
        <div className="rx-library-header">
          <div>
            <h2 id="library-heading" className="rx-library-heading">
              Algorithm Library
            </h2>
            <p className="rx-library-subheading">
              Choose an algorithm below to launch its purpose-built simulation workspace.
            </p>
          </div>
        </div>

        <div className="rx-library-grid">
          {ALGO_METADATA_CARDS.map(meta => {
            const algo = ALGORITHMS[meta.id];
            if (!algo) return null;
            const Icon = meta.icon;

            return (
              <div
                key={algo.id}
                className="rx-algo-card"
                onClick={() => onSelectAlgo(algo.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectAlgo(algo.id)}
              >
                <div className="rx-algo-card-header">
                  <div className="rx-algo-card-icon" style={{ backgroundColor: `${meta.badgeColor}15`, color: meta.badgeColor }}>
                    <Icon size={24} />
                  </div>
                  <span className="rx-algo-tag">{meta.tag}</span>
                </div>

                <div className="rx-algo-card-titles">
                  <h3 className="rx-algo-primary-title">
                    {algo.primaryName}
                  </h3>
                  <div className="rx-algo-secondary-title">
                    {algo.secondaryName}
                  </div>
                </div>

                <p className="rx-algo-card-desc">
                  {algo.shortDescription}
                </p>

                <div className="rx-algo-specs-row">
                  <span className="rx-spec-pill" title="Time Complexity">
                    <Clock size={13} />
                    <span className="font-mono">{meta.complexity}</span>
                  </span>
                  <span className="rx-spec-pill" title="Space Complexity">
                    <span className="font-mono">{meta.space}</span>
                  </span>
                </div>

                <div className="rx-algo-card-footer">
                  <span className="rx-launch-link">
                    Launch Simulation <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Unified Journey Card */}
        <div className="rx-featured-journey-card mt-8">
          <div className="rx-featured-journey-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="rx-badge-featured">Continuous Workflow</span>
              <span className="text-sm font-semibold text-emerald-700">14 Dynamic Stages</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Live Logistics Journey — End-to-End Delivery Pipeline
            </h3>
            <p className="text-slate-600 text-base mb-4">
              Watch all algorithms interact in real-time: orders are ingested and ranked in the binary heap, Floyd–Warshall evaluates transit legs, greedy assignment dispatches the optimal vehicle, Dijkstra plots the turn-by-turn route, and parcel arrival is verified.
            </p>
            <button
              className="rx-btn-journey-launch"
              onClick={() => onSelectAlgo('full-journey')}
            >
              <PlayCircle size={18} />
              <span>Launch 14-Stage Unified Journey</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Architectural Logistics Flow */}
      <section className="rx-flow-section" aria-label="End-to-End System Workflow">
        <h3 className="rx-flow-heading">The RouteX Logistics Lifecycle</h3>
        <p className="rx-flow-subheading">
          How foundational data structures and algorithmic paradigms collaborate across urban parcel fulfillment:
        </p>

        <div className="rx-flow-steps-grid">
          <div className="rx-flow-step">
            <span className="rx-flow-step-num">1</span>
            <strong>Order Intake &amp; Heap</strong>
            <p>Customer orders enter min-heap; emergency parcels rise to root.</p>
          </div>
          <div className="rx-flow-step">
            <span className="rx-flow-step-num">2</span>
            <strong>Distance Matrix</strong>
            <p>Floyd–Warshall pre-calculates all-pairs travel distances across the urban grid.</p>
          </div>
          <div className="rx-flow-step">
            <span className="rx-flow-step-num">3</span>
            <strong>Greedy Dispatch</strong>
            <p>Available fleet vehicles evaluated; lowest detour distance selected.</p>
          </div>
          <div className="rx-flow-step">
            <span className="rx-flow-step-num">4</span>
            <strong>Dijkstra Route</strong>
            <p>Shortest path calculated; vehicle moves through road intersections.</p>
          </div>
          <div className="rx-flow-step">
            <span className="rx-flow-step-num">5</span>
            <strong>Delivery Complete</strong>
            <p>Vehicle payload deducted; order status updated to Delivered.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
