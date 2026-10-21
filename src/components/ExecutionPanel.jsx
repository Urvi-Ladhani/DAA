import React from 'react';
import {
  HelpCircle,
  Cpu,
  ArrowRight,
  GitCommit,
  CheckCircle,
  Lightbulb,
  Clock,
  HardDrive,
  Info,
} from 'lucide-react';

export default function ExecutionPanel({
  currentStep,
  algorithmMeta,
}) {
  const title = currentStep?.title || 'Algorithm Initialized';
  const comparisons = currentStep?.comparisons || [];
  const calculations = currentStep?.calculations || '—';
  const decision = currentStep?.decision || 'Executing algorithm step.';
  const whatChanges = currentStep?.whatChanges || 'State updated.';
  const whatNext = currentStep?.whatNext || 'Proceed to next operation.';

  return (
    <div className="execution-panel-container glass-panel">
      {/* Panel Title */}
      <div className="panel-title-row">
        <span className="panel-tag">EXECUTION TELEMETRY &amp; LEARNING</span>
        <span className="panel-subtext">Detailed intermediate comparison &amp; decision logic</span>
      </div>

      {/* Step Title Header */}
      <div className="exec-step-header">
        <div className="exec-title-row">
          <Lightbulb size={18} className="text-amber" />
          <h3 className="exec-title">{title}</h3>
        </div>
      </div>

      {/* Structured Explanation Cards */}
      <div className="exec-sections-list">
        {/* 1. Comparisons */}
        <div className="exec-card">
          <div className="exec-card-header">
            <GitCommit size={14} className="text-cyan" />
            <span>Values Compared</span>
          </div>
          <div className="exec-card-body">
            {comparisons.length === 0 ? (
              <span className="text-dim text-xs">No active comparisons in this step.</span>
            ) : (
              <ul className="comparisons-list">
                {comparisons.map((c, i) => (
                  <li key={`comp-${i}`} className="telemetry text-xs">{c}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 2. Intermediate Calculation */}
        <div className="exec-card">
          <div className="exec-card-header">
            <Cpu size={14} className="text-mint" />
            <span>Intermediate Calculation</span>
          </div>
          <div className="exec-card-body">
            <p className="telemetry text-xs text-mint font-semibold">{calculations}</p>
          </div>
        </div>

        {/* 3. Decision & Reason */}
        <div className="exec-card">
          <div className="exec-card-header">
            <CheckCircle size={14} className="text-amber" />
            <span>Decision &amp; Reasoning</span>
          </div>
          <div className="exec-card-body">
            <p className="text-xs text-main">{decision}</p>
          </div>
        </div>

        {/* 4. State Changes & What Next */}
        <div className="exec-dual-grid">
          <div className="exec-mini-card">
            <span className="text-xs text-muted block mb-1">State Mutation:</span>
            <span className="telemetry text-xs text-cyan">{whatChanges}</span>
          </div>
          <div className="exec-mini-card">
            <span className="text-xs text-muted block mb-1">What Happens Next:</span>
            <span className="text-xs text-dim flex items-center gap-1">
              <ArrowRight size={12} className="text-amber inline" /> {whatNext}
            </span>
          </div>
        </div>
      </div>

      {/* Complexity Card */}
      {algorithmMeta && (
        <div className="complexity-footer-card">
          <div className="complexity-header">
            <Info size={14} className="text-cyan" />
            <span>Algorithmic Complexity &amp; Guarantees</span>
          </div>

          <div className="complexity-badges-row">
            <div className="comp-pill">
              <Clock size={12} className="text-cyan" />
              <span>Time: <strong className="telemetry text-cyan">
                {typeof algorithmMeta.timeComplexity === 'object'
                  ? Object.entries(algorithmMeta.timeComplexity).map(([k, v]) => `${k}: ${v}`).join(' | ')
                  : algorithmMeta.timeComplexity}
              </strong></span>
            </div>

            <div className="comp-pill">
              <HardDrive size={12} className="text-mint" />
              <span>Space: <strong className="telemetry text-mint">{algorithmMeta.spaceComplexity}</strong></span>
            </div>
          </div>

          <p className="complexity-assumptions text-xs text-dim">
            <strong>Assumptions:</strong> {algorithmMeta.assumptions}
          </p>
        </div>
      )}
    </div>
  );
}
