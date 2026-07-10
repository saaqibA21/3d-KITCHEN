import React, { useState, useEffect } from 'react';
import useKitchenStore from '../store/kitchenStore';
import './Sidebar.css';

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/>
    <rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);

const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconTiles = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z"/>
    <path d="M3 9h18"/>
    <path d="M3 15h18"/>
    <path d="M9 3v18"/>
    <path d="M15 3v18"/>
  </svg>
);

const IconScanner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h4V1H4a3 3 0 0 0-3 3v4h2V4a1 1 0 0 1 1-1Z"/>
    <path d="M16 1h4a3 3 0 0 1 3 3v4h-2V4a1 1 0 0 1-1-1h-4V1Z"/>
    <path d="M1 16v4a3 3 0 0 0 3 3h4v-2H4a1 1 0 0 1-1-1v-4H1Z"/>
    <path d="M23 16v4a3 3 0 0 1-3 3h-4v-2h4a1 1 0 0 1 1-1v-4h2Z"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
  </svg>
);

const IconLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18H18"/>
    <path d="M3 22h18"/>
    <path d="M12 2v10"/>
    <path d="m17 7-5-5-5 5"/>
  </svg>
);

const CATALOG = [
  {
    category: 'Base Cabinets', icon: '🗄️',
    items: [
      { type: 'base_cabinet', label: 'Base Cabinet 60cm', desc: '600mm standard' },
      { type: 'drawer_unit',  label: 'Drawer Unit',       desc: '3-drawer stack' },
      { type: 'corner_base',  label: 'Corner Base',       desc: 'L-corner unit' },
    ],
  },
  {
    category: 'Wall Cabinets', icon: '📦',
    items: [
      { type: 'wall_cabinet',  label: 'Wall Cabinet 60cm', desc: 'Overhead storage' },
      { type: 'glass_cabinet', label: 'Glass Cabinet',     desc: 'Transparent door' },
      { type: 'open_shelf',    label: 'Open Shelf',        desc: 'No doors' },
      { type: 'wine_rack',     label: 'Wine Rack',         desc: 'Diagonal slots' },
    ],
  },
  {
    category: 'Tall Cabinets', icon: '🏛️',
    items: [
      { type: 'tall_cabinet', label: 'Tall Pantry', desc: 'Full-height unit' },
    ],
  },
  {
    category: 'Island & Hood', icon: '🏝️',
    items: [
      { type: 'island',     label: 'Kitchen Island', desc: 'Freestanding' },
      { type: 'range_hood', label: 'Range Hood',     desc: 'Above stove' },
    ],
  },
  {
    category: 'Appliances', icon: '⚡',
    items: [
      { type: 'sink',         label: 'Sink',         desc: 'With faucet' },
      { type: 'stove',        label: 'Stove / Hob',  desc: '4-burner' },
      { type: 'refrigerator', label: 'Refrigerator', desc: 'French door' },
      { type: 'oven',         label: 'Oven',          desc: 'Built-in' },
      { type: 'dishwasher',   label: 'Dishwasher',   desc: 'Full-size' },
    ],
  },
];

const ROOM_PRESETS = [
  {
    id: 'straight', label: 'Straight', icon: '▬',
    modules: [
      { type: 'base_cabinet', position: [0.0, 0.0] },
      { type: 'base_cabinet', position: [0.6, 0.0] },
      { type: 'sink',         position: [1.2, 0.0] },
      { type: 'stove',        position: [2.0, 0.0] },
      { type: 'base_cabinet', position: [2.6, 0.0] },
      { type: 'wall_cabinet', position: [0.0, 0.0] },
      { type: 'wall_cabinet', position: [0.6, 0.0] },
      { type: 'wall_cabinet', position: [1.2, 0.0] },
      { type: 'refrigerator', position: [3.4, 0.0] },
    ],
  },
  {
    id: 'l-shape', label: 'L-Shape', icon: '⌐',
    modules: [
      { type: 'base_cabinet', position: [0.0, 0.0] },
      { type: 'base_cabinet', position: [0.6, 0.0] },
      { type: 'sink',         position: [1.2, 0.0] },
      { type: 'corner_base',  position: [2.0, 0.0] },
      { type: 'base_cabinet', position: [0.0, 0.9] },
      { type: 'stove',        position: [0.0, 1.5] },
      { type: 'refrigerator', position: [3.6, 0.0] },
      { type: 'wall_cabinet', position: [0.0, 0.0] },
      { type: 'wall_cabinet', position: [0.6, 0.0] },
    ],
  },
  {
    id: 'island', label: 'Island', icon: '⬜',
    modules: [
      { type: 'base_cabinet', position: [0.0, 0.0] },
      { type: 'sink',         position: [0.6, 0.0] },
      { type: 'base_cabinet', position: [1.4, 0.0] },
      { type: 'stove',        position: [2.0, 0.0] },
      { type: 'wall_cabinet', position: [0.0, 0.0] },
      { type: 'wall_cabinet', position: [0.6, 0.0] },
      { type: 'refrigerator', position: [3.6, 0.0] },
      { type: 'island',       position: [1.5, 1.8] },
    ],
  },
];

const TILE_PATTERNS = [
  { id: 'subway', label: 'Subway' },
  { id: 'hex',    label: 'Hexagon' },
];

export default function Sidebar() {
  const {
    roomConfig, setRoomConfig,
    addModule, clearAll,
    backsplash, setBacksplash,
    showBacksplash, toggleBacksplash,
    undo, redo,
    blueprintUrl, blueprintOpacity, calibrationMode, pixelsPerMeter,
    setBlueprintUrl, setBlueprintOpacity, setCalibrationMode, clearBlueprint
  } = useKitchenStore();

  const [expandedCategories, setExpandedCategories] = useState(['Base Cabinets', 'Appliances']);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'room' | 'backsplash' | 'blueprint'

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddModule = (type) => {
    addModule(type, [
      0.2 + Math.random() * Math.max(0.1, roomConfig.width - 1.2),
      0.2 + Math.random() * Math.max(0.1, roomConfig.depth - 1.0),
    ]);
  };

  const applyPreset = (preset) => {
    if (!confirm(`Apply ${preset.label} preset? This will clear your current design.`)) return;
    clearAll();
    setTimeout(() => {
      preset.modules.forEach((m) => addModule(m.type, m.position));
    }, 50);
  };

  return (
    <div className="sidebar animate-slide-left">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon"><IconLogo /></span>
          <div>
            <div className="sidebar-logo-title">KitchenCraft</div>
            <div className="sidebar-logo-sub">3D Designer Pro</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sidebar-tabs">
        {[
          { id: 'modules',    icon: <IconGrid />, label: 'Modules' },
          { id: 'room',       icon: <IconHome />, label: 'Room' },
          { id: 'backsplash', icon: <IconTiles />, label: 'Tiles' },
          { id: 'blueprint',  icon: <IconScanner />, label: 'Scanner' },
        ].map((t) => (
          <button
            key={t.id}
            className={`sidebar-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-scroll">

        {/* ── MODULES TAB ─────────────────────────────────── */}
        {activeTab === 'modules' && (
          <>
            {/* Room Presets */}
            <div className="sidebar-section">
              <div className="sidebar-section-title"><span>⚡</span><span>Quick Presets</span></div>
              <div className="preset-grid">
                {ROOM_PRESETS.map((p) => (
                  <button key={p.id} className="preset-btn" onClick={() => applyPreset(p)}>
                    <span className="preset-icon">{p.icon}</span>
                    <span className="preset-label">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            {/* Catalog */}
            <div className="sidebar-section-title" style={{ marginBottom: 8 }}>
              <span>🧱</span><span>Module Catalog</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 4px 8px', lineHeight: 1.4 }}>
              Click to add · Double-click in 3D to open doors
            </p>
            {CATALOG.map((group) => (
              <div key={group.category} className="catalog-group">
                <button className="catalog-group-header" onClick={() => toggleCategory(group.category)}>
                  <span>{group.icon} {group.category}</span>
                  <span className="catalog-chevron">{expandedCategories.includes(group.category) ? '▾' : '▸'}</span>
                </button>
                {expandedCategories.includes(group.category) && (
                  <div className="catalog-items animate-fade-in">
                    {group.items.map((item) => (
                      <button key={item.type} className="catalog-item" onClick={() => handleAddModule(item.type)}>
                        <div className="catalog-item-body">
                          <div className="catalog-item-label">{item.label}</div>
                          <div className="catalog-item-desc">{item.desc}</div>
                        </div>
                        <span className="catalog-item-add">+</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── ROOM TAB ─────────────────────────────────────── */}
        {activeTab === 'room' && (
          <div className="sidebar-section">
            <div className="sidebar-section-title"><span>📐</span><span>Room Dimensions</span></div>
            <div className="room-config">
              {[
                { key: 'width', label: 'Width (m)', min: 2, max: 12, step: 0.5 },
                { key: 'depth', label: 'Depth (m)', min: 2, max: 10, step: 0.5 },
                { key: 'height', label: 'Ceiling (m)', min: 2.2, max: 4.5, step: 0.1 },
              ].map(({ key, label, min, max, step }) => (
                <div key={key} className="form-row">
                  <label className="label">{label}</label>
                  <div className="slider-row">
                    <input type="range" min={min} max={max} step={step}
                      value={roomConfig[key]}
                      onChange={(e) => setRoomConfig({ [key]: parseFloat(e.target.value) })}
                    />
                    <span className="slider-value">{roomConfig[key]}m</span>
                  </div>
                </div>
              ))}

              <div className="divider" />
              <div className="sidebar-section-title" style={{ marginTop: 4 }}><span>🎨</span><span>Colors</span></div>

              <div className="form-row">
                <label className="label">Wall Color</label>
                <input type="color" value={roomConfig.wallColor}
                  onChange={(e) => setRoomConfig({ wallColor: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* ── BACKSPLASH TAB ────────────────────────────────── */}
        {activeTab === 'backsplash' && (
          <div className="sidebar-section">
            <div className="sidebar-section-title"><span>🟦</span><span>Backsplash Tiles</span></div>

            <div className="form-row" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="label" style={{ margin: 0 }}>Show Backsplash</label>
                <button
                  className={`toggle-btn ${showBacksplash ? 'active' : ''}`}
                  onClick={toggleBacksplash}
                >
                  {showBacksplash ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="label">Tile Pattern</label>
              <div className="pattern-grid">
                {TILE_PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    className={`pattern-btn ${backsplash.pattern === p.id ? 'active' : ''}`}
                    onClick={() => setBacksplash({ pattern: p.id })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label className="label">Tile Color</label>
              <input type="color" value={backsplash.tileColor}
                onChange={(e) => setBacksplash({ tileColor: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="label">Grout Color</label>
              <input type="color" value={backsplash.groutColor}
                onChange={(e) => setBacksplash({ groutColor: e.target.value })} />
            </div>

            <div style={{ marginTop: 12, padding: '10px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                💡 Backsplash appears between the countertop and wall cabinets on the back and left walls in 3D view.
              </p>
            </div>
          </div>
        )}

        {/* ── SCANNER TAB ─────────────────────────────────── */}
        {activeTab === 'blueprint' && (
          <div className="sidebar-section">
            <div className="sidebar-section-title"><span>🗺️</span><span>Blueprint Scanner</span></div>
            
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              Upload a top-down modular blueprint image. You can trace over it or use auto-detection to build your room.
            </p>

            <div className="form-row" style={{ marginBottom: 14 }}>
              <input 
                type="file" 
                accept="image/*" 
                id="blueprint-file-input" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setBlueprintUrl(url);
                  }
                }}
              />
              <button 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => document.getElementById('blueprint-file-input').click()}
              >
                📂 Upload Blueprint Image
              </button>
            </div>

            {blueprintUrl && (
              <div className="animate-fade-in">
                <div className="divider" />
                
                {/* Opacity */}
                <div className="form-row">
                  <label className="label">Template Opacity</label>
                  <div className="slider-row">
                    <input 
                      type="range" min="0.1" max="1.0" step="0.05"
                      value={blueprintOpacity}
                      onChange={(e) => setBlueprintOpacity(parseFloat(e.target.value))}
                    />
                    <span className="slider-value">{Math.round(blueprintOpacity * 100)}%</span>
                  </div>
                </div>

                <div className="divider" />

                {/* Scale Calibration */}
                <div className="form-row">
                  <label className="label">Scale Calibration</label>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                    Current scale: <strong>{Math.round(pixelsPerMeter)} px/m</strong>.
                  </p>
                  <button 
                    className={`btn-secondary ${calibrationMode ? 'active-green' : ''}`}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 6 }}
                    onClick={() => setCalibrationMode(!calibrationMode)}
                  >
                    {calibrationMode ? '📍 Click A and B on Canvas...' : '📐 Calibrate Scale'}
                  </button>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    💡 Tip: Click start and end points of a wall in the 2D view, then input its real length.
                  </p>
                </div>

                <div className="divider" />

                {/* Auto Wall Extractor */}
                <div className="form-row">
                  <label className="label">AI Auto-Extraction</label>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 6 }}
                    onClick={() => {
                      const img = new Image();
                      img.src = blueprintUrl;
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const imgData = ctx.getImageData(0, 0, img.width, img.height);
                        const data = imgData.data;

                        let minX = img.width, maxX = 0, minY = img.height, maxY = 0, count = 0;

                        for (let y = 0; y < img.height; y++) {
                          for (let x = 0; x < img.width; x++) {
                            const idx = (y * img.width + x) * 4;
                            const r = data[idx];
                            const g = data[idx + 1];
                            const b = data[idx + 2];
                            const a = data[idx + 3];

                            // Check for dark lines on light background (wall lines)
                            if (a > 100 && (r + g + b) / 3 < 120) {
                              if (x < minX) minX = x;
                              if (x > maxX) maxX = x;
                              if (y < minY) minY = y;
                              if (y > maxY) maxY = y;
                              count++;
                            }
                          }
                        }

                        if (count > 100) {
                          const wPx = maxX - minX;
                          const dPx = maxY - minY;

                          // Compute dimensions using calibrated pixels per meter
                          const detectedW = parseFloat((wPx / pixelsPerMeter).toFixed(1));
                          const detectedD = parseFloat((dPx / pixelsPerMeter).toFixed(1));

                          if (detectedW > 1.5 && detectedD > 1.5 && detectedW < 25 && detectedD < 25) {
                            setRoomConfig({ width: detectedW, depth: detectedD });
                            alert(`⚡ Layout Scanner:\nDetected Boundary Size: ${detectedW}m × ${detectedD}m`);
                          } else {
                            // Fallback aspect-ratio matching
                            const fallbackScale = wPx / 5.0;
                            const estD = parseFloat((dPx / fallbackScale).toFixed(1));
                            setRoomConfig({ width: 5.0, depth: estD });
                            useKitchenStore.setState({ pixelsPerMeter: fallbackScale });
                            alert(`⚡ Layout Scanner:\nEstimated room aspect ratio fitted to standard 5.0m width.\nCalculated Depth: ${estD}m.\nUse 'Calibrate Scale' to refine.`);
                          }
                        } else {
                          alert("Could not detect continuous dark boundaries. Ensure your blueprint has distinct layout lines.");
                        }
                      };
                    }}
                  >
                    ⚡ Auto-Detect Walls
                  </button>
                </div>

                <div className="divider" />

                {/* Clear */}
                <button 
                  className="btn-danger" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={clearBlueprint}
                >
                  🗑️ Clear Blueprint
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
