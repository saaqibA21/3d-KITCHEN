import React, { useRef, useEffect, useState, useCallback } from 'react';
import useKitchenStore from '../store/kitchenStore';

const GRID_SIZE = 20; // pixels per 10cm
const SCALE = 50; // pixels per meter

const TYPE_COLORS = {
  base_cabinet: '#c8a87a',
  wall_cabinet: '#a0c8e0',
  tall_cabinet: '#b8a8c8',
  corner_base: '#c8b87a',
  island: '#d4b896',
  drawer_unit: '#c8a87a',
  sink: '#7ab8d4',
  stove: '#888888',
  refrigerator: '#aaaaaa',
  oven: '#666666',
  dishwasher: '#999999',
  custom_ai_object: '#9ad4c8',
};

export default function FloorPlan2D() {
  const canvasRef = useRef(null);
  const { 
    roomConfig, modules, selectedId, setSelectedId, updateModule,
    blueprintUrl, blueprintOpacity, calibrationMode, calibrationPoints,
    addCalibrationPoint, calibrateScale 
  } = useKitchenStore();
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState(null);
  const [blueprintImgObj, setBlueprintImgObj] = useState(null);

  useEffect(() => {
    if (!blueprintUrl) {
      setBlueprintImgObj(null);
      return;
    }
    const img = new Image();
    img.src = blueprintUrl;
    img.onload = () => setBlueprintImgObj(img);
  }, [blueprintUrl]);

  const getRoomOrigin = useCallback((canvas) => {
    const roomW = roomConfig.width * SCALE;
    const roomD = roomConfig.depth * SCALE;
    return {
      x: (canvas.width - roomW) / 2,
      y: (canvas.height - roomD) / 2,
    };
  }, [roomConfig]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: cw, height: ch } = canvas;

    ctx.clearRect(0, 0, cw, ch);

    // Background
    ctx.fillStyle = '#fbfaf7';
    ctx.fillRect(0, 0, cw, ch);

    // Grid
    ctx.strokeStyle = 'rgba(60, 98, 85, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < cw; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
    }
    for (let y = 0; y < ch; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
    }

    // Blueprint background image
    if (blueprintImgObj) {
      ctx.save();
      ctx.globalAlpha = blueprintOpacity;
      const imgW = blueprintImgObj.width;
      const imgH = blueprintImgObj.height;
      const aspect = imgW / imgH;
      let drawW = cw * 0.85;
      let drawH = drawW / aspect;
      if (drawH > ch * 0.85) {
        drawH = ch * 0.85;
        drawW = drawH * aspect;
      }
      ctx.drawImage(blueprintImgObj, (cw - drawW) / 2, (ch - drawH) / 2, drawW, drawH);
      ctx.restore();
    }

    // Calibration Overlay
    if (calibrationPoints && calibrationPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#3c6255';
      ctx.fillStyle = '#3c6255';
      ctx.lineWidth = 2;
      ctx.font = 'bold 11px Inter, sans-serif';
      
      calibrationPoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(idx === 0 ? 'A' : 'B', pt[0] + 8, pt[1] - 8);
      });

      if (calibrationPoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(calibrationPoints[0][0], calibrationPoints[0][1]);
        ctx.lineTo(calibrationPoints[1][0], calibrationPoints[1][1]);
        ctx.stroke();
      }
      ctx.restore();
    }

    const origin = getRoomOrigin(canvas);
    const roomW = roomConfig.width * SCALE;
    const roomD = roomConfig.depth * SCALE;

    // Room shadow
    ctx.shadowColor = 'rgba(60, 98, 85, 0.06)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#eae3da';
    ctx.fillRect(origin.x, origin.y, roomW, roomD);
    ctx.shadowBlur = 0;

    // Room floor
    ctx.fillStyle = 'rgba(60, 98, 85, 0.08)';
    ctx.fillRect(origin.x, origin.y, roomW, roomD);

    // Floor grid lines
    ctx.strokeStyle = 'rgba(60, 98, 85, 0.12)';
    ctx.lineWidth = 1;
    for (let x = origin.x; x <= origin.x + roomW; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, origin.y); ctx.lineTo(x, origin.y + roomD); ctx.stroke();
    }
    for (let y = origin.y; y <= origin.y + roomD; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(origin.x, y); ctx.lineTo(origin.x + roomW, y); ctx.stroke();
    }

    // Room walls
    ctx.strokeStyle = '#3c6255';
    ctx.lineWidth = 4;
    ctx.strokeRect(origin.x, origin.y, roomW, roomD);

    // Wall labels
    ctx.fillStyle = '#3c6255';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${roomConfig.width}m`, origin.x + roomW / 2, origin.y - 8);
    ctx.save();
    ctx.translate(origin.x - 12, origin.y + roomD / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${roomConfig.depth}m`, 0, 0);
    ctx.restore();

    // Modules
    modules.forEach((mod) => {
      const mx = origin.x + mod.position[0] * SCALE;
      const my = origin.y + mod.position[1] * SCALE;
      const mw = mod.width * SCALE;
      const mh = mod.depth * SCALE;

      const isSelected = mod.id === selectedId;
      const isHovered = mod.id === hoveredId;

      ctx.save();
      ctx.translate(mx + mw / 2, my + mh / 2);
      ctx.rotate((mod.rotation * Math.PI) / 180);
      ctx.translate(-(mw / 2), -(mh / 2));

      // Shadow
      if (isSelected || isHovered) {
        ctx.shadowColor = isSelected ? 'rgba(60, 98, 85, 0.35)' : 'rgba(60, 98, 85, 0.08)';
        ctx.shadowBlur = 12;
      }

      // Fill
      const baseColor = TYPE_COLORS[mod.type] || '#888';
      ctx.fillStyle = isSelected
        ? baseColor
        : isHovered
        ? baseColor + 'cc'
        : baseColor + '99';
      ctx.fillRect(0, 0, mw, mh);

      // Border
      ctx.strokeStyle = isSelected ? '#3c6255' : isHovered ? 'rgba(60, 98, 85, 0.5)' : 'rgba(60, 98, 85, 0.15)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(0, 0, mw, mh);

      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#1e2522';
      ctx.font = `${isSelected ? 700 : 500} 9px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = mod.label.length > 10 ? mod.label.substring(0, 8) + '…' : mod.label;
      ctx.fillText(label, mw / 2, mh / 2);

      // Size label
      ctx.fillStyle = 'rgba(30, 37, 34, 0.5)';
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(`${Math.round(mod.width * 100)}×${Math.round(mod.depth * 100)}cm`, mw / 2, mh / 2 + 10);

      ctx.restore();
    });

    // Compass
    ctx.fillStyle = '#3c6255';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('N', origin.x + roomW / 2, origin.y - 24);

    // Module count
    ctx.fillStyle = 'rgba(30, 37, 34, 0.4)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`${modules.length} module${modules.length !== 1 ? 's' : ''}`, 12, ch - 12);
  }, [roomConfig, modules, selectedId, hoveredId, getRoomOrigin, blueprintImgObj, blueprintOpacity, calibrationPoints, calibrationMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    });
    observer.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  const getModuleAtPoint = useCallback((px, py) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const origin = getRoomOrigin(canvas);
    for (let i = modules.length - 1; i >= 0; i--) {
      const mod = modules[i];
      const mx = origin.x + mod.position[0] * SCALE;
      const my = origin.y + mod.position[1] * SCALE;
      const mw = mod.width * SCALE;
      const mh = mod.depth * SCALE;
      if (px >= mx && px <= mx + mw && py >= my && py <= my + mh) return mod;
    }
    return null;
  }, [modules, getRoomOrigin]);

  const snapToGrid = (val) => Math.round(val / (GRID_SIZE / SCALE)) * (GRID_SIZE / SCALE);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (calibrationMode) {
      const newPoints = [...calibrationPoints, [px, py]];
      addCalibrationPoint([px, py]);

      if (newPoints.length === 2) {
        setTimeout(() => {
          const distStr = prompt("Enter the real-world distance between point A and B in meters (e.g. 5.0):");
          const realDist = parseFloat(distStr);
          if (!isNaN(realDist) && realDist > 0) {
            calibrateScale(realDist);
          } else {
            useKitchenStore.setState({ calibrationPoints: [], calibrationMode: false });
          }
        }, 100);
      }
      return;
    }

    const mod = getModuleAtPoint(px, py);
    if (mod) {
      const canvas = canvasRef.current;
      const origin = getRoomOrigin(canvas);
      setDragging(mod.id);
      setDragOffset({
        x: px - (origin.x + mod.position[0] * SCALE),
        y: py - (origin.y + mod.position[1] * SCALE),
      });
      setSelectedId(mod.id);
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (dragging) {
      const canvas = canvasRef.current;
      const origin = getRoomOrigin(canvas);
      const mod = modules.find((m) => m.id === dragging);
      if (!mod) return;
      let nx = (px - dragOffset.x - origin.x) / SCALE;
      let ny = (py - dragOffset.y - origin.y) / SCALE;
      nx = snapToGrid(Math.max(0, Math.min(roomConfig.width - mod.width, nx)));
      ny = snapToGrid(Math.max(0, Math.min(roomConfig.depth - mod.depth, ny)));
      updateModule(dragging, { position: [nx, ny] });
    } else {
      const hovered = getModuleAtPoint(px, py);
      setHoveredId(hovered ? hovered.id : null);
    }
  };

  const handleMouseUp = () => { setDragging(null); };

  const handleDoubleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const mod = getModuleAtPoint(px, py);
    if (mod) {
      updateModule(mod.id, { rotation: (mod.rotation + 90) % 360 });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', cursor: calibrationMode ? 'crosshair' : dragging ? 'grabbing' : hoveredId ? 'grab' : 'crosshair', display: 'block' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  );
}
