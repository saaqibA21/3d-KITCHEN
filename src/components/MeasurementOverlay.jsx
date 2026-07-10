import React, { useMemo } from 'react';
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useMaterial, useApp } from '@playcanvas/react/hooks';
import useKitchenStore from '../store/kitchenStore';
import { Color, Texture, PIXELFORMAT_R8_G8_B8_A8 } from 'playcanvas';

function makeTextTexture(app, text, color = '#f59e0b') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  
  // Background bubble
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.roundRect(16, 16, 480, 96, 24);
  ctx.fill();

  // Text
  ctx.fillStyle = color;
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  const tex = new Texture(app.graphicsDevice, {
    width: 512,
    height: 128,
    format: PIXELFORMAT_R8_G8_B8_A8,
    autoMipmap: true
  });
  tex.setSource(canvas);
  return tex;
}

function TextPlane({ app, text, position, rotation, scale = [1.2, 1, 0.3] }) {
  const texture = useMemo(() => makeTextTexture(app, text), [app, text]);
  const material = useMaterial({
    diffuseMap: texture,
    emissiveMap: texture,
    emissive: new Color(1, 1, 1),
    opacityMap: texture,
    blendType: 'normal',
    opacityMapChannel: 'a'
  });

  return (
    <Entity position={position} rotation={rotation} scale={scale}>
      <Render type="plane" material={material} />
    </Entity>
  );
}

export default function MeasurementOverlay({ roomConfig }) {
  const app = useApp();
  const { showMeasurements, modules, selectedId } = useKitchenStore();

  if (!showMeasurements) return null;

  const { width, depth } = roomConfig;
  const hw = width / 2;
  const hd = depth / 2;

  const selectedMod = modules.find(m => m.id === selectedId);

  return (
    <Entity name="measurements-group">
      {/* Width Label — front edge */}
      <TextPlane 
        app={app} 
        text={`${width.toFixed(1)}m`} 
        position={[0, 0.05, hd + 0.3]} 
        rotation={[90, 0, 0]} 
        scale={[1.0, 1.0, 0.25]}
      />

      {/* Depth Label — right edge */}
      <TextPlane 
        app={app} 
        text={`${depth.toFixed(1)}m`} 
        position={[hw + 0.3, 0.05, 0]} 
        rotation={[90, 90, 0]} 
        scale={[1.0, 1.0, 0.25]}
      />

      {/* Selected module dimensions */}
      {selectedMod && (() => {
        const wx = selectedMod.position[0] - hw + selectedMod.width / 2;
        const wz = selectedMod.position[1] - hd + selectedMod.depth / 2;
        const wy = selectedMod.type.includes('wall') || selectedMod.type === 'glass_cabinet' || selectedMod.type === 'open_shelf' || selectedMod.type === 'wine_rack' ? 1.45 + selectedMod.height : selectedMod.height;
        const labelText = `W:${Math.round(selectedMod.width * 100)} D:${Math.round(selectedMod.depth * 100)} H:${Math.round(selectedMod.height * 100)}`;
        
        return (
          <TextPlane 
            app={app} 
            text={labelText} 
            position={[wx, wy + 0.25, wz]} 
            rotation={[90, 0, 0]} 
            scale={[1.5, 1.0, 0.38]}
          />
        );
      })()}
    </Entity>
  );
}
