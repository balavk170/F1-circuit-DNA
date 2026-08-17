// src/components/Loader.jsx
const { useEffect, useRef } = React;

window.Loader = function Loader() {
  const fillRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const fill = fillRef.current;
    const status = statusRef.current;
    if (!fill || !status) return;
    const msgs = [
      'INITIALIZING TELEMETRY SYSTEMS...','LOADING CIRCUIT DATA...',
      'PARSING FASTF1 SESSION...','BUILDING ML FEATURE MATRIX...',
      'CALIBRATING TYRE MODELS...','RENDERING 3D CIRCUIT...','READY'
    ];
    let pct = 0;
    function step() {
      pct = Math.min(pct + rand(8, 18), 100);
      fill.style.width = pct + '%';
      status.textContent = msgs[Math.min(Math.floor(pct / 100 * msgs.length), msgs.length - 1)];
      if (pct < 100) setTimeout(step, rand(75, 190));
      else setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hide');
      }, 350);
    }
    step();
  }, []);

  return (
    <div id="loader">
      <div className="loader-logo">F1<span>APEX</span></div>
      <div className="loader-bar"><div className="loader-fill" ref={fillRef} id="loader-fill" /></div>
      <div className="loader-status" ref={statusRef} id="loader-status">INITIALIZING TELEMETRY SYSTEMS...</div>
    </div>
  );
};
