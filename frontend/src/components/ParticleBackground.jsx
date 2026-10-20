import { useEffect, useRef } from 'react';

/**
 * Full-screen canvas of tiny drifting particles.
 * - scales particle count with screen area (capped, so it stays light on phones)
 * - particles twinkle and gently drift away from the cursor
 * - renders a single still frame when the user prefers reduced motion
 * - cleans up its listeners + animation frame on unmount
 */
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let frame = 0;
    const pointer = { x: -9999, y: -9999 };

    const makeParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() < 0.08 ? Math.random() * 1.2 + 1.3 : Math.random() * 1.1 + 0.3, // mostly dust, a few brighter motes
      tint: Math.random() < 0.28,                   // ~28% pick up the cobalt accent
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18 - 0.03,     // very slight upward drift
      base: Math.random() * 0.65 + 0.2,            // base opacity
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.004,         // twinkle speed
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

const count = Math.min(320, Math.max(90, Math.floor((width * height) / 5500)));      particles = Array.from({ length: count }, makeParticle);
      if (reduceMotion) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const alpha = reduceMotion ? p.base : p.base * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.tint
          ? `rgba(138,152,255,${alpha.toFixed(3)})`
          : `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
    };

    const step = () => {
      for (const p of particles) {
        // gentle repulsion from the cursor
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 140 * 140 && dist2 > 0.01) {
          const dist = Math.sqrt(dist2);
          const force = (140 - dist) / 140;
          p.x += (dx / dist) * force * 1.4;
          p.y += (dy / dist) * force * 1.4;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.speed;

        // wrap around the edges
        if (p.x < -4) p.x = width + 4;
        else if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        else if (p.y > height + 4) p.y = -4;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduceMotion) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
      frame = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

export default ParticleBackground;
