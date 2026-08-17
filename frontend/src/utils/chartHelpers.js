// src/utils/chartHelpers.js
// Chart.js chart builder functions — called imperatively from React useEffect hooks.

const chartInst = {};
window.chartInst = chartInst;

/* ─── Utils ─────────────────────────────────────────────────────────────── */
function rand(a,b){ return Math.random()*(b-a)+a; }
function lerp(a,b,t){ return a+(b-a)*t; }
window.rand = rand;
window.lerp = lerp;

function speedColor(t){
  const s=[[0,.27,1],[0,1,.53],[1,1,0],[1,.39,0]];
  const i=Math.min(Math.floor(t*3),2), f=t*3-i;
  const l=(a,b)=>a+(b-a)*f;
  return`rgb(${Math.round(l(s[i][0],s[i+1][0])*255)},${Math.round(l(s[i][1],s[i+1][1])*255)},${Math.round(l(s[i][2],s[i+1][2])*255)})`;
}
window.speedColor = speedColor;

function chartDefaults(){
  return{
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{labels:{color:'rgba(255,255,255,.45)',font:{family:"'Share Tech Mono',monospace",size:10},boxWidth:10,padding:8}},
      tooltip:{backgroundColor:'rgba(5,5,18,.95)',borderColor:'rgba(0,245,255,.18)',borderWidth:1,
        titleColor:'#00f5ff',bodyColor:'rgba(255,255,255,.75)',
        titleFont:{family:"'Orbitron',sans-serif",size:11},
        bodyFont:{family:"'Share Tech Mono',monospace",size:10}},
    },
    scales:{
      x:{ticks:{color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}},grid:{color:'rgba(255,255,255,.035)'}},
      y:{ticks:{color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}},grid:{color:'rgba(255,255,255,.035)'}},
    },
  };
}
window.chartDefaults = chartDefaults;

function destroyChart(id){
  if(chartInst[id]){ chartInst[id].destroy(); delete chartInst[id]; }
}
window.destroyChart = destroyChart;

/* ─── Speed ─────────────────────────────────────────────────────────────── */
function buildSpeedChart(c){
  destroyChart('speed');
  const n=c.waypoints.length;
  const dist=Array.from({length:n},(_,i)=>Math.round(i*c.length*1000/n));
  const base=Array.from({length:n},(_,i)=>c.speeds[Math.floor(i/n*c.speeds.length)]);
  const colors=['#00f5ff','#ff2222','#39ff14'];
  const labels2=['VER','LEC','HAM'];
  const datasets=labels2.map((l,li)=>({
    label:l, data:base.map(s=>+(s*rand(.94,1.06)+rand(-6,6)).toFixed(1)),
    borderColor:colors[li], backgroundColor:'transparent', borderWidth:1.5, pointRadius:0, tension:.45
  }));
  const opts=chartDefaults();
  opts.scales.x.title={display:true,text:'Distance (m)',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  opts.scales.y.title={display:true,text:'Speed (km/h)',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  const el=document.getElementById('chartSpeed');
  if(el) chartInst['speed']=new Chart(el.getContext('2d'),{type:'line',data:{labels:dist,datasets},options:opts});
}
window.buildSpeedChart = buildSpeedChart;

/* ─── Throttle ───────────────────────────────────────────────────────────── */
function buildThrottleChart(c){
  destroyChart('throttle');
  const n=36, labels=Array.from({length:n},(_,i)=>(i*c.length*1000/n|0)+'');
  const d=Array.from({length:n},()=>Math.max(0,Math.min(100,rand(45,100))));
  const el=document.getElementById('chartThrottle');
  if(el) chartInst['throttle']=new Chart(el.getContext('2d'),{
    type:'bar', data:{labels, datasets:[{label:'Throttle %', data:d,
      backgroundColor:d.map(v=>`rgba(57,255,20,${v/100})`),
      borderColor:'rgba(57,255,20,.25)', borderWidth:1, borderRadius:2}]},
    options:chartDefaults()
  });
}
window.buildThrottleChart = buildThrottleChart;

/* ─── Brake ──────────────────────────────────────────────────────────────── */
function buildBrakeChart(c){
  destroyChart('brake');
  const n=60;
  const labels=Array.from({length:n},(_,i)=>(i*c.length*1000/n|0));
  const cornerPoints=Array.from({length:c.corners},(_,ci)=>Math.round(ci/c.corners*n));
  const d=Array.from({length:n},(_,i)=>{
    let v=4+rand(0,8);
    for(let ci=0;ci<c.corners;ci++){if(Math.abs(i/n-ci/c.corners)<.045)v=Math.max(v,rand(55,100));}
    return +v.toFixed(1);
  });
  const pointBg=d.map((_,i)=>cornerPoints.some(cp=>Math.abs(i-cp)<2)?'rgba(255,0,144,.9)':'transparent');
  const pointR=d.map((_,i)=>cornerPoints.some(cp=>Math.abs(i-cp)<2)?4:0);
  const el=document.getElementById('chartBrake');
  if(el) chartInst['brake']=new Chart(el.getContext('2d'),{
    type:'line',
    data:{labels, datasets:[{label:'Brake %', data:d, borderColor:'#ff0090',
      backgroundColor:'rgba(255,0,144,.07)', fill:true, borderWidth:1.8,
      pointRadius:pointR, pointBackgroundColor:pointBg,
      pointBorderColor:'rgba(255,0,144,.6)', pointBorderWidth:1, tension:.12}]},
    options:chartDefaults()
  });
}
window.buildBrakeChart = buildBrakeChart;

/* ─── Brake Scatter ──────────────────────────────────────────────────────── */
function buildBrakeScatterChart(c){
  destroyChart('bscatter');
  const d=Array.from({length:40},()=>({x:+(rand(0,c.length*1000).toFixed(0)),y:+(rand(15,100).toFixed(1)),r:+(rand(3,11)).toFixed(1)}));
  const el=document.getElementById('chartBrakeScatter');
  if(el) chartInst['bscatter']=new Chart(el.getContext('2d'),{
    type:'bubble', data:{datasets:[{label:'Brake Events', data:d,
      backgroundColor:'rgba(255,0,144,.28)', borderColor:'rgba(255,0,144,.55)', borderWidth:1}]},
    options:chartDefaults()
  });
}
window.buildBrakeScatterChart = buildBrakeScatterChart;

/* ─── G-Force ────────────────────────────────────────────────────────────── */
function buildGforceChart(c){
  destroyChart('gforce');
  const n=55;
  const d=Array.from({length:n},()=>{
    const lat=rand(-4.2,4.2), lon=rand(-5.2,5.2);
    const spd=rand(80,c.topSpeed);
    return{x:+lat.toFixed(2),y:+lon.toFixed(2),r:Math.max(3,(spd-80)/38)};
  });
  const opts=chartDefaults();
  opts.scales.x.title={display:true,text:'Lateral G',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  opts.scales.y.title={display:true,text:'Longitudinal G',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  const el=document.getElementById('chartGforce');
  if(el) chartInst['gforce']=new Chart(el.getContext('2d'),{
    type:'bubble', data:{datasets:[{label:'G-Force', data:d,
      backgroundColor:d.map(p=>{const t=Math.hypot(p.x,p.y)/7;return speedColor(Math.min(t,1)).replace('rgb','rgba').replace(')',`,.35)`);}),
      borderColor:d.map(p=>speedColor(Math.min(Math.hypot(p.x,p.y)/7,1))), borderWidth:1}]},
    options:opts
  });
}
window.buildGforceChart = buildGforceChart;

/* ─── Tyre Strategy ──────────────────────────────────────────────────────── */
function buildTyreStratChart(c){
  destroyChart('tyre');
  const drvs=['VER','LEC','HAM','NOR','ALO'];
  const strats=[
    [['soft',15],['medium',25],['hard',c.laps-40]],
    [['medium',20],['hard',28],['soft',c.laps-48]],
    [['soft',12],['hard',30],['medium',c.laps-42]],
    [['soft',18],['medium',c.laps-18]],
    [['medium',25],['hard',c.laps-25]],
  ];
  const cmpCol={soft:'rgba(255,34,34,.8)',medium:'rgba(245,230,66,.8)',hard:'rgba(240,240,240,.8)',inter:'rgba(57,255,20,.8)',wet:'rgba(0,245,255,.8)'};
  const datasets=[];
  drvs.forEach((d,di)=>{
    let st=0;
    strats[di].forEach(([cp,lp])=>{
      datasets.push({label:`${d} ${cp.toUpperCase()}`, data:[{x:st,y:di},{x:st+lp,y:di}],
        borderColor:cmpCol[cp], borderWidth:9, pointRadius:0, showLine:true});
      st+=lp;
    });
  });
  const opts=chartDefaults();
  opts.plugins.legend={display:false};
  opts.scales.x.title={display:true,text:'Lap',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  opts.scales.x.min=0; opts.scales.x.max=c.laps;
  opts.scales.y.ticks={...opts.scales.y.ticks, callback:v=>drvs[v]||'', stepSize:1};
  opts.scales.y.min=-.5; opts.scales.y.max=4.5;
  const el=document.getElementById('chartTyreStrat');
  if(el) chartInst['tyre']=new Chart(el.getContext('2d'),{type:'scatter',data:{datasets},options:opts});
}
window.buildTyreStratChart = buildTyreStratChart;

/* ─── Radar ──────────────────────────────────────────────────────────────── */
function buildRadarChart(c, activeCircuit){
  destroyChart('radar');
  const labels=Object.keys(c.radar);
  const otherKey=CIRCUIT_KEYS.find(k=>k!==activeCircuit)||'monza';
  const other=CIRCUITS[otherKey];
  const el=document.getElementById('chartRadar');
  if(!el) return;
  chartInst['radar']=new Chart(el.getContext('2d'),{
    type:'radar',
    data:{labels, datasets:[
      {label:c.name.split(' ').pop(), data:Object.values(c.radar),
        borderColor:'#00f5ff', backgroundColor:'rgba(0,245,255,.07)',
        pointBackgroundColor:'#00f5ff', borderWidth:1.5, pointRadius:3},
      {label:other.name.split(' ').pop(), data:Object.values(other.radar),
        borderColor:'#ff0090', backgroundColor:'rgba(255,0,144,.05)',
        pointBackgroundColor:'#ff0090', borderWidth:1.5, pointRadius:3},
    ]},
    options:{...chartDefaults(),scales:{r:{
      ticks:{color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9},backdropColor:'transparent'},
      grid:{color:'rgba(255,255,255,.07)'}, angleLines:{color:'rgba(255,255,255,.07)'},
      pointLabels:{color:'rgba(255,255,255,.45)',font:{family:"'Share Tech Mono',monospace",size:9}},
    }}}
  });
}
window.buildRadarChart = buildRadarChart;

/* ─── Win Probability ────────────────────────────────────────────────────── */
function buildWinProbChart(c){
  destroyChart('winprob');
  const colors=['rgba(0,245,255,.7)','rgba(255,34,34,.7)','rgba(57,255,20,.7)','rgba(245,230,66,.7)','rgba(191,95,255,.7)'];
  const borders=['#00f5ff','#ff2222','#39ff14','#f5e642','#bf5fff'];
  const opts=chartDefaults(); opts.indexAxis='y'; opts.plugins.legend={display:false};
  opts.plugins.tooltip.callbacks={label:ctx=>`${ctx.parsed.x.toFixed(1)}%`};
  const el=document.getElementById('chartWinProb');
  if(el) chartInst['winprob']=new Chart(el.getContext('2d'),{
    type:'bar', data:{labels:c.constructors, datasets:[{label:'Win %', data:c.winProbs,
      backgroundColor:colors, borderColor:borders, borderWidth:1, borderRadius:4}]}, options:opts
  });
}
window.buildWinProbChart = buildWinProbChart;

/* ─── Features ───────────────────────────────────────────────────────────── */
function buildFeaturesChart(c){
  destroyChart('features');
  const drvs=c.drivers.slice(0,4);
  const feats=['Quali Pace','Race Pace','Tyre Mgmt','Wet Weather','Starts'];
  const cols=['#00f5ff','#ff2222','#39ff14','#f5e642'];
  const el=document.getElementById('chartFeatures');
  if(el) chartInst['features']=new Chart(el.getContext('2d'),{
    type:'bar',
    data:{labels:feats, datasets:drvs.map((d,i)=>({label:d,
      data:Array.from({length:5},()=>+(rand(62,98)).toFixed(1)),
      backgroundColor:`${cols[i]}28`, borderColor:cols[i], borderWidth:1.5, borderRadius:3}))},
    options:{...chartDefaults(), scales:{...chartDefaults().scales, y:{...chartDefaults().scales.y, min:50, max:100}}}
  });
}
window.buildFeaturesChart = buildFeaturesChart;

/* ─── Heatmap — BUG FIX: brighter HSL colour gradient ───────────────────── */
function buildHeatmap(){
  const grid=document.getElementById('heatmap-grid');
  if(!grid) return;
  grid.innerHTML='';
  const labels=CIRCUIT_LABELS;

  // Header row
  const blank=document.createElement('div');
  blank.className='hm-cell hm-header hm-label'; blank.textContent='DRIVER'; grid.appendChild(blank);
  labels.forEach(l=>{
    const h=document.createElement('div');
    h.className='hm-cell hm-header'; h.textContent=l.toUpperCase(); grid.appendChild(h);
  });

  ALL_DRIVERS.forEach(drv=>{
    const lbl=document.createElement('div');
    lbl.className='hm-cell hm-label'; lbl.textContent=drv.slice(0,3).toUpperCase(); grid.appendChild(lbl);
    labels.forEach(()=>{
      const sc=rand(52,99); const t=(sc-52)/47;
      // ── BRIGHTER HSL gradient: blue (240°) → green (120°) → yellow (60°) → red (0°)
      const hue   = Math.round(lerp(240, 0, t));
      const sat   = 95;
      const light = 48;
      const textLight = t > 0.45 ? 'rgba(0,0,0,.88)' : 'rgba(255,255,255,.95)';
      const cell=document.createElement('div'); cell.className='hm-cell';
      cell.style.cssText=`background:hsl(${hue},${sat}%,${light}%);color:${textLight};`;
      cell.innerHTML=`<span style="font-size:20px;font-weight:800;line-height:1">${Math.round(sc)}</span>`;
      if(sc>90) cell.innerHTML+=`<span style="position:absolute;top:4px;right:5px;font-size:10px;opacity:.9">★</span>`;
      grid.appendChild(cell);
    });
  });
}
window.buildHeatmap = buildHeatmap;

/* ─── Prediction List ────────────────────────────────────────────────────── */
function buildPredList(c){
  const list=document.getElementById('pred-list'); if(!list) return;
  list.innerHTML='';
  const preds=c.drivers.map((d,i)=>({name:d,team:c.teams[i],prob:Math.max(3,c.winProbs[i]+rand(-2,2))})).sort((a,b)=>b.prob-a.prob);
  const total=preds.reduce((s,p)=>s+p.prob,0);
  const bcols=['#f5e642','rgba(255,255,255,.65)','#ff6b00','#00f5ff','#39ff14'];
  preds.forEach((p,i)=>{
    const pct=(p.prob/total*100).toFixed(1);
    const item=document.createElement('div'); item.className='pred-item';
    item.innerHTML=`<div class="pred-pos ${i<3?'p'+(i+1):''}">${i+1}</div>
      <div class="pred-driver"><div class="pred-name">${p.name}</div><div class="pred-team">${p.team}</div></div>
      <div class="pred-bar-wrap"><div class="pred-bar" style="width:0%;background:${bcols[i]||'#666'}" data-pct="${pct}"></div></div>
      <div class="pred-pct" style="color:${bcols[i]||'#666'}">${pct}%</div>`;
    list.appendChild(item);
  });
  setTimeout(()=>list.querySelectorAll('.pred-bar').forEach(b=>b.style.width=b.dataset.pct+'%'),300);
}
window.buildPredList = buildPredList;

/* ─── Championship Points ────────────────────────────────────────────────── */
function buildPointsChart(){
  destroyChart('points');
  const races=Array.from({length:22},(_,i)=>`R${i+1}`);
  const drivers2=['Verstappen','Hamilton','Leclerc','Norris'];
  const cols2=['#00f5ff','#39ff14','#ff2222','#f5e642'];
  const datasets=drivers2.map((d,di)=>{
    let cum=0;
    const data=races.map(()=>{
      cum+=(di===0?rand(15,25):di===1?rand(8,20):di===2?rand(6,18):rand(5,15));
      return Math.round(cum);
    });
    return{label:d, data, borderColor:cols2[di], backgroundColor:'transparent',
      borderWidth:di===0?2:1.5, pointRadius:0, tension:.4};
  });
  const el=document.getElementById('chartPoints');
  if(el) chartInst['points']=new Chart(el.getContext('2d'),{
    type:'line', data:{labels:races, datasets}, options:chartDefaults()
  });
}
window.buildPointsChart = buildPointsChart;

/* ─── ML Chart ───────────────────────────────────────────────────────────── */
let mlChart=null;
function buildMLChart(laps, top3, lapData){
  if(mlChart){mlChart.destroy(); mlChart=null;}
  const lcols=['#f5e642','rgba(255,255,255,.65)','#ff6b00'];
  const opts=chartDefaults();
  opts.scales.x.title={display:true,text:'Lap',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  opts.scales.y.title={display:true,text:'Win Probability %',color:'rgba(255,255,255,.28)',font:{family:"'Share Tech Mono',monospace",size:9}};
  opts.scales.y.min=0; opts.scales.y.max=62;
  const el=document.getElementById('chartMLLap');
  if(el) mlChart=new Chart(el.getContext('2d'),{
    type:'line', data:{labels:laps, datasets:top3.map((p,i)=>({
      label:p.driver, data:lapData[i], borderColor:lcols[i],
      backgroundColor:'transparent', borderWidth:i===0?2:1.5,
      pointRadius:0, tension:.4, borderDash:i===2?[4,2]:[],
    }))}, options:opts
  });
}
window.buildMLChart = buildMLChart;

/* ─── Build All Charts ───────────────────────────────────────────────────── */
function buildAllCharts(key){
  const c=CIRCUITS[key];
  buildSpeedChart(c); buildThrottleChart(c); buildBrakeChart(c);
  buildBrakeScatterChart(c); buildGforceChart(c); buildTyreStratChart(c);
  buildRadarChart(c, key); buildWinProbChart(c); buildFeaturesChart(c);
  buildHeatmap(); buildPredList(c); buildPointsChart();
}
window.buildAllCharts = buildAllCharts;
