import React, { useEffect, useRef } from 'react';
import { X, FileCode } from 'lucide-react';
import { parseSourceCode, resolveCodeLine } from '../algorithms/lineMapping.js';

export default function CodeViewer({
  isOpen,
  onClose,
  rawSourceCode,
  fileName,
  currentCodeTag,
  currentOp,
}) {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  const parsedLines = React.useMemo(() => {
    return parseSourceCode(rawSourceCode);
  }, [rawSourceCode]);

  const activeLineNumber = React.useMemo(() => {
    return resolveCodeLine(rawSourceCode, currentCodeTag);
  }, [rawSourceCode, currentCodeTag]);

  // Smooth scroll active line into view
  useEffect(() => {
    if (isOpen && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isOpen, activeLineNumber]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="rx-code-drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="rx-code-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Algorithm Source Code Viewer"
      >
        {/* Drawer Header */}
        <div className="rx-code-drawer-header">
          <div className="rx-code-drawer-title-group">
            <div className="rx-code-icon-box">
              <FileCode size={20} className="text-primary" />
            </div>
            <div>
              <div className="rx-code-filename font-mono">
                src/algorithms/{fileName}
              </div>
              <div className="rx-code-status-row font-mono">
                <span className="rx-code-status-dot" />
                <span>Synchronized Execution — Line {activeLineNumber}</span>
                {currentOp && <span className="rx-code-op-badge">[{currentOp}]</span>}
              </div>
            </div>
          </div>

          <button
            className="rx-code-drawer-close-btn"
            onClick={onClose}
            title="Close Source Code Viewer (Esc)"
            aria-label="Close Source Code Viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Code View Body with Line Numbers */}
        <div className="rx-code-drawer-scroll" ref={containerRef}>
          <pre className="rx-code-pre">
            {parsedLines.map(line => {
              const isActive = line.lineNumber === activeLineNumber;

              return (
                <div
                  key={`line-${line.lineNumber}`}
                  ref={isActive ? activeLineRef : null}
                  className={`rx-code-line ${isActive ? 'rx-code-line-active' : ''}`}
                >
                  <span className="rx-code-gutter">{line.lineNumber}</span>
                  <span className="rx-code-text">{line.cleanText || ' '}</span>
                </div>
              );
            })}
          </pre>
        </div>
      </aside>
    </div>
  );
}
