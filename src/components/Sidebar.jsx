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

const IconMagic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
    <path d="m14 7 3 3"/>
    <path d="M5 6v1"/>
    <path d="M19 14v1"/>
    <path d="M10 2v2"/>
    <path d="M7 14h1"/>
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
  {
    category: 'Walls & Openings', icon: '🧱',
    items: [
      { type: 'door',      label: 'Single Door',    desc: 'Standard swing door' },
      { type: 'window',    label: 'Glass Window',   desc: 'Translucent glass pane' },
      { type: 'stairs',    label: 'Wooden Stairs',  desc: 'Staircase steps' },
      { type: 'partition', label: 'Partition Wall', desc: 'Room divider wall' },
    ],
  },
  {
    category: 'Living & Decor', icon: '🛋️',
    items: [
      { type: 'sofa',         label: 'L-Shape Sofa',    desc: 'Sectional sofa' },
      { type: 'armchair',     label: 'Accent Armchair',  desc: 'White armchair' },
      { type: 'coffee_table', label: 'Coffee Table',     desc: 'Circular wood' },
      { type: 'sideboard',    label: 'Sideboard Cabinet', desc: 'Dark wood crezenda' },
      { type: 'rug',          label: 'Area Rug',         desc: 'Charcoal fabric' },
      { type: 'framed_art',   label: 'Framed Painting',  desc: 'Wall landscape print' },
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
    setBlueprintUrl, setBlueprintOpacity, setCalibrationMode, clearBlueprint,
    customAiCatalog, addCustomAiObject,
    floors, activeFloorId, activeFloorsView, switchFloor, addFloor, toggleFloorsView,
    rooms, addRoomZone, updateRoomZone, removeRoomZone
  } = useKitchenStore();

  const [expandedCategories, setExpandedCategories] = useState(['Base Cabinets', 'Appliances']);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'room' | 'backsplash' | 'blueprint' | 'custom'

  const [customName, setCustomName] = useState('AI Refrigerator');
  const [customWidth, setCustomWidth] = useState(0.8);
  const [customHeight, setCustomHeight] = useState(1.8);
  const [customDepth, setCustomDepth] = useState(0.7);
  const [customType, setCustomType] = useState('appliance');
  const [customImage, setCustomImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCustom = () => {
    if (!customImage) {
      alert("Please upload a furniture/appliance image first!");
      return;
    }
    setIsGenerating(true);

    const img = new Image();
    img.src = customImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 64, 64);
      const imgData = ctx.getImageData(0, 0, 64, 64);
      const data = imgData.data;

      // Extract background color (use top-left pixel)
      const bgR = data[0], bgG = data[1], bgB = data[2];

      const profile = [];
      // Scan bottom to top (row 63 down to 0)
      for (let y = 63; y >= 0; y--) {
        let firstX = -1;
        let lastX = -1;
        for (let x = 0; x < 64; x++) {
          const idx = (y * 64 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // Compute color difference from background
          const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (a > 100 && diff > 35) {
            if (firstX === -1) firstX = x;
            lastX = x;
          }
        }

        if (firstX !== -1 && lastX !== -1) {
          const width = lastX - firstX;
          const radius = width / 2;
          profile.push(radius);
        } else {
          profile.push(profile.length > 0 ? profile[profile.length - 1] : 5);
        }
      }

      // Smooth the profile array using a 3-tap moving average filter
      const smoothed = [];
      for (let i = 0; i < profile.length; i++) {
        const prev = i > 0 ? profile[i - 1] : profile[i];
        const next = i < profile.length - 1 ? profile[i + 1] : profile[i];
        smoothed.push((prev + profile[i] + next) / 3);
      }

      // Normalize profile so maximum radius is exactly 0.5 (unit radius)
      const maxVal = Math.max(...smoothed, 1);
      const normalizedProfile = smoothed.map(r => r / maxVal * 0.5);

      setTimeout(() => {
        const newObj = {
          id: `ai_${Date.now()}`,
          label: customName,
          width: customWidth,
          height: customHeight,
          depth: customDepth,
          objectType: customType,
          imageUrl: customImage,
          silhouetteProfile: normalizedProfile
        };
        addCustomAiObject(newObj);
        setIsGenerating(false);
        alert(`✨ AI Custom Object Generated:\nSuccessfully converted "${customName}" into a 3D model!`);
      }, 1500);
    };
  };

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
          { id: 'custom',     icon: <IconMagic />, label: 'Custom' },
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
          <div className="sidebar-section animate-slide-up">
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
              <div className="sidebar-section-title"><span>🏢</span><span>Level Manager</span></div>
              
              <div className="form-row">
                <label className="label">Active Floor</label>
                <select value={activeFloorId} onChange={(e) => switchFloor(e.target.value)}>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.height}m)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '6px 8px' }}
                  onClick={() => {
                    const name = prompt("Enter new floor name:", `Floor ${floors.length + 1}`);
                    if (name) addFloor(name);
                  }}
                >
                  🏢 Add Floor
                </button>
                <button
                  className={`btn-secondary ${activeFloorsView === 'stacked' ? 'active' : ''}`}
                  style={{
                    flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '6px 8px',
                    background: activeFloorsView === 'stacked' ? 'rgba(60, 98, 85, 0.15)' : undefined
                  }}
                  onClick={toggleFloorsView}
                >
                  🏢 View Stacked
                </button>
              </div>

              <div className="divider" />
              <div className="sidebar-section-title"><span>🏷️</span><span>Room Zones</span></div>
              
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input
                  type="text" placeholder="e.g. Living Room" id="new-room-zone-name"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '6px 8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.target.value.trim();
                      if (val) {
                        addRoomZone(val);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  className="btn-primary"
                  style={{ fontSize: '0.72rem', padding: '6px 12px' }}
                  onClick={() => {
                    const el = document.getElementById('new-room-zone-name');
                    if (el && el.value.trim()) {
                      addRoomZone(el.value.trim());
                      el.value = '';
                    }
                  }}
                >
                  Add
                </button>
              </div>

              {rooms.length === 0 ? (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
                  No room partitions defined. Type name above and click Add!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto' }}>
                  {rooms.map((rm) => (
                    <div key={rm.id} style={{ background: 'rgba(60,98,85,0.03)', border: '1px solid var(--border-subtle)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{rm.label}</span>
                        <button
                          style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }}
                          onClick={() => removeRoomZone(rm.id)}
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div className="dims-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <div className="dim-field" style={{ margin: 0 }}>
                          <span className="dim-label" style={{ fontSize: '0.62rem', marginBottom: 2 }}>W (m)</span>
                          <input
                            type="number" step={0.1} min={0.5} max={10}
                            value={rm.width} onChange={(e) => updateRoomZone(rm.id, { width: parseFloat(e.target.value) || 1 })}
                            style={{ padding: '2px 4px', fontSize: '0.7rem', border: '1px solid var(--border-subtle)' }}
                          />
                        </div>
                        <div className="dim-field" style={{ margin: 0 }}>
                          <span className="dim-label" style={{ fontSize: '0.62rem', marginBottom: 2 }}>D (m)</span>
                          <input
                            type="number" step={0.1} min={0.5} max={10}
                            value={rm.depth} onChange={(e) => updateRoomZone(rm.id, { depth: parseFloat(e.target.value) || 1 })}
                            style={{ padding: '2px 4px', fontSize: '0.7rem', border: '1px solid var(--border-subtle)' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

        {/* ── CUSTOM TAB ─────────────────────────────────── */}
        {activeTab === 'custom' && (
          <div className="sidebar-section animate-slide-up">
            <h3 className="sidebar-section-title">🪄 AI Furniture Generator</h3>
            
            <div className="form-row">
              <label className="label">Object Image</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div className="mc-add-swatch" style={{ width: '100%', height: 120, flexDirection: 'column', gap: 8, fontSize: '0.8rem', borderStyle: 'dashed' }}>
                  {customImage ? (
                    <img src={customImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Upload Image File</span>
                    </>
                  )}
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = (ev) => setCustomImage(ev.target.result);
                        r.readAsDataURL(file);
                      }
                    }}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="label">Object Name</label>
              <input
                type="text" value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Vintage Refrigerator"
              />
            </div>

            <div className="form-row">
              <label className="label">Model Style</label>
              <select value={customType} onChange={(e) => setCustomType(e.target.value)}>
                <option value="appliance">Solid Appliance Box</option>
                <option value="lamp">Table Lamp</option>
                <option value="stool">Chair / Stool</option>
                <option value="table">Dining Table</option>
                <option value="plant">Potted Plant</option>
                <option value="billboard">Flat Decor Billboard</option>
              </select>
            </div>

            <div className="divider" />

            <h4 className="label">Dimensions (meters)</h4>
            <div className="dims-grid" style={{ marginBottom: 14 }}>
              <div className="dim-field">
                <span className="dim-label" style={{ textAlign: 'center', display: 'block' }}>W</span>
                <input
                  type="number" step={0.05} min={0.1} max={4}
                  value={customWidth} onChange={(e) => setCustomWidth(parseFloat(e.target.value))}
                />
              </div>
              <div className="dim-field">
                <span className="dim-label" style={{ textAlign: 'center', display: 'block' }}>D</span>
                <input
                  type="number" step={0.05} min={0.1} max={3}
                  value={customDepth} onChange={(e) => setCustomDepth(parseFloat(e.target.value))}
                />
              </div>
              <div className="dim-field">
                <span className="dim-label" style={{ textAlign: 'center', display: 'block' }}>H</span>
                <input
                  type="number" step={0.05} min={0.1} max={4}
                  value={customHeight} onChange={(e) => setCustomHeight(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleGenerateCustom}
              disabled={isGenerating}
            >
              {isGenerating ? '⌛ AI Rendering...' : '🪄 Generate 3D Model'}
            </button>

            <div className="divider" style={{ margin: '18px 0 14px 0' }} />

            <h3 className="sidebar-section-title">📦 Your Custom AI Models</h3>
            
            {customAiCatalog.length === 0 ? (
              <div className="empty-state" style={{ padding: '16px 8px' }}>
                <p>No custom objects created yet. Upload an image above to generate one!</p>
              </div>
            ) : (
              <div className="catalog-items" style={{ padding: 0, gap: 6, background: 'transparent' }}>
                {customAiCatalog.map((obj) => (
                  <div
                    key={obj.id}
                    className="catalog-item animate-scale-in"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 6,
                      background: 'rgba(60, 98, 85, 0.03)', border: '1px solid var(--border-subtle)',
                      padding: 10, borderRadius: 'var(--radius-sm)', transform: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                      <img
                        src={obj.imageUrl} alt={obj.label}
                        style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover', background: '#fff', border: '1px solid var(--border-subtle)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {obj.label}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          {obj.width} × {obj.depth} × {obj.height}m • {obj.objectType}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', padding: '6px 8px', fontSize: '0.72rem' }}
                      onClick={() => addModule('custom_ai_object', null, {
                        label: obj.label,
                        width: obj.width,
                        height: obj.height,
                        depth: obj.depth,
                        customImageUrl: obj.imageUrl,
                        objectType: obj.objectType,
                        silhouetteProfile: obj.silhouetteProfile
                      })}
                    >
                      ➕ Add to Layout
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
