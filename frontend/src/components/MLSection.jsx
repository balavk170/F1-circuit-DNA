// src/components/MLSection.jsx
const { useEffect, useState } = React;

window.MLSection = function MLSection() {
  const [circuit, setCircuit] = useState('monaco');
  const [year, setYear] = useState('2023');
  const [conditions, setConditions] = useState('dry');
  const [algo, setAlgo] = useState('RF');

  async function runModel() {
    try {
      const qs = new URLSearchParams({ circuit, year, conditions, algorithm: algo });
      const resp = await fetch(`http://127.0.0.1:8000/ml/predict?${qs}`);
      if (!resp.ok) throw new Error('API Error');
      const data = await resp.json();

      const probs = data.predictions;

      // Pred list
      const list = document.getElementById('ml-pred-list');
      if (list) {
        list.innerHTML = '';
        const bcols=['#f5e642','rgba(255,255,255,.65)','#ff6b00','#00f5ff','#39ff14','#bf5fff','#ff0090','#ff6b00'];
        probs.slice(0,6).forEach((p,i) => {
          const pct = (p.prob*100).toFixed(1);
          const item = document.createElement('div'); item.className='pred-item';
          item.innerHTML=`<div class="pred-pos ${i<3?'p'+(i+1):''}">${i+1}</div>
            <div class="pred-driver"><div class="pred-name">${p.driver}</div></div>
            <div class="pred-bar-wrap"><div class="pred-bar" style="width:0%;background:${bcols[i]}" data-pct="${pct}"></div></div>
            <div class="pred-pct" style="color:${bcols[i]}">${pct}%</div>`;
          list.appendChild(item);
        });
        setTimeout(() => list.querySelectorAll('.pred-bar').forEach(b => b.style.width=b.dataset.pct+'%'), 100);
      }

      // Lap chart
      const laps = data.laps;
      const top3_probs = probs.slice(0,3);
      const lapData = data.lapTraces.slice(0,3).map(t => t.data);
      buildMLChart(laps, top3_probs, lapData);

      // Metrics
      const metrics = document.getElementById('ml-metrics');
      if (metrics) {
        metrics.innerHTML =
          `<div class="hstat"><div class="hstat-val" style="font-size:19px">${data.accuracy}%</div><div class="hstat-lbl">MODEL ACCURACY</div></div>
           <div class="hstat"><div class="hstat-val" style="font-size:19px;color:var(--ny)">${data.algorithm}</div><div class="hstat-lbl">ALGORITHM</div></div>
           <div class="hstat"><div class="hstat-val" style="font-size:19px;color:var(--ng)">${laps.length}</div><div class="hstat-lbl">RACE LAPS</div></div>
           <div class="hstat"><div class="hstat-val" style="font-size:19px;color:var(--no)">${data.conditions.toUpperCase()}</div><div class="hstat-lbl">CONDITIONS</div></div>
           <div class="hstat"><div class="hstat-val" style="font-size:19px;color:var(--npu)">${data.year}</div><div class="hstat-lbl">SEASON YEAR</div></div>
           <div class="hstat"><div class="hstat-val" style="font-size:19px;color:var(--np)">${probs[0].driver}</div><div class="hstat-lbl">PREDICTED WINNER</div></div>`;
      }
    } catch (err) {
      console.error('ML Predict failed:', err);
      const list = document.getElementById('ml-pred-list');
      if (list) list.innerHTML = `<div style="color:#ff0090;padding:10px;">Error running ML model. Is the backend running?</div>`;
    }
  }

  // Auto-run on mount
  useEffect(() => { setTimeout(runModel, 300); }, []);

  const algos = ['RF','LR','GB'];
  const algoLabels = {RF:'Random Forest',LR:'Logistic Reg.',GB:'Gradient Boost'};

  return (
    <section id="ml-section" style={{padding:'60px 72px 60px 36px', maxWidth:'1580px', margin:'0 auto'}}>
      <div className="section-header">
        <div className="section-tag">◈ MACHINE LEARNING ENGINE</div>
        <div className="section-title">Lap-by-Lap Win Probability Tracker</div>
      </div>
      <div className="chart-card" id="card-ml" style={{padding:'26px'}}>
        <div className="cc tl"/><div className="cc tr"/><div className="cc bl"/><div className="cc br"/>
        <div className="card-label">CHART 13 · ML ENGINE</div>
        <div className="card-title" style={{marginBottom:0}}>Race Win Probability Tracker</div>
        <div className="ml-controls" style={{marginTop:'14px'}}>
          <select className="ml-select" value={circuit} onChange={e => setCircuit(e.target.value)} id="ml-circuit">
            {['monaco','silverstone','monza','spa','suzuka'].map(k => (
              <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>
            ))}
          </select>
          <select className="ml-select" value={year} onChange={e => setYear(e.target.value)} id="ml-year">
            {['2023','2022','2021','2020','2019'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="ml-select" value={conditions} onChange={e => setConditions(e.target.value)} id="ml-conditions">
            {['dry','wet','mixed'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          {algos.map(a => (
            <button key={a} className={`algo-btn${algo===a?' active':''}`} data-algo={a} onClick={() => setAlgo(a)}>
              {algoLabels[a]}
            </button>
          ))}
          <button className="ml-btn" id="ml-run-btn" onClick={runModel}>▶ RUN MODEL</button>
        </div>
        <div id="ml-result" style={{display:'flex',gap:'20px',flexWrap:'wrap',alignItems:'flex-start',marginTop:'4px'}}>
          <div style={{flex:1,minWidth:'260px'}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'rgba(255,255,255,.38)',letterSpacing:'.12em',marginBottom:'8px'}}>PREDICTED ORDER</div>
            <div id="ml-pred-list" className="pred-list"/>
          </div>
          <div style={{flex:2,minWidth:'300px'}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'9px',color:'rgba(255,255,255,.38)',letterSpacing:'.12em',marginBottom:'8px'}}>LAP-BY-LAP WIN PROBABILITY</div>
            <div style={{height:'260px'}}><canvas id="chartMLLap"/></div>
          </div>
        </div>
        <div id="ml-metrics" style={{display:'flex',gap:'22px',marginTop:'14px',flexWrap:'wrap',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,.06)'}}/>
      </div>
    </section>
  );
};
