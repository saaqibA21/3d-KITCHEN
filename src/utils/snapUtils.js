// ─── Snap-to-Wall and Overlap Prevention Utilities ───────────────────────────

const SNAP_DISTANCE = 0.15; // meters — snap when within 15cm of wall

/**
 * Snap a module position to room walls if close enough.
 * Returns { position, snapped, snapAxis }
 */
export function snapToWalls(position, mod, roomConfig) {
  let [x, y] = position;
  let snapped = false;
  let snapAxis = null;

  const roomW = roomConfig.width;
  const roomD = roomConfig.depth;

  // Left wall snap (x = 0)
  if (x < SNAP_DISTANCE) { x = 0; snapped = true; snapAxis = 'left'; }
  // Right wall snap (x = roomW - modWidth)
  else if (x + mod.width > roomW - SNAP_DISTANCE) { x = roomW - mod.width; snapped = true; snapAxis = 'right'; }

  // Top wall snap (y = 0)
  if (y < SNAP_DISTANCE) { y = 0; snapped = true; snapAxis = snapAxis || 'top'; }
  // Bottom wall snap (y = roomD - modDepth)
  else if (y + mod.depth > roomD - SNAP_DISTANCE) { y = roomD - mod.depth; snapped = true; snapAxis = snapAxis || 'bottom'; }

  // Clamp within room
  x = Math.max(0, Math.min(roomW - mod.width, x));
  y = Math.max(0, Math.min(roomD - mod.depth, y));

  return { position: [x, y], snapped, snapAxis };
}

/**
 * Check if two modules overlap (AABB collision).
 */
export function modulesOverlap(a, b) {
  const ax1 = a.position[0], ax2 = ax1 + a.width;
  const ay1 = a.position[1], ay2 = ay1 + a.depth;
  const bx1 = b.position[0], bx2 = bx1 + b.width;
  const by1 = b.position[1], by2 = by1 + b.depth;
  const GAP = 0.02;
  return !(ax2 + GAP <= bx1 || bx2 + GAP <= ax1 || ay2 + GAP <= by1 || by2 + GAP <= ay1);
}

/**
 * Find best non-overlapping position for a module.
 */
export function resolveOverlap(position, mod, modules, roomConfig) {
  const STEP = 0.05;
  let [x, y] = position;
  const others = modules.filter(m => m.id !== mod.id);

  const candidate = { ...mod, position: [x, y] };
  const hasOverlap = others.some(o => modulesOverlap(candidate, o));
  if (!hasOverlap) return [x, y];

  // Try nudging in 8 directions
  for (let dist = STEP; dist < 2; dist += STEP) {
    for (const [dx, dy] of [[dist,0],[-dist,0],[0,dist],[0,-dist],[dist,dist],[-dist,dist],[dist,-dist],[-dist,-dist]]) {
      const nx = Math.max(0, Math.min(roomConfig.width - mod.width, x + dx));
      const ny = Math.max(0, Math.min(roomConfig.depth - mod.depth, y + dy));
      const c = { ...mod, position: [nx, ny] };
      if (!others.some(o => modulesOverlap(c, o))) return [nx, ny];
    }
  }
  return [x, y];
}
