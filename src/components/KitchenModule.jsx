import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useMaterial, useApp, useAppEvent } from '@playcanvas/react/hooks';
import { Vec2, Vec3, math, BLEND_NORMAL, Texture, PIXELFORMAT_R8_G8_B8_A8, Mesh, MeshInstance, StandardMaterial, Color } from 'playcanvas';
import useKitchenStore from '../store/kitchenStore';
import { SinkModel, StoveModel, RefrigeratorModel, OvenModel, DishwasherModel } from './Appliances';
import { getCabinetTexture, getCountertopTexture } from '../utils/textures';
import { hexToColor } from './Appliances';

// ─── Material properties mapping ──────────────────────────────────────────────
const MAT_PROPS = {
  matte:      { roughness: 0.88, metalness: 0.00 },
  glossy:     { roughness: 0.05, metalness: 0.08 },
  wood_grain: { roughness: 0.72, metalness: 0.00 },
  concrete:   { roughness: 0.95, metalness: 0.00 },
};
const CT_PROPS = {
  granite:  { roughness: 0.28, metalness: 0.05 },
  marble:   { roughness: 0.18, metalness: 0.04 },
  quartz:   { roughness: 0.22, metalness: 0.04 },
  laminate: { roughness: 0.55, metalness: 0.00 },
};

function useCabinetMat(app, mod) {
  const matRef = useRef(null);
  const [, tick] = useState(0);
  const { color, material, textureScale = 1.0, textureRotation = 0 } = mod;

  useEffect(() => {
    if (!app || !app.graphicsDevice) return;

    // Create material once
    if (!matRef.current) {
      matRef.current = new StandardMaterial();
    }
    const m = matRef.current;

    // Apply color first (always)
    const pc = hexToColor(color);
    m.diffuse = new Color(pc.r, pc.g, pc.b);

    // Apply texture on top of color if available
    const tex = getCabinetTexture(app, material, color);
    if (tex) {
      m.diffuseMap = tex;
      m.diffuseMapTiling = new Vec2(2 * textureScale, 2 * textureScale);
      m.diffuseMapRotation = textureRotation;
      // When textured, white diffuse lets texture show true color
      m.diffuse = new Color(1, 1, 1);
    } else {
      m.diffuseMap = null;
      m.diffuseMapTiling = new Vec2(1, 1);
    }

    const props = MAT_PROPS[material] || MAT_PROPS.matte;
    m.roughness = props.roughness;
    m.metalness = props.metalness;

    // Glossy: add specular sheen
    if (material === 'glossy') {
      m.specular = new Color(0.9, 0.9, 0.9);
      m.shininess = 85;
    } else {
      m.specular = new Color(0.1, 0.1, 0.1);
      m.shininess = 10;
    }

    m.update();
    tick(n => n + 1);
  }, [app, color, material, textureScale, textureRotation]);

  // Bootstrap a placeholder before first effect fires
  if (!matRef.current && app && app.graphicsDevice) {
    const m = new StandardMaterial();
    const pc = hexToColor(color);
    m.diffuse = new Color(pc.r, pc.g, pc.b);
    m.update();
    matRef.current = m;
  }
  return matRef.current;
}

function useCountertopMat(app, mod) {
  const matRef = useRef(null);
  const [, tick] = useState(0);
  const { countertop, color, textureScale = 1.0 } = mod;

  useEffect(() => {
    if (!app || !app.graphicsDevice) return;

    if (!matRef.current) {
      matRef.current = new StandardMaterial();
    }
    const m = matRef.current;

    const tex = getCountertopTexture(app, countertop, color || '#888888');
    if (tex) {
      m.diffuseMap = tex;
      m.diffuse = new Color(1, 1, 1);
      m.diffuseMapTiling = new Vec2(1.5 * textureScale, 1.5 * textureScale);
    } else {
      m.diffuseMap = null;
      m.diffuse = new Color(0.4, 0.4, 0.4);
      m.diffuseMapTiling = new Vec2(1, 1);
    }

    const props = CT_PROPS[countertop] || CT_PROPS.granite;
    m.roughness = props.roughness;
    m.metalness = props.metalness;
    m.update();
    tick(n => n + 1);
  }, [app, countertop, color, textureScale]);

  if (!matRef.current && app && app.graphicsDevice) {
    const m = new StandardMaterial();
    m.diffuse = new Color(0.4, 0.4, 0.4);
    m.roughness = 0.3;
    m.update();
    matRef.current = m;
  }
  return matRef.current;
}

// ─── Helper parts ────────────────────────────────────────────────────────────
function Handle({ position, size = [0.008, 0.12, 0.008], horizontal = false }) {
  const handleMat = useMaterial({ diffuse: hexToColor('#c8c8c8'), roughness: 0.08, metalness: 0.85 });
  const scale = horizontal ? [size[1], size[0], size[2]] : size;
  return (
    <Entity name="handle" position={position} scale={scale}>
      <Render type="box" material={handleMat} castShadows />
    </Entity>
  );
}

function KickPlate({ width, depth }) {
  const kickMat = useMaterial({ diffuse: hexToColor('#1c1c1c'), roughness: 0.8 });
  return (
    <Entity name="kickplate" position={[0, 0.06, depth / 2 - 0.005]} scale={[width, 0.1, 0.015]}>
      <Render type="box" material={kickMat} castShadows receiveShadows />
    </Entity>
  );
}

function SelectionBox({ width, height, depth, wallOffset = 0 }) {
  const lineMat = useMaterial({ diffuse: hexToColor('#10b981'), emissive: hexToColor('#10b981'), wireframe: true });
  const fillMat = useMaterial({ diffuse: hexToColor('#10b981'), opacity: 0.08, blendType: 'normal' });
  const pos = [0, height / 2 + wallOffset, 0];
  const scl = [width + 0.02, height + 0.02, depth + 0.02];
  return (
    <Entity name="selection-group">
      <Entity name="selection-fill" position={pos} scale={scl}>
        <Render type="box" material={fillMat} />
      </Entity>
      <Entity name="selection-lines" position={pos} scale={scl}>
        <Render type="box" material={lineMat} />
      </Entity>
    </Entity>
  );
}

function AnimatedDoor({ mod, open, width, height, depthFront, children }) {
  const pivotRef = useRef();
  
  useAppEvent('update', (dt) => {
    if (!pivotRef.current) return;
    const target = open ? -95 : 0;
    const curEuler = pivotRef.current.getLocalEulerAngles();
    const nextY = math.lerp(curEuler.y, target, dt * 6);
    pivotRef.current.setLocalEulerAngles(0, nextY, 0);
  });

  return (
    <Entity ref={pivotRef} name="door-pivot" position={[-width / 2, 0, 0]}>
      <Entity name="door-content" position={[width / 2, 0, 0]}>
        {children}
      </Entity>
    </Entity>
  );
}

// ─── Cabinet Types ────────────────────────────────────────────────────────────

function BaseCabinet({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const ctMat = useCountertopMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  return (
    <Entity name="base-cabinet">
      <Entity position={[0, h / 2 - 0.02, 0]} scale={[w - 0.008, h - 0.04, d - 0.008]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      {mod.countertop && (
        <Entity position={[0, h - 0.02, 0]} scale={[w + 0.02, 0.04, d + 0.02]}>
          <Render type="box" material={ctMat} castShadows receiveShadows />
        </Entity>
      )}
      <AnimatedDoor mod={mod} open={mod.doorOpen} width={w} height={h * 0.72} depthFront={d / 2}>
        <Entity position={[0, h * 0.45, d / 2 + 0.006]} scale={[w - 0.055, h * 0.72, 0.018]}>
          <Render type="box" material={cabMat} castShadows />
        </Entity>
        <Handle position={[w * 0.3, h * 0.55, d / 2 + 0.024]} />
      </AnimatedDoor>
      <KickPlate width={w} depth={d} />
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function WallCabinet({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const trimMat = useMaterial({ diffuse: hexToColor('#d0ccc6'), roughness: 0.6 });
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  return (
    <Entity name="wall-cabinet">
      <Entity position={[0, h / 2, 0]} scale={[w - 0.008, h - 0.008, d - 0.008]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      <AnimatedDoor mod={mod} open={mod.doorOpen} width={w} height={h * 0.88} depthFront={d / 2}>
        <Entity position={[0, h * 0.5, d / 2 + 0.006]} scale={[w - 0.04, h * 0.88, 0.016]}>
          <Render type="box" material={cabMat} castShadows />
        </Entity>
        <Handle position={[w * 0.28, h * 0.26, d / 2 + 0.022]} />
      </AnimatedDoor>
      {/* Underside strip */}
      <Entity position={[0, 0.003, 0]} scale={[w, 0.006, d]}>
        <Render type="box" material={trimMat} />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function TallCabinet({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  return (
    <Entity name="tall-cabinet">
      <Entity position={[0, h / 2, 0]} scale={[w - 0.008, h - 0.008, d - 0.008]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      {/* Top door */}
      <AnimatedDoor mod={mod} open={mod.doorOpen} width={w} height={h * 0.52} depthFront={d / 2}>
        <Entity position={[0, h * 0.72, d / 2 + 0.006]} scale={[w - 0.04, h * 0.52, 0.018]}>
          <Render type="box" material={cabMat} castShadows />
        </Entity>
        <Handle position={[w * 0.28, h * 0.6, d / 2 + 0.024]} />
      </AnimatedDoor>
      {/* Bottom door */}
      <Entity position={[0, h * 0.24, d / 2 + 0.006]} scale={[w - 0.04, h * 0.44, 0.018]}>
        <Render type="box" material={cabMat} castShadows />
      </Entity>
      <Handle position={[w * 0.28, h * 0.38, d / 2 + 0.024]} />
      <KickPlate width={w} depth={d} />
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function DrawerUnit({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const ctMat = useCountertopMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const nDrawers = 3;

  return (
    <Entity name="drawer-unit">
      <Entity position={[0, h / 2, 0]} scale={[w - 0.008, h - 0.04, d - 0.008]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      {mod.countertop && (
        <Entity position={[0, h - 0.02, 0]} scale={[w + 0.02, 0.04, d + 0.02]}>
          <Render type="box" material={ctMat} castShadows />
        </Entity>
      )}
      {Array.from({ length: nDrawers }).map((_, i) => {
        const dh = (h - 0.12) / nDrawers;
        const dy = 0.08 + dh * i + dh / 2;
        return (
          <Entity key={i} name="drawer-group">
            <Entity position={[0, dy, d / 2 + 0.007]} scale={[w - 0.055, dh - 0.018, 0.018]}>
              <Render type="box" material={cabMat} castShadows />
            </Entity>
            <Handle position={[0, dy, d / 2 + 0.024]} size={[w * 0.5, 0.01, 0.01]} horizontal />
          </Entity>
        );
      })}
      <KickPlate width={w} depth={d} />
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function CornerBase({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const ctMat = useCountertopMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  return (
    <Entity name="corner-base">
      <Entity position={[0, h / 2, 0]} scale={[w, h - 0.04, d]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      {mod.countertop && (
        <Entity position={[0, h - 0.02, 0]} scale={[w + 0.02, 0.04, d + 0.02]}>
          <Render type="box" material={ctMat} castShadows />
        </Entity>
      )}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function IslandUnit({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const ctMat = useCountertopMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  return (
    <Entity name="island-unit">
      <Entity position={[0, h / 2 - 0.02, 0]} scale={[w - 0.008, h - 0.055, d - 0.008]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      {mod.countertop && (
        <Entity position={[0, h - 0.02, 0]} scale={[w + 0.05, 0.05, d + 0.05]}>
          <Render type="box" material={ctMat} castShadows />
        </Entity>
      )}
      {[-1, 1].map((side) => (
        <Entity key={side} name="island-side-group">
          <Entity position={[side * (w / 2 + 0.005), h * 0.44, 0]} scale={[0.018, h * 0.72, d - 0.055]}>
            <Render type="box" material={cabMat} castShadows />
          </Entity>
          <Handle position={[side * (w / 2 + 0.022), h * 0.55, 0]} />
        </Entity>
      ))}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function GlassCabinet({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const trimMat = useMaterial({ diffuse: hexToColor('#d0ccc6'), roughness: 0.6 });
  const glassMat = useMaterial({ diffuse: hexToColor('#c8e8f4'), opacity: 0.38, roughness: 0.02, blendType: 'normal' });
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  return (
    <Entity name="glass-cabinet">
      {/* Frame */}
      <Entity position={[0, h / 2, 0]} scale={[w - 0.008, h - 0.008, d - 0.008]}>
        <Render type="box" material={cabMat} castShadows receiveShadows />
      </Entity>
      {/* Glass panel */}
      <AnimatedDoor mod={mod} open={mod.doorOpen} width={w} height={h * 0.85} depthFront={d / 2}>
        <Entity position={[0, h * 0.5, d / 2 + 0.004]} scale={[w - 0.055, h * 0.82, 0.008]}>
          <Render type="box" material={glassMat} />
        </Entity>
        {/* Glass frame bars */}
        {[h * 0.38, h * 0.64].map((fy, i) => (
          <Entity key={i} position={[0, fy, d / 2 + 0.01]} scale={[w - 0.055, 0.012, 0.012]}>
            <Render type="box" material={cabMat} />
          </Entity>
        ))}
        <Handle position={[w * 0.28, h * 0.26, d / 2 + 0.02]} />
      </AnimatedDoor>
      <Entity position={[0, 0.003, 0]} scale={[w, 0.006, d]}>
        <Render type="box" material={trimMat} />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function OpenShelf({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const shelfCount = 2;

  return (
    <Entity name="open-shelf">
      {/* Side panels */}
      {[-1, 1].map((side) => (
        <Entity key={side} position={[side * (w / 2 - 0.012), h / 2, 0]} scale={[0.018, h, d]}>
          <Render type="box" material={cabMat} castShadows />
        </Entity>
      ))}
      {/* Back panel */}
      <Entity position={[0, h / 2, -d / 2 + 0.01]} scale={[w - 0.03, h, 0.015]}>
        <Render type="box" material={cabMat} castShadows />
      </Entity>
      {/* Shelves */}
      {Array.from({ length: shelfCount + 2 }).map((_, i) => {
        const sy = (h / (shelfCount + 1)) * i;
        return (
          <Entity key={i} position={[0, sy + 0.01, 0]} scale={[w - 0.03, 0.018, d - 0.018]}>
            <Render type="box" material={cabMat} castShadows receiveShadows />
          </Entity>
        );
      })}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function WineRack({ mod, isSelected, app }) {
  const cabMat = useCabinetMat(app, mod);
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const cols = 3, rows = 3;

  return (
    <Entity name="wine-rack">
      {/* Outer frame */}
      {[-1, 1].map((side) => (
        <Entity key={`s${side}`} position={[side * (w / 2 - 0.015), h / 2, 0]} scale={[0.025, h, d]}>
          <Render type="box" material={cabMat} castShadows />
        </Entity>
      ))}
      <Entity position={[0, 0.012, 0]} scale={[w, 0.02, d]}>
        <Render type="box" material={cabMat} castShadows />
      </Entity>
      <Entity position={[0, h - 0.012, 0]} scale={[w, 0.02, d]}>
        <Render type="box" material={cabMat} castShadows />
      </Entity>
      {/* Diagonal dividers */}
      {Array.from({ length: cols - 1 }).map((_, c) => (
        Array.from({ length: rows - 1 }).map((_, r) => {
          const cx = -w / 2 + (w / cols) * (c + 1);
          const cy = (h / rows) * (r + 1);
          return (
            <Entity key={`d${c}${r}`} position={[cx, cy, 0]} rotation={[0, 0, 45]} scale={[(w / cols) * 1.3, 0.012, d * 0.6]}>
              <Render type="box" material={cabMat} castShadows />
            </Entity>
          );
        })
      ))}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function RangeHood({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const silverMat = useMaterial({ diffuse: hexToColor('#c0c0c0'), roughness: 0.15, metalness: 0.7 });
  const grilleMat = useMaterial({ diffuse: hexToColor('#a0a0a0'), roughness: 0.2, metalness: 0.6 });
  const ledMat = useMaterial({ diffuse: hexToColor('#fffbe8'), emissive: hexToColor('#fffbe8'), emissiveIntensity: 2.0 });

  return (
    <Entity name="range-hood">
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={silverMat} castShadows receiveShadows />
      </Entity>
      {/* Vent grille */}
      {[-2, -1, 0, 1, 2].map((i) => (
        <Entity key={i} position={[i * 0.08, 0.04, d / 2 + 0.005]} scale={[0.04, h - 0.06, 0.008]}>
          <Render type="box" material={grilleMat} />
        </Entity>
      ))}
      {/* LED strip */}
      <Entity position={[0, 0.02, d / 2 - 0.02]} scale={[w * 0.7, 0.01, 0.02]}>
        <Render type="box" material={ledMat} />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

// ─── Custom AI Object Renderer ───────────────────────────────────────────────
function useCustomAiMaterial(app, imageUrl) {
  const matRef = useRef(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!app || !app.graphicsDevice) return;

    // Create / reuse material imperatively
    if (!matRef.current) {
      const m = new StandardMaterial();
      m.roughness = 0.55;
      m.metalness = 0.08;
      m.update();
      matRef.current = m;
    }

    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      if (!app.graphicsDevice) return;
      try {
        const tex = new Texture(app.graphicsDevice, {
          width: img.naturalWidth  || img.width,
          height: img.naturalHeight || img.height,
          format: PIXELFORMAT_R8_G8_B8_A8,
          autoMipmap: true,
          flipY: true,
        });
        tex.setSource(img);
        tex.upload();
        const m = matRef.current;
        m.diffuseMap = tex;
        m.diffuse = new Color(1, 1, 1);
        m.update();
        forceUpdate(n => n + 1); // trigger a re-render so Render components pick up the new mat
      } catch (e) {
        console.warn('CustomAiMat texture error:', e);
      }
    };
    img.onerror = () => {
      console.warn('CustomAiMat: failed to load image', imageUrl);
    };
  }, [app, imageUrl]);

  // Ensure material exists even on first render (before image loads)
  if (!matRef.current && app && app.graphicsDevice) {
    const m = new StandardMaterial();
    m.diffuse = new Color(0.6, 0.6, 0.6);
    m.roughness = 0.6;
    m.update();
    matRef.current = m;
  }

  return matRef.current;
}

// ─── Sub-Models ───
function createLatheMesh(device, profile, segments = 32) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const rows = profile.length;

  for (let r = 0; r < rows; r++) {
    const radius = profile[r];
    const y = r / (rows - 1); // 0 to 1

    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const c = Math.cos(angle);
      const s_val = Math.sin(angle);

      // Positions
      positions.push(radius * c, y - 0.5, radius * s_val);

      // Normals
      normals.push(c, 0, s_val);

      // UVs
      uvs.push(s / segments, r / (rows - 1));
    }
  }

  // Indices
  for (let r = 0; r < rows - 1; r++) {
    for (let s = 0; s < segments; s++) {
      const p0 = r * (segments + 1) + s;
      const p1 = p0 + 1;
      const p2 = (r + 1) * (segments + 1) + s;
      const p3 = p2 + 1;

      // Triangle 1
      indices.push(p0, p1, p2);
      // Triangle 2
      indices.push(p1, p3, p2);
    }
  }

  const mesh = new Mesh(device);
  mesh.setPositions(positions);
  mesh.setNormals(normals);
  mesh.setUvs(0, uvs);
  mesh.setIndices(indices);
  mesh.update(1); // pc.PRIMITIVE_TRIANGLES is 1

  return mesh;
}

function LatheMeshRenderer({ profile, w, h, d, material }) {
  const app = useApp();
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !profile || !profile.length || !material) return;
    const entity = ref.current;

    const mesh = createLatheMesh(app.graphicsDevice, profile);
    const meshInstance = new MeshInstance(mesh, material);

    if (entity.render) {
      entity.removeComponent('render');
    }

    entity.addComponent('render', {
      meshInstances: [meshInstance],
      castShadows: true,
      receiveShadows: true
    });
  }, [app, profile, material]);

  return <Entity ref={ref} scale={[w, h, d]} />;
}

function LampModel({ w, h, d, customMat, profile, isSelected }) {
  // Always use proper structured model — silhouette lathe was distorted/unreliable
  const blackMat    = useMaterial({ diffuse: hexToColor('#0e0e0e'), roughness: 0.4, metalness: 0.2 });
  const goldMat     = useMaterial({ diffuse: hexToColor('#c8860a'), roughness: 0.12, metalness: 0.92 });
  const darkGoldMat = useMaterial({ diffuse: hexToColor('#7a5200'), roughness: 0.3,  metalness: 0.6 });
  const glowMat     = useMaterial({
    diffuse: hexToColor('#fff6d6'),
    emissive: hexToColor('#ffbb44'),
    emissiveIntensity: 4.0,
    roughness: 1.0, metalness: 0.0,
  });

  // Proportional breakdown (bottom to top):
  // base disc -> gold trumpet -> black stem -> glow bulb -> drum shade
  const standH   = h * 0.04;
  const trumpetH = h * 0.22;
  const stemH    = h * 0.28;
  const shadeH   = h * 0.40;

  const baseY    = standH * 0.5;
  const trumpetY = standH + trumpetH * 0.5;
  const stemY    = standH + trumpetH + stemH * 0.5;
  const bulbY    = standH + trumpetH + stemH;
  const shadeY   = standH + trumpetH + stemH + shadeH * 0.5;

  const shadeR      = w * 0.50;
  const trumpetBotR = w * 0.38;
  const bulbR       = w * 0.10;

  return (
    <Entity name="custom-lamp">
      {/* Flat black base disc */}
      <Entity position={[0, baseY, 0]} scale={[w * 0.55, standH, w * 0.55]}>
        <Render type="cylinder" material={blackMat} castShadows receiveShadows />
      </Entity>

      {/* Gold trumpet — inverted cone (wide at bottom, narrow at top) */}
      <Entity position={[0, trumpetY, 0]} rotation={[180, 0, 0]} scale={[trumpetBotR * 2, trumpetH, trumpetBotR * 2]}>
        <Render type="cone" material={goldMat} castShadows />
      </Entity>
      {/* Small gold collar between trumpet top and stem */}
      <Entity position={[0, standH + trumpetH - 0.005, 0]} scale={[w * 0.13, 0.04, w * 0.13]}>
        <Render type="cylinder" material={goldMat} castShadows />
      </Entity>

      {/* Thin black stem */}
      <Entity position={[0, stemY, 0]} scale={[w * 0.055, stemH, w * 0.055]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>

      {/* Warm glow bulb at shade base */}
      <Entity position={[0, bulbY + bulbR * 0.5, 0]} scale={[bulbR * 2, bulbR * 2, bulbR * 2]}>
        <Render type="sphere" material={glowMat} />
      </Entity>

      {/* Drum shade — image texture on cylinder */}
      <Entity position={[0, shadeY, 0]} scale={[shadeR * 2, shadeH, shadeR * 2]}>
        <Render type="cylinder" material={customMat} castShadows receiveShadows />
      </Entity>

      {/* Top rim of shade */}
      <Entity position={[0, standH + trumpetH + stemH + shadeH - 0.003, 0]} scale={[shadeR * 2, 0.012, shadeR * 2]}>
        <Render type="cylinder" material={darkGoldMat} castShadows />
      </Entity>

      {/* Bottom rim of shade */}
      <Entity position={[0, standH + trumpetH + stemH + 0.003, 0]} scale={[shadeR * 2 + 0.012, 0.012, shadeR * 2 + 0.012]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>

      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}


function StoolModel({ w, h, d, customMat, isSelected }) {
  const woodMat = useMaterial({ diffuse: hexToColor('#8b5a2b'), roughness: 0.6 });
  const legW = 0.03;
  const seatH = h * 0.08;
  const legH = h - seatH;

  return (
    <Entity name="custom-stool">
      <Entity position={[0, h - seatH / 2, 0]} scale={[w, seatH, d]}>
        <Render type="cylinder" material={customMat} castShadows />
      </Entity>
      <Entity position={[-w * 0.35, legH / 2, -d * 0.35]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      <Entity position={[w * 0.35, legH / 2, -d * 0.35]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      <Entity position={[-w * 0.35, legH / 2, d * 0.35]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      <Entity position={[w * 0.35, legH / 2, d * 0.35]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function TableModel({ w, h, d, customMat, isSelected }) {
  const woodMat = useMaterial({ diffuse: hexToColor('#5c3a21'), roughness: 0.7 });
  const legW = 0.05;
  const topH = 0.04;
  const legH = h - topH;

  return (
    <Entity name="custom-table">
      <Entity position={[0, h - topH / 2, 0]} scale={[w, topH, d]}>
        <Render type="box" material={customMat} castShadows receiveShadows />
      </Entity>
      <Entity position={[-w * 0.42, legH / 2, -d * 0.42]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      <Entity position={[w * 0.42, legH / 2, -d * 0.42]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      <Entity position={[-w * 0.42, legH / 2, d * 0.42]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      <Entity position={[w * 0.42, legH / 2, d * 0.42]} scale={[legW, legH, legW]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function PlantModel({ w, h, d, customMat, isSelected }) {
  const potMat = useMaterial({ diffuse: hexToColor('#a0522d'), roughness: 0.8 });
  const potH = h * 0.3;
  const plantH = h - potH;

  return (
    <Entity name="custom-plant">
      <Entity position={[0, potH / 2, 0]} scale={[w * 0.5, potH, w * 0.5]}>
        <Render type="cone" material={potMat} castShadows />
      </Entity>
      <Entity position={[0, potH + plantH / 2, 0]} scale={[w, plantH, 0.005]}>
        <Render type="box" material={customMat} castShadows />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function GlbModelRenderer({ url, mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const parentRef = useRef();
  const loadedModelRef = useRef(null);

  useEffect(() => {
    if (!app || !url) return;
    
    let active = true;
    app.assets.loadFromUrl(url, 'container', (err, asset) => {
      if (err) {
        console.error("Failed to load GLB:", err);
        return;
      }
      if (!active) return;
      if (!parentRef.current) return;

      if (loadedModelRef.current) {
        loadedModelRef.current.destroy();
      }

      try {
        const entity = asset.resource.instantiateRenderEntity({
          castShadows: true,
          receiveShadows: true
        });
        
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        const renders = entity.findComponents('render');
        renders.forEach((r) => {
          r.meshInstances.forEach((mi) => {
            const aabb = mi.aabb;
            const min = aabb.getMin();
            const max = aabb.getMax();
            minX = Math.min(minX, min.x);
            minY = Math.min(minY, min.y);
            minZ = Math.min(minZ, min.z);
            maxX = Math.max(maxX, max.x);
            maxY = Math.max(maxY, max.y);
            maxZ = Math.max(maxZ, max.z);
          });
        });

        if (minX !== Infinity) {
          const modelW = maxX - minX;
          const modelH = maxY - minY;
          const modelD = maxZ - minZ;

          const scaleX = modelW > 0 ? w / modelW : 1.0;
          const scaleY = modelH > 0 ? h / modelH : 1.0;
          const scaleZ = modelD > 0 ? d / modelD : 1.0;
          
          entity.setLocalScale(scaleX, scaleY, scaleZ);
          
          const centerX = (minX + maxX) / 2;
          const centerY = minY;
          const centerZ = (minZ + maxZ) / 2;
          entity.setLocalPosition(-centerX * scaleX, -centerY * scaleY, -centerZ * scaleZ);
        }

        parentRef.current.addChild(entity);
        loadedModelRef.current = entity;
      } catch (e) {
        console.error("Failed to instantiate GLB render entity:", e);
      }
    });

    return () => {
      active = false;
      if (loadedModelRef.current) {
        loadedModelRef.current.destroy();
      }
    };
  }, [app, url, w, h, d]);

  return (
    <Entity ref={parentRef} name="glb-container">
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function createDisplacedPlaneMesh(device, depthMap, w, h, displacement, resolution) {
  const { data, width: dw, height: dh } = depthMap;
  const aspect = w / h;
  const segsX = resolution;
  const segsY = Math.round(resolution / aspect);
  const channels = data ? Math.max(1, Math.round(data.length / (dw * dh))) : 1;

  console.log("createDisplacedPlaneMesh debug:", {
    dataLength: data ? data.length : 0,
    dw,
    dh,
    channels,
    w,
    h,
    displacement,
    resolution,
    dataType: data ? data.constructor.name : 'null',
    sampleData: data ? data.slice(0, 10) : []
  });

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Generate vertices
  for (let y = 0; y <= segsY; y++) {
    const v = y / segsY;
    const posY = (0.5 - v) * h;
    const py = Math.floor(v * (dh - 1));

    for (let x = 0; x <= segsX; x++) {
      const u = x / segsX;
      const posX = (u - 0.5) * w;
      const px = Math.floor(u * (dw - 1));

      const index = (py * dw + px) * channels;
      // Get height from depth map (default to 0 if out of bounds)
      const depthVal = data && data[index] !== undefined ? data[index] / 255.0 : 0.0;
      const posZ = depthVal * displacement;

      positions.push(posX, posY, posZ);
      normals.push(0, 0, 1); // Face forward initially
      uvs.push(u, 1 - v); // Image coordinates uv
    }
  }

  // Generate indices (two triangles per cell)
  for (let y = 0; y < segsY; y++) {
    for (let x = 0; x < segsX; x++) {
      const row1 = y * (segsX + 1);
      const row2 = (y + 1) * (segsX + 1);

      // Triangle 1
      indices.push(row1 + x, row2 + x, row1 + x + 1);
      // Triangle 2
      indices.push(row1 + x + 1, row2 + x, row2 + x + 1);
    }
  }

  // Compute smooth vertex normals
  const tempV1 = new Vec3();
  const tempV2 = new Vec3();
  const tempNormal = new Vec3();

  // Reset normals to 0
  for (let i = 0; i < normals.length; i++) {
    normals[i] = 0;
  }

  // Accumulate triangle normals
  for (let i = 0; i < indices.length; i += 3) {
    const idx0 = indices[i];
    const idx1 = indices[i + 1];
    const idx2 = indices[i + 2];

    const p0 = new Vec3(positions[idx0 * 3], positions[idx0 * 3 + 1], positions[idx0 * 3 + 2]);
    const p1 = new Vec3(positions[idx1 * 3], positions[idx1 * 3 + 1], positions[idx1 * 3 + 2]);
    const p2 = new Vec3(positions[idx2 * 3], positions[idx2 * 3 + 1], positions[idx2 * 3 + 2]);

    tempV1.sub2(p1, p0);
    tempV2.sub2(p2, p0);
    tempNormal.cross(tempV1, tempV2).normalize();

    // Accumulate normals for the three vertices
    normals[idx0 * 3] += tempNormal.x;
    normals[idx0 * 3 + 1] += tempNormal.y;
    normals[idx0 * 3 + 2] += tempNormal.z;

    normals[idx1 * 3] += tempNormal.x;
    normals[idx1 * 3 + 1] += tempNormal.y;
    normals[idx1 * 3 + 2] += tempNormal.z;

    normals[idx2 * 3] += tempNormal.x;
    normals[idx2 * 3 + 1] += tempNormal.y;
    normals[idx2 * 3 + 2] += tempNormal.z;
  }

  // Normalize final vertex normals
  for (let i = 0; i < normals.length; i += 3) {
    const n = new Vec3(normals[i], normals[i + 1], normals[i + 2]).normalize();
    normals[i] = n.x;
    normals[i + 1] = n.y;
    normals[i + 2] = n.z;
  }

  const mesh = new Mesh(device);
  mesh.setPositions(positions);
  mesh.setNormals(normals);
  mesh.setUvs(0, uvs);
  mesh.setIndices(indices);
  mesh.update(1); // 1 = pc.PRIMITIVE_TRIANGLES
  return mesh;
}

function SculptModel3D({ w, h, d, customMat, mod, isSelected, app }) {
  const entityRef = useRef();
  const meshRef = useRef(null);

  useEffect(() => {
    if (!app || !entityRef.current || !mod.depthMap || !app.graphicsDevice) return;

    const device = app.graphicsDevice;
    const mesh = createDisplacedPlaneMesh(
      device, 
      mod.depthMap, 
      w, 
      h, 
      mod.displacement || 0.4, 
      mod.resolution || 64
    );

    meshRef.current = mesh;

    // Clone custom material to avoid changing shared state wireframe setting
    const mat = customMat.clone();
    mat.wireframe = !!mod.wireframe;
    mat.cull = 0; // CullNone (0) to render back faces
    mat.update();

    const meshInstance = new MeshInstance(mesh, mat);
    const entity = entityRef.current;
    
    if (!entity.render) {
      entity.addComponent('render', {
        type: 'asset',
        castShadows: true,
        receiveShadows: true
      });
    }
    entity.render.meshInstances = [meshInstance];

    return () => {
      if (meshRef.current) {
        meshRef.current.destroy();
      }
      if (entity.render) {
        entity.removeComponent('render');
      }
    };
  }, [app, mod.depthMap, w, h, mod.displacement, mod.resolution, customMat, customMat.diffuseMap, mod.wireframe]);

  return (
    <Entity ref={entityRef} name="custom-sculpt-relief">
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function CustomAiObjectModel({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };

  if (mod.objectType === 'glb') {
    return <GlbModelRenderer url={mod.glbUrl} mod={mod} isSelected={isSelected} app={app} />;
  }

  const customMat = useCustomAiMaterial(app, mod.customImageUrl);
  const sideMat = useMaterial({ diffuse: hexToColor('#1a1a1a'), roughness: 0.7, metalness: 0.15 });
  const topMat  = useMaterial({ diffuse: hexToColor('#2a2a2a'), roughness: 0.6, metalness: 0.1 });
  const legMat  = useMaterial({ diffuse: hexToColor('#111111'), roughness: 0.3, metalness: 0.8 });

  if (!customMat) return null;
  if (mod.objectType === 'sculpt') {
    return <SculptModel3D w={w} h={h} d={d} customMat={customMat} mod={mod} isSelected={isSelected} app={app} />;
  }
  if (mod.objectType === 'lamp') {
    return <LampModel w={w} h={h} d={d} customMat={customMat} profile={mod.silhouetteProfile} isSelected={isSelected} />;
  }
  if (mod.objectType === 'stool') {
    // Sophisticated chair with seat, back, and 4 legs
    const legR = 0.022;
    const seatH = h * 0.55;
    const backH = h - seatH;
    return (
      <Entity name="custom-stool">
        {/* Seat cushion */}
        <Entity position={[0, seatH, 0]} scale={[w, 0.08, d]}>
          <Render type="box" material={customMat} castShadows receiveShadows />
        </Entity>
        {/* Backrest */}
        <Entity position={[0, seatH + backH / 2 + 0.04, -d / 2 + 0.02]} scale={[w, backH, 0.04]}>
          <Render type="box" material={customMat} castShadows />
        </Entity>
        {/* 4 Legs */}
        {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz],i) => (
          <Entity key={i} position={[sx*(w/2-legR), seatH/2, sz*(d/2-legR)]} scale={[legR*2, seatH, legR*2]}>
            <Render type="box" material={legMat} castShadows />
          </Entity>
        ))}
        {isSelected && <SelectionBox width={w} height={h} depth={d} />}
      </Entity>
    );
  }
  if (mod.objectType === 'table') {
    // Table with tabletop and 4 legs
    const tableTopH = 0.05;
    const legR = 0.03;
    return (
      <Entity name="custom-table">
        {/* Tabletop */}
        <Entity position={[0, h - tableTopH/2, 0]} scale={[w, tableTopH, d]}>
          <Render type="box" material={customMat} castShadows receiveShadows />
        </Entity>
        {/* 4 Legs */}
        {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz],i) => (
          <Entity key={i} position={[sx*(w/2-legR*2), (h-tableTopH)/2, sz*(d/2-legR*2)]} scale={[legR*2, h-tableTopH, legR*2]}>
            <Render type="box" material={legMat} castShadows />
          </Entity>
        ))}
        {isSelected && <SelectionBox width={w} height={h} depth={d} />}
      </Entity>
    );
  }
  if (mod.objectType === 'plant') {
    return <PlantModel w={w} h={h} d={d} customMat={customMat} isSelected={isSelected} />;
  }
  if (mod.objectType === 'billboard') {
    return (
      <Entity name="custom-billboard">
        <Entity position={[0, h / 2, 0]} scale={[w, h, 0.006]}>
          <Render type="box" material={customMat} castShadows receiveShadows />
        </Entity>
        {isSelected && <SelectionBox width={w} height={h} depth={d} />}
      </Entity>
    );
  }

  // Default: solid appliance box — image projected on ALL 6 faces
  return (
    <Entity name="custom-appliance">
      {/* Main body with image texture on all faces */}
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={customMat} castShadows receiveShadows />
      </Entity>
      {/* Top cap (slightly darker) */}
      <Entity position={[0, h + 0.002, 0]} scale={[w + 0.002, 0.005, d + 0.002]}>
        <Render type="box" material={topMat} castShadows />
      </Entity>
      {/* Thin bottom base */}
      <Entity position={[0, 0.018, 0]} scale={[w - 0.02, 0.036, d - 0.02]}>
        <Render type="box" material={sideMat} castShadows receiveShadows />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

// ─── Architectural Sub-Models ───
function DoorModel3D({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const frameMat = useMaterial({ diffuse: hexToColor('#cccccc'), roughness: 0.5 });
  const panelMat = useMaterial({ diffuse: hexToColor('#e8ebe9'), roughness: 0.6 });

  const frameThick = 0.04;
  const openAngle = mod.doorOpen ? 90 : 0;

  return (
    <Entity name="3d-door">
      <Entity position={[0, h - frameThick / 2, 0]} scale={[w, frameThick, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>
      <Entity position={[-w / 2 + frameThick / 2, h / 2, 0]} scale={[frameThick, h, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>
      <Entity position={[w / 2 - frameThick / 2, h / 2, 0]} scale={[frameThick, h, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>

      <Entity position={[-w / 2 + frameThick, 0, 0]} rotation={[0, openAngle, 0]}>
        <Entity position={[(w - frameThick * 2) / 2, h / 2, 0]} scale={[w - frameThick * 2, h - frameThick, 0.04]}>
          <Render type="box" material={panelMat} castShadows />
        </Entity>
      </Entity>

      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function WindowModel3D({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const frameMat = useMaterial({ diffuse: hexToColor('#b8c0ba'), roughness: 0.3, metalness: 0.5 });
  const glassMat = useMaterial({
    diffuse: hexToColor('#d4e8f0'),
    opacity: 0.45,
    blendType: BLEND_NORMAL,
    roughness: 0.1,
    metalness: 0.9
  });

  const frameThick = 0.06;

  return (
    <Entity name="3d-window">
      <Entity position={[0, frameThick / 2, 0]} scale={[w, frameThick, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>
      <Entity position={[0, h - frameThick / 2, 0]} scale={[w, frameThick, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>
      <Entity position={[-w / 2 + frameThick / 2, h / 2, 0]} scale={[frameThick, h, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>
      <Entity position={[w / 2 - frameThick / 2, h / 2, 0]} scale={[frameThick, h, d]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>

      <Entity position={[0, h / 2, 0]} scale={[w - frameThick * 2, h - frameThick * 2, 0.02]}>
        <Render type="box" material={glassMat} />
      </Entity>

      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function StairsModel3D({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const woodMat = useMaterial({ diffuse: hexToColor('#a28c70'), roughness: 0.6 });

  const stepsCount = 10;
  const stepH = h / stepsCount;
  const stepD = d / stepsCount;

  return (
    <Entity name="3d-stairs">
      {Array.from({ length: stepsCount }).map((_, i) => {
        const currentH = (i + 1) * stepH;
        const sy = currentH / 2;
        const sz = -d / 2 + (i * stepD) + stepD / 2;
        return (
          <Entity
            key={i}
            position={[0, sy, sz]}
            scale={[w, currentH, stepD]}
          >
            <Render type="box" material={woodMat} castShadows receiveShadows />
          </Entity>
        );
      })}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function PartitionModel3D({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const wallMat = useMaterial({ diffuse: hexToColor('#eae3da'), roughness: 0.9 });

  return (
    <Entity name="3d-partition">
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={wallMat} castShadows receiveShadows />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

// ─── Living Room & Decor Models ────────────────────────────────────────────────
function SofaModel3D({ mod, isSelected }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const fabricMat = useMaterial({ diffuse: hexToColor(mod.color || '#6e808a'), roughness: 0.85 });
  const baseMat = useMaterial({ diffuse: hexToColor('#222222'), roughness: 0.9 });
  
  return (
    <Entity name="3d-sofa">
      <Entity position={[-w * 0.1, 0.15 / 2, -d * 0.2]} scale={[w * 0.8, 0.15, d * 0.6]}>
        <Render type="box" material={baseMat} castShadows receiveShadows />
      </Entity>
      <Entity position={[w * 0.3, 0.15 / 2, d * 0.1]} scale={[w * 0.4, 0.15, d * 1.2]}>
        <Render type="box" material={baseMat} castShadows receiveShadows />
      </Entity>
      
      <Entity position={[-w * 0.1, 0.15 + 0.12, -d * 0.2]} scale={[w * 0.8, 0.24, d * 0.6]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>
      <Entity position={[w * 0.3, 0.15 + 0.12, d * 0.1]} scale={[w * 0.4, 0.24, d * 1.2]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>

      <Entity position={[-w * 0.1, h - 0.2, -d * 0.45]} scale={[w * 0.8, 0.4, 0.15]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>
      <Entity position={[w * 0.42, h - 0.2, d * 0.1]} scale={[0.15, 0.4, d * 1.2]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>

      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function ArmchairModel3D({ mod, isSelected }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const fabricMat = useMaterial({ diffuse: hexToColor(mod.color || '#f5f5f5'), roughness: 0.9 });
  const woodMat = useMaterial({ diffuse: hexToColor('#8b5a2b'), roughness: 0.6 });

  return (
    <Entity name="3d-armchair">
      <Entity position={[0, 0.25, 0]} scale={[w * 0.75, 0.2, d * 0.75]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>
      <Entity position={[0, h * 0.6, -d * 0.38]} scale={[w * 0.75, h * 0.7, 0.12]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>
      <Entity position={[-w * 0.42, h * 0.45, 0]} scale={[0.1, h * 0.6, d]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>
      <Entity position={[w * 0.42, h * 0.45, 0]} scale={[0.1, h * 0.6, d]}>
        <Render type="box" material={fabricMat} castShadows />
      </Entity>
      {[-0.38, 0.38].map((lx) =>
        [-0.38, 0.38].map((lz) => (
          <Entity key={`${lx}-${lz}`} position={[lx * w, 0.08, lz * d]} scale={[0.04, 0.16, 0.04]}>
            <Render type="cylinder" material={woodMat} castShadows />
          </Entity>
        ))
      )}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function CoffeeTableModel3D({ mod, isSelected }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const woodMat = useMaterial({ diffuse: hexToColor(mod.color || '#e2ccb0'), roughness: 0.6 });
  const metalMat = useMaterial({ diffuse: hexToColor('#111111'), roughness: 0.4, metalness: 0.8 });

  const topH = 0.03;
  return (
    <Entity name="3d-coffee-table">
      <Entity position={[0, h - topH / 2, 0]} scale={[w, topH, d]}>
        <Render type="cylinder" material={woodMat} castShadows />
      </Entity>
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const lx = Math.cos(rad) * w * 0.35;
        const lz = Math.sin(rad) * d * 0.35;
        return (
          <Entity
            key={i}
            position={[lx, (h - topH) / 2, lz]}
            rotation={[10, 0, angle]}
            scale={[0.02, h - topH, 0.02]}
          >
            <Render type="cylinder" material={metalMat} castShadows />
          </Entity>
        );
      })}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function SideboardModel3D({ mod, isSelected }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const woodMat = useMaterial({ diffuse: hexToColor(mod.color || '#3a322c'), roughness: 0.7 });
  const handleMat = useMaterial({ diffuse: hexToColor('#c0c0c0'), roughness: 0.2, metalness: 0.8 });

  return (
    <Entity name="3d-sideboard">
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={woodMat} castShadows receiveShadows />
      </Entity>
      {[-0.3, 0, 0.3].map((hx, i) => (
        <React.Fragment key={i}>
          <Entity position={[hx * w, h * 0.7, d / 2 + 0.015]} scale={[0.12, 0.015, 0.02]}>
            <Render type="box" material={handleMat} castShadows />
          </Entity>
          <Entity position={[hx * w, h * 0.35, d / 2 + 0.015]} scale={[0.12, 0.015, 0.02]}>
            <Render type="box" material={handleMat} castShadows />
          </Entity>
        </React.Fragment>
      ))}
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

function RugModel3D({ mod, isSelected }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const rugMat = useMaterial({ diffuse: hexToColor(mod.color || '#4a5054'), roughness: 0.98 });

  return (
    <Entity name="3d-rug" position={[0, 0.002, 0]} scale={[w, 0.004, d]}>
      <Render type="box" material={rugMat} receiveShadows />
    </Entity>
  );
}

function FramedArtModel3D({ mod, isSelected }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const frameMat = useMaterial({ diffuse: hexToColor('#111111'), roughness: 0.4 });
  const artMat = useMaterial({ diffuse: hexToColor('#f0ebe4'), roughness: 0.9 });

  return (
    <Entity name="3d-framed-art">
      <Entity position={[0, h / 2, 0]} scale={[w, h, 0.02]}>
        <Render type="box" material={frameMat} castShadows />
      </Entity>
      <Entity position={[0, h / 2, 0.011]} scale={[w - 0.08, h - 0.08, 0.005]}>
        <Render type="box" material={artMat} />
      </Entity>
      {isSelected && <SelectionBox width={w} height={h} depth={d} />}
    </Entity>
  );
}

// ─── Renderer Map ─────────────────────────────────────────────────────────────
const CABINET_MAP = {
  base_cabinet: BaseCabinet,
  wall_cabinet: WallCabinet,
  tall_cabinet: TallCabinet,
  corner_base:  CornerBase,
  drawer_unit:  DrawerUnit,
  island:       IslandUnit,
  glass_cabinet: GlassCabinet,
  open_shelf:   OpenShelf,
  wine_rack:    WineRack,
  range_hood:   RangeHood,
  custom_ai_object: CustomAiObjectModel,
  door:         DoorModel3D,
  window:       WindowModel3D,
  stairs:       StairsModel3D,
  partition:    PartitionModel3D,
  sofa:         SofaModel3D,
  armchair:     ArmchairModel3D,
  coffee_table: CoffeeTableModel3D,
  sideboard:    SideboardModel3D,
  rug:          RugModel3D,
  framed_art:   FramedArtModel3D,
};

const APPLIANCE_MAP = {
  sink:         SinkModel,
  stove:        StoveModel,
  refrigerator: RefrigeratorModel,
  oven:         OvenModel,
  dishwasher:   DishwasherModel,
};

export default function KitchenModule({ mod, roomConfig }) {
  const app = useApp();
  const { selectedId, setSelectedId, toggleDoor } = useKitchenStore();
  const isSelected = mod.id === selectedId;
  const [hovered, setHovered] = useState(false);

  const wx = mod.position[0] - roomConfig.width / 2 + mod.width / 2;
  const wz = mod.position[1] - roomConfig.depth / 2 + mod.depth / 2;
  const wallY = mod.type.includes('wall') || mod.type === 'glass_cabinet' || mod.type === 'open_shelf' || mod.type === 'wine_rack' ? 1.45 : 0;

  const Renderer = CABINET_MAP[mod.type] || APPLIANCE_MAP[mod.type];
  if (!Renderer) return null;

  return (
    <Entity
      name={`mod-${mod.type}`}
      position={[wx, wallY, wz]}
      rotation={[0, mod.rotation, 0]}
      onClick={(e) => { e.stopPropagation(); setSelectedId(mod.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <Renderer mod={mod} isSelected={isSelected || hovered} app={app} />
    </Entity>
  );
}
