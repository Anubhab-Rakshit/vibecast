import React, { useMemo } from 'react';

const FloatingDust = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 2,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 6 + 8,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          bottom: '-10px',
          left: p.left,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(180,150,90,0.25)',
          animation: `dust-drift ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
};

export default FloatingDust;
