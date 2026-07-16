// src/utils/environment.js
// Procedural HDR sky presets for PlayCanvas
import * as pc from 'playcanvas';

export const SKY_PRESETS = {
  day: {
    label: 'Moody Day',
    icon: '☀️',
    ambient: 0.18,
    ambientColor: '#2b303c',
    dirIntensity: 1.6,
    dirColor: '#e6edf3',
    dirRotation: [-50, 30, 0],
    fogColor: '#111622',
    fogNear: 12,
    fogFar: 30,
    pendantIntensity: 0.8,
    pendantColor: '#fff0d0',
    underCabinetIntensity: 0.6,
    bgColor: '#0d1117',
  },
  overcast: {
    label: 'Stormy',
    icon: '☁️',
    ambient: 0.12,
    ambientColor: '#1c202a',
    dirIntensity: 0.5,
    dirColor: '#8892a0',
    dirRotation: [-80, 0, 0],
    fogColor: '#0c0e14',
    fogNear: 8,
    fogFar: 22,
    pendantIntensity: 1.0,
    pendantColor: '#ffffff',
    underCabinetIntensity: 0.8,
    bgColor: '#08090d',
  },
  sunset: {
    label: 'Sunset',
    icon: '🌅',
    ambient: 0.08,
    ambientColor: '#ff5010',
    dirIntensity: 1.2,
    dirColor: '#ff6020',
    dirRotation: [-15, 80, 0],
    fogColor: '#160805',
    fogNear: 6,
    fogFar: 18,
    pendantIntensity: 2.2,
    pendantColor: '#ffa040',
    underCabinetIntensity: 1.5,
    bgColor: '#0a0402',
  },
  night: {
    label: 'Night',
    icon: '🌙',
    ambient: 0.03,
    ambientColor: '#0c101b',
    dirIntensity: 0.0,
    dirColor: '#ffffff',
    dirRotation: [-90, 0, 0],
    fogColor: '#05070c',
    fogNear: 4,
    fogFar: 14,
    pendantIntensity: 3.2,
    pendantColor: '#ffcc80',
    underCabinetIntensity: 2.0,
    bgColor: '#020305',
  },
  studio: {
    label: 'Dark Studio',
    icon: '💡',
    ambient: 0.10,
    ambientColor: '#1b1e26',
    dirIntensity: 1.8,
    dirColor: '#ffffff',
    dirRotation: [-65, 30, 0],
    fogColor: '#10121a',
    fogNear: 15,
    fogFar: 35,
    pendantIntensity: 1.2,
    pendantColor: '#ffffff',
    underCabinetIntensity: 0.8,
    bgColor: '#090a0d',
  },
  showroom: {
    label: 'Gold Gallery',
    icon: '🏗️',
    ambient: 0.14,
    ambientColor: '#26201b',
    dirIntensity: 1.5,
    dirColor: '#fbbf24',
    dirRotation: [-55, 20, 0],
    fogColor: '#120f0d',
    fogNear: 12,
    fogFar: 28,
    pendantIntensity: 1.5,
    pendantColor: '#ffe8b0',
    underCabinetIntensity: 1.0,
    bgColor: '#080605',
  },
};

// Helper function to convert Hex to pc.Color
function hexToColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new pc.Color(r, g, b, 1);
}

// Apply sky preset to PlayCanvas app
export function applySkyPreset(app, presetName, exposure = 1.1) {
  if (!app || !app.scene) return;
  const cfg = SKY_PRESETS[presetName] || SKY_PRESETS.day;

  // Tone mapping: ACESFilmic
  try {
    if (app.scene.toneMapping !== undefined) {
      app.scene.toneMapping = pc.TONEMAP_ACES; 
    }
    app.scene.exposure = exposure;
  } catch(e) { console.error('Failed to set tonemapping:', e); }

  // Ambient light
  try {
    const amb = hexToColor(cfg.ambientColor);
    app.scene.ambientLight = new pc.Color(
      amb.r * cfg.ambient,
      amb.g * cfg.ambient,
      amb.b * cfg.ambient,
      1
    );
  } catch(e) { /* ignore */ }

  // Background/clear color
  try {
    const fogColor = hexToColor(cfg.fogColor);
    app.scene.fog.type = 'linear';
    app.scene.fog.color = fogColor;
    app.scene.fog.start = cfg.fogNear;
    app.scene.fog.end = cfg.fogFar;
    app.scene.clearColor = fogColor;
  } catch(e) { /* ignore */ }
}
