import { create } from 'zustand';

const generateId = () => Math.random().toString(36).substr(2, 9);

const MODULE_DEFAULTS = {
  base_cabinet:    { width: 0.6,  height: 0.85, depth: 0.6,  color: '#e8dcc8', material: 'matte',     countertop: 'granite', label: 'Base Cabinet' },
  wall_cabinet:    { width: 0.6,  height: 0.7,  depth: 0.35, color: '#e8dcc8', material: 'matte',     countertop: null,      label: 'Wall Cabinet' },
  tall_cabinet:    { width: 0.6,  height: 2.1,  depth: 0.6,  color: '#e8dcc8', material: 'matte',     countertop: null,      label: 'Tall Cabinet' },
  corner_base:     { width: 0.9,  height: 0.85, depth: 0.9,  color: '#e8dcc8', material: 'matte',     countertop: 'granite', label: 'Corner Base' },
  island:          { width: 1.2,  height: 0.9,  depth: 0.8,  color: '#d4c5b0', material: 'matte',     countertop: 'marble',  label: 'Island Unit' },
  drawer_unit:     { width: 0.6,  height: 0.85, depth: 0.6,  color: '#e8dcc8', material: 'matte',     countertop: 'granite', label: 'Drawer Unit' },
  glass_cabinet:   { width: 0.6,  height: 0.7,  depth: 0.35, color: '#d4e8f0', material: 'glossy',    countertop: null,      label: 'Glass Cabinet' },
  open_shelf:      { width: 0.8,  height: 0.6,  depth: 0.25, color: '#c8a878', material: 'wood_grain', countertop: null,      label: 'Open Shelf' },
  wine_rack:       { width: 0.6,  height: 0.7,  depth: 0.35, color: '#8c6840', material: 'wood_grain', countertop: null,      label: 'Wine Rack' },
  range_hood:      { width: 0.9,  height: 0.5,  depth: 0.5,  color: '#c0c0c0', material: 'glossy',    countertop: null,      label: 'Range Hood' },
  sink:            { width: 0.8,  height: 0.85, depth: 0.6,  color: '#d0d8e0', material: 'glossy',    countertop: 'granite', label: 'Sink',          isAppliance: true },
  stove:           { width: 0.6,  height: 0.85, depth: 0.6,  color: '#333333', material: 'matte',     countertop: null,      label: 'Stove',         isAppliance: true },
  refrigerator:    { width: 0.75, height: 1.8,  depth: 0.7,  color: '#d0d0d0', material: 'glossy',    countertop: null,      label: 'Refrigerator',  isAppliance: true },
  oven:            { width: 0.6,  height: 0.6,  depth: 0.55, color: '#222222', material: 'matte',     countertop: null,      label: 'Oven',          isAppliance: true },
  dishwasher:      { width: 0.6,  height: 0.85, depth: 0.6,  color: '#d0d0d0', material: 'glossy',    countertop: null,      label: 'Dishwasher',    isAppliance: true },

  // Architectural Fixtures
  door:            { width: 0.9,  height: 2.1,  depth: 0.15, color: '#e8ebe9', material: 'matte',     countertop: null,      label: 'Door',          isFixture: true },
  window:          { width: 1.2,  height: 1.2,  depth: 0.15, color: '#d4e8f0', material: 'glossy',    countertop: null,      label: 'Window',        isFixture: true },
  stairs:          { width: 1.0,  height: 2.8,  depth: 2.5,  color: '#e2d3c0', material: 'wood_grain', countertop: null,      label: 'Stairs',        isFixture: true },
  partition:       { width: 2.0,  height: 2.8,  depth: 0.12, color: '#eae3da', material: 'matte',     countertop: null,      label: 'Partition Wall', isFixture: true },
};

const DEFAULT_STATE = {
  roomConfig: {
    width: 5,
    depth: 4,
    height: 2.8,
    wallColor: '#f0ebe4',
    floorColor: '#c8b89a',
    floorTexture: 'tile',
  },
  modules: [],
  rooms: [], // Custom Room Zone rects: { id, label, position: [x,y], width, depth }
  selectedId: null,
  viewMode: 'plan',
  lightingMood: 'day',
  showMeasurements: true,
  showBacksheet: true, // backward compatible helper
  showBacksplash: true,
  backsplash: {
    pattern: 'subway',
    tileColor: '#e8e4e0',
    groutColor: '#b0aaa4',
  },
  blueprintUrl: null,
  blueprintOpacity: 0.4,
  calibrationMode: false,
  calibrationPoints: [],
  pixelsPerMeter: 100,
  customAiCatalog: [],

  // Multi-floor states
  activeFloorId: '1',
  activeFloorsView: 'active', // 'active' | 'stacked'
  floors: [
    { id: '1', name: 'Ground Floor', height: 2.8 },
  ],
  floorData: {
    '1': {
      roomConfig: { width: 5, depth: 4, height: 2.8, wallColor: '#f0ebe4', floorColor: '#c8b89a', floorTexture: 'tile' },
      modules: [],
      rooms: []
    }
  }
};

const useKitchenStore = create((set, get) => ({
  ...DEFAULT_STATE,
  history: [DEFAULT_STATE],
  historyIndex: 0,

  MODULE_DEFAULTS,

  // ── Push to undo history ──────────────────────────────────────────────────
  _pushHistory: () => {
    const { modules, rooms, roomConfig, historyIndex, history } = get();
    const snapshot = {
      modules: JSON.parse(JSON.stringify(modules)),
      rooms: JSON.parse(JSON.stringify(rooms)),
      roomConfig: { ...roomConfig }
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    set({ history: newHistory.slice(-50), historyIndex: Math.min(newHistory.length - 1, 49) });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({ ...prev, historyIndex: historyIndex - 1, selectedId: null });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({ ...next, historyIndex: historyIndex + 1, selectedId: null });
  },

  // ── View & UI ─────────────────────────────────────────────────────────────
  setViewMode: (mode) => set({ viewMode: mode }),
  setLightingMood: (mood) => set({ lightingMood: mood }),
  toggleMeasurements: () => set((s) => ({ showMeasurements: !s.showMeasurements })),
  toggleBacksplash: () => set((s) => ({ showBacksplash: !s.showBacksplash })),

  // ── Room Config ───────────────────────────────────────────────────────────
  setRoomConfig: (config) => {
    get()._pushHistory();
    set((state) => ({ roomConfig: { ...state.roomConfig, ...config } }));
  },

  setBacksplash: (config) => {
    set((state) => ({ backsplash: { ...state.backsplash, ...config } }));
  },

  // ── Module CRUD ───────────────────────────────────────────────────────────
  addModule: (type, position, customProps = {}) => {
    const defaults = type === 'custom_ai_object' ? customProps : MODULE_DEFAULTS[type];
    if (!defaults) return;
    get()._pushHistory();
    const newModule = {
      id: generateId(),
      type,
      position: position || [0.1, 0.1],
      rotation: 0,
      doorOpen: false,
      textureScale: 1.0,
      textureRotation: 0,
      ...defaults,
    };
    set((state) => ({ modules: [...state.modules, newModule], selectedId: newModule.id }));
  },

  removeModule: (id) => {
    get()._pushHistory();
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  updateModule: (id, changes) => {
    set((state) => ({
      modules: state.modules.map((m) => (m.id === id ? { ...m, ...changes } : m)),
    }));
  },

  toggleDoor: (id) => {
    set((state) => ({
      modules: state.modules.map((m) => m.id === id ? { ...m, doorOpen: !m.doorOpen } : m),
    }));
  },

  setSelectedId: (id) => set({ selectedId: id }),

  getSelectedModule: () => {
    const { modules, selectedId } = get();
    return modules.find((m) => m.id === selectedId) || null;
  },

  clearAll: () => {
    get()._pushHistory();
    set({ modules: [], selectedId: null });
  },

  // ── Save / Load ───────────────────────────────────────────────────────────
  saveDesign: () => {
    const { modules, roomConfig, backsplash } = get();
    const design = { modules, roomConfig, backsplash, version: '2.0', savedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kitchen-design.json'; a.click();
    URL.revokeObjectURL(url);
  },

  loadDesign: (jsonData) => {
    try {
      const design = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      set({
        modules: design.modules || [],
        rooms: design.rooms || [],
        roomConfig: design.roomConfig || get().roomConfig,
        backsplash: design.backsplash || get().backsplash,
        floors: design.floors || get().floors,
        floorData: design.floorData || get().floorData,
        activeFloorId: design.activeFloorId || get().activeFloorId,
        selectedId: null,
      });
    } catch (e) { console.error('Failed to load design:', e); }
  },

  setBlueprintUrl: (url) => set({ blueprintUrl: url, calibrationPoints: [], calibrationMode: false }),
  setBlueprintOpacity: (opacity) => set({ blueprintOpacity: opacity }),
  setCalibrationMode: (bool) => set({ calibrationMode: bool, calibrationPoints: [] }),
  addCalibrationPoint: (pt) => set((state) => {
    const pts = [...state.calibrationPoints, pt];
    return { calibrationPoints: pts };
  }),
  clearBlueprint: () => set({ blueprintUrl: null, calibrationPoints: [], calibrationMode: false, pixelsPerMeter: 100 }),
  calibrateScale: (realDistance) => {
    const { calibrationPoints } = get();
    if (calibrationPoints.length !== 2) return;
    const [p1, p2] = calibrationPoints;
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    const distPx = Math.sqrt(dx * dx + dy * dy);
    if (distPx <= 0 || realDistance <= 0) return;
    const ppm = distPx / realDistance;
    set({ pixelsPerMeter: ppm, calibrationMode: false, calibrationPoints: [] });
  },
  addCustomAiObject: (obj) => set((state) => ({ customAiCatalog: [...state.customAiCatalog, obj] })),

  // ── Room Zones Actions ──────────────────────────────────────────────────
  addRoomZone: (label, dims = {}) => {
    get()._pushHistory();
    const newRoom = {
      id: generateId(),
      label: label || 'New Room',
      position: [0.5, 0.5],
      width: dims.width || 2.0,
      depth: dims.depth || 2.0,
      color: 'rgba(60, 98, 85, 0.08)'
    };
    set((state) => ({ rooms: [...state.rooms, newRoom] }));
  },
  updateRoomZone: (id, changes) => {
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  },
  removeRoomZone: (id) => {
    get()._pushHistory();
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
    }));
  },

  // ── Multi-Floor Actions ─────────────────────────────────────────────────
  switchFloor: (floorId) => {
    const { activeFloorId, floorData, modules, rooms, roomConfig } = get();
    const updatedFloorData = {
      ...floorData,
      [activeFloorId]: {
        roomConfig: { ...roomConfig },
        modules: JSON.parse(JSON.stringify(modules)),
        rooms: JSON.parse(JSON.stringify(rooms))
      }
    };
    
    const targetFloor = updatedFloorData[floorId] || {
      roomConfig: { ...roomConfig },
      modules: [],
      rooms: []
    };
    
    set({
      floorData: updatedFloorData,
      activeFloorId: floorId,
      roomConfig: { ...targetFloor.roomConfig },
      modules: JSON.parse(JSON.stringify(targetFloor.modules)),
      rooms: JSON.parse(JSON.stringify(targetFloor.rooms)),
      selectedId: null
    });
  },
  addFloor: (name, height = 2.8) => {
    get()._pushHistory();
    const { floors, floorData, roomConfig } = get();
    const newId = (floors.length + 1).toString();
    const newFloors = [...floors, { id: newId, name: name || `Floor ${newId}`, height }];
    
    const newFloorData = {
      ...floorData,
      [newId]: {
        roomConfig: { ...roomConfig, height },
        modules: [],
        rooms: []
      }
    };
    set({ floors: newFloors, floorData: newFloorData });
    get().switchFloor(newId);
  },
  toggleFloorsView: () => {
    const current = get().activeFloorsView;
    set({ activeFloorsView: current === 'active' ? 'stacked' : 'active' });
  },
}));

export default useKitchenStore;
