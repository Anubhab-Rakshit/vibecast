import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from './GlassPanel';
import LiveDot from './LiveDot';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const StatusCapsule = ({ step = 0, isStreaming = false }) => {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsShrunk(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let displayStatus = "FORECAST READY";
  let statusColor = "var(--text-primary)";
  
  if (isStreaming) {
    if (step === 47) {
      displayStatus = "⚠ SPECIAL BULLETIN";
      statusColor = "var(--accent-red)";
    } else {
      displayStatus = `STEP ${step.toString().padStart(2, '0')}/47`;
      statusColor = "var(--accent-teal)";
    }
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      style={{
        position: 'fixed',
        top: '64px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        transition: 'width 0.3s ease',
        width: isShrunk ? '160px' : '220px',
      }}
    >
      <GlassPanel
        style={{
          height: '36px',
          borderRadius: '18px',
          backgroundColor: 'rgba(17,24,39,0.7)',
          border: `0.5px solid ${isStreaming && step === 47 ? 'var(--accent-red)' : 'rgba(74,222,204,0.3)'}`,
          boxShadow: isStreaming && step === 47 ? '0 0 30px rgba(239,68,68,0.2)' : '0 0 30px rgba(74,222,204,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isShrunk ? 'center' : 'space-between',
          padding: '0 12px',
          transition: 'all 0.4s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LiveDot />
          {!isShrunk && (
            <span className="label-caps" style={{ fontSize: '10px', color: 'var(--accent-teal)', width: '60px' }}>
              NMWS LIVE
            </span>
          )}
        </div>
        
        {/* Radar Icon */}
        <div style={{ width: '18px', height: '18px', position: 'relative' }}>
          <motion.svg 
            viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="1.5"
            animate={isStreaming ? { rotate: 360 } : {}}
            transition={isStreaming ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.4" />
            <circle cx="12" cy="12" r="6" strokeOpacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="var(--accent-teal)" />
            <path d="M12 12 L20 4" strokeDasharray="4 2" />
          </motion.svg>
        </div>

        {!isShrunk && (
          <div style={{ width: '100px', textAlign: 'right', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.span 
                key={displayStatus}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="label-caps" 
                style={{ fontSize: '10px', color: statusColor, display: 'inline-block', whiteSpace: 'nowrap' }}
              >
                {displayStatus}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
};

export default StatusCapsule;

export default StatusCapsule;
