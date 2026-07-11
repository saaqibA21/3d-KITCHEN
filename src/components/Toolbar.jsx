import React, { useRef, useCallback, useState } from 'react';
import useKitchenStore from '../store/kitchenStore';
import './Toolbar.css';

// ─── SVG Icons ───────────────────────────────────────────
const IconBrand = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18H18"/>
    <path d="M3 22h18"/>
    <path d="M12 2v10"/>
    <path d="m17 7-5-5-5 5"/>
  </svg>
);

const IconCamera = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconPlan = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <line x1="3" x2="21" y1="9" y2="9"/>
    <line x1="9" x2="9" y1="21" y2="9"/>
  </svg>
);

const Icon3D = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" x2="12" y1="22.08" y2="12"/>
  </svg>
);

const IconWalk = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconUndo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);

const IconRedo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/>
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
  </svg>
);

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const IconEvening = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 18a5 5 0 0 0-10 0"/>
    <path d="M12 2v7"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
    <path d="M2 22h20"/>
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const IconRuler = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <path d="M3 7h4"/>
    <path d="M3 12h8"/>
    <path d="M3 17h4"/>
  </svg>
);

const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

// Screenshot needs canvas access — lifted as a separate component
function ScreenshotButton() {
  const handleClick = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitchen-render-${Date.now()}.png`;
    a.click();
  };
  return (
    <button className="btn-secondary tooltip" data-tip="Screenshot (PNG)" onClick={handleClick} id="btn-screenshot">
      <IconCamera />
    </button>
  );
}

// ─── CAD Blueprints DXF Exporter ─────────────────────────────────────────────
function exportToDXF(roomConfig, modules, rooms) {
  let dxf = [];
  
  dxf.push("0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1006", "0", "ENDSEC");
  dxf.push("0", "SECTION", "2", "ENTITIES");

  const drawLine = (x1, y1, x2, y2, layer) => {
    dxf.push("0", "LINE");
    dxf.push("8", layer);
    dxf.push("10", x1.toFixed(3));
    dxf.push("20", y1.toFixed(3));
    dxf.push("30", "0.0");
    dxf.push("11", x2.toFixed(3));
    dxf.push("21", y2.toFixed(3));
    dxf.push("31", "0.0");
  };

  const drawRect = (x, y, w, d, rotation, layer) => {
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const pts = [
      { dx: -w/2, dy: -d/2 },
      { dx: w/2, dy: -d/2 },
      { dx: w/2, dy: d/2 },
      { dx: -w/2, dy: d/2 }
    ];

    const wpts = pts.map(p => ({
      x: x + (p.dx * cos - p.dy * sin),
      y: y + (p.dx * sin + p.dy * cos)
    }));

    drawLine(wpts[0].x, wpts[0].y, wpts[1].x, wpts[1].y, layer);
    drawLine(wpts[1].x, wpts[1].y, wpts[2].x, wpts[2].y, layer);
    drawLine(wpts[2].x, wpts[2].y, wpts[3].x, wpts[3].y, layer);
    drawLine(wpts[3].x, wpts[3].y, wpts[0].x, wpts[0].y, layer);
  };

  const drawText = (x, y, text, height, layer) => {
    dxf.push("0", "TEXT");
    dxf.push("8", layer);
    dxf.push("10", x.toFixed(3));
    dxf.push("20", y.toFixed(3));
    dxf.push("30", "0.0");
    dxf.push("40", height.toFixed(3));
    dxf.push("1", text);
  };

  const rw = roomConfig.width;
  const rd = roomConfig.depth;
  drawLine(0, 0, rw, 0, "WALLS_OUTER");
  drawLine(rw, 0, rw, rd, "WALLS_OUTER");
  drawLine(rw, rd, 0, rd, "WALLS_OUTER");
  drawLine(0, rd, 0, 0, "WALLS_OUTER");

  rooms.forEach((rm) => {
    const rx = rm.position[0] + rm.width / 2;
    const ry = rd - (rm.position[1] + rm.depth / 2);
    drawRect(rx, ry, rm.width, rm.depth, 0, "ROOM_ZONES");
    drawText(rm.position[0] + 0.1, rd - rm.position[1] - 0.25, `${rm.label} (${(rm.width * rm.depth).toFixed(1)}m2)`, 0.12, "ROOM_LABELS");
  });

  modules.forEach((mod) => {
    const mx = mod.position[0] + mod.width / 2;
    const my = rd - (mod.position[1] + mod.depth / 2);
    const layerName = mod.isFixture ? "ARCHITECTURAL_FIXTURES" : "FURNITURE_MODULES";
    drawRect(mx, my, mod.width, mod.depth, mod.rotation, layerName);
    drawText(mod.position[0] + 0.05, rd - mod.position[1] - 0.2, `${mod.label}`, 0.08, "OBJECT_LABELS");
  });

  dxf.push("0", "ENDSEC", "0", "EOF");

  const content = dxf.join("\n");
  const blob = new Blob([content], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `room_layout_draft.dxf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── 3D CAD Mesh OBJ Exporter ────────────────────────────────────────────────
function exportToOBJ(roomConfig, modules) {
  let obj = [];
  let vertexOffset = 1;

  obj.push("# KitchenCraft 3D CAD Exporter");
  obj.push("# Units: Meters");

  const addBox = (name, x, y, z, w, h, d, rotationY) => {
    obj.push(`g ${name}`);
    const halfW = w / 2;
    const halfH = h / 2;
    const halfD = d / 2;

    const localVertices = [
      { x: -halfW, y: -halfH, z: -halfD },
      { x: halfW, y: -halfH, z: -halfD },
      { x: halfW, y: halfH, z: -halfD },
      { x: -halfW, y: halfH, z: -halfD },
      { x: -halfW, y: -halfH, z: halfD },
      { x: halfW, y: -halfH, z: halfD },
      { x: halfW, y: halfH, z: halfD },
      { x: -halfW, y: halfH, z: halfD }
    ];

    const rad = (rotationY * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    localVertices.forEach(v => {
      const rx = v.x * cos - v.z * sin;
      const rz = v.x * sin + v.z * cos;
      const wx = x + rx;
      const wy = y + v.y;
      const wz = z + rz;
      obj.push(`v ${wx.toFixed(4)} ${wy.toFixed(4)} ${wz.toFixed(4)}`);
    });

    const faces = [
      [1, 2, 3, 4],
      [5, 8, 7, 6],
      [1, 5, 6, 2],
      [4, 3, 7, 8],
      [1, 4, 8, 5],
      [2, 6, 7, 3]
    ];

    faces.forEach(f => {
      obj.push(`f ${f[0] + vertexOffset} ${f[1] + vertexOffset} ${f[2] + vertexOffset} ${f[3] + vertexOffset}`);
    });

    vertexOffset += 8;
  };

  const rw = roomConfig.width;
  const rd = roomConfig.depth;
  const rh = roomConfig.height;

  addBox("Room_Floor", 0, -0.01, 0, rw, 0.02, rd, 0);
  addBox("Wall_Back", 0, rh / 2, -rd / 2 - 0.01, rw, rh, 0.02, 0);
  addBox("Wall_Left", -rw / 2 - 0.01, rh / 2, 0, 0.02, rh, rd, 0);
  addBox("Wall_Right", rw / 2 + 0.01, rh / 2, 0, 0.02, rh, rd, 0);

  modules.forEach(mod => {
    const wx = mod.position[0] - rw / 2 + mod.width / 2;
    const wz = mod.position[1] - rd / 2 + mod.depth / 2;
    const wy = mod.type.includes('wall') || mod.type === 'glass_cabinet' || mod.type === 'open_shelf' || mod.type === 'wine_rack' ? 1.45 + mod.height / 2 : mod.height / 2;

    addBox(
      `${mod.type}_${mod.id}`,
      wx,
      wy,
      wz,
      mod.width,
      mod.height,
      mod.depth,
      mod.rotation
    );
  });

  const content = obj.join("\n");
  const blob = new Blob([content], { type: "model/obj" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `room_layout_3d.obj`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Toolbar() {
  const {
    viewMode, setViewMode,
    modules,
    saveDesign,
    undo, redo,
    lightingMood, setLightingMood,
    showMeasurements, toggleMeasurements,
    history, historyIndex,
    rooms, roomConfig
  } = useKitchenStore();
  
  const [exportOpen, setExportOpen] = useState(false);

  const views = [
    { id: 'plan', label: '2D Plan', icon: <IconPlan /> },
    { id: '3d',   label: '3D View', icon: <Icon3D /> },
    { id: 'walkthrough', label: 'Walkthrough', icon: <IconWalk /> },
  ];

  const moods = [
    { id: 'day',     icon: <IconSun />, tip: 'Day' },
    { id: 'evening', icon: <IconEvening />, tip: 'Evening' },
    { id: 'night',   icon: <IconMoon />, tip: 'Night' },
  ];

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < (history?.length ?? 1) - 1;

  return (
    <div className="toolbar">
      {/* Brand */}
      <div className="toolbar-brand">
        <span className="toolbar-brand-icon"><IconBrand /></span>
        <div className="toolbar-brand-text">
          <span className="toolbar-brand-name">KitchenCraft</span>
          <span className="toolbar-brand-tag">3D PRO</span>
        </div>
      </div>

      {/* View Switcher */}
      <div className="toolbar-views">
        {views.map((v) => (
          <button
            key={v.id}
            id={`view-btn-${v.id}`}
            className={`view-btn ${viewMode === v.id ? 'active' : ''}`}
            onClick={() => setViewMode(v.id)}
          >
            <span className="view-btn-icon">{v.icon}</span>
            <span className="view-btn-label">{v.label}</span>
            {viewMode === v.id && <span className="view-btn-dot" />}
          </button>
        ))}
      </div>

      {/* Middle Controls */}
      <div className="toolbar-middle">
        {/* Undo / Redo */}
        <div className="toolbar-group">
          <button
            className={`btn-icon tooltip ${!canUndo ? 'disabled' : ''}`}
            data-tip="Undo (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo}
            id="btn-undo"
          >
            <IconUndo />
          </button>
          <button
            className={`btn-icon tooltip ${!canRedo ? 'disabled' : ''}`}
            data-tip="Redo (Ctrl+Y)"
            onClick={redo}
            disabled={!canRedo}
            id="btn-redo"
          >
            <IconRedo />
          </button>
        </div>

        <div className="toolbar-sep" />

        {/* Lighting Moods */}
        <div className="toolbar-group">
          {moods.map((m) => (
            <button
              key={m.id}
              className={`btn-icon tooltip ${lightingMood === m.id ? 'active' : ''}`}
              data-tip={m.tip}
              onClick={() => setLightingMood(m.id)}
              id={`mood-btn-${m.id}`}
            >
              {m.icon}
            </button>
          ))}
        </div>

        <div className="toolbar-sep" />

        {/* Measurements Toggle */}
        <button
          className={`btn-icon tooltip ${showMeasurements ? 'active' : ''}`}
          data-tip="Measurements"
          onClick={toggleMeasurements}
          id="btn-measurements"
        >
          <IconRuler />
        </button>

        {/* Screenshot */}
        <ScreenshotButton />
      </div>

      {/* Right */}
      <div className="toolbar-actions">
        {viewMode === 'walkthrough' && (
          <div className="toolbar-hint animate-fade-in">
            <span className="hint-key">WASD</span>
            <span className="hint-separator">move</span>
            <span className="hint-key">Mouse</span>
            <span className="hint-separator">look</span>
          </div>
        )}
        <div className="toolbar-stat">
          <span className="stat-num">{modules.length}</span>
          <span className="stat-label">modules</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn-secondary" onClick={() => setExportOpen(!exportOpen)} id="btn-export" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>📤</span> Export CAD
          </button>
          {exportOpen && (
            <div className="export-dropdown animate-scale-in">
              <button
                className="export-dropdown-item"
                onClick={() => { exportToDXF(roomConfig, modules, rooms); setExportOpen(false); }}
              >
                📐 AutoCAD Blueprint (.DXF)
              </button>
              <button
                className="export-dropdown-item"
                onClick={() => { exportToOBJ(roomConfig, modules); setExportOpen(false); }}
              >
                📦 3D CAD Mesh (.OBJ)
              </button>
            </div>
          )}
        </div>

        <button className="btn-primary" id="btn-save" onClick={saveDesign}>
          <IconSave style={{ marginRight: 6 }} /> Save
        </button>
      </div>
    </div>
  );
}
