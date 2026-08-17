// src/components/Hero.jsx
const { useEffect, useRef } = React;

window.Hero = function Hero({ circuit }) {
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Cleanup previous scene
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = buildHeroScene(circuit, canvasRef.current);
  }, [circuit]);

  const c = CIRCUITS[circuit] || CIRCUITS['monaco'];

  return (
    <section id="hero">
      <canvas ref={canvasRef} id="hero-canvas" />

      {/* Controls badge */}
      <div id="hero-controls-badge">
        <div className="ctrl-row"><span className="ctrl-key">DRAG</span><span className="ctrl-desc">Orbit camera</span></div>
        <div className="ctrl-row"><span className="ctrl-key">SCROLL</span><span className="ctrl-desc">Zoom in / out</span></div>
        <div className="ctrl-row"><span className="ctrl-key">RIGHT DRAG</span><span className="ctrl-desc">Pan view</span></div>
        <div className="ctrl-row"><span className="ctrl-key">DBL CLICK</span><span className="ctrl-desc">Reset camera</span></div>
      </div>

      {/* Animated hint pills */}
      <div id="hero-controls-hint">
        <div className="hint-pill"><span className="hint-icon">⟳</span>DRAG TO ORBIT</div>
        <div className="hint-pill"><span className="hint-icon">⊕</span>SCROLL TO ZOOM</div>
        <div className="hint-pill"><span className="hint-icon">✥</span>RIGHT DRAG TO PAN</div>
      </div>

      {/* Hero UI overlay */}
      <div className="hero-ui">
        <div>
          <div className="hero-title">
            <span className="t1">FORMULA ONE</span>
            <span className="t2" id="hero-circuit-name">{c.name.toUpperCase()}</span>
            <span className="t3" id="hero-circuit-sub">
              {c.city.toUpperCase()} · {c.length} KM · {c.laps} LAPS
            </span>
          </div>
        </div>
        <div>
          <div className="hero-stats">
            <div className="hstat">
              <div className="hstat-val" id="stat-topspeed">{c.topSpeed}</div>
              <div className="hstat-lbl">TOP SPEED km/h</div>
            </div>
            <div className="hstat">
              <div className="hstat-val" id="stat-corners">{c.corners}</div>
              <div className="hstat-lbl">CORNERS</div>
            </div>
            <div className="hstat">
              <div className="hstat-val" id="stat-laprecord">{c.lapRecord}</div>
              <div className="hstat-lbl">LAP RECORD</div>
            </div>
            <div className="hstat">
              <div className="hstat-val" id="stat-drs">{c.drs}</div>
              <div className="hstat-lbl">DRS ZONES</div>
            </div>
          </div>
          <div className="speed-legend">
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'rgba(255,255,255,.38)',letterSpacing:'.1em',marginBottom:'4px'}}>SPEED HEATMAP</div>
            <div className="speed-grad-bar" />
            <div className="speed-grad-labels"><span>LOW</span><span>MED</span><span>HIGH</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};
