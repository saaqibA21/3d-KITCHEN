import React, { useMemo } from 'react';
import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useMaterial, useApp } from '@playcanvas/react/hooks';
import useKitchenStore from '../store/kitchenStore';
import { makeSubwayTileTexture, makeHexTileTexture } from '../utils/textures';
import { Vec2 } from 'playcanvas';

export default function Backsplash({ roomConfig }) {
  const app = useApp();
  const { backsplash, showBacksplash } = useKitchenStore();

  const { pattern, tileColor, groutColor } = backsplash;
  const { width, depth } = roomConfig;

  // Generate tile texture
  const texture = useMemo(() => {
    if (!showBacksplash) return null;
    if (pattern === 'hex') return makeHexTileTexture(app, tileColor, groutColor);
    return makeSubwayTileTexture(app, tileColor, groutColor);
  }, [app, pattern, tileColor, groutColor, showBacksplash]);

  // Create material with texture and tiling
  const material = useMaterial({
    diffuseMap: texture || undefined,
    roughness: 0.2,
    metalness: 0.05,
    diffuseMapTiling: new Vec2(pattern === 'hex' ? 4 : 3, pattern === 'hex' ? 4 : 2),
  });

  if (!showBacksplash || !texture) return null;

  // Backsplash height configurations (cm)
  const splashBottom = 0.87;
  const splashTop = 1.43;
  const splashHeight = splashTop - splashBottom;
  const splashY = splashBottom + splashHeight / 2;

  return (
    <Entity name="backsplash-group">
      {/* Back wall backsplash */}
      <Entity 
        position={[0, splashY, -depth / 2 + 0.012]} 
        rotation={[90, 0, 0]} 
        scale={[width - 0.02, 1, splashHeight]}
      >
        <Render type="plane" material={material} receiveShadows />
      </Entity>
      
      {/* Left wall backsplash */}
      <Entity 
        position={[-width / 2 + 0.012, splashY, 0]} 
        rotation={[90, 90, 0]} 
        scale={[depth - 0.02, 1, splashHeight]}
      >
        <Render type="plane" material={material} receiveShadows />
      </Entity>
    </Entity>
  );
}
