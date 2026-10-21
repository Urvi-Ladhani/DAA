import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
} from 'lucide-react';

export default function PlaybackControls({
  currentStepIndex,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onPlay,
  onPause,
  onPrevStep,
  onNextStep,
  onRunToCompletion,
  onChangeSpeed,
  onSeekStep,
}) {
  const speeds = [0.5, 1, 2, 4];
  const safeCurrent = Math.min(currentStepIndex + 1, totalSteps || 1);
  const isAtEnd = currentStepIndex >= (totalSteps - 1);

  return (
    <footer className="rx-playback-bar" aria-label="Simulation Playback Controls">
      {/* 1. Left: Current Step Number */}
      <div className="rx-playback-step-info">
        <span className="rx-step-label">Current Step</span>
        <div className="rx-step-counter font-mono">
          Step <strong className="rx-step-active-num">{safeCurrent}</strong> of {totalSteps || 1}
        </div>
      </div>

      {/* 2. Center: Playback Buttons Group */}
      <div className="rx-playback-buttons-group">
        {/* Previous Step */}
        <button
          className="rx-playback-btn"
          onClick={onPrevStep}
          disabled={currentStepIndex <= 0}
          title="Previous Step"
          aria-label="Previous Step"
        >
          <SkipBack size={18} />
        </button>

        {/* Play / Pause Toggle */}
        {isPlaying ? (
          <button
            className="rx-playback-btn rx-btn-play-pause rx-btn-pause"
            onClick={onPause}
            title="Pause Simulation"
            aria-label="Pause Simulation"
          >
            <Pause size={20} />
          </button>
        ) : (
          <button
            className="rx-playback-btn rx-btn-play-pause rx-btn-play"
            onClick={onPlay}
            title={isAtEnd ? "Restart Simulation from Beginning" : "Play Simulation"}
            aria-label={isAtEnd ? "Restart Simulation from Beginning" : "Play Simulation"}
          >
            <Play size={20} className="ml-0.5" />
          </button>
        )}

        {/* Next Step */}
        <button
          className="rx-playback-btn"
          onClick={onNextStep}
          disabled={isAtEnd}
          title="Next Step"
          aria-label="Next Step"
        >
          <SkipForward size={18} />
        </button>

        {/* Run to Completion */}
        <button
          className="rx-playback-btn"
          onClick={onRunToCompletion}
          disabled={isAtEnd}
          title="Run to Completion"
          aria-label="Run to Completion"
        >
          <FastForward size={18} />
        </button>
      </div>

      {/* 3. Right: Scrubber Slider & Speed Selector */}
      <div className="rx-playback-right-controls">
        {/* Progress Slider */}
        <div className="rx-scrubber-container">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => onSeekStep(Number(e.target.value))}
            className="rx-scrubber-slider"
            title={`Seek step (${safeCurrent}/${totalSteps})`}
            aria-label="Simulation progress scrubber"
          />
        </div>

        {/* Animation Speed Selector */}
        <div className="rx-speed-selector" role="group" aria-label="Playback speed">
          <span className="rx-speed-label">Speed</span>
          <div className="rx-speed-pills">
            {speeds.map(spd => (
              <button
                key={spd}
                className={`rx-speed-pill ${playbackSpeed === spd ? 'rx-speed-pill-active' : ''}`}
                onClick={() => onChangeSpeed(spd)}
                title={`Set speed to ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
