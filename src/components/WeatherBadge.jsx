import React from 'react';

const WeatherBadge = ({ level = 1, label = "Level 1" }) => {
  const getLevelColor = (level) => {
    switch(level) {
      case 1: return "var(--accent-teal)";
      case 2: return "#60A5FA"; // Category 2 Procrastination Front
      case 3: return "var(--accent-amber)";
      case 4: return "var(--accent-fog)";
      case 5: return "var(--accent-red)";
      default: return "var(--accent-teal)";
    }
  };

  return (
    <div 
      className="inline-element"
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div 
        style={{
          width: '6px',
          backgroundColor: getLevelColor(level)
        }}
      />
      <span 
        className="label-caps"
        style={{
          padding: '4px 8px',
          fontSize: '10px',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default WeatherBadge;
