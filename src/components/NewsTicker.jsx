import React, { useState, useEffect } from 'react';

const messages = [
  '4.2 billion humans are overthinking something right now',
  'Mercury is in retrograde. Your ping is 450ms. These are related.',
  'ALERT: Your alternate self replied to that email immediately. They are fine.',
  'FORECAST: Partly cloudy with a 90% chance of not doing the thing',
  "BREAKING: Local human has been 'about to start' for 3 hours",
  'ADVISORY: Existential fog persisting through the weekend',
  'UPDATE: The thing you are avoiding has not gone away',
];

const NewsTicker = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '46px',
      background: 'linear-gradient(90deg, rgba(8,12,20,0.95) 0%, rgba(10,14,26,0.95) 50%, rgba(8,12,20,0.95) 100%)',
      borderBottom: '1px solid rgba(74,222,204,0.16)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      zIndex: 9800,
      userSelect: 'none',
      boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 -1px 0 rgba(148,163,184,0.08)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px)',
        opacity: 0.55,
      }} />

      {/* Left side (fixed brand) */}
      <div style={{
        flexShrink: 0,
        padding: '0 14px 0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '100%',
        background: 'linear-gradient(90deg, rgba(8,12,20,1) 0%, rgba(8,12,20,0.96) 72%, rgba(8,12,20,0) 100%)',
        zIndex: 2,
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--teal)',
          boxShadow: '0 0 10px rgba(74,222,204,0.7)',
          animation: 'pulse-ring 1.4s ease-out infinite'
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--teal)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          VIBECAST
        </span>
        <span style={{ color: 'var(--text-ghost)', fontSize: '10px' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-mid)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Official Useless Forecast
        </span>
      </div>

      {/* Scrolling section */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '80px',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(10,14,26,0.92), rgba(10,14,26,0))',
          zIndex: 3,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '120px',
          height: '100%',
          background: 'linear-gradient(270deg, rgba(10,14,26,0.92), rgba(10,14,26,0))',
          zIndex: 3,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '78px',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 50s linear infinite',
          willChange: 'transform',
        }}>
          {/* Double array for seamless loop */}
          {[...messages, ...messages].map((msg, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'rgba(241,245,249,0.76)',
              letterSpacing: '0.02em'
            }}>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Right side (fixed status + clock) */}
      <div style={{
        flexShrink: 0,
        padding: '0 16px 0 12px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'linear-gradient(270deg, rgba(8,12,20,1) 0%, rgba(8,12,20,0.96) 72%, rgba(8,12,20,0) 100%)',
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          border: '1px solid rgba(148,163,184,0.22)',
          borderRadius: '9px',
          padding: '3px 8px'
        }}>
          Live
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--teal)',
          letterSpacing: '0.12em'
        }}>
          {time}
        </span>
      </div>
    </div>
  );
};

export default NewsTicker;
