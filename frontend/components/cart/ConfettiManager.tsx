'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'diamond';
  life: number;
  maxLife: number;
}

const COLORS = [
  '#c9a84c', '#e8d49a', '#5a6b2e', '#9cac5e',
  '#c4cc9a', '#e8a090', '#f4c1c0', '#b8b8b8',
  '#d4af37', '#7a8e3c',
];

// ─── Confetti Canvas ──────────────────────────────────────────────────────────
function ConfettiCanvas({ originX, originY, onDone }: {
  originX: number;
  originY: number;
  onDone: () => void;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const particles  = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    // Spawn particles
    const COUNT = 72;
    particles.current = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      return {
        x:             originX,
        y:             originY,
        vx:            Math.cos(angle) * speed,
        vy:            Math.sin(angle) * speed - (3 + Math.random() * 4),
        color:         COLORS[Math.floor(Math.random() * COLORS.length)],
        size:          5 + Math.random() * 7,
        rotation:      Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape:         (['rect', 'circle', 'diamond'] as const)[Math.floor(Math.random() * 3)],
        life:          0,
        maxLife:       50 + Math.floor(Math.random() * 30),
      };
    });

    let alive = true;

    function draw() {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      let stillGoing = false;

      for (const p of particles.current) {
        p.life++;
        if (p.life > p.maxLife) continue;
        stillGoing = true;

        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.28;                        // gravity
        p.vx *= 0.985;                       // drag
        p.rotation += p.rotationSpeed;

        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = p.color;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, 0);
          ctx.lineTo(0, p.size / 2);
          ctx.lineTo(-p.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        }

        ctx.restore();
      }

      ctx.globalAlpha = 1;

      if (stillGoing) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [originX, originY, onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

// ─── Manager: attach to window so any component can trigger it ────────────────
type FireFn = (x: number, y: number) => void;
const listeners = new Set<FireFn>();

export function fireConfetti(btnEl?: HTMLElement | null) {
  let x = window.innerWidth  / 2;
  let y = window.innerHeight / 3;
  if (btnEl) {
    const r = btnEl.getBoundingClientRect();
    x = r.left + r.width  / 2;
    y = r.top  + r.height / 2;
  }
  listeners.forEach(fn => fn(x, y));
}

// ─── Portal component — mount once in layout ─────────────────────────────────
interface Burst { id: number; x: number; y: number; }

export function ConfettiManager() {
  const [bursts, setBursts] = useStateRef<Burst[]>([]);

  useEffect(() => {
    const fire: FireFn = (x, y) => {
      const id = Date.now() + Math.random();
      setBursts(b => [...b, { id, x, y }]);
    };
    listeners.add(fire);
    return () => { listeners.delete(fire); };
  }, [setBursts]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {bursts.map(b => (
        <ConfettiCanvas
          key={b.id}
          originX={b.x}
          originY={b.y}
          onDone={() => setBursts(prev => prev.filter(p => p.id !== b.id))}
        />
      ))}
    </>,
    document.body,
  );
}

// tiny helper — useState with ref so the effect closure stays fresh
function useStateRef<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { useState } = require('react');
  return useState<T>(initial);
}