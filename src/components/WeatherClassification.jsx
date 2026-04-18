import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia?.('(max-width: 900px)').matches;

const WeatherClassification = ({ level = 1 }) => {
  const [prevLevel, setPrevLevel] = useState(level);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (level !== prevLevel) {
      setPrevLevel(level);
      setAnimKey(k => k + 1);
    }
  }, [level]);

  let name = "MILD AVOIDANCE DRIZZLE";
  let color = 'var(--teal)';
  if (level === 2) { name = "ELEVATED FIXATION SQUALL"; color = '#60A5FA'; }
  if (level === 3) { name = "SEVERE SPIRAL STORM"; color = 'var(--amber)'; }
  if (level === 4) { name = "CRITICAL DREAD CYCLONE"; color = 'var(--fog)'; }
  if (level >= 5) { name = "CATEGORY 5 MIDNIGHT DREAD HURRICANE"; color = 'var(--red)'; }

  return (
    <div style={{ position: 'absolute', left: isMobileViewport ? '14px' : '48px', top: isMobileViewport ? '82px' : '96px', width: isMobileViewport ? 'calc(100vw - 28px)' : '280px', zIndex: 30 }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.2 }}
      >
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '8px',
          color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '4px'
        }}>
          CURRENT CONDITIONS
        </div>

        <div style={{ position: 'relative', height: isMobileViewport ? '52px' : '80px', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={animKey}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(16px, 2vw, 28px)',
                fontWeight: 'bold',
                lineHeight: 1.1,
                color: color,
                textShadow: level >= 5 ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
                position: 'absolute'
              }}
            >
              {name}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ opacity: level >= 3 ? 1 : 0.5 }}
          transition={{ duration: 0.4 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', marginTop: '-8px' }}
        >
          Trajectory: WORSENING ↑
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WeatherClassification;
