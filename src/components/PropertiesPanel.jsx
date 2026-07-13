import React, { useRef } from 'react';
import useKitchenStore from '../store/kitchenStore';
import './PropertiesPanel.css';

const COUNTERTOPS = [
  { value: 'granite', label: 'Granite', icon: '🪨', gradient: 'radial-gradient(circle, #5c5c5c 10%, #2b2b2b 80%)' },
  { value: 'marble', label: 'Marble', icon: '⚪', gradient: 'linear-gradient(135deg, #f5f5f5 25%, #e0e0e0 50%, #f5f5f5 75%)' },
  { value: 'quartz', label: 'Quartz', icon: '💎', gradient: 'linear-gradient(135deg, #e6f2ff, #ffffff)' },
  { value: 'laminate', label: 'Laminate', icon: '🪵', gradient: 'linear-gradient(45deg, #a0522d, #8b4513)' },
];

const PRESET_COLORS = [
  '#f5f0e8', '#e8dcc8', '#d4c5b0', // Warm neutrals
  '#3a322c', '#5c3a21', '#8b5a2b', // Wood tints
  '#2d2d2d', '#111111', '#4a5054', // Greys / Charcoals
  '#1e293b', '#1e3a8a', '#60a5fa', // Blues
  '#365314', '#15803d', '#86efac', // Greens
  '#7f1d1d', '#b91c1c', '#fca5a5', // Reds / Pinks
  '#7c2d12', '#ea580c', '#ffedd5', // Orange / Peach
  '#fef08a', '#facc15', '#eab308'  // Yellows
];

const CUSTOMIZER_CATEGORIES = [
  { id: 'matte',      label: 'Matte',      icon: '🎨', gradient: 'radial-gradient(circle, #cbd5e1 10%, #475569 90%)' },
  { id: 'glossy',     label: 'Glossy',     icon: '✨', gradient: 'linear-gradient(135deg, #e2a85c, #0a0c10)' },
  { id: 'wood_grain', label: 'Wood',       icon: '🪵', gradient: 'linear-gradient(45deg, #8b5a2b, #5c3a21)' },
  { id: 'concrete',   label: 'Concrete',   icon: '🪨', gradient: 'linear-gradient(135deg, #708090, #2f4f4f)' },
];

export default function PropertiesPanel() {
  const { getSelectedModule, updateModule, removeModule, selectedId, setSelectedId, toggleDoor } = useKitchenStore();
  const fileInputRef = useRef();
  const { saveDesign, loadDesign, clearAll, modules } = useKitchenStore();
  const mod = getSelectedModule();

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadDesign(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="props-panel animate-slide-right">
      <div className="props-header">
        <span className="props-header-icon">✦</span>
        <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>Properties</span>
        {mod && (
          <span style={{ marginLeft: 'auto', fontSize: '0.60rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
            {mod.type}
          </span>
        )}
      </div>

      <div className="props-scroll">
        {mod ? (
          <div className="props-body animate-fade-in" key={mod.id}>
            {/* Header: Back & Close Buttons */}
            <div className="mc-header-row">
              <button className="mc-back-btn" onClick={() => setSelectedId(null)}>
                ◀ Back
              </button>
              <span className="badge" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.label}</span>
              <button className="mc-close-btn" onClick={() => setSelectedId(null)}>✕</button>
            </div>

            {/* Split layout Customizer */}
            <div className="material-customizer">
              {/* Left Column: Material finish categories */}
              <div className="mc-left-panel">
                {CUSTOMIZER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`mc-category-btn ${mod.material === cat.id ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { material: cat.id })}
                  >
                    <div className="mc-thumbnail" style={{ background: cat.gradient }}>
                      {mod.material === cat.id && cat.icon}
                    </div>
                    <span className="mc-label">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Column: Custom Tint, Swatches, Scale, Rotation */}
              <div className="mc-right-panel">
                {/* Tint Colour display */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <label className="label" style={{ margin: 0 }}>Tint Colour</label>
                  <div style={{ width: 28, height: 16, borderRadius: 4, background: mod.color, border: '1px solid var(--border-subtle)' }} />
                </div>

                {/* Swatches Grid */}
                <div className="mc-grid">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`mc-swatch ${mod.color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => updateModule(mod.id, { color: c })}
                    />
                  ))}
                  {/* Plus Custom Color Picker button */}
                  <div className="mc-add-swatch" style={{ position: 'relative' }}>
                    <span>+</span>
                    <input
                      type="color"
                      value={mod.color}
                      onChange={(e) => updateModule(mod.id, { color: e.target.value })}
                      style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                    />
                  </div>
                </div>

                {/* Texture Scale Slider */}
                <div className="form-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label" style={{ margin: 0 }}>Texture Scale</label>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.70rem', fontWeight: 700, color: 'var(--accent-teal)', minWidth: 'auto' }}>
                      {Math.round((mod.textureScale || 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range" min="0.2" max="3.0" step="0.1"
                    value={mod.textureScale || 1.0}
                    onChange={(e) => updateModule(mod.id, { textureScale: parseFloat(e.target.value) })}
                  />
                </div>

                {/* Texture Rotation Slider */}
                <div className="form-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label" style={{ margin: 0 }}>Tex Rotation</label>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.70rem', fontWeight: 700, color: 'var(--accent-violet)', minWidth: 'auto' }}>
                      {mod.textureRotation || 0}°
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="360" step="15"
                    value={mod.textureRotation || 0}
                    onChange={(e) => updateModule(mod.id, { textureRotation: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: '14px 0 10px 0' }} />

            {/* Countertop Section (only for base + island + appliances with countertops) */}
            {['base_cabinet', 'corner_base', 'drawer_unit', 'island', 'sink', 'stove', 'dishwasher'].includes(mod.type) && (
              <div className="props-group">
                <label className="label">Countertop Material</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {COUNTERTOPS.map((ct) => (
                    <button
                      key={ct.value}
                      className={`mc-swatch ${mod.countertop === ct.value ? 'active' : ''}`}
                      style={{
                        background: ct.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', aspectRatio: '1', borderRadius: 'var(--radius-sm)',
                        boxShadow: mod.countertop === ct.value ? 'inset 0 0 0 2px var(--accent-primary)' : '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      title={ct.label}
                      onClick={() => updateModule(mod.id, { countertop: ct.value })}
                    >
                      {mod.countertop === ct.value && <span>{ct.icon}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="divider" style={{ margin: '6px 0 10px 0' }} />

            {/* Dimensions */}
            <div className="props-group">
              <label className="label">Dimensions (m)</label>
              <div className="dims-grid">
                <div className="dim-field">
                  <span className="dim-label dim-label-w">W</span>
                  <input
                    type="number" min={0.05} max={8.0} step={0.05}
                    value={parseFloat(mod.width.toFixed(2))}
                    onChange={(e) => updateModule(mod.id, { width: parseFloat(e.target.value) || 0.1 })}
                  />
                </div>
                <div className="dim-field">
                  <span className="dim-label dim-label-d">D</span>
                  <input
                    type="number" min={0.05} max={6.0} step={0.05}
                    value={parseFloat(mod.depth.toFixed(2))}
                    onChange={(e) => updateModule(mod.id, { depth: parseFloat(e.target.value) || 0.1 })}
                  />
                </div>
                <div className="dim-field">
                  <span className="dim-label dim-label-h">H</span>
                  <input
                    type="number" min={0.02} max={5.0} step={0.05}
                    value={parseFloat(mod.height.toFixed(2))}
                    onChange={(e) => updateModule(mod.id, { height: parseFloat(e.target.value) || 0.1 })}
                  />
                </div>
              </div>
            </div>

            {/* Position Coordinates */}
            <div className="props-group">
              <label className="label">Position (m)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div className="dim-field">
                  <span className="dim-label dim-label-x">X →</span>
                  <input
                    type="number" step={0.05} min={0} max={12}
                    value={parseFloat(mod.position[0].toFixed(2))}
                    onChange={(e) => updateModule(mod.id, { position: [parseFloat(e.target.value) || 0, mod.position[1]] })}
                  />
                </div>
                <div className="dim-field">
                  <span className="dim-label dim-label-z">Z ↓</span>
                  <input
                    type="number" step={0.05} min={0} max={10}
                    value={parseFloat(mod.position[1].toFixed(2))}
                    onChange={(e) => updateModule(mod.id, { position: [mod.position[0], parseFloat(e.target.value) || 0] })}
                  />
                </div>
              </div>
            </div>

             {/* Rotation */}
            <div className="props-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Rotation</label>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {mod.rotation}°
                </span>
              </div>
              <input
                type="range" min="0" max="360" step="5"
                value={mod.rotation || 0}
                onChange={(e) => updateModule(mod.id, { rotation: parseInt(e.target.value) })}
                style={{ marginBottom: 10 }}
              />
              <div className="rotation-row">
                {[0, 90, 180, 270].map((r) => (
                  <button
                    key={r}
                    className={`rotation-btn ${mod.rotation === r ? 'active' : ''}`}
                    onClick={() => updateModule(mod.id, { rotation: r })}
                  >
                    {r}°
                  </button>
                ))}
              </div>
            </div>

            {/* Door Action */}
            {['base_cabinet','wall_cabinet','tall_cabinet','glass_cabinet','door'].includes(mod.type) && (
              <div className="props-group" style={{ marginBottom: 12 }}>
                <button
                  className={`btn-secondary ${mod.doorOpen ? 'active-green' : ''}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => toggleDoor(mod.id)}
                >
                  {mod.doorOpen ? '🚪 Close Door' : '🚪 Open Door'}
                </button>
              </div>
            )}

            {/* Delete */}
            <button className="btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={() => removeModule(mod.id)}>
              🗑️ Remove Item
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '2.4rem' }}>✦</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>Select any item in the <strong style={{ color: 'var(--accent-primary)' }}>2D plan</strong> or <strong style={{ color: 'var(--accent-teal)' }}>3D view</strong> to edit properties</p>
          </div>
        )}

        <div className="divider" />

        {/* Design Actions */}
        <div className="props-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="label" style={{ margin: 0 }}>Project</label>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 100, border: '1px solid var(--border-subtle)' }}>
              {modules.length} items
            </span>
          </div>
          <div className="action-buttons">
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={saveDesign}>
              💾 Save Design
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()}>
              📂 Load Design
            </button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleLoad} />
            <button className="btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (confirm('Clear all modules?')) clearAll(); }}>
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="props-tips">
          <div className="tip-title">💡 Tips</div>
          <ul className="tip-list">
            <li>Double-click in 2D view to rotate</li>
            <li>Drag modules to reposition</li>
            <li>WASD + mouse in walkthrough</li>
            <li>Click canvas to deselect</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
