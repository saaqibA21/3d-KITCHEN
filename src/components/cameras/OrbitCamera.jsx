import React from 'react';
import { Entity } from '@playcanvas/react';
import { Camera } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';
import { Vec3 } from 'playcanvas';

export default function OrbitCamera({ roomConfig }) {
  const initPos = [roomConfig.width * 0.5, roomConfig.height * 0.7, roomConfig.depth * 0.7];
  
  return (
    <Entity name="orbit-camera-container">
      <Entity 
        name="camera" 
        position={initPos}
      >
        <Camera fov={52} near={0.1} far={60} />
        <OrbitControls
          distanceMin={1.5}
          distanceMax={18}
          pitchAngleMin={-85}
          pitchAngleMax={15}
          pivotPoint={new Vec3(0, 0.5, 0)}
        />
      </Entity>
    </Entity>
  );
}
