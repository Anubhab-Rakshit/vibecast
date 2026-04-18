import React from 'react';

const ScanlineCard = ({ children, className = '', style = {} }) => {
  return (
    <div 
      className={`panel crt-scanlines ${className}`}
      style={{
        ...style
      }}
    >
      {/* We need to ensure content is above the crt-scanlines pseudo-element.
          The crt-scanlines class handles the ::after with pointer-events: none 
          and z-index: 10. */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        {children}
      </div>
    </div>
  );
};

export default ScanlineCard;
