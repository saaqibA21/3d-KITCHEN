import React, { useRef, useEffect } from 'react';
import { Entity } from '@playcanvas/react';
import { Camera } from '@playcanvas/react/components';
import { useAppEvent } from '@playcanvas/react/hooks';
import { Vec3 } from 'playcanvas';

const MOVE_SPEED = 3.5;
const keys = {};

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
}

export default function WalkthroughCamera({ roomConfig, isActive }) {
  const cameraRef = useRef();
  const rotationRef = useRef({ pitch: 0, yaw: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isActive || document.pointerLockElement === null) return;
      if (!cameraRef.current) return;

      const rot = rotationRef.current;
      rot.yaw -= e.movementX * 0.15;
      rot.pitch -= e.movementY * 0.15;
      rot.pitch = Math.max(-85, Math.min(85, rot.pitch));

      cameraRef.current.setEulerAngles(rot.pitch, rot.yaw, 0);
    };

    const handleCanvasClick = () => {
      if (isActive && document.pointerLockElement === null) {
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.requestPointerLock();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleCanvasClick);
    };
  }, [isActive]);

  // Set initial orientation looking forward/into the room
  useEffect(() => {
    if (isActive && cameraRef.current) {
      const hw = roomConfig.width / 2;
      const hd = roomConfig.depth / 2;
      // Position at eye level near the entrance/back
      cameraRef.current.setPosition(0, 1.65, hd - 0.5);
      rotationRef.current = { pitch: 0, yaw: 180 };
      cameraRef.current.setEulerAngles(0, 180, 0);
    }
  }, [isActive, roomConfig]);

  useAppEvent('update', (dt) => {
    if (!isActive || !cameraRef.current || document.pointerLockElement === null) return;

    const camera = cameraRef.current;
    const pos = camera.getPosition();

    // Get forward/right vectors from camera orientation
    const forward = camera.forward;
    const right = camera.right;

    // Zero out Y to lock movement to horizontal plane
    const flatForward = new Vec3(forward.x, 0, forward.z).normalize();
    const flatRight = new Vec3(right.x, 0, right.z).normalize();

    const moveDir = new Vec3(0, 0, 0);

    if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(flatForward);
    if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(flatForward);
    if (keys['KeyA'] || keys['ArrowLeft']) moveDir.sub(flatRight);
    if (keys['KeyD'] || keys['ArrowRight']) moveDir.add(flatRight);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().scale(MOVE_SPEED * dt);
      const newPos = pos.clone().add(moveDir);

      // Collision bounding box inside room limits
      const hw = roomConfig.width / 2 - 0.35;
      const hd = roomConfig.depth / 2 - 0.35;

      newPos.x = Math.max(-hw, Math.min(hw, newPos.x));
      newPos.z = Math.max(-hd, Math.min(hd, newPos.z));
      newPos.y = 1.65; // keep eye height fixed

      camera.setPosition(newPos);
    }
  });

  return (
    <Entity 
      ref={cameraRef} 
      name="walkthrough-camera" 
      position={[0, 1.65, roomConfig.depth / 2 - 0.5]}
    >
      <Camera fov={60} near={0.1} far={50} />
    </Entity>
  );
}
