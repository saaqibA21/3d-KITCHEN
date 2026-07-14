import React from 'react';
import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Vec3, Vec2 } from 'playcanvas';
import useKitchenStore from '../../store/kitchenStore';

export default function OrbitCamera({ roomConfig }) {
  const initPos = [roomConfig.width * 0.5, roomConfig.height * 0.7, roomConfig.depth * 0.7];
  const isDragging3D = useKitchenStore((s) => s.isDragging3D);
  
  return (
    <Entity name="orbit-camera-container">
      <Entity 
        name="camera" 
        position={initPos}
      >
        <Camera fov={52} near={0.1} far={60} />
        <Script
          script={CameraControls}
          enabled={!isDragging3D}
          enableFly={false}
          focusPoint={new Vec3(0, 0.5, 0)}
          zoomRange={new Vec2(1.5, 18)}
          pitchRange={new Vec2(-85, 15)}
        />
      </Entity>
    </Entity>
  );
}
