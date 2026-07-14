import React, { useState } from 'react';
import useKitchenStore from '../store/kitchenStore';
import './PropertiesPanel.css';

const INSPECTOR_TABS = [
  { id: 'material',   label: 'Material' },
  { id: 'dimensions', label: 'Size' },
  { id: 'position',   label: 'Position' },
  { id: 'door',       label: 'Door' },
  { id: 'countertop', label: 'Top' },
];

const COUNTERTOPS = [
  { value: 'granite',   label: 'Granite',  gradient: 'radial-gradient(circle, #5c5c5c 10%, #2b2b2b 80%)' },
  { value: 'marble',    label: 'Marble',   gradient: 'linear-gradient(135deg, #f5f5f5 25%, #e0e0e0 50%, #f5f5f5 75%)' },
  { value: 'quartz',    label: 'Quartz',   gradient: 'linear-gradient(135deg, #e6f2ff, #ffffff)' },
  { value: 'laminate',  label: 'Laminate', gradient: 'linear-gradient(45deg, #a0522d, #8b4513)' },
  { value: 'sintered',  label: 'Sintered', gradient: 'linear-gradient(135deg, #c0c0c0, #808080)' },
  { value: 'butcher',   label: 'Butcher Block', gradient: 'linear-gradient(45deg, #a0522d, #d2691e)' },
];

const CABINET_MATERIALS = [
  { id: 'matte',        label: 'Matte',       gradient: 'radial-gradient(circle, #cbd5e1 10%, #475569 90%)' },
  { id: 'glossy',       label: 'Glossy',      gradient: 'linear-gradient(135deg, #e2a85c, #0a0c10)' },
  { id: 'ultra_gloss',  label: 'Ultra Gloss', gradient: 'linear-gradient(135deg, #ffffff 0%, #cccccc 40%, #ffffff 100%)' },
  { id: 'wood_grain',   label: 'Oak Wood',    gradient: 'linear-gradient(45deg, #8b5a2b, #5c3a21)' },
  { id: 'wood_walnut',  label: 'Walnut',      gradient: 'linear-gradient(45deg, #3d1f0a, #7a4a1e)' },
  { id: 'concrete',     label: 'Concrete',    gradient: 'linear-gradient(135deg, #708090, #2f4f4f)' },
];

const PRESET_COLORS = [
  '#f5f0e8', '#e8dcc8', '#d4c5b0', '#c0a882', '#a08060',
  '#3a322c', '#5c3a21', '#8b5a2b', '#2d2d2d', '#111111',
  '#4a5054', '#1e293b', '#1e3a8a', '#60a5fa', '#365314',
  '#15803d', '#86efac', '#7f1d1d', '#b91c1c', '#fca5a5',
  '#7c2d12', '#ea580c', '#ffedd5', '#fef08a', '#facc15',
  '#ffffff', '#c0c0c0', '#808080', '#000000',
];

export default function PropertiesPanel() {
  const { getSelectedModule, updateModule, removeModule, selectedId, setSelectedId, toggleDoor, modules } = useKitchenStore();
  const { saveDesign, loadDesign, clearAll } = useKitchenStore();
  const fileInputRef = React.useRef();
  const mod = getSelectedModule();
  const [inspectorTab, setInspectorTab] = useState('material');
  const [hexInput, setHexInput] = useState('');

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadDesign(ev.target.result);
    reader.readAsText(file);
  };

  const handleDuplicate = () => {
    if (!mod) return;
    const { addModule } = useKitchenStore.getState();
    addModule(mod.type, [mod.position[0] + 0.1, mod.position[1] + 0.1], mod);
  };

  const handleRotate = () => {
    if (!mod) return;
    updateModule(mod.id, { rotation: (mod.rotation + 90) % 360 });
  };

  if (!mod) {
    return (
      <div className="props-panel animate-slide-right">
        <div className="props-header">
          <span className="props-header-icon">✦</span>
          <span className="props-header-title" style={{ fontFamily: 'var(--font-display)' }}>Properties</span>
        </div>
        <div className="props-scroll">
          <div className="props-empty">
            <div className="props-empty-icon">🪑</div>
            <div className="props-empty-title">No Object Selected</div>
            <div className="props-empty-desc">Click any cabinet, appliance, or fixture in the floor plan or 3D view to edit its properties.</div>
          </div>
          <div style={{ padding: '0 14px 14px' }}>
            <div className="divider" style={{ marginBottom: 12 }} />
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{modules.length}</div>
                <div className="stat-label">Objects</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{modules.filter(m => m.isAppliance).length}</div>
                <div className="stat-label">Appliances</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={saveDesign} style={{ flex: 1 }}>💾 Save</button>
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ flex: 1 }}>📂 Load</button>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleLoad} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn-danger" onClick={clearAll} style={{ width: '100%' }}>🗑️ Clear All Objects</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="props-panel animate-slide-right">
      <div className="props-header">
        <span className="props-header-icon">✦</span>
        <span className="props-header-title" style={{ fontFamily: 'var(--font-display)' }}>Properties</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.60rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
          {mod.type}
        </span>
      </div>
      <div className="props-scroll">
        <div className="props-body animate-fade-in" key={mod.id}>
          {/* Header row */}
          <div className="mc-header-row">
            <button className="mc-back-btn" onClick={() => setSelectedId(null)}>◀ Back</button>
            <span className="badge" style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.label}</span>
            <button className="mc-close-btn" onClick={() => setSelectedId(null)}>✕</button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{(mod.width * 100).toFixed(0)}</div>
              <div className="stat-label">W (cm)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{(mod.depth * 100).toFixed(0)}</div>
              <div className="stat-label">D (cm)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{(mod.height * 100).toFixed(0)}</div>
              <div className="stat-label">H (cm)</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="action-row">
            <button className="btn-secondary" style={{ flex: 1 }} onClick={handleRotate}>↻ Rotate</button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={handleDuplicate}>⊕ Duplicate</button>
            <button className="btn-danger" onClick={() => { removeModule(mod.id); }}>🗑</button>
          </div>

          {/* Inspector tabs */}
          <div className="inspector-tabs">
            {INSPECTOR_TABS.map(t => (
              <button key={t.id} className={`inspector-tab ${inspectorTab === t.id ? 'active' : ''}`}
                onClick={() => setInspectorTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── MATERIAL TAB ── */}
          {inspectorTab === 'material' && (
            <div className="animate-fade-in">
              <div className="label" style={{ marginBottom: 6 }}>Finish</div>
              <div className="mc-left-panel">
                {CABINET_MATERIALS.map(cat => (
                  <button key={cat.id}
                    className={`mc-category-btn ${mod.material === cat.id ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { material: cat.id })}>
                    <div className="mc-thumbnail" style={{ background: cat.gradient }}>
                      {mod.material === cat.id && '✓'}
                    </div>
                    <span className="mc-label">{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="label" style={{ marginBottom: 6 }}>Color</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <input type="color" value={mod.color}
                  onChange={(e) => updateModule(mod.id, { color: e.target.value })}
                  style={{ width: 36, height: 30, borderRadius: 6, border: '1px solid var(--border-input)', cursor: 'pointer', background: 'none', padding: 2 }} />
                <input type="text" value={hexInput || mod.color}
                  onChange={(e) => {
                    setHexInput(e.target.value);
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateModule(mod.id, { color: e.target.value });
                  }}
                  placeholder="#hex"
                  style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 6, color: 'var(--text-primary)', padding: '6px 10px', fontSize: '0.76rem', fontFamily: 'monospace', outline: 'none' }} />
              </div>
              <div className="mc-grid">
                {PRESET_COLORS.map(c => (
                  <button key={c} className={`mc-swatch ${mod.color === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => { updateModule(mod.id, { color: c }); setHexInput(c); }} />
                ))}
              </div>

              {/* PBR sliders */}
              <div className="pbr-section">
                <div className="label" style={{ marginBottom: 6 }}>PBR Properties</div>
                <div className="pbr-row">
                  <span className="pbr-label">Roughness</span>
                  <input type="range" min={0} max={1} step={0.01}
                    value={mod.roughnessOverride ?? 0.88}
                    onChange={(e) => updateModule(mod.id, { roughnessOverride: parseFloat(e.target.value) })} />
                  <span className="pbr-value">{(mod.roughnessOverride ?? 0.88).toFixed(2)}</span>
                </div>
                <div className="pbr-row">
                  <span className="pbr-label">Metalness</span>
                  <input type="range" min={0} max={1} step={0.01}
                    value={mod.metalnessOverride ?? 0}
                    onChange={(e) => updateModule(mod.id, { metalnessOverride: parseFloat(e.target.value) })} />
                  <span className="pbr-value">{(mod.metalnessOverride ?? 0).toFixed(2)}</span>
                </div>
                <div className="pbr-row">
                  <span className="pbr-label">Tex Scale</span>
                  <input type="range" min={0.5} max={4} step={0.1}
                    value={mod.textureScale ?? 1}
                    onChange={(e) => updateModule(mod.id, { textureScale: parseFloat(e.target.value) })} />
                  <span className="pbr-value">{(mod.textureScale ?? 1).toFixed(1)}×</span>
                </div>
              </div>
            </div>
          )}

          {/* ── DIMENSIONS TAB ── */}
          {inspectorTab === 'dimensions' && (
            <div className="animate-fade-in">
              <div className="label" style={{ marginBottom: 8 }}>Dimensions (meters)</div>
              <div className="dim-inputs">
                {[['Width', 'width', 0.1, 4], ['Depth', 'depth', 0.1, 2], ['Height', 'height', 0.3, 2.5]].map(([label, key, min, max]) => (
                  <div key={key} className="dim-input-group">
                    <span className="dim-input-label">{label}</span>
                    <input type="number" step={0.05} min={min} max={max}
                      value={mod[key]}
                      onChange={(e) => updateModule(mod.id, { [key]: parseFloat(e.target.value) || mod[key] })} />
                  </div>
                ))}
              </div>
              <div className="label" style={{ marginBottom: 6 }}>Rotation</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[0, 90, 180, 270].map(deg => (
                  <button key={deg}
                    className={`option-btn ${mod.rotation === deg ? 'active' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => updateModule(mod.id, { rotation: deg })}>
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── POSITION TAB ── */}
          {inspectorTab === 'position' && (
            <div className="animate-fade-in">
              <div className="label" style={{ marginBottom: 8 }}>Position (meters from corner)</div>
              <div className="xyz-grid">
                <div className="dim-input-group">
                  <span className="dim-input-label">X (left→right)</span>
                  <input type="number" step={0.05} min={0}
                    value={mod.position[0]}
                    onChange={(e) => updateModule(mod.id, { position: [parseFloat(e.target.value) || 0, mod.position[1]] })} />
                </div>
                <div className="dim-input-group">
                  <span className="dim-input-label">Z (front→back)</span>
                  <input type="number" step={0.05} min={0}
                    value={mod.position[1]}
                    onChange={(e) => updateModule(mod.id, { position: [mod.position[0], parseFloat(e.target.value) || 0] })} />
                </div>
              </div>
              <div className="label" style={{ marginBottom: 6 }}>Snap Options</div>
              <div className="door-grid">
                <button className="option-btn" onClick={() => updateModule(mod.id, { position: [0, mod.position[1]] })}>← Snap Left</button>
                <button className="option-btn" onClick={() => updateModule(mod.id, { position: [mod.position[0], 0] })}>↑ Snap Front</button>
              </div>
            </div>
          )}

          {/* ── DOOR TAB ── */}
          {inspectorTab === 'door' && (
            <div className="animate-fade-in">
              <div className="form-row">
                <label className="label">Door Open/Close</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className={`toggle-btn ${mod.doorOpen ? 'active' : ''}`} onClick={() => toggleDoor(mod.id)}>
                    {mod.doorOpen ? 'OPEN' : 'CLOSED'}
                  </button>
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-secondary)' }}>{mod.doorOpen ? '🚪 Door is open' : '🔒 Door is closed'}</span>
                </div>
              </div>
              <div className="label" style={{ marginBottom: 6 }}>Handle Style</div>
              <div className="handle-grid">
                {['None', 'Bar', 'D-Pull', 'Cup', 'Knob'].map(h => (
                  <button key={h}
                    className={`option-btn ${(mod.handleStyle || 'Bar') === h ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { handleStyle: h })}>
                    {h}
                  </button>
                ))}
              </div>
              <div className="label" style={{ marginBottom: 6 }}>Door Style</div>
              <div className="door-grid">
                {['Slab', 'Shaker', 'Glass', 'Louvered'].map(s => (
                  <button key={s}
                    className={`option-btn ${(mod.doorStyle || 'Slab') === s ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { doorStyle: s })}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── COUNTERTOP TAB ── */}
          {inspectorTab === 'countertop' && mod.countertop && (
            <div className="animate-fade-in">
              <div className="label" style={{ marginBottom: 8 }}>Countertop Material</div>
              <div className="countertop-grid">
                {COUNTERTOPS.map(ct => (
                  <button key={ct.value}
                    className={`countertop-btn ${mod.countertop === ct.value ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { countertop: ct.value })}>
                    <div className="ct-swatch" style={{ background: ct.gradient }} />
                    <span className="ct-label">{ct.label}</span>
                  </button>
                ))}
              </div>
              <div className="label" style={{ marginBottom: 6, marginTop: 4 }}>Edge Profile</div>
              <div className="door-grid">
                {['Straight', 'Bullnose', 'Ogee', 'Waterfall'].map(p => (
                  <button key={p}
                    className={`option-btn ${(mod.edgeProfile || 'Straight') === p ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { edgeProfile: p })}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {inspectorTab === 'countertop' && !mod.countertop && (
            <div className="props-empty" style={{ minHeight: 120 }}>
              <div className="props-empty-icon" style={{ fontSize: 24 }}>⬜</div>
              <div className="props-empty-title" style={{ fontSize: '0.78rem' }}>No Countertop</div>
              <div className="props-empty-desc">This module doesn't have a countertop surface.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
