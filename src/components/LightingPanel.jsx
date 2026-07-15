// src/components/LightingPanel.jsx
import React from 'react';
import useKitchenStore from '../store/kitchenStore';
import { SKY_PRESETS } from '../utils/environment';

export default function LightingPanel() {
  const {
    skyPreset, setSkyPreset,
    exposure, setExposure,
    sunAngle, setSunAngle,
    sunIntensity, setSunIntensity,
    ambientIntensity, setAmbientIntensity,
    ssaoEnabled, bloomEnabled, vignetteEnabled, filmGrainEnabled, dofEnabled,
    ssaoIntensity, bloomIntensity, vignetteIntensity,
    contrast, saturation,
    setPostFX,
    ledColor, setLedColor,
  } = useKitchenStore();

  return (
    <div style={{ padding: '12px 14px' }}>
      {/* Sky Presets */}
      <div className="sidebar-section-title"><span>🌍</span><span>Sky & Environment</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 14 }}>
        {Object.entries(SKY_PRESETS).map(([key, cfg]) => (
          <button key={key}
            onClick={() => setSkyPreset(key)}
            style={{
              background: skyPreset === key ? 'var(--accent-dim)' : 'var(--bg-secondary)',
              border: `1px solid ${skyPreset === key ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '8px 4px',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              transition: 'var(--transition)',
              color: skyPreset === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.60rem', fontWeight: 600,
            }}>
            <span style={{ fontSize: 18 }}>{cfg.icon}</span>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Exposure */}
      <div className="label">Exposure</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <input type="range" min={0.3} max={2.5} step={0.05}
          value={exposure}
          onChange={(e) => setExposure(parseFloat(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 32 }}>
          {exposure.toFixed(2)}
        </span>
      </div>

      {/* Sun Angle */}
      <div className="label">Sun Angle</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <input type="range" min={0} max={180} step={1}
          value={sunAngle}
          onChange={(e) => setSunAngle(parseInt(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 32 }}>
          {sunAngle}°
        </span>
      </div>

      {/* Sun Intensity */}
      <div className="label">Sun Intensity</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <input type="range" min={0} max={3} step={0.05}
          value={sunIntensity}
          onChange={(e) => setSunIntensity(parseFloat(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 32 }}>
          {sunIntensity.toFixed(1)}
        </span>
      </div>

      <div className="divider" />

      {/* Post-Processing */}
      <div className="sidebar-section-title" style={{ marginTop: 8 }}><span>✨</span><span>Post-Processing</span></div>

      {/* SSAO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>Ambient Occlusion</span>
        <button className={`toggle-btn ${ssaoEnabled ? 'active' : ''}`} onClick={() => setPostFX('ssaoEnabled', !ssaoEnabled)}>
          {ssaoEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      {ssaoEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <input type="range" min={0} max={1} step={0.05} value={ssaoIntensity}
            onChange={(e) => setPostFX('ssaoIntensity', parseFloat(e.target.value))}
            style={{ flex: 1 }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 28 }}>{ssaoIntensity.toFixed(2)}</span>
        </div>
      )}

      {/* Bloom */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>Bloom</span>
        <button className={`toggle-btn ${bloomEnabled ? 'active' : ''}`} onClick={() => setPostFX('bloomEnabled', !bloomEnabled)}>
          {bloomEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      {bloomEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <input type="range" min={0} max={1} step={0.05} value={bloomIntensity}
            onChange={(e) => setPostFX('bloomIntensity', parseFloat(e.target.value))}
            style={{ flex: 1 }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 28 }}>{bloomIntensity.toFixed(2)}</span>
        </div>
      )}

      {/* Vignette */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>Vignette</span>
        <button className={`toggle-btn ${vignetteEnabled ? 'active' : ''}`} onClick={() => setPostFX('vignetteEnabled', !vignetteEnabled)}>
          {vignetteEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Film Grain */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>Film Grain</span>
        <button className={`toggle-btn ${filmGrainEnabled ? 'active' : ''}`} onClick={() => setPostFX('filmGrainEnabled', !filmGrainEnabled)}>
          {filmGrainEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="divider" />

      {/* Color Grading */}
      <div className="sidebar-section-title" style={{ marginTop: 8 }}><span>🎨</span><span>Color Grading</span></div>
      <div className="label">Contrast</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input type="range" min={0.5} max={2.0} step={0.05} value={contrast}
          onChange={(e) => setPostFX('contrast', parseFloat(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 28 }}>{contrast.toFixed(2)}</span>
      </div>
      <div className="label">Saturation</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input type="range" min={0} max={2.0} step={0.05} value={saturation}
          onChange={(e) => setPostFX('saturation', parseFloat(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontFamily: 'monospace', width: 28 }}>{saturation.toFixed(2)}</span>
      </div>

      <div className="divider" />
      
      {/* LED Underglow */}
      <div className="sidebar-section-title" style={{ marginTop: 8 }}><span>💡</span><span>Cabinet LED Underglow</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input type="color" value={ledColor || '#fff0d0'}
          onChange={(e) => setLedColor(e.target.value)}
          style={{ width: 36, height: 26, borderRadius: 4, border: '1px solid var(--border-input)', cursor: 'pointer', background: 'none', padding: 2 }} />
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'space-around' }}>
          {[
            { color: '#fff8f0', name: 'Warm' },
            { color: '#fbbf24', name: 'Amber' },
            { color: '#3b82f6', name: 'Ice' },
            { color: '#10b981', name: 'Neon' },
            { color: '#ec4899', name: 'Pink' }
          ].map(sw => (
            <button key={sw.color}
              onClick={() => setLedColor(sw.color)}
              title={sw.name}
              style={{
                width: 18, height: 18,
                borderRadius: '50%',
                background: sw.color,
                border: `2px solid ${ledColor === sw.color ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}
