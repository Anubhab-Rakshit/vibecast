import React from 'react';

const ScanlinePanel = ({ children, style = {} }) => {
  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-accent)',
      borderRadius: '4px',
      overflow: 'hidden',
      ...style
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default ScanlinePanel;
