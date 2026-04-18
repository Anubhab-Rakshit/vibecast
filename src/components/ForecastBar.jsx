import React from 'react';
import { motion } from 'framer-motion';

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia?.('(max-width: 900px)').matches;

const ForecastBar = ({ step = 0 }) => {
  if (step <= 10) return null;

  const anxietyDepth = Math.min(100, Math.round((step / 47) * 100));
  const careerColor = step > 20 ? 'var(--amber)' : 'var(--text-mid)';
  const careerText = step > 20 ? 'ACTIVATED' : 'DORMANT';
  const cosmicColor = step > 40 ? 'var(--red)' : 'var(--text-mid)';
  const cosmicText = step > 40 ? 'IMMINENT' : 'APPROACHING';

  return (
    <motion.div
      initial={{ y: 44, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', bottom: isMobileViewport ? '52px' : 0, left: 0, width: '100vw', height: isMobileViewport ? '38px' : '44px',
        backgroundColor: 'var(--bg-void)', borderTop: '0.5px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: isMobileViewport ? '10px' : '24px', zIndex: 50,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: isMobileViewport ? '0 12px' : '0',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '9px' : '10px', color: 'var(--text-mid)', textTransform: 'uppercase' }}>
        ANXIETY DEPTH:{' '}
        <motion.span
          animate={{ opacity: 1 }}
          key={anxietyDepth}
          style={{ color: 'var(--text-bright)' }}
        >
          {anxietyDepth}%
        </motion.span>
      </div>
      <div style={{ color: 'var(--border-subtle)' }}>|</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '9px' : '10px', color: careerColor, textTransform: 'uppercase', transition: 'color 0.5s' }}>
        CAREER CONCERNS: {careerText}
      </div>
      <div style={{ color: 'var(--border-subtle)' }}>|</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: isMobileViewport ? '9px' : '10px', color: cosmicColor,
        textTransform: 'uppercase', transition: 'color 0.5s',
        animation: step > 40 ? 'blink 0.5s infinite' : 'none'
      }}>
        COSMIC DREAD: {cosmicText}
      </div>
    </motion.div>
  );
};

export default ForecastBar;
