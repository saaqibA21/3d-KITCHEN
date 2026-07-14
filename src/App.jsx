import React, { useState, useEffect } from 'react';
import useKitchenStore from './store/kitchenStore';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import FloorPlan2D from './components/FloorPlan2D';
import Scene3D from './components/Scene3D';
import './App.css';

function WalkthroughOverlay({ onExit }) {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const handleLock = () => setLocked(document.pointerLockElement !== null);
    document.addEventListener('pointerlockchange', handleLock);
    return () => document.removeEventListener('pointerlockchange', handleLock);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.code === 'Escape' && !document.pointerLockElement) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onExit]);

  return (
    <div className="walkthrough-overlay">
      {locked ? (
        <>
          <div className="walkthrough-crosshair" />
          <div className="walkthrough-controls-hint">
            <span className="hint-key">W</span>
            <span className="hint-key">A</span>
            <span className="hint-key">S</span>
            <span className="hint-key">D</span>
            <span className="hint-separator">—</span>
            <span className="hint-key">Mouse</span>
            <span className="hint-separator">look</span>
            <span className="hint-key">ESC</span>
            <span className="hint-separator">exit lock</span>
          </div>
        </>
      ) : (
        <div className="walkthrough-click-prompt">
          <h3>🚶 Walkthrough Mode</h3>
          <p>Click anywhere to lock mouse and start walking</p>
          <p style={{ marginTop: 8, fontSize: '0.72rem', opacity: 0.6 }}>
            Press ESC twice to exit walkthrough
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { 
    viewMode, setViewMode, 
    vignetteEnabled, vignetteIntensity, 
    filmGrainEnabled, contrast, saturation 
  } = useKitchenStore();
  
  const isWalkthrough = viewMode === 'walkthrough';
  const is3D = viewMode === '3d';
  const isPlan = viewMode === 'plan';

  useEffect(() => {
    if (!filmGrainEnabled) return;
    const canvas = document.getElementById('grain-overlay');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;

    const drawGrain = () => {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i+1] = v;
        data[i+2] = v;
        data[i+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      frame = requestAnimationFrame(drawGrain);
    };

    drawGrain();
    return () => cancelAnimationFrame(frame);
  }, [filmGrainEnabled, viewMode]);

  return (
    <div className={`app-layout ${isWalkthrough ? 'walkthrough-mode' : is3D ? 'view-3d' : 'view-plan'}`}>
      {/* Toolbar spans full width */}
      <div className="app-toolbar">
        <Toolbar />
      </div>

      {/* Sidebar — hide in walkthrough */}
      {!isWalkthrough && (
        <div className="app-sidebar">
          <Sidebar />
        </div>
      )}

      {/* Main Viewport */}
      <div
        className={`app-viewport ${isWalkthrough ? 'full-view' : ''}`}
        style={isWalkthrough ? { gridColumn: '1 / -1' } : {}}
      >
        {/* 2D Floor Plan */}
        {isPlan && (
          <div className="viewport-2d animate-fade-in">
            <FloorPlan2D />
          </div>
        )}

        {/* 3D Scene (always mounted to preserve state, just hidden) */}
        <div
          className="viewport-3d"
          style={{ 
            display: isPlan ? 'none' : 'block', 
            position: 'relative',
            filter: `contrast(${contrast}) saturate(${saturation})`
          }}
        >
          {isWalkthrough && <WalkthroughOverlay onExit={() => setViewMode('3d')} />}
          <Scene3D isWalkthrough={isWalkthrough} />

          {/* Vignette & Grain Overlay */}
          {(vignetteEnabled || filmGrainEnabled) && !isPlan && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2,
              background: vignetteEnabled
                ? `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,${vignetteIntensity * 0.8}) 100%)`
                : 'none',
            }}>
              {filmGrainEnabled && (
                <canvas id="grain-overlay" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none',
                }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel — hide in walkthrough */}
      {!isWalkthrough && (
        <div className="app-props">
          <PropertiesPanel />
        </div>
      )}
    </div>
  );
}
