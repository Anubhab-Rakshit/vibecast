import React from 'react';

const LiveDot = () => {
  return (
    <div style={{
      position: 'relative',
      width: '6px',
      height: '6px',
      backgroundColor: 'var(--red)',
      borderRadius: '50%',
      display: 'inline-block'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '50%',
        backgroundColor: 'var(--red)',
        animation: 'pulse-ring 1.2s ease-out infinite'
      }} />
    </div>
  );
};

export default LiveDot;
