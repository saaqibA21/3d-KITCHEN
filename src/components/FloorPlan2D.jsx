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
    addCalibrationPoint, calibrateScale,
    rooms, updateRoomZone, removeRoomZone
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

    // Exterior Dimension Lines & ticks (Top and Left)
    ctx.save();
    ctx.strokeStyle = '#6e7a75';
    ctx.fillStyle = '#6e7a75';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    const drawHash = (cx, cy) => {
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 4);
      ctx.lineTo(cx + 4, cy - 4);
      ctx.stroke();
    };

    // 1. Top Wall Main Dimension Line
    const topY = origin.y - 24;
    ctx.beginPath();
    ctx.moveTo(origin.x, topY);
    ctx.lineTo(origin.x + roomW, topY);
    ctx.stroke();

    // Extension lines
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x, topY - 4);
    ctx.moveTo(origin.x + roomW, origin.y);
    ctx.lineTo(origin.x + roomW, topY - 4);
    ctx.stroke();

    drawHash(origin.x, topY);
    drawHash(origin.x + roomW, topY);

    // Dimension text background + text
    ctx.fillStyle = '#fbfaf7';
    const topText = `${roomConfig.width.toFixed(2)} m`;
    const topTextW = ctx.measureText(topText).width + 8;
    ctx.fillRect(origin.x + roomW / 2 - topTextW / 2, topY - 6, topTextW, 12);
    ctx.fillStyle = '#3c6255';
    ctx.fillText(topText, origin.x + roomW / 2, topY + 3);

    // 2. Left Wall Main Dimension Line
    const leftX = origin.x - 24;
    ctx.save();
    ctx.strokeStyle = '#6e7a75';
    ctx.fillStyle = '#6e7a75';
    ctx.beginPath();
    ctx.moveTo(leftX, origin.y);
    ctx.lineTo(leftX, origin.y + roomD);
    ctx.stroke();

    // Extension lines
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(leftX - 4, origin.y);
    ctx.moveTo(origin.x, origin.y + roomD);
    ctx.lineTo(leftX - 4, origin.y + roomD);
    ctx.stroke();

    drawHash(leftX, origin.y);
    drawHash(leftX, origin.y + roomD);

    // Left dimension text
    ctx.fillStyle = '#fbfaf7';
    const leftText = `${roomConfig.depth.toFixed(2)} m`;
    const leftTextW = ctx.measureText(leftText).width + 8;
    ctx.fillRect(leftX - 6, origin.y + roomD / 2 - 6, 12, 12);
    
    ctx.translate(leftX + 3, origin.y + roomD / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#3c6255';
    ctx.fillText(leftText, 0, 0);
    ctx.restore();

    // 3. Top wall sub-dimensions (cabinet segments aligned to top wall)
    const topModules = modules
      .filter(m => m.position[1] < 0.1)
      .sort((a, b) => a.position[0] - b.position[0]);

    if (topModules.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(110, 122, 117, 0.4)';
      ctx.fillStyle = '#6e7a75';
      ctx.font = '8px Inter, sans-serif';
      const subY = origin.y - 12;

      let lastX = origin.x;
      topModules.forEach((m) => {
        const startX = origin.x + m.position[0] * SCALE;
        const endX = startX + m.width * SCALE;

        if (startX > lastX + 2) {
          ctx.beginPath(); ctx.moveTo(lastX, subY); ctx.lineTo(startX, subY); ctx.stroke();
          drawHash(lastX, subY); drawHash(startX, subY);
          const midX = (lastX + startX) / 2;
          const val = ((startX - lastX) / SCALE).toFixed(2);
          ctx.fillText(`${val}m`, midX, subY - 3);
        }

        ctx.beginPath(); ctx.moveTo(startX, subY); ctx.lineTo(endX, subY); ctx.stroke();
        drawHash(startX, subY); drawHash(endX, subY);
        const midM = (startX + endX) / 2;
        ctx.fillText(`${m.width.toFixed(2)}m`, midM, subY - 3);
        
        lastX = endX;
      });

      const rightWallX = origin.x + roomW;
      if (rightWallX > lastX + 2) {
        ctx.beginPath(); ctx.moveTo(lastX, subY); ctx.lineTo(rightWallX, subY); ctx.stroke();
        drawHash(lastX, subY); drawHash(rightWallX, subY);
        const midX = (lastX + rightWallX) / 2;
        const val = ((rightWallX - lastX) / SCALE).toFixed(2);
        ctx.fillText(`${val}m`, midX, subY - 3);
      }
      ctx.restore();
    }

    // 4. Centered Room Label & Area (Japandi style badge)
    const area = roomConfig.width * roomConfig.depth;
    ctx.save();
    ctx.fillStyle = 'rgba(251, 250, 247, 0.9)';
    ctx.strokeStyle = 'rgba(60, 98, 85, 0.15)';
    ctx.lineWidth = 1;
    const badgeW = 160;
    const badgeH = 46;
    const bx = origin.x + roomW / 2 - badgeW / 2;
    const by = origin.y + roomD / 2 - badgeH / 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3c6255';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Modular Kitchen Room', origin.x + roomW / 2, origin.y + roomD / 2 - 4);
    ctx.fillStyle = '#6e7a75';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${area.toFixed(2)} m² (${roomConfig.width}m × ${roomConfig.depth}m)`, origin.x + roomW / 2, origin.y + roomD / 2 + 12);
    ctx.restore();

    // Room Zones
    rooms.forEach((rm) => {
      const rx = origin.x + rm.position[0] * SCALE;
      const ry = origin.y + rm.position[1] * SCALE;
      const rw = rm.width * SCALE;
      const rh = rm.depth * SCALE;

      ctx.save();
      ctx.fillStyle = rm.color || 'rgba(60, 98, 85, 0.04)';
      ctx.fillRect(rx, ry, rw, rh);

      ctx.strokeStyle = selectedId === rm.id ? '#3c6255' : 'rgba(60, 98, 85, 0.25)';
      ctx.lineWidth = selectedId === rm.id ? 2 : 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);

      ctx.fillStyle = '#3c6255';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rm.label, rx + rw / 2, ry + rh / 2 - 5);
      
      ctx.fillStyle = '#6e7a75';
      ctx.font = '8px Inter, sans-serif';
      const rmArea = rm.width * rm.depth;
      ctx.fillText(`${rmArea.toFixed(1)} m²`, rx + rw / 2, ry + rh / 2 + 6);
      ctx.restore();
    });

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

      // ── CUSTOM SYMBOLS OVERRIDES ──
      if (mod.type === 'door') {
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, mh, mw, 1.5 * Math.PI, 2 * Math.PI);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, mh);
        ctx.lineTo(mw, mh);
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();
        return;
      }

      if (mod.type === 'window') {
        ctx.fillStyle = 'rgba(212, 232, 240, 0.6)';
        ctx.fillRect(0, 0, mw, mh);
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, mw, mh);
        
        ctx.beginPath();
        ctx.moveTo(0, mh / 2);
        ctx.lineTo(mw, mh / 2);
        ctx.stroke();
        
        ctx.restore();
        return;
      }

      if (mod.type === 'stairs') {
        ctx.fillStyle = '#e2d3c0';
        ctx.fillRect(0, 0, mw, mh);
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, mw, mh);
        
        const stepCount = 8;
        const stepW = mw / stepCount;
        for (let i = 1; i < stepCount; i++) {
          ctx.beginPath();
          ctx.moveTo(i * stepW, 0);
          ctx.lineTo(i * stepW, mh);
          ctx.stroke();
        }
        
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, mh / 2);
        ctx.lineTo(mw - 10, mh / 2);
        ctx.lineTo(mw - 16, mh / 2 - 4);
        ctx.moveTo(mw - 10, mh / 2);
        ctx.lineTo(mw - 16, mh / 2 + 4);
        ctx.stroke();
        
        ctx.restore();
        return;
      }

      if (mod.type === 'partition') {
        ctx.fillStyle = '#eae3da';
        ctx.fillRect(0, 0, mw, mh);
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, mw, mh);
        
        ctx.strokeStyle = 'rgba(60, 98, 85, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < mw + mh; i += 12) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - mh, mh);
          ctx.stroke();
        }
        
        ctx.restore();
        return;
      }

      if (mod.type === 'sofa') {
        ctx.fillStyle = isSelected ? '#a8b6be' : '#c4d0d6';
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = isSelected ? 2 : 1;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(mw, 0);
        ctx.lineTo(mw, mh * 0.4);
        ctx.lineTo(mw * 0.4, mh * 0.4);
        ctx.lineTo(mw * 0.4, mh);
        ctx.lineTo(0, mh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, mh * 0.12);
        ctx.lineTo(mw, mh * 0.12);
        ctx.moveTo(mw * 0.12, mh * 0.12);
        ctx.lineTo(mw * 0.12, mh);
        ctx.stroke();

        ctx.restore();
        return;
      }

      if (mod.type === 'armchair') {
        ctx.fillStyle = isSelected ? '#e0e0e0' : '#f5f5f5';
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(0, 0, mw, mh, 4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeRect(0, 0, mw * 0.15, mh);
        ctx.strokeRect(mw * 0.85, 0, mw * 0.15, mh);
        ctx.strokeRect(mw * 0.15, 0, mw * 0.7, mh * 0.15);

        ctx.restore();
        return;
      }

      if (mod.type === 'coffee_table') {
        ctx.fillStyle = isSelected ? '#d8c5b0' : '#e2ccb0';
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(mw / 2, mh / 2, Math.min(mw, mh) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        return;
      }

      if (mod.type === 'sideboard') {
        ctx.fillStyle = isSelected ? '#2d2621' : '#3a322c';
        ctx.strokeStyle = '#1a1410';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.fillRect(0, 0, mw, mh);
        ctx.strokeRect(0, 0, mw, mh);
        
        ctx.beginPath();
        ctx.moveTo(mw / 3, 0); ctx.lineTo(mw / 3, mh);
        ctx.moveTo(mw * 2/3, 0); ctx.lineTo(mw * 2/3, mh);
        ctx.stroke();

        ctx.restore();
        return;
      }

      if (mod.type === 'rug') {
        ctx.strokeStyle = '#4a5054';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.strokeRect(0, 0, mw, mh);
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(74, 80, 84, 0.05)';
        ctx.fillRect(0, 0, mw, mh);

        ctx.restore();
        return;
      }

      if (mod.type === 'framed_art') {
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, mw, mh * 0.15);
        ctx.strokeStyle = '#3c6255';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, mw, mh * 0.15);

        ctx.restore();
        return;
      }

      if (isSelected || isHovered) {
        ctx.shadowColor = isSelected ? 'rgba(60, 98, 85, 0.35)' : 'rgba(60, 98, 85, 0.08)';
        ctx.shadowBlur = 12;
      }

      const baseColor = TYPE_COLORS[mod.type] || '#888';
      ctx.fillStyle = isSelected
        ? baseColor
        : isHovered
        ? baseColor + 'cc'
        : baseColor + '99';
      ctx.fillRect(0, 0, mw, mh);

      ctx.strokeStyle = isSelected ? '#3c6255' : isHovered ? 'rgba(60, 98, 85, 0.5)' : 'rgba(60, 98, 85, 0.15)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(0, 0, mw, mh);

      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1e2522';
      ctx.font = `${isSelected ? 700 : 500} 9px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = mod.label.length > 10 ? mod.label.substring(0, 8) + '…' : mod.label;
      ctx.fillText(label, mw / 2, mh / 2);

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

  const getRoomZoneAtPoint = useCallback((px, py) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const origin = getRoomOrigin(canvas);
    for (let i = rooms.length - 1; i >= 0; i--) {
      const rm = rooms[i];
      const rx = origin.x + rm.position[0] * SCALE;
      const ry = origin.y + rm.position[1] * SCALE;
      const rw = rm.width * SCALE;
      const rh = rm.depth * SCALE;
      if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) return rm;
    }
    return null;
  }, [rooms, getRoomOrigin]);

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
      setDragging({ type: 'module', id: mod.id });
      setDragOffset({
        x: px - (origin.x + mod.position[0] * SCALE),
        y: py - (origin.y + mod.position[1] * SCALE),
      });
      setSelectedId(mod.id);
    } else {
      const rm = getRoomZoneAtPoint(px, py);
      if (rm) {
        const canvas = canvasRef.current;
        const origin = getRoomOrigin(canvas);
        setDragging({ type: 'room', id: rm.id });
        setDragOffset({
          x: px - (origin.x + rm.position[0] * SCALE),
          y: py - (origin.y + rm.position[1] * SCALE),
        });
        setSelectedId(rm.id);
      } else {
        setSelectedId(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (dragging) {
      const canvas = canvasRef.current;
      const origin = getRoomOrigin(canvas);
      if (dragging.type === 'module') {
        const mod = modules.find((m) => m.id === dragging.id);
        if (!mod) return;
        let nx = (px - dragOffset.x - origin.x) / SCALE;
        let ny = (py - dragOffset.y - origin.y) / SCALE;
        nx = snapToGrid(Math.max(0, Math.min(roomConfig.width - mod.width, nx)));
        ny = snapToGrid(Math.max(0, Math.min(roomConfig.depth - mod.depth, ny)));
        updateModule(dragging.id, { position: [nx, ny] });
      } else if (dragging.type === 'room') {
        const rm = rooms.find((r) => r.id === dragging.id);
        if (!rm) return;
        let nx = (px - dragOffset.x - origin.x) / SCALE;
        let ny = (py - dragOffset.y - origin.y) / SCALE;
        nx = snapToGrid(Math.max(0, Math.min(roomConfig.width - rm.width, nx)));
        ny = snapToGrid(Math.max(0, Math.min(roomConfig.depth - rm.depth, ny)));
        updateRoomZone(dragging.id, { position: [nx, ny] });
      }
    } else {
      const hovered = getModuleAtPoint(px, py) || getRoomZoneAtPoint(px, py);
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
