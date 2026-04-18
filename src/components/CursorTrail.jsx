import React, { useEffect, useRef } from 'react';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const CursorTrail = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let dots = [];
    const MAX_DOTS = 14;
    let mouse = { x: -100, y: -100 };
    
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dots.push({ x: mouse.x, y: mouse.y, age: 0 });
      if (dots.length > MAX_DOTS) dots.shift();
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        dot.age += 1;
        const alpha = Math.max(0, 1 - dot.age / 20);
        ctx.beginPath();
        // Offset by 10 to match the crosshair center of cursor.svg
        ctx.arc(dot.x + 10, dot.y + 10, 2 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 204, ${alpha})`;
        ctx.fill();
      }
      
      dots = dots.filter(d => d.age < 20);
      animId = requestAnimationFrame(draw);
    };
    draw();
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none'
      }} 
    />
  );
};

export default CursorTrail;
