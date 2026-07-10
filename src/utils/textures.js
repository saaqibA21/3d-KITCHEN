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
  const base = hexToRgb(baseColor);
  const dark = { r: Math.max(0, base.r - 60), g: Math.max(0, base.g - 50), b: Math.max(0, base.b - 30) };
  const light = { r: Math.min(255, base.r + 40), g: Math.min(255, base.g + 30), b: Math.min(255, base.b + 20) };
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const ny = y / SIZE;
      // Ring pattern
      const ring = Math.sin((ny * 18 + fbm(nx * 2, ny * 2, 5, 3) * 3) * Math.PI) * 0.5 + 0.5;
      // Fine grain
      const grain = fbm(nx * 40, ny * 5, 3, 7) * 0.18;
      const t = ring * 0.75 + grain;
      const c = lerpColor(dark, light, Math.min(1, Math.max(0, t)));
      const i = (y * SIZE + x) * 4;
      img.data[i] = c.r;
      img.data[i + 1] = c.g;
      img.data[i + 2] = c.b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}

// ─── Marble Texture ────────────────────────────────────────────────────────
export function makeMarbleTexture(app, baseColor = '#e8e4de') {
  const { canvas, ctx } = makeCanvas();
  const base = hexToRgb(baseColor);
  const vein = { r: Math.max(0, base.r - 110), g: Math.max(0, base.g - 100), b: Math.max(0, base.b - 80) };
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const ny = y / SIZE;
      // Flowing marble veins
      const turbulence = fbm(nx * 3, ny * 3, 6, 2);
      const pattern = Math.abs(Math.sin((nx * 6 + turbulence * 4) * Math.PI));
      const t = Math.pow(pattern, 3.5);
      const c = lerpColor(base, vein, Math.min(1, t));
      // Add subtle glimmer
      const glimmer = fbm(nx * 80, ny * 80, 2, 5) > 0.78 ? 15 : 0;
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.min(255, c.r + glimmer);
      img.data[i + 1] = Math.min(255, c.g + glimmer);
      img.data[i + 2] = Math.min(255, c.b + glimmer);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}

// ─── Granite Texture ───────────────────────────────────────────────────────
export function makeGraniteTexture(app, baseColor = '#6a6a6a') {
  const { canvas, ctx } = makeCanvas();
  const base = hexToRgb(baseColor);
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const ny = y / SIZE;
      // Mineral speckle
      const n1 = fbm(nx * 25, ny * 25, 4, 1);
      const n2 = fbm(nx * 60, ny * 60, 3, 9);
      const speckle = n1 * 0.6 + n2 * 0.4;
      const offset = (speckle - 0.5) * 90;
      // Occasional sparkle crystal
      const sparkle = fbm(nx * 200, ny * 200, 1, 13) > 0.88 ? 60 : 0;
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.min(255, Math.max(0, base.r + offset + sparkle));
      img.data[i + 1] = Math.min(255, Math.max(0, base.g + offset * 0.8 + sparkle));
      img.data[i + 2] = Math.min(255, Math.max(0, base.b + offset * 0.6 + sparkle));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}

// ─── Quartz Texture ────────────────────────────────────────────────────────
export function makeQuartzTexture(app, baseColor = '#c4b89a') {
  const { canvas, ctx } = makeCanvas();
  const base = hexToRgb(baseColor);
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const ny = y / SIZE;
      const n = fbm(nx * 15, ny * 15, 5, 4);
      const offset = (n - 0.5) * 40;
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.min(255, Math.max(0, base.r + offset));
      img.data[i + 1] = Math.min(255, Math.max(0, base.g + offset));
      img.data[i + 2] = Math.min(255, Math.max(0, base.b + offset));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}

// ─── Laminate Texture ──────────────────────────────────────────────────────
export function makeLaminateTexture(app, baseColor = '#9a7a5a') {
  const { canvas, ctx } = makeCanvas();
  const base = hexToRgb(baseColor);
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const ny = y / SIZE;
      const grain = fbm(nx * 80, ny * 8, 2, 2) * 20 - 10;
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.min(255, Math.max(0, base.r + grain));
      img.data[i + 1] = Math.min(255, Math.max(0, base.g + grain));
      img.data[i + 2] = Math.min(255, Math.max(0, base.b + grain));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}

// ─── Concrete Texture ──────────────────────────────────────────────────────
export function makeConcreteTexture(app, baseColor = '#8a8a8a') {
  const { canvas, ctx } = makeCanvas();
  const base = hexToRgb(baseColor);
  const img = ctx.createImageData(SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const ny = y / SIZE;
      const n = fbm(nx * 8, ny * 8, 6, 3);
      const offset = (n - 0.5) * 50;
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.min(255, Math.max(0, base.r + offset));
      img.data[i + 1] = Math.min(255, Math.max(0, base.g + offset));
      img.data[i + 2] = Math.min(255, Math.max(0, base.b + offset));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return wrapCanvas(app, canvas);
}

// ─── Floor Tile Texture ────────────────────────────────────────────────────
export function makeFloorTileTexture(app, tileColor = '#c8b89a', groutColor = '#7a7068') {
  const { canvas, ctx } = makeCanvas();
  const grout = hexToRgb(groutColor);
  const tile = hexToRgb(tileColor);

  const GROUT = 8; // grout width in px
  const TILE = 120; // tile size in px

  const img = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const tx = x % TILE;
      const ty = y % TILE;
      const isGrout = tx < GROUT || ty < GROUT;
      const nx = x / SIZE;
      const ny = y / SIZE;
      const variation = fbm(nx * 5, ny * 5, 3, x % 7 + 1) * 20 - 10;
      const c = isGrout ? grout : tile;
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.min(255, Math.max(0, c.r + (isGrout ? 0 : variation)));
      img.data[i + 1] = Math.min(255, Math.max(0, c.g + (isGrout ? 0 : variation)));
      img.data[i + 2] = Math.min(255, Math.max(0, c.b + (isGrout ? 0 : variation)));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
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
    case 'concrete': return getCachedTexture(key, () => makeConcreteTexture(app, color));
    case 'matte': return null;
    case 'glossy': return null;
    default: return null;
  }
}
