import React, { Suspense, useMemo, useEffect, useRef } from 'react';
import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Render, Environment } from '@playcanvas/react/components';
import { useMaterial, useApp } from '@playcanvas/react/hooks';
import * as pc from 'playcanvas';
import useKitchenStore from '../store/kitchenStore';
import KitchenModule from './KitchenModule';
import OrbitCamera from './cameras/OrbitCamera';
import WalkthroughCamera from './cameras/WalkthroughCamera';
import Backsplash from './Backsplash';
import MeasurementOverlay from './MeasurementOverlay';
import { 
  makeFloorTileTexture, 
  makeHexFloorTexture, 
  makeHerringboneTexture, 
  makeHardwoodFloorTexture, 
  makeMarbleFloorTexture, 
  makeConcreteTexture 
} from '../utils/textures';
import { hexToColor } from './Appliances';
import { SKY_PRESETS } from '../utils/environment';

// ─── Lighting Configurations ─────────────────────────────────────────────────
const MOODS = {
  day: {
    ambient: 0.55,
    ambientColor: '#fff8f0',
    dirIntensity: 1.4,
    dirColor: '#fff8f0',
    pendantIntensity: 0.6,
    pendantColor: '#fff0d0',
    underCabinetIntensity: 0.4,
    fogColor: '#e8e4df',
    fogNear: 8,
    fogFar: 22,
  },
  evening: {
    ambient: 0.2,
    ambientColor: '#ffaa55',
    dirIntensity: 0.5,
    dirColor: '#ff9944',
    pendantIntensity: 1.8,
    pendantColor: '#ffa040',
    underCabinetIntensity: 1.0,
    fogColor: '#3a2010',
    fogNear: 6,
    fogFar: 16,
  },
  night: {
    ambient: 0.05,
    ambientColor: '#101828',
    dirIntensity: 0.0,
    dirColor: '#ffffff',
    pendantIntensity: 2.5,
    pendantColor: '#ffcc80',
    underCabinetIntensity: 1.4,
    fogColor: '#0a0c12',
    fogNear: 4,
    fogFar: 12,
  },
};

// ─── Pendant Light Fixture ────────────────────────────────────────────────────
function PendantLight({ position, intensity, color }) {
  const cableMat = useMaterial({ diffuse: hexToColor('#444444'), roughness: 0.5 });
  const shadeMat = useMaterial({ diffuse: hexToColor('#c8c0b0'), roughness: 0.3, metalness: 0.4 });
  const bulbMat = useMaterial({
    diffuse: hexToColor(color),
    emissive: hexToColor(color),
    emissiveIntensity: intensity * 4,
  });

  return (
    <Entity name="pendant-light-group" position={position}>
      {/* Cable */}
      <Entity position={[0, 0, 0]} scale={[0.01, 0.4, 0.01]}>
        <Render type="cylinder" material={cableMat} />
      </Entity>
      {/* Shade */}
      <Entity position={[0, -0.4, 0]} scale={[0.28, 0.18, 0.28]}>
        <Render type="cone" material={shadeMat} castShadows />
      </Entity>
      {/* Bulb glow */}
      <Entity position={[0, -0.38, 0]} scale={[0.08, 0.08, 0.08]}>
        <Render type="sphere" material={bulbMat} />
      </Entity>
      {/* Light source */}
      <Entity position={[0, -0.5, 0]}>
        <Light
          type="omni"
          intensity={intensity * 0.8}
          color={hexToColor(color)}
          range={4}
          castShadows={true}
          shadowResolution={512}
        />
      </Entity>
    </Entity>
  );
}

// ─── Under-Cabinet LED Strip ──────────────────────────────────────────────────
function LEDStrip({ position, width, intensity, color }) {
  const ledMat = useMaterial({
    diffuse: hexToColor(color),
    emissive: hexToColor(color),
    emissiveIntensity: intensity * 3,
  });

  return (
    <Entity name="led-strip-group" position={position}>
      <Entity scale={[width * 0.8, 0.01, 0.03]}>
        <Render type="box" material={ledMat} />
      </Entity>
      <Entity position={[0, -0.05, 0]}>
        <Light type="omni" intensity={intensity * 0.6} color={hexToColor(color)} range={1.5} />
      </Entity>
    </Entity>
  );
}

// ─── Room Geometry ────────────────────────────────────────────────────────────
function Room({ roomConfig, app }) {
  const { width, depth, height, wallColor, floorColor, floorMaterial, ceilingColor } = roomConfig;

  const floorTex = useMemo(() => {
    const tileColor = floorColor || '#eae1d6';
    let groutColor = '#7a7068';
    if (tileColor.startsWith('#') && tileColor.length === 7) {
      const r = Math.max(0, parseInt(tileColor.slice(1, 3), 16) - 40);
      const g = Math.max(0, parseInt(tileColor.slice(3, 5), 16) - 40);
      const b = Math.max(0, parseInt(tileColor.slice(5, 7), 16) - 40);
      groutColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    switch (floorMaterial) {
      case 'hex':         return makeHexFloorTexture(app, tileColor, groutColor);
      case 'herringbone': return makeHerringboneTexture(app, tileColor, groutColor);
      case 'hardwood':    return makeHardwoodFloorTexture(app, tileColor);
      case 'marble':      return makeMarbleFloorTexture(app, tileColor);
      case 'concrete':    return makeConcreteTexture(app, tileColor);
      case 'tile':
      default:            return makeFloorTileTexture(app, tileColor, groutColor);
    }
  }, [app, floorColor, floorMaterial]);

  const floorMat = useMaterial({
    diffuseMap: floorTex,
    roughness: 0.55,
    metalness: 0.02,
    diffuseMapTiling: new pc.Vec2(4, 4),
  });

  const wallMat = useMaterial({
    diffuse: hexToColor(wallColor || '#f0ebe4'),
    roughness: 0.88,
    metalness: 0,
  });

  const ceilingMat = useMaterial({
    diffuse: hexToColor(ceilingColor || '#f8f5f0'),
    roughness: 0.9,
  });

  const baseboardMat = useMaterial({
    diffuse: hexToColor('#d8d0c4'),
    roughness: 0.7,
  });

  return (
    <Entity name="room-geometry">
      {/* Floor */}
      <Entity position={[0, -0.01, 0]} scale={[width, 0.02, depth]}>
        <Render type="box" material={floorMat} receiveShadows={true} />
      </Entity>

      {/* Ceiling */}
      <Entity position={[0, height + 0.01, 0]} scale={[width, 0.02, depth]}>
        <Render type="box" material={ceilingMat} />
      </Entity>

      {/* Back wall */}
      <Entity position={[0, height / 2, -depth / 2 - 0.01]} scale={[width, height, 0.02]}>
        <Render type="box" material={wallMat} receiveShadows={true} />
      </Entity>

      {/* Left wall */}
      <Entity position={[-width / 2 - 0.01, height / 2, 0]} scale={[0.02, height, depth]}>
        <Render type="box" material={wallMat} receiveShadows={true} />
      </Entity>

      {/* Right wall */}
      <Entity position={[width / 2 + 0.01, height / 2, 0]} scale={[0.02, height, depth]}>
        <Render type="box" material={wallMat} receiveShadows={true} />
      </Entity>

      {/* Baseboard trim */}
      {[
        { pos: [0, 0.05, -depth / 2 + 0.01], size: [width, 0.1, 0.02] },
        { pos: [-width / 2 + 0.01, 0.05, 0], size: [0.02, 0.1, depth] },
        { pos: [width / 2 - 0.01, 0.05, 0], size: [0.02, 0.1, depth] },
      ].map((b, i) => (
        <Entity key={i} position={b.pos} scale={b.size}>
          <Render type="box" material={baseboardMat} receiveShadows={true} />
        </Entity>
      ))}

      {/* Ceiling cornice */}
      {[
        { pos: [0, height - 0.04, -depth / 2 + 0.02], size: [width, 0.07, 0.05] },
        { pos: [-width / 2 + 0.02, height - 0.04, 0], size: [0.05, 0.07, depth] },
        { pos: [width / 2 - 0.02, height - 0.04, 0], size: [0.05, 0.07, depth] },
      ].map((c, i) => (
        <Entity key={i} position={c.pos} scale={c.size}>
          <Render type="box" material={ceilingMat} castShadows />
        </Entity>
      ))}
    </Entity>
  );
}

// ─── Scene Global Configuration Configurator ─────────────────────────────────
function SceneConfig() {
  const app = useApp();
  const { skyPreset, exposure, ambientIntensity } = useKitchenStore();
  const cfg = SKY_PRESETS[skyPreset] || SKY_PRESETS.day;

  useEffect(() => {
    if (!app) return;
    
    // ACESFilmic tone mapping
    try {
      if (app.scene.toneMapping !== undefined) {
        app.scene.toneMapping = pc.TONEMAP_ACES;
      }
      app.scene.exposure = exposure;
    } catch (e) {
      console.error('Failed to set tone mapping:', e);
    }

    // Set Ambient Light
    const amb = hexToColor(cfg.ambientColor);
    app.scene.ambientLight = new pc.Color(
      amb.r * cfg.ambient * ambientIntensity,
      amb.g * cfg.ambient * ambientIntensity,
      amb.b * cfg.ambient * ambientIntensity,
      1
    );
    
    // Set Clear/Background Color
    const fogColor = hexToColor(cfg.fogColor);
    app.scene.clearColor = fogColor;

    // Fog configuration
    app.scene.fog.type = 'linear';
    app.scene.fog.color = fogColor;
    app.scene.fog.start = cfg.fogNear;
    app.scene.fog.end = cfg.fogFar;

    // Enable Clustered Lighting for better multi-light shadows
    if (app.scene.lightmapper) {
      app.scene.clusteredLightingEnabled = true;
    }
  }, [app, skyPreset, exposure, ambientIntensity, cfg]);

  return null;
}

// ─── Main Scene Content ───────────────────────────────────────────────────────
function SceneContent({ isWalkthrough }) {
  const app = useApp();
  const {
    roomConfig, modules,
    activeFloorsView, floors, floorData, activeFloorId,
    skyPreset, sunAngle, sunIntensity
  } = useKitchenStore();
  const cfg = SKY_PRESETS[skyPreset] || SKY_PRESETS.day;

  const { width, depth, height } = roomConfig;

  const pendantPositions = [
    [0, height - 0.05, 0],
    [-width * 0.25, height - 0.05, -depth * 0.15],
    [width * 0.25, height - 0.05, -depth * 0.15],
  ];

  const floorItems = useMemo(() => {
    if (activeFloorsView === 'stacked') {
      let cumulativeY = 0;
      return floors.map((f) => {
        const offset = cumulativeY;
        cumulativeY += f.height;
        const isCurrent = f.id === activeFloorId;
        const data = isCurrent ? { modules, roomConfig } : (floorData[f.id] || { modules: [], roomConfig: { width: 5, depth: 4, height: 2.8 } });
        return {
          ...f,
          yOffset: offset,
          modulesList: data.modules || [],
          config: data.roomConfig,
        };
      });
    } else {
      return [{
        id: activeFloorId,
        name: 'Active Floor',
        height: roomConfig.height,
        yOffset: 0,
        modulesList: modules,
        config: roomConfig,
      }];
    }
  }, [activeFloorsView, floors, floorData, activeFloorId, modules, roomConfig]);

  return (
    <Entity name="scene-root">
      <SceneConfig />

      {/* Directional Sun Light */}
      <Entity position={[width * 0.3, height * 0.85, depth * 0.3]} rotation={[-(90 - sunAngle * 0.5), 35, 0]}>
        <Light
          type="directional"
          intensity={cfg.dirIntensity * sunIntensity}
          color={hexToColor(cfg.dirColor)}
          castShadows={cfg.dirIntensity > 0}
          shadowResolution={2048}
          shadowDistance={30}
          shadowBias={0.005}
          shadowNormalBias={0.05}
          vsmBlurSize={11}
        />
      </Entity>

      {/* Pendant Lights */}
      {pendantPositions.map((pos, i) => (
        <PendantLight
          key={i}
          position={pos}
          intensity={cfg.pendantIntensity}
          color={cfg.pendantColor}
        />
      ))}

      {/* LED Strips under overhead cabinets */}
      <LEDStrip
        position={[-width * 0.1, 1.42, -depth / 2 + 0.32]}
        width={width * 0.55}
        intensity={cfg.underCabinetIntensity}
        color="#e8f0ff"
      />

      {/* Stacked Floor entities list */}
      {floorItems.map((f) => (
        <Entity key={f.id} name={`floor-${f.id}`} position={[0, f.yOffset, 0]}>
          <Room roomConfig={f.config} app={app} />
          <Backsplash roomConfig={f.config} />

          {/* Modules */}
          {f.modulesList.map((mod) => (
            <KitchenModule key={mod.id} mod={mod} roomConfig={f.config} />
          ))}
        </Entity>
      ))}

      <MeasurementOverlay roomConfig={roomConfig} />

      {/* Camera switcher */}
      {isWalkthrough ? (
        <WalkthroughCamera roomConfig={roomConfig} isActive />
      ) : (
        <OrbitCamera roomConfig={roomConfig} />
      )}
    </Entity>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Scene3D({ isWalkthrough, onGlReady }) {
  const { setSelectedId } = useKitchenStore();

  return (
    <Application
      fillMode="fill-window"
      resolutionMode="auto"
      deviceTypes={['webgl2']}
      graphicsDeviceOptions={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ width: '100%', height: '100%', background: '#0a0b0e' }}
      onClick={() => setSelectedId(null)}
    >
      <Suspense fallback={null}>
        <SceneContent isWalkthrough={isWalkthrough} />
      </Suspense>
    </Application>
  );
}
