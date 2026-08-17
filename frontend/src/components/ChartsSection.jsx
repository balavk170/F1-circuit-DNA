// src/components/ChartsSection.jsx
// BUG FIX 3: Charts section and ML section get padding-right: 72px so the
// fixed-position toggle panel (#toggle-panel, ~50px wide) never overlaps chart edges.

const { useEffect, useRef, useState } = React;

/* ── Card chrome wrapper ─────────────────────────────────────────────────── */
function ChartCard({ id, span, label, title, children, style }) {
  return (
    <div className={`chart-card ${span}`} id={id} style={style}>
      <div className="cc tl"/><div className="cc tr"/><div className="cc bl"/><div className="cc br"/>
      <div className="card-label">{label}</div>
      <div className="card-title">{title}</div>
      {children}
    </div>
  );
}

/* ── Tyre compound buttons ───────────────────────────────────────────────── */
const COMPOUND_STYLES = {
  soft:   { borderColor:'#ff2222', color:'#ff2222', background:'rgba(255,34,34,.08)' },
  medium: { borderColor:'#f5e642', color:'#f5e642' },
  hard:   { borderColor:'#eee',    color:'#eee' },
  inter:  { borderColor:'#39ff14', color:'#39ff14' },
  wet:    { borderColor:'#00f5ff', color:'#00f5ff' },
};

window.ChartsSection = function ChartsSection({ circuit }) {
  const [activeCompound, setActiveCompound] = useState('soft');
  const [visibleCards, setVisibleCards] = useState({
    'card-speed':true,'card-throttle':true,'card-brake':true,'card-bscatter':true,
    'card-gforce':true,'card-tyre':true,'card-scatter3d':true,'card-radar':true,
    'card-winprob':true,'card-features':true,'card-heatmap':true,'card-predict':true,
  });

  // Build all charts when circuit changes
  useEffect(() => {
    // Defer until DOM is ready
    setTimeout(() => buildAllCharts(circuit), 50);
  }, [circuit]);

  // Build/rebuild tyre scene when compound changes
  useEffect(() => {
    setTimeout(() => buildTyreScene(activeCompound), 50);
  }, [activeCompound]);

  // Build scatter scene once on mount
  useEffect(() => {
    setTimeout(() => buildScatterScene(), 80);
  }, []);

  // Scroll animations (GSAP) after mount
  useEffect(() => {
    setTimeout(() => {
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll('.chart-card').forEach((card) => {
          gsap.fromTo(card,
            {opacity:0, rotateY:42, rotateX:-12, z:-100, transformOrigin:'center center -50px'},
            {opacity:1, rotateY:0, rotateX:0, z:0, duration:.85, ease:'power3.out',
              scrollTrigger:{trigger:card, start:'top 88%', toggleActions:'play none none reverse'}}
          );
        });
      }
    }, 200);
  }, []);

  function toggleCard(target) {
    setVisibleCards(prev => ({ ...prev, [target]: !prev[target] }));
  }

  const TOG_BUTTONS = [
    {t:'card-speed',l:'SPD'},{t:'card-throttle',l:'THR'},{t:'card-brake',l:'BRK'},
    {t:'card-bscatter',l:'BSC'},{t:'card-gforce',l:'GFC'},{t:'card-tyre',l:'TYR'},
    {t:'card-scatter3d',l:'CLU'},{t:'card-radar',l:'RDR'},{t:'card-winprob',l:'WIN'},
    {t:'card-features',l:'FTR'},{t:'card-heatmap',l:'HMT'},{t:'card-predict',l:'PRD'},
  ];

  return (
    <>
      {/* ── Right-edge toggle panel ─────────────────────────────────────── */}
      <div id="toggle-panel">
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'8px',color:'rgba(255,255,255,.28)',textAlign:'center',letterSpacing:'.08em',paddingBottom:'4px'}}>VIS</div>
        {TOG_BUTTONS.map(({ t, l }) => (
          <button
            key={t}
            className={`tog-btn${visibleCards[t] ? ' active' : ''}`}
            data-target={t}
            title={l}
            onClick={() => toggleCard(t)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Charts section ──────────────────────────────────────────────── */}
      {/* BUG FIX 3: paddingRight 72px clears the fixed toggle panel */}
      <section id="charts-section" style={{ paddingRight: '72px' }}>
        <div className="section-header">
          <div className="section-tag">◈ TELEMETRY ANALYTICS</div>
          <div className="section-title">Race Data Intelligence</div>
        </div>

        <div className="charts-grid">

          {/* Speed */}
          <ChartCard id="card-speed" span="span-8" label="CHART 01 · TELEMETRY" title="Speed vs Distance"
            style={visibleCards['card-speed'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartSpeed" />
          </ChartCard>

          {/* Throttle */}
          <ChartCard id="card-throttle" span="span-4" label="CHART 02 · INPUT" title="Throttle Application %"
            style={visibleCards['card-throttle'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartThrottle" />
          </ChartCard>

          {/* Brake */}
          <ChartCard id="card-brake" span="span-4" label="CHART 03 · INPUT" title="Brake Pressure"
            style={visibleCards['card-brake'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartBrake" />
          </ChartCard>

          {/* Brake Scatter */}
          <ChartCard id="card-bscatter" span="span-4" label="CHART 04 · EVENTS" title="Brake Event Scatter"
            style={visibleCards['card-bscatter'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartBrakeScatter" />
          </ChartCard>

          {/* G-Force */}
          <ChartCard id="card-gforce" span="span-4" label="CHART 05 · DYNAMICS" title="G-Force Analysis"
            style={visibleCards['card-gforce'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartGforce" />
          </ChartCard>

          {/* Tyre Strategy */}
          <ChartCard id="card-tyre" span="span-8" label="CHART 06 · STRATEGY" title="Tyre Strategy — 3D Live Compound"
            style={visibleCards['card-tyre'] ? undefined : {display:'none'}}>
            <div style={{display:'flex', gap:'6px', marginBottom:'10px'}}>
              {Object.entries(COMPOUND_STYLES).map(([c, s]) => (
                <button
                  key={c}
                  className={`compound-btn${activeCompound === c ? ' active' : ''}`}
                  data-compound={c}
                  style={s}
                  onClick={() => setActiveCompound(c)}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div id="tyre-layout">
              <canvas id="tyre-canvas" width="170" height="170" style={{flexShrink:0,display:'block'}} />
              <div id="tyre-strat-wrap" style={{flex:1,minWidth:0,height:'190px',position:'relative'}}>
                <canvas id="chartTyreStrat" style={{width:'100%',height:'100%'}} />
              </div>
            </div>
          </ChartCard>

          {/* 3D Cluster */}
          <ChartCard id="card-scatter3d" span="span-6" label="CHART 07 · CLUSTERING" title="Circuit Cluster 3D Scatter"
            style={visibleCards['card-scatter3d'] ? undefined : {display:'none'}}>
            <canvas id="scatter3d-canvas" style={{width:'100%',height:'250px',display:'block'}} />
          </ChartCard>

          {/* Radar */}
          <ChartCard id="card-radar" span="span-6" label="CHART 08 · PROFILE" title="Circuit Profile Radar"
            style={visibleCards['card-radar'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartRadar" style={{maxHeight:'270px'}} />
          </ChartCard>

          {/* Win Probability */}
          <ChartCard id="card-winprob" span="span-6" label="CHART 09 · PROBABILITY" title="Win Probability — Constructors"
            style={visibleCards['card-winprob'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartWinProb" />
          </ChartCard>

          {/* Features */}
          <ChartCard id="card-features" span="span-6" label="CHART 10 · BREAKDOWN" title="Driver Feature Breakdown"
            style={visibleCards['card-features'] ? undefined : {display:'none'}}>
            <canvas className="chart-canvas" id="chartFeatures" />
          </ChartCard>

          {/* Heatmap — BUG FIX 2: brighter colours applied in chartHelpers.js */}
          <ChartCard id="card-heatmap" span="span-12" label="CHART 11 · PERFORMANCE" title="Driver Performance Heatmap"
            style={visibleCards['card-heatmap'] ? undefined : {display:'none'}}>
            <div className="heatmap-grid" id="heatmap-grid" />
          </ChartCard>

          {/* Prediction */}
          <ChartCard id="card-predict" span="span-5" label="CHART 12 · PREDICTION" title="Race Prediction Confidence"
            style={visibleCards['card-predict'] ? undefined : {display:'none'}}>
            <div className="pred-list" id="pred-list" />
          </ChartCard>

          {/* Championship Points */}
          <ChartCard id="card-points" span="span-7" label="BONUS · SEASON DATA" title="Championship Points Progression">
            <canvas className="chart-canvas" id="chartPoints" />
          </ChartCard>

        </div>
      </section>
    </>
  );
};
