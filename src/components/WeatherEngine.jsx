import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

// --- RAIN EFFECT (Canvas-based for high performance cinematic rain) ---
const RainEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    let animationFrameId;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    class RainParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.length = Math.random() * 25 + 15;
        this.speed = Math.random() * 12 + 8;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.y += this.speed;
        this.x += this.speed * 0.2; // Slanted rain
        if (this.y > height + 100 || this.x > width + 100) {
          this.reset();
          this.y = -50;
        }
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length * 0.2, this.y + this.length);
        ctx.strokeStyle = `rgba(160, 180, 200, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Adjust particle count based on performance capability (keep it relatively high for cinematic look)
    const particleCount = window.innerWidth < 768 ? 150 : 400;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new RainParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </motion.div>
  );
};

// --- SUN EFFECT (Volumetric CSS Gradients) ---
const SunEffect = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2.5 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 60% 30%, rgba(255, 170, 50, 0.25) 0%, rgba(20, 25, 40, 0.9) 60%)',
        mixBlendMode: 'screen'
      }}
    >
      {/* Sun Core Lens Flare */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '20%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,100,0.4) 0%, rgba(255,150,50,0) 70%)',
          filter: 'blur(40px)',
          transform: 'translate(50%, -50%)'
        }}
      />
    </motion.div>
  );
};

// --- STORM EFFECT (GSAP Lightning + Dark Backdrop) ---
const StormEffect = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simulate sporadic lightning flashes using GSAP
    const flash = () => {
      const flashDuration = Math.random() * 0.1 + 0.05;
      gsap.fromTo(containerRef.current, 
        { backgroundColor: 'rgba(5, 8, 15, 0.9)' },
        { 
          backgroundColor: 'rgba(200, 220, 255, 0.15)', 
          duration: flashDuration,
          yoyo: true,
          repeat: Math.random() > 0.7 ? 3 : 1, // Double/triple flashes
          ease: "power4.inOut",
          onComplete: () => {
            // Schedule next flash randomly between 2s and 10s
            gsap.delayedCall(Math.random() * 8 + 2, flash);
          }
        }
      );
    };

    gsap.delayedCall(1, flash);

    return () => gsap.killTweensOf(containerRef.current);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    >
      {/* Heavy Rain Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
      }} />
    </motion.div>
  );
};

// --- FOG EFFECT (SVG Filters + CSS Animation) ---
const FogEffect = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 3 }}
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="fog-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" />
        </filter>
      </svg>
      
      {/* Slow panning fog layers */}
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '200%', height: '100%',
          filter: 'url(#fog-noise) blur(10px)',
          opacity: 0.8,
          mixBlendMode: 'screen',
          transform: 'scale(1.5)'
        }}
      />
      <motion.div
        animate={{ x: ['-50%', '0%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '200%', height: '100%',
          filter: 'url(#fog-noise) blur(20px)',
          opacity: 0.5,
          mixBlendMode: 'screen',
          transform: 'scale(2)'
        }}
      />
    </motion.div>
  );
};

// --- MAIN ENGINE CONTROLLER ---
const WeatherEngine = ({ weatherType }) => {
  // If no weatherType is provided, render nothing (allows ParticleCanvas to show cleanly on Screen 1)
  if (!weatherType) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <AnimatePresence mode="wait">
        {weatherType === 'RAIN' && <RainEffect key="rain" />}
        {weatherType === 'SUN' && <SunEffect key="sun" />}
        {weatherType === 'STORM' && <StormEffect key="storm" />}
        {weatherType === 'FOG' && <FogEffect key="fog" />}
      </AnimatePresence>
    </div>
  );
};

export default WeatherEngine;
