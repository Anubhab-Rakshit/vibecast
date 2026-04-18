import React from 'react';

const LiveDot = () => {
  return (
    <div
      style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-red)',
        animation: 'radiate 0.8s infinite'
      }}
    />
  );
};

export default LiveDot;
