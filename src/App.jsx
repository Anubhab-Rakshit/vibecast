import React, { useState } from 'react';
import ScanlineCard from './components/ScanlineCard';
import LiveDot from './components/LiveDot';

function App() {
  const [screen, setScreen] = useState(1);

  return (
    <div className="app-container">
      {/* Persistent Elements Shell */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', zIndex: 100, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <LiveDot />
        <span className="label-caps" style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--accent-teal)' }}>
          NMWS LIVE BROADCAST // STATION 01
        </span>
      </div>

      <main style={{ paddingTop: '60px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ScanlineCard style={{ width: '90%', maxWidth: '600px', padding: '40px', border: '1px solid var(--accent-teal)' }}>
          <h1 style={{ color: 'var(--accent-teal)', textAlign: 'center' }}>NATIONAL MENTAL WEATHER SERVICE</h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            INITIALIZING SYSTEM CORE...
          </p>
          <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed var(--border)', textAlign: 'center' }}>
            <span className="label-caps" style={{ fontSize: '10px' }}>[ STANDBY FOR DATA FLOW ]</span>
          </div>
        </ScanlineCard>
      </main>

      {/* Chaos Panel Placeholder */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <button className="panel label-caps" style={{ padding: '8px 16px', fontSize: '10px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          CHAOS_PANEL_v1.0
        </button>
      </div>
    </div>
  );
}

export default App;
