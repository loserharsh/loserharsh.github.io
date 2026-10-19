/**
 * ==========================================================================
 * DOT FIELD — HALFTONE MEMBRANE SHOCKWAVE & WAKE SIMULATION
 * ==========================================================================
 * Adapted from KokonutUI (@dorianbaffier)
 * A dynamic halftone membrane. Swiping pushes the dots with a lateral V-wake,
 * and clicking sends a physical shockwave ring through the spring lattice.
 * ==========================================================================
 */

(function () {
  'use strict';

  // Width of a light or dark patch in the idle halftone, in px.
  const NOISE_SCALE = 240;
  // How fast the halftone pattern drifts through time.
  const NOISE_SPEED = 0.07;
  // The noise is sampled on every third dot and blended in between.
  const TONE_STEP = 3;
  // The idle drift is slow; a frame every 33ms is plenty for it.
  const IDLE_FRAME_MS = 33;
  // The membrane spring physics constants.
  const ANCHOR = 26;
  const COUPLING = 340;
  const DAMPING = 2.4;
  // Physics runs in fixed steps so the springs behave the same at any refresh rate.
  const STEP = 1 / 120;
  // Pointer swipe properties
  const POINTER_RADIUS = 72;
  const POINTER_GAIN = 14;
  const POINTER_MAX_SPEED = 2600;
  const POINTER_PART = 0.45;
  // Click shockwave properties
  const SHOCK_SPEED = 620;
  const SHOCK_WIDTH = 34;
  const SHOCK_FORCE = 5200;
  const SHOCK_LIFE = 1.3;
  // Compression & quantization
  const COMPRESSION_GAIN = 3;
  const BUCKETS = 10;
  // Rest thresholds
  const REST_SPEED = 2;
  const REST_OFFSET = 0.15;

  /** Seeded 3D gradient noise (Ken Perlin's improved noise), about -1 to 1. */
  function createNoise(seed) {
    const p = Array.from({ length: 256 }, (_, i) => i);
    let state = (seed >>> 0) || 1;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
    }
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + (b - a) * t;
    const grad = (hash, x, y, z) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      let v = z;
      if (h < 4) {
        v = y;
      } else if (h === 12 || h === 14) {
        v = x;
      }
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    return (x, y, z) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      const fx = x - Math.floor(x);
      const fy = y - Math.floor(y);
      const fz = z - Math.floor(z);
      const u = fade(fx);
      const v = fade(fy);
      const w = fade(fz);
      const A = perm[X] + Y;
      const AA = perm[A] + Z;
      const AB = perm[A + 1] + Z;
      const B = perm[X + 1] + Y;
      const BA = perm[B] + Z;
      const BB = perm[B + 1] + Z;
      return lerp(
        lerp(
          lerp(grad(perm[AA], fx, fy, fz), grad(perm[BA], fx - 1, fy, fz), u),
          lerp(grad(perm[AB], fx, fy - 1, fz), grad(perm[BB], fx - 1, fy - 1, fz), u),
          v
        ),
        lerp(
          lerp(grad(perm[AA + 1], fx, fy, fz - 1), grad(perm[BA + 1], fx - 1, fy, fz - 1), u),
          lerp(grad(perm[AB + 1], fx, fy - 1, fz - 1), grad(perm[BB + 1], fx - 1, fy - 1, fz - 1), u),
          v
        ),
        w
      );
    };
  }

  /** Create grid of dots and flat buffers for springs. */
  function createField(width, height, spacing) {
    const cols = Math.ceil(width / spacing) + 3;
    const rows = Math.ceil(height / spacing) + 3;
    const size = cols * rows;
    const coarseCols = Math.ceil((cols - 1) / TONE_STEP) + 1;
    const coarseRows = Math.ceil((rows - 1) / TONE_STEP) + 1;
    return {
      cols,
      rows,
      spacing,
      originX: (width - (cols - 1) * spacing) / 2,
      originY: (height - (rows - 1) * spacing) / 2,
      tone: new Float32Array(size),
      coarse: new Float32Array(coarseCols * coarseRows),
      ox: new Float32Array(size),
      oy: new Float32Array(size),
      vx: new Float32Array(size),
      vy: new Float32Array(size),
      ax: new Float32Array(size),
      ay: new Float32Array(size),
    };
  }

  /** Sample noise for idle halftone pattern. */
  function sampleTone(field, noise, time) {
    const { cols, rows, spacing, originX, originY, tone, coarse } = field;
    const z = time * NOISE_SPEED;
    const step = spacing * TONE_STEP;
    const coarseCols = Math.ceil((cols - 1) / TONE_STEP) + 1;
    const coarseRows = Math.ceil((rows - 1) / TONE_STEP) + 1;
    for (let j = 0; j < coarseRows; j++) {
      const ny = (originY + j * step) / NOISE_SCALE;
      for (let i = 0; i < coarseCols; i++) {
        const nx = (originX + i * step) / NOISE_SCALE;
        const n =
          noise(nx, ny, z) * 0.75 +
          noise(nx * 2.1 + 9.3, ny * 2.1 + 3.7, z * 1.3) * 0.25;
        coarse[j * coarseCols + i] = Math.min(1, Math.max(0, 0.5 + n * 1.1));
      }
    }
    for (let j = 0; j < rows; j++) {
      const cj = Math.min(Math.floor(j / TONE_STEP), coarseRows - 2);
      const fy = j / TONE_STEP - cj;
      for (let i = 0; i < cols; i++) {
        const ci = Math.min(Math.floor(i / TONE_STEP), coarseCols - 2);
        const fx = i / TONE_STEP - ci;
        const a = cj * coarseCols + ci;
        const top = coarse[a] + (coarse[a + 1] - coarse[a]) * fx;
        const bottom =
          coarse[a + coarseCols] +
          (coarse[a + coarseCols + 1] - coarse[a + coarseCols]) * fx;
        tone[j * cols + i] = top + (bottom - top) * fy;
      }
    }
  }

  /** Sum of 4 neighbours in lattice. */
  function neighbours(values, field, i, j) {
    const { cols, rows } = field;
    const k = j * cols + i;
    let sum = 0;
    if (i > 0) sum += values[k - 1];
    if (i < cols - 1) sum += values[k + 1];
    if (j > 0) sum += values[k - cols];
    if (j < rows - 1) sum += values[k + cols];
    return sum;
  }

  /** Spring force on every dot. */
  function accelerate(field) {
    const { cols, rows, ox, oy, vx, vy, ax, ay } = field;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const sx = neighbours(ox, field, i, j);
        const sy = neighbours(oy, field, i, j);
        ax[k] += -ANCHOR * ox[k] + COUPLING * (sx - 4 * ox[k]) - DAMPING * vx[k];
        ay[k] += -ANCHOR * oy[k] + COUPLING * (sy - 4 * oy[k]) - DAMPING * vy[k];
      }
    }
  }

  /** Expanding shockwave rings from clicks. */
  function applyShocks(field, shocks) {
    const { cols, rows, spacing, originX, originY, ax, ay } = field;
    for (const shock of shocks) {
      const reach = shock.age * SHOCK_SPEED;
      const fade = 1 - shock.age / SHOCK_LIFE;
      const force = SHOCK_FORCE * fade * fade;
      const outer = reach + SHOCK_WIDTH;
      const inner = Math.max(0, reach - SHOCK_WIDTH);

      const i0 = Math.max(0, Math.floor((shock.x - outer - originX) / spacing));
      const i1 = Math.min(cols - 1, Math.ceil((shock.x + outer - originX) / spacing));
      const j0 = Math.max(0, Math.floor((shock.y - outer - originY) / spacing));
      const j1 = Math.min(rows - 1, Math.ceil((shock.y + outer - originY) / spacing));

      for (let j = j0; j <= j1; j++) {
        const dy = originY + j * spacing - shock.y;
        for (let i = i0; i <= i1; i++) {
          const dx = originX + i * spacing - shock.x;
          const dist = Math.hypot(dx, dy);
          if (dist < inner || dist > outer || dist === 0) continue;
          const band = 1 - Math.abs(dist - reach) / SHOCK_WIDTH;
          const k = j * cols + i;
          ax[k] += (dx / dist) * force * band;
          ay[k] += (dy / dist) * force * band;
        }
      }
    }
  }

  /** Velocity transfer from pointer swipe. */
  function applyPointer(field, pointer, dt) {
    const segX = pointer.x - pointer.lastX;
    const segY = pointer.y - pointer.lastY;
    pointer.lastX = pointer.x;
    pointer.lastY = pointer.y;
    const length = Math.hypot(segX, segY);
    if (!pointer.inside || length < 0.5 || dt <= 0) return false;

    const speed = Math.min(length / dt, POINTER_MAX_SPEED);
    const pvx = (segX / length) * speed;
    const pvy = (segY / length) * speed;
    const { cols, rows, spacing, originX, originY, vx, vy } = field;
    const startX = pointer.x - segX;
    const startY = pointer.y - segY;
    const minX = Math.min(startX, pointer.x) - POINTER_RADIUS;
    const maxX = Math.max(startX, pointer.x) + POINTER_RADIUS;
    const minY = Math.min(startY, pointer.y) - POINTER_RADIUS;
    const maxY = Math.max(startY, pointer.y) + POINTER_RADIUS;
    const i0 = Math.max(0, Math.floor((minX - originX) / spacing));
    const i1 = Math.min(cols - 1, Math.ceil((maxX - originX) / spacing));
    const j0 = Math.max(0, Math.floor((minY - originY) / spacing));
    const j1 = Math.min(rows - 1, Math.ceil((maxY - originY) / spacing));
    const lengthSq = length * length;
    const gain = Math.min(1, POINTER_GAIN * dt);

    for (let j = j0; j <= j1; j++) {
      const py = originY + j * spacing;
      for (let i = i0; i <= i1; i++) {
        const px = originX + i * spacing;
        const t = Math.min(1, Math.max(0, ((px - startX) * segX + (py - startY) * segY) / lengthSq));
        const awayX = px - startX - segX * t;
        const awayY = py - startY - segY * t;
        const dist = Math.hypot(awayX, awayY);
        if (dist >= POINTER_RADIUS) continue;

        const falloff = 1 - dist / POINTER_RADIUS;
        const k = j * cols + i;
        const amount = gain * falloff * falloff;
        const side = dist > 0 ? (speed * POINTER_PART) / dist : 0;
        vx[k] += (pvx + awayX * side - vx[k]) * amount;
        vy[k] += (pvy + awayY * side - vy[k]) * amount;
      }
    }
    return true;
  }

  /** Physics step. */
  function integrate(field, shocks, h) {
    const { ox, oy, vx, vy, ax, ay } = field;
    ax.fill(0);
    ay.fill(0);
    applyShocks(field, shocks);
    accelerate(field);
    let moving = false;
    for (let k = 0; k < ox.length; k++) {
      vx[k] += ax[k] * h;
      vy[k] += ay[k] * h;
      ox[k] += vx[k] * h;
      oy[k] += vy[k] * h;
      if (
        !moving &&
        (Math.abs(vx[k]) > REST_SPEED ||
          Math.abs(vy[k]) > REST_SPEED ||
          Math.abs(ox[k]) > REST_OFFSET ||
          Math.abs(oy[k]) > REST_OFFSET)
      ) {
        moving = true;
      }
    }
    return moving;
  }

  /** Compression calculation. */
  function compression(field, i, j) {
    const { cols, rows, spacing, ox, oy } = field;
    const k = j * cols + i;
    const left = i > 0 ? ox[k - 1] : 0;
    const right = i < cols - 1 ? ox[k + 1] : 0;
    const up = j > 0 ? oy[k - cols] : 0;
    const down = j < rows - 1 ? oy[k + cols] : 0;
    return -(right - left + down - up) / (2 * spacing);
  }

  /** Draw dots to canvas. */
  function draw(ctx, field, size, moving) {
    const { cols, rows, spacing, originX, originY, tone, ox, oy } = field;
    const maxRadius = spacing * 0.42;
    const paths = Array.from({ length: BUCKETS }, () => new Path2D());
    const filled = new Uint8Array(BUCKETS);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        let amount = 0.12 + 0.6 * tone[k];
        if (moving) {
          amount *= 1 + COMPRESSION_GAIN * compression(field, i, j);
        }
        const bucket = Math.round(Math.min(1, Math.max(0, amount)) * (BUCKETS - 1));
        if (bucket === 0) continue;

        const radius = (maxRadius * bucket) / (BUCKETS - 1);
        const x = originX + i * spacing + ox[k];
        const y = originY + j * spacing + oy[k];
        const path = paths[bucket];
        path.moveTo(x + radius, y);
        path.arc(x, y, radius, 0, Math.PI * 2);
        filled[bucket] = 1;
      }
    }

    ctx.clearRect(0, 0, size.width, size.height);
    ctx.fillStyle = size.color || '#FFFFFF';
    for (let b = 1; b < BUCKETS; b++) {
      if (filled[b]) {
        ctx.globalAlpha = 0.18 + (0.34 * b) / (BUCKETS - 1);
        ctx.fill(paths[b]);
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Main initializer for DotField
   */
  function initDotField() {
    const canvas = document.getElementById('siteDotFieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spacing = 18; // Elegant spacing for clean manga aesthetic
    const seed = 7;
    const noise = createNoise(seed);
    const size = { width: 0, height: 0, color: '#FFFFFF' };
    let field = createField(0, 0, spacing);

    const pointer = {
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      inside: false,
    };
    const shocks = [];
    let time = 0;
    let last = 0;
    let lastTone = 0;
    let carry = 0;
    let stirring = false;
    let awake = false;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.width = window.innerWidth;
      size.height = window.innerHeight;
      canvas.width = Math.round(size.width * dpr);
      canvas.height = Math.round(size.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.color = '#FFFFFF';
      field = createField(size.width, size.height, spacing);
      sampleTone(field, noise, time);
      awake = false;
    };

    const physics = (dt) => {
      const pushed = applyPointer(field, pointer, dt);
      carry = Math.min(carry + dt, STEP * 6);
      while (carry >= STEP) {
        carry -= STEP;
        for (const shock of shocks) {
          shock.age += STEP;
        }
        while (shocks.length > 0 && shocks[0].age > SHOCK_LIFE) {
          shocks.shift();
        }
        stirring = integrate(field, shocks, STEP);
      }
      if (!(pushed || stirring || shocks.length > 0)) {
        field.ox.fill(0);
        field.oy.fill(0);
        field.vx.fill(0);
        field.vy.fill(0);
        awake = false;
      }
    };

    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += dt;
      const wasAwake = awake;
      if (awake) {
        physics(dt);
      }
      const toneDue = now - lastTone >= IDLE_FRAME_MS;
      if (toneDue) {
        sampleTone(field, noise, time);
        lastTone = now;
      }
      if (wasAwake || toneDue) {
        draw(ctx, field, size, wasAwake);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf && visible && !reduceMotion) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!awake) {
        awake = true;
        carry = 0;
        stirring = true;
      }
      start();
    };

    resize();
    draw(ctx, field, size, false);
    canvas.style.opacity = '1';
    start();

    window.addEventListener('resize', () => {
      resize();
      draw(ctx, field, size, false);
    }, { passive: true });

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    });

    // Check if pointer is over the excluded projects showcase section
    function isOverExcludedSection(target) {
      if (!target) return false;
      return !!target.closest('#projects, .projects-showcase-section');
    }

    // Pointer events on window
    const onMove = (event) => {
      if (isOverExcludedSection(event.target)) {
        pointer.inside = false;
        return;
      }
      const clientX = event.clientX;
      const clientY = event.clientY;
      if (!pointer.inside) {
        pointer.lastX = clientX;
        pointer.lastY = clientY;
        pointer.inside = true;
      }
      pointer.x = clientX;
      pointer.y = clientY;
      if (Math.abs(pointer.x - pointer.lastX) > 0.5 || Math.abs(pointer.y - pointer.lastY) > 0.5) {
        wake();
      }
    };

    const onLeave = () => {
      pointer.inside = false;
    };

    const onDown = (event) => {
      if (event.button !== 0) return;
      if (isOverExcludedSection(event.target)) return;
      if (event.target.closest("a, button, input, textarea, select, label, [role='button'], .showcase-card, .spotify-control-btn, .vinyl-upload-btn, .nav-keychain-wrap")) {
        return;
      }
      const clientX = event.clientX;
      const clientY = event.clientY;
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.lastX = clientX;
      pointer.lastY = clientY;
      pointer.inside = true;
      shocks.push({ x: clientX, y: clientY, age: 0 });
      if (shocks.length > 3) {
        shocks.shift();
      }
      wake();
    };

    if (!reduceMotion) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDotField);
  } else {
    initDotField();
  }
})();
