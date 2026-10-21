import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Code2 } from 'lucide-react';
import Header from './components/Header.jsx';
import HomePage from './components/HomePage.jsx';
import OrdersStrip from './components/OrdersStrip.jsx';
import PlaybackControls from './components/PlaybackControls.jsx';
import CodeViewer from './components/CodeViewer.jsx';
import ScenarioSettingsPage from './components/ScenarioSettingsPage.jsx';

import FullJourneyVisualizer from './components/visualizers/FullJourneyVisualizer.jsx';
import PriorityQueueVisualizer from './components/visualizers/PriorityQueueVisualizer.jsx';
import FloydWarshallVisualizer from './components/visualizers/FloydWarshallVisualizer.jsx';
import VehicleAssignmentVisualizer from './components/visualizers/VehicleAssignmentVisualizer.jsx';
import DijkstraVisualizer from './components/visualizers/DijkstraVisualizer.jsx';
import TSPVisualizer from './components/visualizers/TSPVisualizer.jsx';
import KnapsackVisualizer from './components/visualizers/KnapsackVisualizer.jsx';

import { ALGORITHMS } from './algorithms/index.js';
import { createDefaultScenario } from './data/initialScenario.js';
import './App.css';

export default function App() {
  // Scenario state (deterministic 5 demo orders, road network, vehicles)
  const [scenario, setScenario] = useState(() => createDefaultScenario());
  const [activeView, setActiveView] = useState('simulation'); // 'home' | 'simulation' | 'settings'
  const [activeAlgoId, setActiveAlgoId] = useState('priority-queue');
  const [selectedOrderId, setSelectedOrderId] = useState('RX-103');
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);

  // Playback state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const activeAlgo = ALGORITHMS[activeAlgoId] || ALGORITHMS['priority-queue'];

  // Compute real algorithm execution trace
  const simulationResult = useMemo(() => {
    try {
      if (activeAlgoId === 'full-journey') {
        return activeAlgo.run(scenario, selectedOrderId);
      }
      return activeAlgo.run(scenario);
    } catch (err) {
      console.error('Algorithm execution error:', err);
      return { trace: [] };
    }
  }, [activeAlgo, scenario, selectedOrderId, activeAlgoId]);

  const trace = simulationResult?.trace || [];
  const totalSteps = trace.length;
  const safeStepIndex = Math.min(currentStepIndex, Math.max(0, totalSteps - 1));
  const currentStep = trace[safeStepIndex] || null;

  // Sync orders snapshot from current step if in full journey simulation
  const currentOrders = useMemo(() => {
    if (activeAlgoId === 'full-journey' && currentStep?.ordersSnapshot) {
      return currentStep.ordersSnapshot;
    }
    return scenario.orders;
  }, [activeAlgoId, currentStep, scenario.orders]);

  // Reset playback when algorithm or scenario inputs change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeAlgoId, scenario, selectedOrderId]);

  // Playback animation timer loop
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      if (currentStepIndex >= totalSteps - 1) {
        setIsPlaying(false);
        return;
      }

      const intervalMs = Math.max(120, Math.round(900 / playbackSpeed));
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed]);

  // Playback handlers
  const handlePlay = useCallback(() => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, totalSteps]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePrevStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps]);

  const handleRunToCompletion = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(Math.max(0, totalSteps - 1));
  }, [totalSteps]);

  const handleSeekStep = useCallback((stepIdx) => {
    setIsPlaying(false);
    setCurrentStepIndex(stepIdx);
  }, []);

  const handleSaveScenario = useCallback((newScenario) => {
    setScenario(newScenario);
    setActiveView('simulation');
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handleSelectAlgo = useCallback((algoId) => {
    setActiveAlgoId(algoId);
    setActiveView('simulation');
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Render Visualizer for Active Tab
  function renderVisualizerCanvas() {
    switch (activeAlgoId) {
      case 'full-journey':
        return (
          <FullJourneyVisualizer
            currentStep={currentStep}
            roadGraph={scenario.roadGraph}
            orders={currentOrders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
          />
        );
      case 'priority-queue':
        return (
          <PriorityQueueVisualizer
            currentStep={currentStep}
          />
        );
      case 'floyd-warshall':
        return (
          <FloydWarshallVisualizer
            currentStep={currentStep}
            roadGraph={scenario.roadGraph}
          />
        );
      case 'greedy-vehicle-assignment':
        return (
          <VehicleAssignmentVisualizer
            currentStep={currentStep}
            orders={scenario.orders}
          />
        );
      case 'dijkstra':
        return (
          <DijkstraVisualizer
            currentStep={currentStep}
            roadGraph={scenario.roadGraph}
          />
        );
      case 'branch-and-bound-tsp':
        return (
          <TSPVisualizer
            currentStep={currentStep}
          />
        );
      case 'knapsack-01':
        return (
          <KnapsackVisualizer
            currentStep={currentStep}
          />
        );
      default:
        return null;
    }
  }

  // Determine whether to display the 5-order selector in simulation workspace
  const showOrdersSelector = ['priority-queue', 'greedy-vehicle-assignment', 'full-journey'].includes(activeAlgoId);

  return (
    <div className="rx-app-shell">
      {/* 1. Polished Top Navigation */}
      <Header
        activeView={activeView}
        activeAlgoId={activeAlgoId}
        onNavigateHome={() => setActiveView('home')}
        onSelectAlgo={handleSelectAlgo}
        onOpenSettings={() => setActiveView('settings')}
      />

      {/* 2. Main View Switcher */}
      {activeView === 'home' && (
        <HomePage
          onSelectAlgo={handleSelectAlgo}
          onOpenSettings={() => setActiveView('settings')}
        />
      )}

      {activeView === 'settings' && (
        <ScenarioSettingsPage
          scenario={scenario}
          onSaveScenario={handleSaveScenario}
          onCancel={() => setActiveView('simulation')}
        />
      )}

      {activeView === 'simulation' && (
        <div className="rx-simulation-page">
          {/* Algorithm Page Header with subtle View Implementation action */}
          <div className="rx-algo-page-header">
            <div className="rx-algo-title-block">
              <div className="rx-algo-heading-row">
                <h2 className="rx-algo-main-heading">
                  {activeAlgo.primaryName}
                </h2>
                <span className="rx-algo-badge-secondary">
                  {activeAlgo.secondaryName}
                </span>
              </div>
              <p className="rx-algo-desc-text">
                {activeAlgo.shortDescription}
              </p>
            </div>

            {/* Subtle, Unobtrusive View Implementation Action */}
            <div className="rx-algo-header-actions">
              <button
                className="rx-btn-view-code"
                onClick={() => setIsCodeDrawerOpen(true)}
                title={`Inspect JavaScript implementation (${activeAlgo.fileName})`}
              >
                <Code2 size={16} />
                <span>View Implementation</span>
              </button>
            </div>
          </div>

          {/* Dedicated 5-Order Selector Strip for Order-Centric Algorithms */}
          {showOrdersSelector && (
            <div className="rx-orders-strip-wrapper">
              <OrdersStrip
                orders={currentOrders}
                selectedOrderId={selectedOrderId}
                onSelectOrder={setSelectedOrderId}
              />
            </div>
          )}

          {/* Large Central Visualization Canvas */}
          <main className="rx-simulation-canvas-area" aria-label="Interactive Algorithm Simulation Canvas">
            {renderVisualizerCanvas()}
          </main>

          {/* Unified Playback Bar at Bottom */}
          <PlaybackControls
            currentStepIndex={safeStepIndex}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onPlay={handlePlay}
            onPause={handlePause}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onRunToCompletion={handleRunToCompletion}
            onChangeSpeed={setPlaybackSpeed}
            onSeekStep={handleSeekStep}
          />
        </div>
      )}

      {/* 3. Collapsible Source-Code Drawer */}
      <CodeViewer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
        rawSourceCode={activeAlgo.sourceCode}
        fileName={activeAlgo.fileName}
        currentCodeTag={currentStep?.codeTag}
        currentOp={currentStep?.op}
      />
    </div>
  );
}
