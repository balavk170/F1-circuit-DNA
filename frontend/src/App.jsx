// src/App.jsx
const { useState, useEffect } = React;

window.App = function App() {
  const [activeCircuit, setActiveCircuit] = useState('monaco');

  // Custom cursor
  useEffect(() => {
    const glow = document.getElementById('cursor-glow');
    const dot  = document.getElementById('cursor-dot');
    if (!glow || !dot) return;
    let mx=0, my=0, gx=0, gy=0;
    const onMove = e => { mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; };
    const onDown = () => { dot.style.transform='translate(-50%,-50%) scale(.55)'; };
    const onUp   = () => { dot.style.transform='translate(-50%,-50%) scale(1)'; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    let raf;
    (function animCursor() {
      gx += (mx-gx)*.07; gy += (my-gy)*.07;
      glow.style.left=gx+'px'; glow.style.top=gy+'px';
      raf = requestAnimationFrame(animCursor);
    })();
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="cursor-glow"/>
      <div id="cursor-dot"/>
      <Loader />
      <div id="data-stream"/>
      <Navbar activeCircuit={activeCircuit} onCircuitChange={setActiveCircuit} />
      <Hero circuit={activeCircuit} />
      <ChartsSection circuit={activeCircuit} />
      <MLSection />
      <footer>
        <div className="footer-logo">F1<span>APEX</span></div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px',color:'rgba(255,255,255,.25)'}}>
          ANALYTICS DASHBOARD · DATA: KAGGLE F1 DATASET · TELEMETRY: FASTF1 SIMULATION
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'10px',color:'rgba(255,255,255,.18)'}}>
          ◈ 26,759 RACE RESULTS · 1,125 RACES
        </div>
      </footer>
    </>
  );
};
