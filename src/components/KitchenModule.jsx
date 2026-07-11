import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useMaterial, useApp, useAppEvent } from '@playcanvas/react/hooks';
import { Vec2, math, BLEND_NORMAL, Texture, PIXELFORMAT_R8_G8_B8_A8, Mesh, MeshInstance } from 'playcanvas';
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
  const { color, material, textureScale = 1.0, textureRotation = 0 } = mod;
  const map = useMemo(() => getCabinetTexture(app, material, color), [app, material, color]);
  const props = MAT_PROPS[material] || MAT_PROPS.matte;
  return useMaterial({
    diffuse: map ? undefined : hexToColor(color),
    diffuseMap: map || undefined,
    roughness: props.roughness,
    metalness: props.metalness,
    diffuseMapTiling: map ? new Vec2(2 * textureScale, 2 * textureScale) : undefined,
    diffuseMapRotation: textureRotation,
  });
}

function useCountertopMat(app, mod) {
  const { countertop, textureScale = 1.0, textureRotation = 0 } = mod;
  const map = useMemo(() => getCountertopTexture(app, countertop, '#888888'), [app, countertop]);
  const props = CT_PROPS[countertop] || CT_PROPS.granite;
  return useMaterial({
    diffuse: map ? undefined : hexToColor('#666666'),
    diffuseMap: map || undefined,
    roughness: props.roughness,
    metalness: props.metalness,
    diffuseMapTiling: map ? new Vec2(1.5 * textureScale, 1.5 * textureScale) : undefined,
    diffuseMapRotation: textureRotation,
  });
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
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (!app || !app.graphicsDevice) return;
      const tex = new Texture(app.graphicsDevice, {
        width: img.width,
        height: img.height,
        format: PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: true
      });
      tex.setSource(img);
      setTexture(tex);
    };
  }, [app, imageUrl]);

  const mat = useMaterial({
    diffuseMap: texture || undefined,
    roughness: 0.6,
    metalness: 0.1,
  });

  return mat;
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
  if (profile && profile.length > 0) {
    return (
      <Entity name="custom-lathe-lamp">
        <Entity position={[0, h / 2, 0]}>
          <LatheMeshRenderer profile={profile} w={w} h={h} d={d} material={customMat} />
        </Entity>
        {isSelected && <SelectionBox width={w} height={h} depth={d} />}
      </Entity>
    );
  }

  const blackMat = useMaterial({ diffuse: hexToColor('#1a1a1a'), roughness: 0.6, metalness: 0.1 });
  const goldMat = useMaterial({ diffuse: hexToColor('#e2a85c'), roughness: 0.15, metalness: 0.8 });
  const glowMat = useMaterial({ diffuse: hexToColor('#ffeed6'), emissive: hexToColor('#ffeed6'), emissiveIntensity: 2.0 });

  const standH = 0.02;
  const baseH = h * 0.25;
  const stemH = h * 0.4;
  const shadeH = h * 0.35;

  return (
    <Entity name="custom-lamp">
      <Entity position={[0, standH / 2, 0]} scale={[w * 0.6, standH, w * 0.6]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>
      <Entity position={[0, standH + baseH / 2, 0]} scale={[w * 0.5, baseH, w * 0.5]}>
        <Render type="cone" material={goldMat} castShadows />
      </Entity>
      <Entity position={[0, standH + baseH + stemH / 2, 0]} scale={[w * 0.08, stemH, w * 0.08]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>
      <Entity position={[0, standH + baseH + stemH, 0]} scale={[w * 0.15, w * 0.15, w * 0.15]}>
        <Render type="sphere" material={glowMat} />
      </Entity>
      <Entity position={[0, h - shadeH / 2, 0]} scale={[w, shadeH, w]}>
        <Render type="cylinder" material={customMat} castShadows receiveShadows />
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

function CustomAiObjectModel({ mod, isSelected, app }) {
  const { w, h, d } = { w: mod.width, h: mod.height, d: mod.depth };
  const customMat = useCustomAiMaterial(app, mod.customImageUrl);
  const neutralMat = useMaterial({ diffuse: hexToColor('#b0b0b0'), roughness: 0.4, metalness: 0.2 });

  if (mod.objectType === 'lamp') {
    return <LampModel w={w} h={h} d={d} customMat={customMat} profile={mod.silhouetteProfile} isSelected={isSelected} />;
  }
  if (mod.objectType === 'stool') {
    return <StoolModel w={w} h={h} d={d} customMat={customMat} isSelected={isSelected} />;
  }
  if (mod.objectType === 'table') {
    return <TableModel w={w} h={h} d={d} customMat={customMat} isSelected={isSelected} />;
  }
  if (mod.objectType === 'plant') {
    return <PlantModel w={w} h={h} d={d} customMat={customMat} isSelected={isSelected} />;
  }
  if (mod.objectType === 'billboard') {
    return (
      <Entity name="custom-billboard">
        <Entity position={[0, h / 2, 0]} scale={[w, h, 0.005]}>
          <Render type="box" material={customMat} castShadows receiveShadows />
        </Entity>
        {isSelected && <SelectionBox width={w} height={h} depth={d} />}
      </Entity>
    );
  }

  return (
    <Entity name="custom-appliance">
      {/* Front face projection */}
      <Entity position={[0, h / 2, d / 2 - 0.002]} scale={[w, h, 0.004]}>
        <Render type="box" material={customMat} castShadows />
      </Entity>
      {/* Back and side casing */}
      <Entity position={[0, h / 2, -0.002]} scale={[w - 0.004, h - 0.004, d - 0.004]}>
        <Render type="box" material={neutralMat} castShadows receiveShadows />
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
