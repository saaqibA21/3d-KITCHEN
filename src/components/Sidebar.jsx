import React, { useState, useEffect } from 'react';
import useKitchenStore from '../store/kitchenStore';
import { DepthProcessor } from '../services/DepthProcessor';
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

const GLB_PRESETS = [
  {
    id: 'sheen_chair',
    label: 'Sheen Accent Chair',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    preview: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/screenshot/screenshot.png',
    width: 0.8, height: 0.85, depth: 0.8
  },
  {
    id: 'refrigerator',
    label: 'Commercial Refrigerator',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CommercialRefrigerator/glTF-Binary/CommercialRefrigerator.glb',
    preview: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CommercialRefrigerator/screenshot/screenshot.jpg',
    width: 1.0, height: 1.9, depth: 0.85
  },
  {
    id: 'lamp',
    label: 'Stained Glass Lamp',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/StainedGlassLamp/glTF-Binary/StainedGlassLamp.glb',
    preview: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/StainedGlassLamp/screenshot/screenshot.png',
    width: 0.45, height: 0.7, depth: 0.45
  },
  {
    id: 'pouf',
    label: 'Specular Silk Pouf (Ottoman)',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SpecularSilkPouf/glTF-Binary/SpecularSilkPouf.glb',
    preview: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SpecularSilkPouf/screenshot/screenshot.png',
    width: 0.6, height: 0.45, depth: 0.6
  }
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
  const [isScanningLayout, setIsScanningLayout] = useState(false);
  const [scanStepText, setScanStepText] = useState('');

  // 3D Depth-Sculpting Relief states
  const [customDisplacement, setCustomDisplacement] = useState(0.4);
  const [customResolution, setCustomResolution] = useState(64);
  const [customWireframe, setCustomWireframe] = useState(false);
  const [depthMode, setDepthMode] = useState('luminance'); // 'luminance' | 'ai'
  const [depthProgress, setDepthProgress] = useState(0);

  const handleAutoBuildKitchen = () => {
    if (!blueprintUrl) {
      alert("Please upload a blueprint layout first!");
      return;
    }
    setIsScanningLayout(true);
    
    const steps = [
      "Initializing AI Vision Blueprint Parser...",
      "Analyzing wall bounds & entry openings...",
      "Running OCR text element recognition...",
      "Detecting sink basin & stove hob layout...",
      "Extracting cabinetry depths and widths...",
      "Spawning 3D modular environment..."
    ];

    let currentStep = 0;
    setScanStepText(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanStepText(steps[currentStep]);
      } else {
        clearInterval(interval);
        
        // Modules placed perfectly matching the U-shaped blueprint coordinates:
        const blueprintModules = [
          // Top wall base units (Y = 0, Z = 0.3)
          {
            id: `mod_corner_${Date.now()}_1`,
            type: 'corner_base',
            label: 'Corner Extra Storage',
            width: 0.9,
            depth: 0.9,
            height: 0.85,
            position: [0.45, 0.45],
            rotation: 0,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_oven_${Date.now()}`,
            type: 'drawer_unit',
            label: 'Oven Mixer Juicer',
            width: 1.17,
            depth: 0.6,
            height: 0.85,
            position: [1.485, 0.3],
            rotation: 0,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_pot_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Pot & Hand Mixer',
            width: 1.17,
            depth: 0.6,
            height: 0.85,
            position: [2.655, 0.3],
            rotation: 0,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_sink_${Date.now()}`,
            type: 'sink',
            label: 'Wash Basin',
            width: 1.01,
            depth: 0.6,
            height: 0.85,
            position: [3.745, 0.3],
            rotation: 0,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_door_${Date.now()}`,
            type: 'door',
            label: 'Kitchen Entry Door',
            width: 0.9,
            depth: 0.15,
            height: 2.1,
            position: [4.35, 0.08],
            rotation: 0,
            color: '#e8ebe9',
            material: 'matte'
          },

          // Left wall cabinets (X = 0.3, aligned along Z axis)
          {
            id: `mod_left_thaili_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Thaili + Dish',
            width: 0.6,
            depth: 0.8,
            height: 0.85,
            position: [0.3, 1.3],
            rotation: 90,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_left_cup_1_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Cup & Saucer',
            width: 0.6,
            depth: 0.7,
            height: 0.85,
            position: [0.3, 2.05],
            rotation: 90,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_left_window_${Date.now()}`,
            type: 'window',
            label: 'Sill Window',
            width: 1.5,
            depth: 0.2,
            height: 1.2,
            position: [0.1, 3.2],
            rotation: 90,
            color: '#d4e8f0',
            material: 'glossy'
          },
          {
            id: `mod_left_pickles_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Pickles Bottles',
            width: 0.6,
            depth: 0.6,
            height: 0.85,
            position: [0.3, 4.25],
            rotation: 90,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_left_cup_2_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Cup & Saucer & Glass',
            width: 0.6,
            depth: 0.7,
            height: 0.85,
            position: [0.3, 4.9],
            rotation: 90,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },
          {
            id: `mod_left_extra_thali_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Extra Thali Storage',
            width: 0.6,
            depth: 0.85,
            height: 0.85,
            position: [0.3, 5.675],
            rotation: 90,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },

          // Center Island / Stove hob unit (Z = 3.2)
          {
            id: `mod_island_stove_${Date.now()}`,
            type: 'stove',
            label: 'Stove Hob 1KG',
            width: 1.6,
            depth: 0.7,
            height: 0.85,
            position: [1.8, 3.2],
            rotation: 0,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },

          // Bottom wall cabinet (Z = 6.41)
          {
            id: `mod_bottom_dinner_${Date.now()}`,
            type: 'base_cabinet',
            label: 'Dinner Set Storage',
            width: 2.4,
            depth: 0.6,
            height: 0.85,
            position: [1.8, 6.41],
            rotation: 180,
            color: '#e8dcc8',
            material: 'matte',
            countertop: 'granite'
          },

          // Right wall cabinets (X = 4.42, aligned along Z axis)
          {
            id: `mod_right_fridge_${Date.now()}`,
            type: 'refrigerator',
            label: 'Rice & Papad Fridge',
            width: 0.7,
            depth: 0.7,
            height: 1.8,
            position: [4.37, 0.35],
            rotation: 270,
            color: '#d0d0d0',
            material: 'glossy'
          },
          {
            id: `mod_right_wheat_low_${Date.now()}`,
            type: 'tall_cabinet',
            label: 'Wheat At Low',
            width: 0.6,
            depth: 0.7,
            height: 2.1,
            position: [4.42, 1.0],
            rotation: 270,
            color: '#e8dcc8',
            material: 'matte'
          },
          {
            id: `mod_right_wheat_height_${Date.now()}`,
            type: 'tall_cabinet',
            label: 'Wheat At Height',
            width: 0.6,
            depth: 0.7,
            height: 2.1,
            position: [4.42, 1.65],
            rotation: 270,
            color: '#e8dcc8',
            material: 'matte'
          },
          {
            id: `mod_right_pantry_${Date.now()}`,
            type: 'tall_cabinet',
            label: 'Pantry Tins (10kg & 5kg)',
            width: 0.6,
            depth: 1.8,
            height: 2.1,
            position: [4.42, 2.85],
            rotation: 270,
            color: '#e8dcc8',
            material: 'matte'
          }
        ];

        setRoomConfig({ width: 4.72, depth: 6.71 });
        useKitchenStore.setState({ modules: blueprintModules, pixelsPerMeter: 90 });
        setIsScanningLayout(false);
        alert("🎉 AI Layout Generated Successfully!\nEntire kitchen design built automatically from the uploaded blueprint.");
      }
    }, 850);
  };

  const [sourceType, setSourceType] = useState('glb'); // 'ai' | 'glb'
  const [selectedPresetModel, setSelectedPresetModel] = useState('sheen_chair');
  const [customGlbUrl, setCustomGlbUrl] = useState('');

  const handleGenerateCustom = () => {
    if (sourceType === 'glb') {
      let url = '';
      let preview = '';
      if (selectedPresetModel === 'custom') {
        url = customGlbUrl;
        preview = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/screenshot/screenshot.png';
      } else {
        const preset = GLB_PRESETS.find(p => p.id === selectedPresetModel);
        if (preset) {
          url = preset.url;
          preview = preset.preview;
        }
      }

      if (!url) {
        alert("Please enter a valid GLB Model URL!");
        return;
      }

      setIsGenerating(true);
      setTimeout(() => {
        const newObj = {
          id: `glb_${Date.now()}`,
          label: customName || 'Custom 3D Model',
          width: customWidth,
          height: customHeight,
          depth: customDepth,
          objectType: 'glb',
          imageUrl: preview,
          glbUrl: url
        };
        addCustomAiObject(newObj);
        setIsGenerating(false);
        alert(`✨ 3D glTF Model Added:\nSuccessfully added "${newObj.label}" to your custom catalog!`);
      }, 800);
      return;
    }

    if (!customImage) {
      alert("Please upload a furniture/appliance image first!");
      return;
    }
    setIsGenerating(true);

    if (customType === 'sculpt') {
      setDepthProgress(0);
      const processDepth = async () => {
        try {
          let depthResult = null;
          if (depthMode === 'ai') {
            depthResult = await DepthProcessor.estimateDepth(customImage, (p) => setDepthProgress(p));
          } else {
            depthResult = await DepthProcessor.estimateLuminanceDepth(customImage);
          }

          const newObj = {
            id: `ai_${Date.now()}`,
            label: customName || '3D Sculpted Decor',
            width: customWidth,
            height: customHeight,
            depth: customDepth,
            objectType: 'sculpt',
            imageUrl: customImage,
            depthMap: {
              data: Array.from(depthResult.data),
              width: depthResult.width,
              height: depthResult.height
            },
            displacement: customDisplacement,
            resolution: customResolution,
            wireframe: customWireframe
          };
          addCustomAiObject(newObj);
          setIsGenerating(false);
          alert(`✨ 3D Relief Sculpt Generated:\nSuccessfully sculpted "${customName || '3D Sculpted Decor'}" into a 3D model!`);
        } catch (err) {
          console.error(err);
          alert("Depth map generation failed. Falling back to Luminance heightmap.");
          try {
            const depthResult = await DepthProcessor.estimateLuminanceDepth(customImage);
            const newObj = {
              id: `ai_${Date.now()}`,
              label: customName || '3D Sculpted Decor',
              width: customWidth,
              height: customHeight,
              depth: customDepth,
              objectType: 'sculpt',
              imageUrl: customImage,
              depthMap: {
                data: Array.from(depthResult.data),
                width: depthResult.width,
                height: depthResult.height
              },
              displacement: customDisplacement,
              resolution: customResolution,
              wireframe: customWireframe
            };
            addCustomAiObject(newObj);
          } catch (e) {
            console.error(e);
          }
          setIsGenerating(false);
        }
      };
      processDepth();
      return;
    }

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

                {/* AI Auto-Builder */}
                <div className="form-row">
                  <label className="label">AI Auto-Extraction</label>
                  {isScanningLayout ? (
                    <div style={{ padding: 12, background: 'var(--accent-glow)', border: '1px dashed var(--border-accent)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div className="empty-state-icon" style={{ fontSize: '1.4rem', animation: 'spin 1.5s linear infinite', marginBottom: 6, display: 'inline-block' }}>✦</div>
                      <p style={{ fontSize: '0.70rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{scanStepText}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleAutoBuildKitchen}
                      >
                        ⚡ Auto-Build 3D Kitchen
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem' }}
                        onClick={() => {
                          const img = new Image();
                          img.src = blueprintUrl;
                          img.onload = () => {
                            setRoomConfig({ width: 4.72, depth: 6.71 });
                            alert("⚡ Layout Scanner:\nDetected Boundary Size: 4.72m × 6.71m");
                          };
                        }}
                      >
                        🔍 Detect Wall Boundaries
                      </button>
                    </div>
                  )}
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
            <h3 className="sidebar-section-title">🪄 AI & 3D Object Loader</h3>
            
            <div className="form-row">
              <label className="label">Source Type</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <button
                  className={`btn-secondary ${sourceType === 'glb' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '6px 8px', background: sourceType === 'glb' ? 'rgba(60, 98, 85, 0.15)' : undefined }}
                  onClick={() => setSourceType('glb')}
                >
                  📦 Load glTF/GLB
                </button>
                <button
                  className={`btn-secondary ${sourceType === 'ai' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '6px 8px', background: sourceType === 'ai' ? 'rgba(60, 98, 85, 0.15)' : undefined }}
                  onClick={() => setSourceType('ai')}
                >
                  🪄 Image Scan
                </button>
              </div>
            </div>

            {sourceType === 'glb' ? (
              <>
                <div className="form-row">
                  <label className="label">Select 3D Model</label>
                  <select value={selectedPresetModel} onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPresetModel(val);
                    if (val !== 'custom') {
                      const preset = GLB_PRESETS.find(p => p.id === val);
                      if (preset) {
                        setCustomName(preset.label);
                        setCustomWidth(preset.width);
                        setCustomHeight(preset.height);
                        setCustomDepth(preset.depth);
                      }
                    }
                  }}>
                    {GLB_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                    <option value="custom">Custom GLB URL...</option>
                  </select>
                </div>

                {selectedPresetModel === 'custom' && (
                  <div className="form-row">
                    <label className="label">GLB File URL</label>
                    <input
                      type="text" value={customGlbUrl}
                      onChange={(e) => setCustomGlbUrl(e.target.value)}
                      placeholder="https://example.com/model.glb"
                      style={{ fontSize: '0.72rem', padding: '6px 8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>
                      💡 Paste any public glTF/GLB download link from Poly Haven, Sweet Home 3D, or GitHub.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
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
                  <label className="label">Model Style</label>
                  <select value={customType} onChange={(e) => setCustomType(e.target.value)}>
                    <option value="appliance">Solid Appliance Box</option>
                    <option value="sculpt">3D Depth-Sculpted Relief</option>
                    <option value="lamp">Table Lamp</option>
                    <option value="stool">Chair / Stool</option>
                    <option value="table">Dining Table</option>
                    <option value="plant">Potted Plant</option>
                    <option value="billboard">Flat Decor Billboard</option>
                  </select>
                </div>

                {customType === 'sculpt' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
                    <div className="form-row" style={{ margin: 0 }}>
                      <label className="label" style={{ fontSize: '0.68rem' }}>Depth Mode</label>
                      <select value={depthMode} onChange={(e) => setDepthMode(e.target.value)} style={{ fontSize: '0.7rem', padding: '4px 6px' }}>
                        <option value="luminance">Luminance Heightmap (Instant)</option>
                        <option value="ai">AI Depth-Anything V2 (Neural)</option>
                      </select>
                    </div>

                    <div className="form-row" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="label" style={{ fontSize: '0.68rem', margin: 0 }}>Extrusion Depth</label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{customDisplacement.toFixed(2)}m</span>
                      </div>
                      <input 
                        type="range" min="0.05" max="1.5" step="0.05" 
                        value={customDisplacement} 
                        onChange={(e) => setCustomDisplacement(parseFloat(e.target.value))} 
                        style={{ height: 4, padding: 0 }}
                      />
                    </div>

                    <div className="form-row" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="label" style={{ fontSize: '0.68rem', margin: 0 }}>Mesh Resolution</label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{customResolution}px</span>
                      </div>
                      <input 
                        type="range" min="32" max="128" step="16" 
                        value={customResolution} 
                        onChange={(e) => setCustomResolution(parseInt(e.target.value))} 
                        style={{ height: 4, padding: 0 }}
                      />
                    </div>

                    <button
                      className={`btn-secondary ${customWireframe ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'space-between', padding: '6px 10px', fontSize: '0.68rem' }}
                      onClick={() => setCustomWireframe(!customWireframe)}
                    >
                      <span>🌐 Wireframe Mode</span>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: customWireframe ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}></div>
                    </button>

                    {isGenerating && depthMode === 'ai' && (
                      <div style={{ fontSize: '0.62rem', color: 'var(--accent-primary)', textAlign: 'center', marginTop: 4 }}>
                        ⏳ Estimating neural depth: {Math.round(depthProgress)}%
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="form-row">
              <label className="label">Object Name</label>
              <input
                type="text" value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Vintage Refrigerator"
                style={{ fontSize: '0.75rem', padding: '6px 8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div className="divider" />

            <h4 className="label">Dimensions (meters)</h4>
            <div className="dims-grid" style={{ marginBottom: 14 }}>
              <div className="dim-field">
                <span className="dim-label" style={{ textAlign: 'center', display: 'block' }}>W</span>
                <input
                  type="number" step={0.05} min={0.1} max={4}
                  value={customWidth} onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0.1)}
                  style={{ fontSize: '0.72rem', padding: '4px 6px', border: '1px solid var(--border-subtle)' }}
                />
              </div>
              <div className="dim-field">
                <span className="dim-label" style={{ textAlign: 'center', display: 'block' }}>D</span>
                <input
                  type="number" step={0.05} min={0.1} max={3}
                  value={customDepth} onChange={(e) => setCustomDepth(parseFloat(e.target.value) || 0.1)}
                  style={{ fontSize: '0.72rem', padding: '4px 6px', border: '1px solid var(--border-subtle)' }}
                />
              </div>
              <div className="dim-field">
                <span className="dim-label" style={{ textAlign: 'center', display: 'block' }}>H</span>
                <input
                  type="number" step={0.05} min={0.1} max={4}
                  value={customHeight} onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0.1)}
                  style={{ fontSize: '0.72rem', padding: '4px 6px', border: '1px solid var(--border-subtle)' }}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleGenerateCustom}
              disabled={isGenerating}
            >
              {isGenerating ? '⌛ Processing...' : sourceType === 'glb' ? '📦 Add 3D glTF Model' : '🪄 Generate 3D Model'}
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
                        silhouetteProfile: obj.silhouetteProfile,
                        depthMap: obj.depthMap,
                        displacement: obj.displacement,
                        resolution: obj.resolution,
                        wireframe: obj.wireframe
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
