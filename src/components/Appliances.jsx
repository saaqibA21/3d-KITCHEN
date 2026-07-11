import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useMaterial } from '@playcanvas/react/hooks';
import { Color, Vec2, StandardMaterial } from 'playcanvas';
import { getCabinetTexture, getCountertopTexture } from '../utils/textures';

export function hexToColor(hex) {
  if (!hex) return new Color(1, 1, 1);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color(r, g, b);
}

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
  const { color = '#e8dcc8', material = 'matte', textureScale = 1.0, textureRotation = 0 } = mod;

  useEffect(() => {
    if (!app || !app.graphicsDevice) return;

    if (!matRef.current) {
      matRef.current = new StandardMaterial();
    }
    const m = matRef.current;

    const pc = hexToColor(color);
    m.diffuse = new Color(pc.r, pc.g, pc.b);

    const tex = getCabinetTexture(app, material, color);
    if (tex) {
      m.diffuseMap = tex;
      m.diffuseMapTiling = new Vec2(2 * textureScale, 2 * textureScale);
      m.diffuseMapRotation = textureRotation;
      m.diffuse = new Color(1, 1, 1);
    } else {
      m.diffuseMap = null;
      m.diffuseMapTiling = new Vec2(1, 1);
    }

    const props = MAT_PROPS[material] || MAT_PROPS.matte;
    m.roughness = props.roughness;
    m.metalness = props.metalness;

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
  const { countertop = 'granite', color, textureScale = 1.0 } = mod;

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

// ── Sink Appliance ────────────────────────────────────────────────────────────
export function SinkModel({ mod, app }) {
  const { width: w, height: h, depth: d } = mod;
  const bodyMat = useCabinetMat(app, mod);
  const ctMat = useCountertopMat(app, mod);

  const basinMat = useMaterial({ diffuse: hexToColor('#b8b8b8'), roughness: 0.2, metalness: 0.6 });
  const blackMat = useMaterial({ diffuse: hexToColor('#1a1a1a'), roughness: 0.5 });

  return (
    <Entity name="sink-appliance">
      {/* Cabinet body */}
      <Entity position={[0, (h - 0.05) / 2, 0]} scale={[w, h - 0.05, d]}>
        <Render type="box" material={bodyMat} castShadows receiveShadows />
      </Entity>
      {/* Countertop */}
      <Entity position={[0, h - 0.02, 0]} scale={[w + 0.01, 0.04, d + 0.01]}>
        <Render type="box" material={ctMat} castShadows receiveShadows />
      </Entity>
      {/* Basin */}
      <Entity position={[0, h - 0.03, 0]} scale={[w * 0.65, 0.06, d * 0.65]}>
        <Render type="box" material={basinMat} castShadows />
      </Entity>
      
      {/* Matte-Black Gooseneck Faucet */}
      <Entity position={[0, h + 0.06, -d * 0.2]} scale={[0.02, 0.12, 0.02]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>
      <Entity position={[0, h + 0.12, -d * 0.14]} rotation={[90, 0, 0]} scale={[0.02, 0.12, 0.02]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>
      <Entity position={[0, h + 0.10, -d * 0.08]} scale={[0.015, 0.04, 0.015]}>
        <Render type="cylinder" material={blackMat} castShadows />
      </Entity>
      <Entity position={[0.04, h + 0.04, -d * 0.2]} rotation={[0, 0, 45]} scale={[0.008, 0.05, 0.008]}>
        <Render type="box" material={blackMat} castShadows />
      </Entity>
    </Entity>
  );
}

// ── Stove Appliance ───────────────────────────────────────────────────────────
export function StoveModel({ mod, app }) {
  const { width: w, height: h, depth: d } = mod;
  const bodyMat = useCabinetMat(app, mod);
  const ctMat = useCountertopMat(app, mod);

  const surfaceMat = useMaterial({ diffuse: hexToColor('#111111'), roughness: 0.1, metalness: 0.1 });
  const burnerMat = useMaterial({ diffuse: hexToColor('#1a1a1a'), roughness: 0.3, metalness: 0.3 });
  const knobMat = useMaterial({ diffuse: hexToColor('#333333'), roughness: 0.5 });

  const burnerPositions = [
    [-w * 0.2, w * 0.15],
    [w * 0.2, w * 0.15],
    [-w * 0.2, -w * 0.15],
    [w * 0.2, -w * 0.15],
  ];

  return (
    <Entity name="stove-appliance">
      <Entity position={[0, (h - 0.05) / 2, 0]} scale={[w, h - 0.05, d]}>
        <Render type="box" material={bodyMat} castShadows receiveShadows />
      </Entity>
      <Entity position={[0, h - 0.02, 0]} scale={[w + 0.01, 0.04, d + 0.01]}>
        <Render type="box" material={ctMat} castShadows receiveShadows />
      </Entity>

      <Entity position={[0, h + 0.005, 0]} scale={[w * 0.9, 0.01, d * 0.9]}>
        <Render type="box" material={surfaceMat} castShadows receiveShadows />
      </Entity>
      
      {burnerPositions.map(([bx, bz], i) => (
        <Entity key={i} position={[bx, h + 0.015, bz]} scale={[w * 0.24, 0.01, w * 0.24]}>
          <Render type="cylinder" material={burnerMat} castShadows />
        </Entity>
      ))}

      {[-0.18, -0.06, 0.06, 0.18].map((kx, i) => (
        <Entity key={i} position={[kx * w, h + 0.015, d * 0.4]} scale={[0.03, 0.01, 0.03]}>
          <Render type="cylinder" material={knobMat} castShadows />
        </Entity>
      ))}
    </Entity>
  );
}

// ── Refrigerator Appliance ────────────────────────────────────────────────────
export function RefrigeratorModel({ mod, app }) {
  const { width: w, height: h, depth: d } = mod;
  const bodyMat = useCabinetMat(app, mod);

  const doorMat = useMaterial({ diffuse: hexToColor('#c8c8c8'), roughness: 0.1, metalness: 0.15 });
  const handleMat = useMaterial({ diffuse: hexToColor('#909090'), roughness: 0.1, metalness: 0.7 });
  const dividerMat = useMaterial({ diffuse: hexToColor('#aaaaaa'), roughness: 0.3 });

  return (
    <Entity name="fridge-appliance">
      {/* Body */}
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={bodyMat} castShadows receiveShadows />
      </Entity>
      {/* Door panel top */}
      <Entity position={[0, h * 0.72, d / 2 + 0.005]} scale={[w * 0.9, h * 0.52, 0.01]}>
        <Render type="box" material={doorMat} castShadows />
      </Entity>
      {/* Door panel bottom */}
      <Entity position={[0, h * 0.24, d / 2 + 0.005]} scale={[w * 0.9, h * 0.44, 0.01]}>
        <Render type="box" material={doorMat} castShadows />
      </Entity>
      {/* Handle top */}
      <Entity position={[w * 0.35, h * 0.72, d / 2 + 0.02]} scale={[0.03, 0.2, 0.03]}>
        <Render type="box" material={handleMat} castShadows />
      </Entity>
      {/* Handle bottom */}
      <Entity position={[w * 0.35, h * 0.24, d / 2 + 0.02]} scale={[0.03, 0.15, 0.03]}>
        <Render type="box" material={handleMat} castShadows />
      </Entity>
      {/* Door divider */}
      <Entity position={[0, h * 0.48, d / 2 + 0.006]} scale={[w, 0.015, 0.01]}>
        <Render type="box" material={dividerMat} />
      </Entity>
    </Entity>
  );
}

// ── Oven Appliance ────────────────────────────────────────────────────────────
export function OvenModel({ mod, app }) {
  const { width: w, height: h, depth: d } = mod;
  const bodyMat = useCabinetMat(app, mod);

  const glassMat = useMaterial({ diffuse: hexToColor('#0a1a2a'), roughness: 0.05, opacity: 0.7, blendType: 'normal' });
  const handleMat = useMaterial({ diffuse: hexToColor('#888888'), roughness: 0.1, metalness: 0.7 });
  const stripMat = useMaterial({ diffuse: hexToColor('#2a2a2a'), roughness: 0.4 });

  return (
    <Entity name="oven-appliance">
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={bodyMat} castShadows receiveShadows />
      </Entity>
      {/* Glass window */}
      <Entity position={[0, h * 0.55, d / 2 + 0.01]} scale={[w * 0.75, h * 0.55, 0.02]}>
        <Render type="box" material={glassMat} />
      </Entity>
      {/* Handle */}
      <Entity position={[0, h * 0.88, d / 2 + 0.02]} scale={[w * 0.7, 0.025, 0.025]}>
        <Render type="box" material={handleMat} castShadows />
      </Entity>
      {/* Control strip */}
      <Entity position={[0, h * 0.1, d / 2 + 0.01]} scale={[w * 0.9, h * 0.14, 0.01]}>
        <Render type="box" material={stripMat} />
      </Entity>
    </Entity>
  );
}

// ── Dishwasher Appliance ──────────────────────────────────────────────────────
export function DishwasherModel({ mod, app }) {
  const { width: w, height: h, depth: d } = mod;
  const bodyMat = useCabinetMat(app, mod);

  const doorMat = useMaterial({ diffuse: hexToColor('#d4d4d4'), roughness: 0.1, metalness: 0.2 });
  const stripMat = useMaterial({ diffuse: hexToColor('#1a1a1a'), roughness: 0.3 });
  const handleMat = useMaterial({ diffuse: hexToColor('#909090'), roughness: 0.1, metalness: 0.7 });

  return (
    <Entity name="dishwasher-appliance">
      <Entity position={[0, h / 2, 0]} scale={[w, h, d]}>
        <Render type="box" material={bodyMat} castShadows receiveShadows />
      </Entity>
      {/* Door panel */}
      <Entity position={[0, h * 0.5, d / 2 + 0.005]} scale={[w * 0.9, h * 0.88, 0.01]}>
        <Render type="box" material={doorMat} />
      </Entity>
      {/* Control strip */}
      <Entity position={[0, h * 0.92, d / 2 + 0.01]} scale={[w * 0.9, h * 0.1, 0.01]}>
        <Render type="box" material={stripMat} />
      </Entity>
      {/* Handle */}
      <Entity position={[0, h * 0.88, d / 2 + 0.02]} scale={[w * 0.6, 0.02, 0.02]}>
        <Render type="box" material={handleMat} castShadows />
      </Entity>
    </Entity>
  );
}
