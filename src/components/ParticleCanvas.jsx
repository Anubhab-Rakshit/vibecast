import React, { useRef, useEffect } from 'react';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    // Particle factory
    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    });

    const COUNT = 90;
    const particles = Array.from({ length: COUNT }, createParticle);
    const CONNECTION_DIST = 130;
    const MOUSE_DIST = 120;
    const MOUSE_PUSH = 0.015;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Subtle mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST) {
          const force = (1 - dist / MOUSE_DIST) * MOUSE_PUSH;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // Drag (velocity dampening)
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Draw node
        const glow = dist < MOUSE_DIST ? (1 - dist / MOUSE_DIST) : 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + glow * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 204, ${p.opacity + glow * 0.4})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const cdx = p.x - q.x;
          const cdy = p.y - q.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < CONNECTION_DIST) {
            const alpha = (1 - cdist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(74, 222, 204, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse-to-node connections
        if (dist < MOUSE_DIST * 1.5) {
          const alpha = (1 - dist / (MOUSE_DIST * 1.5)) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(74, 222, 204, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
};

export default ParticleCanvas;
