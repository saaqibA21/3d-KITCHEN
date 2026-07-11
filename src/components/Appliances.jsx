import React, { useMemo } from 'react';
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useMaterial } from '@playcanvas/react/hooks';
import { Color, Vec2 } from 'playcanvas';
import { getCabinetTexture, getCountertopTexture } from '../utils/textures';

export function hexToColor(hex) {
  if (!hex) return new Color(1, 1, 1);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color(r, g, b);
}

// ── Sink Appliance ────────────────────────────────────────────────────────────
export function SinkModel({ mod, app }) {
  const { width: w, height: h, depth: d } = mod;
  
  const cabTex = useMemo(() => getCabinetTexture(app, mod.material || 'matte', mod.color || '#e8dcc8'), [app, mod.material, mod.color]);
  const ctTex = useMemo(() => getCountertopTexture(app, mod.countertop || 'granite', '#888888'), [app, mod.countertop]);

  const bodyMat = useMaterial({
    diffuse: cabTex ? undefined : hexToColor(mod.color || '#e8dcc8'),
    diffuseMap: cabTex || undefined,
    roughness: 0.8,
    diffuseMapTiling: cabTex ? new Vec2(2, 2) : undefined
  });

  const ctMat = useMaterial({
    diffuse: ctTex ? undefined : hexToColor('#f0ede8'),
    diffuseMap: ctTex || undefined,
    roughness: 0.2,
    diffuseMapTiling: ctTex ? new Vec2(1.5, 1.5) : undefined
  });

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
  
  const cabTex = useMemo(() => getCabinetTexture(app, mod.material || 'matte', mod.color || '#e8dcc8'), [app, mod.material, mod.color]);
  const ctTex = useMemo(() => getCountertopTexture(app, mod.countertop || 'granite', '#888888'), [app, mod.countertop]);

  const bodyMat = useMaterial({
    diffuse: cabTex ? undefined : hexToColor(mod.color || '#e8dcc8'),
    diffuseMap: cabTex || undefined,
    roughness: 0.8,
    diffuseMapTiling: cabTex ? new Vec2(2, 2) : undefined
  });

  const ctMat = useMaterial({
    diffuse: ctTex ? undefined : hexToColor('#f0ede8'),
    diffuseMap: ctTex || undefined,
    roughness: 0.2,
    diffuseMapTiling: ctTex ? new Vec2(1.5, 1.5) : undefined
  });

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
export function RefrigeratorModel({ mod }) {
  const { width: w, height: h, depth: d } = mod;

  const bodyMat = useMaterial({ diffuse: hexToColor('#d0d0d0'), roughness: 0.2, metalness: 0.1 });
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
export function OvenModel({ mod }) {
  const { width: w, height: h, depth: d } = mod;

  const bodyMat = useMaterial({ diffuse: hexToColor('#1e1e1e'), roughness: 0.5 });
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
export function DishwasherModel({ mod }) {
  const { width: w, height: h, depth: d } = mod;

  const bodyMat = useMaterial({ diffuse: hexToColor('#c8c8c8'), roughness: 0.2, metalness: 0.1 });
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
