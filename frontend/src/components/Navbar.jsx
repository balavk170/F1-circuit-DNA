// src/components/Navbar.jsx
// BUG FIX 1: live-clock moved INSIDE the nav as the rightmost flex item,
// eliminating the fixed-position overlap with the circuit-selector buttons.

const { useEffect, useRef } = React;

window.Navbar = function Navbar({ activeCircuit, onCircuitChange }) {
  const clockRef = useRef(null);

  // Live UTC clock
  useEffect(() => {
    function tick() {
      if (!clockRef.current) return;
      const d = new Date();
      clockRef.current.textContent =
        [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
          .map(v => String(v).padStart(2, '0')).join(':') + ' UTC';
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const circuits = [
    { key: 'monaco',      label: 'Monaco' },
    { key: 'silverstone', label: 'Silverstone' },
    { key: 'monza',       label: 'Monza' },
    { key: 'spa',         label: 'Spa' },
    { key: 'suzuka',      label: 'Suzuka' },
  ];

  return (
    <nav>
      {/* Logo */}
      <div className="nav-logo">F1<span>APEX</span></div>

      {/* Section links */}
      <ul className="nav-links">
        <li><a href="#hero">Circuit</a></li>
        <li><a href="#charts-section">Analytics</a></li>
        <li><a href="#ml-section">ML Engine</a></li>
      </ul>

      {/* Circuit selector */}
      <div className="circuit-selector" id="circuit-selector">
        {circuits.map(({ key, label }) => (
          <button
            key={key}
            className={`circuit-btn${activeCircuit === key ? ' active' : ''}`}
            data-circuit={key}
            onClick={() => onCircuitChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── BUG FIX: clock is now a flex sibling — no overlap ── */}
      <div
        ref={clockRef}
        className="nav-clock"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: 'var(--nc)',
          opacity: 0.65,
          letterSpacing: '.1em',
          whiteSpace: 'nowrap',
          marginLeft: '18px',
          flexShrink: 0,
        }}
      >
        00:00:00 UTC
      </div>
    </nav>
  );
};
