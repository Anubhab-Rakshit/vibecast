import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const ChaosToggle = ({ label, active, onClick, extraLabel }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onClick}>
      <div style={{
        width: '32px', height: '16px', borderRadius: '8px',
        backgroundColor: active ? 'var(--accent-red)' : 'var(--bg-primary)',
        border: `1px solid ${active ? 'var(--accent-red)' : 'var(--border)'}`,
        position: 'relative',
        transition: 'all 0.2s ease',
        flexShrink: 0
      }}>
        <motion.div 
          animate={{ left: active ? '18px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute', top: '2px', left: '2px',
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: active ? '#FFF' : 'var(--text-muted)',
          }} 
        />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: active ? 'var(--accent-red)' : 'var(--text-primary)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    {extraLabel && (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginLeft: '44px', marginTop: '4px' }}>
        {extraLabel}
      </span>
    )}
  </motion.div>
);

const ChaosPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [crtActive, setCrtActive] = useState(false);
  
  const [pinkMode, setPinkMode] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);
  const [unreadableMode, setUnreadableMode] = useState(false);

  const glitchIntervalRef = useRef(null);
  const constraintsRef = useRef(null);

  const triggerTransition = (callback) => {
    setCrtActive(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setCrtActive(false), 100);
    }, 300);
  };

  const togglePink = () => {
    const nextState = !pinkMode;
    triggerTransition(() => {
      setPinkMode(nextState);
      if (nextState) {
        document.body.classList.add('theme-pink');
        if (glitchMode) toggleGlitch(false);
      } else {
        document.body.classList.remove('theme-pink');
      }
    });
  };

  const themes = ['theme-pink', 'theme-sepia', 'theme-void', 'theme-green'];
  
  const applyRandomTheme = () => {
    triggerTransition(() => {
      themes.forEach(t => document.body.classList.remove(t));
      if (Math.random() > 0.2) {
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        document.body.classList.add(randomTheme);
      }
    });
  };

  const toggleGlitch = (forceState = null) => {
    const nextState = forceState !== null ? forceState : !glitchMode;
    setGlitchMode(nextState);
    if (nextState) {
      if (pinkMode) {
        setPinkMode(false);
        document.body.classList.remove('theme-pink');
      }
      const fireRandomEvent = () => {
        applyRandomTheme();
        const nextInterval = Math.random() * (90000 - 45000) + 45000;
        glitchIntervalRef.current = setTimeout(fireRandomEvent, nextInterval);
      };
      glitchIntervalRef.current = setTimeout(fireRandomEvent, 2000);
    } else {
      clearTimeout(glitchIntervalRef.current);
      themes.forEach(t => document.body.classList.remove(t));
    }
  };

  useEffect(() => {
    return () => clearTimeout(glitchIntervalRef.current);
  }, []);

  const toggleUnreadable = () => {
    const nextState = !unreadableMode;
    triggerTransition(() => {
      setUnreadableMode(nextState);
      if (nextState) document.body.classList.add('mode-decrease-readability');
      else document.body.classList.remove('mode-decrease-readability');
    });
  };

  const handleReset = () => {
    triggerTransition(() => {
      setPinkMode(false);
      setGlitchMode(false);
      setUnreadableMode(false);
      clearTimeout(glitchIntervalRef.current);
      document.body.className = '';
    });
  };

  return (
    <>
      {/* Full-viewport drag constraint layer — invisible */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none',
          zIndex: 9800,
        }}
      />

      <AnimatePresence>
        {crtActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}
          >
            <svg style={{ width: '100%', height: '100%' }}>
              <filter id="crt-glitch">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer><feFuncA type="linear" slope="4"/></feComponentTransfer>
              </filter>
              <rect width="100%" height="100%" filter="url(#crt-glitch)" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The draggable panel — Framer Motion native drag */}
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9900,
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: isOpen ? '4px' : '24px',
          border: isOpen ? '0.5px solid var(--accent-red)' : '0.5px solid var(--border)',
          width: isOpen ? '260px' : '90px',
          height: isOpen ? 'auto' : '48px',
          overflow: 'hidden',
          boxShadow: isOpen
            ? '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(239,68,68,0.1)'
            : '0 4px 12px rgba(0,0,0,0.4)',
          filter: isDragging
            ? 'drop-shadow(-6px -6px 0px rgba(239,68,68,0.3)) drop-shadow(6px 6px 0px rgba(74,222,204,0.3))'
            : 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(true)}
              style={{
                width: '100%', height: '48px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="label-caps" style={{ fontSize: '11px', color: 'var(--text-muted)', pointerEvents: 'none' }}>◈ CHAOS</span>
            </motion.div>
          ) : (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header — drag handle area */}
              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: 'rgba(239,68,68,0.05)'
                }}
              >
                <span className="label-caps" style={{ fontSize: '9px', color: 'var(--accent-red)', letterSpacing: '0.18em' }}>
                  ⠿ CHAOS CONTROL
                </span>
                <div
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  style={{
                    width: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >✕</div>
              </div>

              <motion.div 
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                style={{ padding: '16px' }}
              >
                <ChaosToggle label="PINK INVASION MODE" active={pinkMode} onClick={togglePink} />
                <ChaosToggle label="RANDOM GLITCH MODE" active={glitchMode} onClick={() => toggleGlitch(null)} />
                <ChaosToggle label="DECREASE READABILITY" active={unreadableMode} onClick={toggleUnreadable} extraLabel="accessibility ☑ (approximate)" />
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button
                    onClick={handleReset}
                    style={{
                      background: 'transparent', border: 'none',
                      fontFamily: 'var(--font-mono)', fontSize: '9px',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      textDecoration: 'underline transparent',
                      transition: 'text-decoration 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.textDecorationColor = 'var(--text-muted)'}
                    onMouseLeave={e => e.target.style.textDecorationColor = 'transparent'}
                  >
                    [ EMERGENCY RESET ]
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default ChaosPanel;
