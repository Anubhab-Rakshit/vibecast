import React, { useState, useEffect } from 'react';

const SignalBars = () => {
  const [signalBars, setSignalBars] = useState([true, true, true, true]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextBars = [true, true, true, true];
      const dropIndex = Math.floor(Math.random() * 4);
      nextBars[dropIndex] = false;
      setSignalBars(nextBars);

      setTimeout(() => {
        setSignalBars([true, true, true, true]);
      }, 500 + Math.random() * 1000);
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '11px' }}>
      {signalBars.map((active, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${(i + 1) * 24}%`,
            borderRadius: '1px',
            backgroundColor: 'var(--teal)',
            opacity: active ? 1 : 0.22,
            transition: 'opacity 0.2s ease',
          }}
        />
      ))}
    </div>
  );
};

const DotLeader = () => (
  <>
    <span style={{ fontSize: '26px', lineHeight: 0, color: 'rgba(148,163,184,0.28)', transform: 'translateY(-2px)', userSelect: 'none' }}>·</span>
    <span style={{ fontSize: '26px', lineHeight: 0, color: 'rgba(148,163,184,0.28)', transform: 'translateY(-2px)', userSelect: 'none' }}>·</span>
    <span style={{ fontSize: '26px', lineHeight: 0, color: 'rgba(148,163,184,0.28)', transform: 'translateY(-2px)', userSelect: 'none' }}>·</span>
  </>
);

const StripItem = ({ label, value, valueColor = 'var(--text-bright)', trailing = null }) => (
  <div
    style={{
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 14px',
      height: '100%',
      borderRight: '1px solid rgba(74,222,204,0.15)',
      boxShadow: 'inset -1px 0 0 rgba(148,163,184,0.05)',
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '8px',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
    <DotLeader />
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: valueColor,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        minWidth: 0,
      }}
    >
      {value}
      {trailing}
    </div>
  </div>
);

const HUDBar = ({ step = 0, isStreaming = false, isComplete = false, livePhrase = '' }) => {
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

  let dreadLevel = 0;
  let dreadText = 'NONE';
  if (isStreaming || isComplete) {
    if (step > 0 && step <= 10) {
      dreadLevel = 1;
      dreadText = 'MILD';
    } else if (step > 10 && step <= 20) {
      dreadLevel = 2;
      dreadText = 'ELEVATED';
    } else if (step > 20 && step <= 35) {
      dreadLevel = 3;
      dreadText = 'SEVERE';
    } else if (step > 35 && step < 47) {
      dreadLevel = 4;
      dreadText = 'CRITICAL';
    } else if (step >= 47) {
      dreadLevel = 5;
      dreadText = 'MAXIMUM';
    }
  }

  let dreadColor = 'var(--text-dim)';
  if (dreadLevel === 1) dreadColor = 'var(--teal)';
  else if (dreadLevel === 2) dreadColor = '#60A5FA';
  else if (dreadLevel === 3) dreadColor = 'var(--amber)';
  else if (dreadLevel >= 4) dreadColor = 'var(--red)';

  const protocolValue = isComplete ? (
    <span style={{ color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Spiral Complete</span>
  ) : (
    `STEP ${step.toString().padStart(2, '0')}/47`
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: '58px',
        left: '48%',
        transform: 'translateX(-48%)',
        width: 'min(1080px, calc(100vw - 28px))',
        height: '52px',
        borderRadius: '10px',
        border: '1px solid rgba(74,222,204,0.22)',
        background: 'linear-gradient(108deg, rgba(10,14,26,0.92) 0%, rgba(12,18,30,0.92) 58%, rgba(8,12,20,0.92) 100%)',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
        alignItems: 'center',
        zIndex: 92,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.42), inset 0 1px 0 rgba(148,163,184,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.045) 2px, rgba(0,0,0,0.045) 3px)',
          opacity: 0.52,
        }}
      />

      <StripItem
        label="Location"
        value={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
            <span style={{ color: 'var(--text-bright)', fontSize: '12px', letterSpacing: '0.04em' }}>LAT 22.57N</span>
            <span
              style={{
                color: 'var(--text-dim)',
                fontSize: '9px',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '210px',
              }}
            >
              {livePhrase}
            </span>
          </div>
        }
      />

      <StripItem
        label="Signal"
        value={
          <>
            <SignalBars />
            <span style={{ color: 'var(--teal)', letterSpacing: '0.12em', fontSize: '10px' }}>STABLE</span>
          </>
        }
      />

      <StripItem label="Protocol" value={protocolValue} valueColor="var(--text-bright)" />

      <StripItem
        label="Dread"
        value={dreadText}
        valueColor={dreadColor}
        trailing={
          dreadLevel >= 4 ? (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: dreadColor,
                boxShadow: `0 0 8px ${dreadColor}`,
                animation: 'blink 0.9s infinite',
              }}
            />
          ) : null
        }
      />

      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '126px',
          padding: '0 14px 0 10px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '26px',
            lineHeight: 0,
            color: 'rgba(148,163,184,0.28)',
            transform: 'translateY(-2px)',
            userSelect: 'none',
            marginRight: '8px',
          }}
        >
          ·
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--teal)',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
};

export default HUDBar;
