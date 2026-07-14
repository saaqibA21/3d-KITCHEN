// ─── Procedural Texture Generator for PlayCanvas ─────────────────────────────
// All textures are generated on the CPU via Canvas API and wrapped in pc.Texture.

import { Texture, PIXELFORMAT_R8_G8_B8_A8, ADDRESS_REPEAT } from 'playcanvas';

const SIZE = 512;

function makeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  return { canvas, ctx: canvas.getContext('2d') };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

// Simple seeded "noise" using sin
function noise(x, y, seed = 1) {
  return Math.sin(x * 127.1 * seed + y * 311.7) * 0.5 + 0.5;
}

function fbm(x, y, octaves = 4, seed = 1) {
  let v = 0, a = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * noise(x * freq, y * freq, seed + i);
    a *= 0.5;
    freq *= 2.1;
  }
  return v;
}

// Helper to wrap HTML Canvas into PlayCanvas Texture
function wrapCanvas(app, canvas) {
  const tex = new Texture(app.graphicsDevice, {
    width: canvas.width,
    height: canvas.height,
    format: PIXELFORMAT_R8_G8_B8_A8,
    autoMipmap: true
  });
  tex.setSource(canvas);
  tex.addressU = ADDRESS_REPEAT;
  tex.addressV = ADDRESS_REPEAT;
  return tex;
}

// ─── Wood Texture ──────────────────────────────────────────────────────────
export function makeWoodTexture(app, baseColor = '#c8a878') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Drawing wood grains using paths and curves
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < SIZE; i += 6) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    const wave = Math.sin(i / 20) * 12;
    ctx.quadraticCurveTo(SIZE / 2, i + wave * 2, SIZE, i);
    ctx.stroke();
  }
  
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 4; i < SIZE; i += 12) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    const wave = Math.sin(i / 15) * 8;
    ctx.quadraticCurveTo(SIZE / 2, i + wave * 2, SIZE, i);
    ctx.stroke();
  }
  
  return wrapCanvas(app, canvas);
}

// ─── Marble Texture ────────────────────────────────────────────────────────
export function makeMarbleTexture(app, baseColor = '#e8e4de') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw sharp veins
  ctx.strokeStyle = 'rgba(120,110,100,0.12)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * SIZE, 0);
    ctx.bezierCurveTo(
      Math.random() * SIZE, SIZE * 0.3,
      Math.random() * SIZE, SIZE * 0.7,
      Math.random() * SIZE, SIZE
    );
    ctx.stroke();
  }
  
  // Draw soft diffuse veins
  ctx.strokeStyle = 'rgba(80,80,80,0.05)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * SIZE, 0);
    ctx.bezierCurveTo(
      Math.random() * SIZE, SIZE * 0.3,
      Math.random() * SIZE, SIZE * 0.7,
      Math.random() * SIZE, SIZE
    );
    ctx.stroke();
  }
  return wrapCanvas(app, canvas);
}

// ─── Granite Texture ───────────────────────────────────────────────────────
export function makeGraniteTexture(app, baseColor = '#6a6a6a') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Draw mineral grains
  const colors = ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.1)', 'rgba(80,80,80,0.2)'];
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = colors[i % 3];
    const r = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(Math.random() * SIZE, Math.random() * SIZE, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return wrapCanvas(app, canvas);
}

// ─── Quartz Texture ────────────────────────────────────────────────────────
export function makeQuartzTexture(app, baseColor = '#c4b89a') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Very fine quartz mineral speckles
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let i = 0; i < 500; i++) {
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1, 1);
  }
  return wrapCanvas(app, canvas);
}

// ─── Laminate Texture ──────────────────────────────────────────────────────
export function makeLaminateTexture(app, baseColor = '#9a7a5a') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Smooth parallel grain lines
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < SIZE; i += 6) {
    ctx.fillRect(0, i, SIZE, 1.5);
  }
  return wrapCanvas(app, canvas);
}

// ─── Concrete Texture ──────────────────────────────────────────────────────
export function makeConcreteTexture(app, baseColor = '#8a8a8a') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  // Concrete air pockets and texture grains
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let i = 0; i < 300; i++) {
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 300; i++) {
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 3, 3);
  }
  return wrapCanvas(app, canvas);
}

// ─── Floor Tile Texture ────────────────────────────────────────────────────
export function makeFloorTileTexture(app, tileColor = '#c8b89a', groutColor = '#7a7068') {
  const { canvas, ctx } = makeCanvas();
  
  ctx.fillStyle = tileColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  ctx.strokeStyle = groutColor;
  ctx.lineWidth = 6;
  const TILE = 120;
  for (let x = 0; x <= SIZE; x += TILE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE); ctx.stroke();
  }
  for (let y = 0; y <= SIZE; y += TILE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIZE, y); ctx.stroke();
  }
  
  // Subtle surface noise
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * SIZE;
    const ry = Math.random() * SIZE;
    ctx.fillRect(rx, ry, 2, 2);
  }
  
  return wrapCanvas(app, canvas);
}

// ─── Wall Textures ─────────────────────────────────────────────────────────
export function makeBrickTexture(app, baseColor = '#b87d6c', isWhite = false) {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = isWhite ? '#e8e4e0' : baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  ctx.strokeStyle = isWhite ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  
  const bh = 32;
  const bw = 64;
  
  for (let y = 0; y <= SIZE; y += bh) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SIZE, y);
    ctx.stroke();
    
    const offset = (y / bh) % 2 === 0 ? 0 : bw / 2;
    for (let x = offset; x <= SIZE + bw; x += bw) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + bh);
      ctx.stroke();
    }
  }
  return wrapCanvas(app, canvas);
}

export function makePlasterTexture(app, baseColor = '#e0dbd5') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 15;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * SIZE, Math.random() * SIZE, Math.random() * 80 + 40, 0, Math.PI / 2);
    ctx.stroke();
  }
  
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 10;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * SIZE, Math.random() * SIZE, Math.random() * 80 + 40, Math.PI, 1.5 * Math.PI);
    ctx.stroke();
  }
  return wrapCanvas(app, canvas);
}

export function makeStoneSlateTexture(app, baseColor = '#3c4048') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 3;
  
  const sh = 80;
  for (let y = 0; y <= SIZE; y += sh) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIZE, y); ctx.stroke();
    
    for (let x = Math.random() * 100; x < SIZE; x += 120 + Math.random() * 100) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sh); ctx.stroke();
    }
  }
  return wrapCanvas(app, canvas);
}

// ─── Backsplash Tile Textures ──────────────────────────────────────────────
export function makeSubwayTileTexture(app, tileColor = '#e8e4e0', groutColor = '#b0aaa4') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = `rgb(${hexToRgb(tileColor).r},${hexToRgb(tileColor).g},${hexToRgb(tileColor).b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const TW = 120; // tile width
  const TH = 60;  // tile height
  const GROUT = 6;

  ctx.fillStyle = `rgb(${hexToRgb(groutColor).r},${hexToRgb(groutColor).g},${hexToRgb(groutColor).b})`;

  for (let row = 0; row * TH < SIZE + TH; row++) {
    const offset = (row % 2) * (TW / 2);
    for (let col = -1; col * TW < SIZE + TW; col++) {
      const x = col * TW + offset;
      const y = row * TH;
      ctx.fillRect(x, y, GROUT, TH);
      ctx.fillRect(x, y, TW, GROUT);
    }
    ctx.fillRect(0, row * TH, SIZE, GROUT);
  }

  // Subtle gloss on tiles
  ctx.globalAlpha = 0.08;
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.globalAlpha = 1;

  return wrapCanvas(app, canvas);
}

export function makeHexTileTexture(app, tileColor = '#d4cfc8', groutColor = '#908880') {
  const { canvas, ctx } = makeCanvas();
  ctx.fillStyle = `rgb(${hexToRgb(groutColor).r},${hexToRgb(groutColor).g},${hexToRgb(groutColor).b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const R = 40; // hex radius
  const h = R * Math.sqrt(3);
  ctx.fillStyle = `rgb(${hexToRgb(tileColor).r},${hexToRgb(tileColor).g},${hexToRgb(tileColor).b})`;

  for (let row = -1; row * h < SIZE + h; row++) {
    for (let col = -1; col * R * 3 < SIZE + R * 3; col++) {
      const cx = col * R * 3 + (row % 2) * R * 1.5;
      const cy = row * h;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + (R - 3) * Math.cos(angle);
        const py = cy + (R - 3) * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
  return wrapCanvas(app, canvas);
}

// ─── Texture Cache ─────────────────────────────────────────────────────────
const cache = new Map();

export function getCachedTexture(key, factory) {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key);
}

export function getCountertopTexture(app, type, color) {
  const key = `ct_${type}_${color}`;
  switch (type) {
    case 'marble': return getCachedTexture(key, () => makeMarbleTexture(app, color));
    case 'granite': return getCachedTexture(key, () => makeGraniteTexture(app, color));
    case 'quartz': return getCachedTexture(key, () => makeQuartzTexture(app, color));
    case 'laminate': return getCachedTexture(key, () => makeLaminateTexture(app, color));
    default: return getCachedTexture(key, () => makeGraniteTexture(app, color));
  }
}

export function getCabinetTexture(app, material, color) {
  const key = `cab_${material}_${color}`;
  switch (material) {
    case 'wood_grain': return getCachedTexture(key, () => makeWoodTexture(app, color));
    case 'wood_walnut': return getCachedTexture(key, () => makeWoodTexture(app, color || '#3d1f0a'));
    case 'concrete': return getCachedTexture(key, () => makeConcreteTexture(app, color));
    case 'matte': return null;
    case 'glossy': return null;
    case 'ultra_gloss': return null;
    default: return null;
  }
}

export function makeHexFloorTexture(app, tileColor = '#d4cfc8', groutColor = '#908880') {
  return makeHexTileTexture(app, tileColor, groutColor);
}

export function makeMarbleFloorTexture(app, baseColor = '#e8e4de') {
  return makeMarbleTexture(app, baseColor);
}

export function makeHerringboneTexture(app, tileColor = '#c8b89a', groutColor = '#8a7a68') {
  const { canvas, ctx } = makeCanvas();
  const GROUT = 6;
  const TW = 80; // tile width
  const TH = 160; // tile height (2:1 ratio)
  
  const grout = hexToRgb(groutColor);
  const tile = hexToRgb(tileColor);
  
  ctx.fillStyle = `rgb(${grout.r},${grout.g},${grout.b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  
  ctx.fillStyle = `rgb(${tile.r},${tile.g},${tile.b})`;
  
  for (let row = -2; row * TH < SIZE + TH * 2; row++) {
    for (let col = -2; col * TW < SIZE + TW * 2; col++) {
      const x = col * TW * 2;
      const y = row * TH;
      
      // Horizontal tile
      ctx.save();
      ctx.translate(x + TW * 0.5, y + TH * 0.5);
      ctx.fillRect(-TW/2 + GROUT, -TH/4 + GROUT, TW - GROUT*2, TH/2 - GROUT*2);
      ctx.restore();
      
      // Vertical tile (rotated)
      ctx.save();
      ctx.translate(x + TW * 1.5, y + TH * 0.5);
      ctx.fillRect(-TH/4 + GROUT, -TW/2 + GROUT, TH/2 - GROUT*2, TW - GROUT*2);
      ctx.restore();
    }
  }
  
  return wrapCanvas(app, canvas);
}

export function makeHardwoodFloorTexture(app, baseColor = '#c8a878') {
  const { canvas, ctx } = makeCanvas();
  const base = hexToRgb(baseColor);
  const dark = { r: Math.max(0, base.r - 50), g: Math.max(0, base.g - 40), b: Math.max(0, base.b - 20) };
  const light = { r: Math.min(255, base.r + 30), g: Math.min(255, base.g + 25), b: Math.min(255, base.b + 15) };
  
  const PLANK_H = 100; // plank height
  const GROUT = 3;
  
  const img = ctx.createImageData(SIZE, SIZE);
  
  for (let y = 0; y < SIZE; y++) {
    const plankRow = Math.floor(y / PLANK_H);
    const isGroutY = (y % PLANK_H) < GROUT;
    
    for (let x = 0; x < SIZE; x++) {
      const nx = (x + plankRow * 73) / SIZE;
      const ny = y / SIZE;
      
      const ring = Math.sin((ny * 20 + fbm(nx * 2, ny * 2, 4, plankRow + 1) * 3) * Math.PI) * 0.5 + 0.5;
      const grain = fbm(nx * 60, ny * 8, 3, plankRow * 7 + 3) * 0.15;
      const t = ring * 0.7 + grain;
      
      const c = isGroutY ? dark : lerpColor(dark, light, Math.min(1, Math.max(0, t)));
      const i = (y * SIZE + x) * 4;
      img.data[i] = c.r;
      img.data[i+1] = c.g;
      img.data[i+2] = c.b;
      img.data[i+3] = 255;
    }
  }
  
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}
