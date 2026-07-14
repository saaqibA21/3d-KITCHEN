// src/utils/environment.js
// Procedural HDR sky presets for PlayCanvas
import * as pc from 'playcanvas';

export const SKY_PRESETS = {
  day: {
    label: 'Clear Day',
    icon: '☀️',
    ambient: 0.55,
    ambientColor: '#e8f4ff',
    dirIntensity: 1.5,
    dirColor: '#fff8f0',
    dirRotation: [-50, 30, 0],
    fogColor: '#c8dff0',
    fogNear: 10,
    fogFar: 28,
    pendantIntensity: 0.5,
    pendantColor: '#fff0d0',
    underCabinetIntensity: 0.3,
    bgColor: '#87ceeb',
  },
  overcast: {
    label: 'Overcast',
    icon: '☁️',
    ambient: 0.75,
    ambientColor: '#e0e8f0',
    dirIntensity: 0.3,
    dirColor: '#d8e8f0',
    dirRotation: [-80, 0, 0],
    fogColor: '#b0c0d0',
    fogNear: 6,
    fogFar: 18,
    pendantIntensity: 0.6,
    pendantColor: '#ffffff',
    underCabinetIntensity: 0.4,
    bgColor: '#b0c0d4',
  },
  sunset: {
    label: 'Sunset',
    icon: '🌅',
    ambient: 0.25,
    ambientColor: '#ff8840',
    dirIntensity: 0.8,
    dirColor: '#ff6020',
    dirRotation: [-15, 80, 0],
    fogColor: '#3a1808',
    fogNear: 5,
    fogFar: 14,
    pendantIntensity: 1.4,
    pendantColor: '#ffa040',
    underCabinetIntensity: 0.9,
    bgColor: '#ff6633',
  },
  night: {
    label: 'Night',
    icon: '🌙',
    ambient: 0.04,
    ambientColor: '#101828',
    dirIntensity: 0.0,
    dirColor: '#ffffff',
    dirRotation: [-90, 0, 0],
    fogColor: '#080c14',
    fogNear: 3,
    fogFar: 10,
    pendantIntensity: 2.8,
    pendantColor: '#ffcc80',
    underCabinetIntensity: 1.6,
    bgColor: '#0a0c1a',
  },
  studio: {
    label: 'Studio',
    icon: '💡',
    ambient: 0.8,
    ambientColor: '#f8f8ff',
    dirIntensity: 1.0,
    dirColor: '#ffffff',
    dirRotation: [-60, 0, 0],
    fogColor: '#e0e8f0',
    fogNear: 12,
    fogFar: 30,
    pendantIntensity: 0.8,
    pendantColor: '#ffffff',
    underCabinetIntensity: 0.5,
    bgColor: '#d0d8e4',
  },
  showroom: {
    label: 'Showroom',
    icon: '🏗️',
    ambient: 0.65,
    ambientColor: '#fdf8f0',
    dirIntensity: 1.2,
    dirColor: '#fffde8',
    dirRotation: [-55, 20, 0],
    fogColor: '#f0e8d8',
    fogNear: 10,
    fogFar: 25,
    pendantIntensity: 0.9,
    pendantColor: '#ffe8b0',
    underCabinetIntensity: 0.6,
    bgColor: '#ede0cc',
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
