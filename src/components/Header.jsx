import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Layers,
  Network,
  Truck,
  Navigation,
  GitFork,
  Briefcase,
  Sliders,
  ChevronDown,
  PlayCircle,
  Cpu,
} from 'lucide-react';
import { SIX_CORE_ALGORITHMS, ALGORITHMS } from '../algorithms/index.js';

const ALGO_ICONS = {
  'priority-queue': Layers,
  'floyd-warshall': Network,
  'greedy-vehicle-assignment': Truck,
  'dijkstra': Navigation,
  'branch-and-bound-tsp': GitFork,
  'knapsack-01': Briefcase,
  'full-journey': PlayCircle,
};

export default function Header({
  activeView, // 'home' | 'simulation' | 'settings'
  activeAlgoId,
  onNavigateHome,
  onSelectAlgo,
  onOpenSettings,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentAlgo = ALGORITHMS[activeAlgoId] || SIX_CORE_ALGORITHMS[0];
  const CurrentIcon = ALGO_ICONS[currentAlgo.id] || Layers;

  return (
    <header className="rx-top-header" role="banner">
      {/* 1. Left: RouteX Branding */}
      <div
        className="rx-brand-container"
        onClick={onNavigateHome}
        role="button"
        tabIndex={0}
        title="RouteX Home — Algorithm Library"
        onKeyDown={(e) => e.key === 'Enter' && onNavigateHome()}
      >
        <div className="rx-brand-icon-box">
          <Cpu size={22} className="rx-brand-icon-svg" />
        </div>
        <div className="rx-brand-text-col">
          <div className="rx-brand-name">
            Route<span className="rx-brand-accent">X</span>
          </div>
          <span className="rx-brand-tagline">ALGORITHM SIMULATOR</span>
        </div>
      </div>

      {/* 2. Center: Algorithm Navigation Menu & Switcher */}
      <nav className="rx-header-nav" aria-label="Main Navigation">
        {/* Home / Algorithm Library Link */}
        <button
          className={`rx-nav-link ${activeView === 'home' ? 'rx-nav-link-active' : ''}`}
          onClick={onNavigateHome}
          title="Browse all algorithm simulations and educational guide"
        >
          <LayoutGrid size={18} className="rx-nav-icon" />
          <span>Algorithm Library</span>
        </button>

        {/* Divider */}
        <div className="rx-nav-divider" />

        {/* Algorithm Dropdown Switcher */}
        <div className="rx-algo-selector-wrapper" ref={dropdownRef}>
          <button
            className={`rx-algo-menu-btn ${activeView === 'simulation' ? 'rx-algo-menu-btn-active' : ''}`}
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            title="Switch Algorithm Simulation"
          >
            <div className="rx-algo-btn-icon-box">
              <CurrentIcon size={18} className="text-primary" />
            </div>

            <div className="rx-algo-btn-text">
              <span className="rx-algo-btn-primary">
                {currentAlgo.primaryName}
              </span>
              <span className="rx-algo-btn-secondary">
                {currentAlgo.secondaryName}
              </span>
            </div>

            <ChevronDown
              size={18}
              className={`rx-chevron ${isDropdownOpen ? 'rx-chevron-open' : ''}`}
            />
          </button>

          {/* Clean Dropdown Popover */}
          {isDropdownOpen && (
            <div className="rx-algo-dropdown-panel" role="menu">
              <div className="rx-dropdown-section-title">
                SELECT ALGORITHM SIMULATION
              </div>

              <div className="rx-dropdown-list">
                {SIX_CORE_ALGORITHMS.map(algo => {
                  const Icon = ALGO_ICONS[algo.id] || Layers;
                  const isSelected = activeView === 'simulation' && algo.id === activeAlgoId;

                  return (
                    <button
                      key={algo.id}
                      role="menuitem"
                      className={`rx-dropdown-item ${isSelected ? 'rx-dropdown-item-active' : ''}`}
                      onClick={() => {
                        onSelectAlgo(algo.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="rx-dropdown-item-icon">
                        <Icon size={18} />
                      </div>
                      <div className="rx-dropdown-item-info">
                        <span className="rx-dropdown-item-primary">{algo.primaryName}</span>
                        <span className="rx-dropdown-item-secondary">{algo.secondaryName}</span>
                      </div>
                      {isSelected && <span className="rx-dropdown-item-pill">Active</span>}
                    </button>
                  );
                })}

                {/* Unified Journey Entry */}
                <div className="rx-dropdown-separator" />
                <button
                  role="menuitem"
                  className={`rx-dropdown-item ${activeView === 'simulation' && activeAlgoId === 'full-journey' ? 'rx-dropdown-item-active' : ''}`}
                  onClick={() => {
                    onSelectAlgo('full-journey');
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="rx-dropdown-item-icon rx-dropdown-journey-icon">
                    <PlayCircle size={18} />
                  </div>
                  <div className="rx-dropdown-item-info">
                    <span className="rx-dropdown-item-primary">Live Logistics Journey</span>
                    <span className="rx-dropdown-item-secondary">14-Stage Unified Pipeline</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 3. Right: Scenario Settings Navigation Tab */}
      <div className="rx-header-right">
        <button
          className={`rx-nav-settings-btn ${activeView === 'settings' ? 'rx-nav-settings-btn-active' : ''}`}
          onClick={onOpenSettings}
          title="Configure orders, road network, vehicles, and packages"
        >
          <Sliders size={18} />
          <span>Scenario Settings</span>
        </button>
      </div>
    </header>
  );
}
