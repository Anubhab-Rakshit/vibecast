import React from 'react';

const GlassPanel = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`panel ${className}`}
      style={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
