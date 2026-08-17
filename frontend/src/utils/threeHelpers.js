// src/utils/threeHelpers.js
// Three.js imperative scene builders — called from React useEffect hooks.

let heroScene, heroCamera, heroRenderer, heroAnimId;
let carGroup, sparkParticles, circuitCurve;
let heroMX=0, heroMY=0;

let tyreScene, tyreCamera, tyreRenderer, tyreAnimId, tyreMesh;
let scatterScene, scatterCamera, scatterRenderer, scatterAnimId;
let scatterTheta=.5, scatterPhi=1.0, scatterDrag=false, prevSX=0, prevSY=0;

function speedColorVec(t){
  const s=[[0,.27,1],[0,1,.53],[1,1,0],[1,.39,0]];
  const i=Math.min(Math.floor(t*3),2), f=t*3-i;
  const l=(a,b)=>a+(b-a)*f;
  return{r:l(s[i][0],s[i+1][0]),g:l(s[i][1],s[i+1][1]),b:l(s[i][2],s[i+1][2])};
}

function objMesh(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0){
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z); m.rotation.set(rx,ry,rz); return m;
}

/* ─── CAR ─────────────────────────────────────────────────────────────────── */
function buildCar(){
  const g=new THREE.Group();
  const body=new THREE.MeshPhongMaterial({color:0x0033cc,shininess:90});
  const acc=new THREE.MeshBasicMaterial({color:0xe10600});
  const dark=new THREE.MeshPhongMaterial({color:0x111111,shininess:20});
  g.add(objMesh(new THREE.BoxGeometry(.3,.065,.85),body,0,.045,0));
  g.add(objMesh(new THREE.CylinderGeometry(.022,.075,.38,6),body,0,.045,.59,0,0,Math.PI/2));
  g.add(objMesh(new THREE.TorusGeometry(.1,.01,4,16,Math.PI),new THREE.MeshBasicMaterial({color:0xcccc00}),0,.125,-.04,Math.PI/2,0,0));
  g.add(objMesh(new THREE.BoxGeometry(.55,.022,.15),acc,0,.015,.68));
  g.add(objMesh(new THREE.BoxGeometry(.46,.2,.04),acc,0,.12,-.58));
  [-1,1].forEach(s=>g.add(objMesh(new THREE.BoxGeometry(.09,.065,.42),body,s*.2,.045,0)));
  [[.2,.075,.34],[-.2,.075,.34],[.2,.075,-.3],[-.2,.075,-.3]].forEach(p=>{
    const w=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.065,12),dark);
    w.rotation.z=Math.PI/2; w.position.set(...p); g.add(w);
  });
  g.scale.setScalar(1.35);
  return g;
}

/* ─── HERO SCENE ─────────────────────────────────────────────────────────── */
function buildHeroScene(key, canvas){
  if(!canvas) return;
  const w=canvas.clientWidth||window.innerWidth;
  const h=canvas.clientHeight||window.innerHeight;
  const c=CIRCUITS[key];
  if(heroRenderer){ heroRenderer.dispose(); if(heroAnimId) cancelAnimationFrame(heroAnimId); }

  heroScene=new THREE.Scene();
  heroScene.fog=new THREE.FogExp2(0x03030a,.035);
  heroCamera=new THREE.PerspectiveCamera(60,w/h,.1,250);
  heroCamera.position.set(0,7,11); heroCamera.lookAt(0,0,0);
  heroRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  heroRenderer.setSize(w,h); heroRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  heroRenderer.setClearColor(0x000000,0);

  heroScene.add(new THREE.AmbientLight(0x112233,2.5));
  const dl=new THREE.DirectionalLight(0x00f5ff,1.2); dl.position.set(6,10,6); heroScene.add(dl);
  const pl=new THREE.PointLight(0xe10600,2,18); pl.position.set(0,4,0); heroScene.add(pl);

  // Stars
  const sPos=new Float32Array(3600); for(let i=0;i<3600;i++) sPos[i]=rand(-100,100);
  const sGeo=new THREE.BufferGeometry(); sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));
  heroScene.add(new THREE.Points(sGeo,new THREE.PointsMaterial({color:0xffffff,size:.07,transparent:true,opacity:.55})));

  // Circuit curve
  const pts=c.waypoints.map(p=>new THREE.Vector3(p[0]*2.4,p[1]*2.4,p[2]*2.4));
  circuitCurve=new THREE.CatmullRomCurve3(pts,true);
  const curvePts=circuitCurve.getPoints(220);

  // Road tube
  const tubeGeo=new THREE.TubeGeometry(circuitCurve,220,.2,8,true);
  heroScene.add(new THREE.Mesh(tubeGeo,new THREE.MeshPhongMaterial({color:0x181828,shininess:25,transparent:true,opacity:.95})));

  // Speed heatmap line
  const lPos=new Float32Array(curvePts.length*3), lCol=new Float32Array(curvePts.length*3);
  const speeds=c.speeds;
  curvePts.forEach((pt,i)=>{
    lPos[i*3]=pt.x; lPos[i*3+1]=pt.y+.24; lPos[i*3+2]=pt.z;
    const si=Math.floor(i/curvePts.length*speeds.length);
    const t=(speeds[si]-80)/(c.topSpeed-80);
    const cv2=speedColorVec(Math.max(0,Math.min(1,t)));
    lCol[i*3]=cv2.r; lCol[i*3+1]=cv2.g; lCol[i*3+2]=cv2.b;
  });
  const lGeo=new THREE.BufferGeometry();
  lGeo.setAttribute('position',new THREE.BufferAttribute(lPos,3));
  lGeo.setAttribute('color',new THREE.BufferAttribute(lCol,3));
  heroScene.add(new THREE.Line(lGeo,new THREE.LineBasicMaterial({vertexColors:true,linewidth:2})));

  // DRS zone markers
  for(let d=0;d<c.drs;d++){
    const pt=circuitCurve.getPoint(.15+d*.4);
    const bm=new THREE.Mesh(new THREE.BoxGeometry(.35,.05,.9),new THREE.MeshBasicMaterial({color:0x39ff14,transparent:true,opacity:.65}));
    bm.position.set(pt.x,pt.y+.3,pt.z); heroScene.add(bm);
  }

  // Kerbs
  for(let ki=0;ki<24;ki++){
    const t=ki/24, pt=circuitCurve.getPoint(t), tang=circuitCurve.getTangent(t);
    const norm=new THREE.Vector3(-tang.z,0,tang.x).normalize();
    for(let s=-1;s<=1;s+=2){
      const km=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.2),new THREE.MeshBasicMaterial({color:ki%2===0?0xff2222:0xffffff}));
      km.position.copy(pt).addScaledVector(norm,s*.3).setY(pt.y+.02); heroScene.add(km);
    }
  }

  heroScene.add(new THREE.GridHelper(30,30,0x0d1224,0x0d1224));

  carGroup=buildCar(); heroScene.add(carGroup);

  const spPos=new Float32Array(150); for(let i=0;i<150;i++) spPos[i]=rand(-.08,.08);
  const spGeo=new THREE.BufferGeometry(); spGeo.setAttribute('position',new THREE.BufferAttribute(spPos,3));
  sparkParticles=new THREE.Points(spGeo,new THREE.PointsMaterial({color:0xff6b00,size:.045,transparent:true,opacity:.88}));
  heroScene.add(sparkParticles);

  // Camera interaction
  let isDrag=false, isRightDrag=false, prevMX=0, prevMY=0, panX=0, panY=0;
  const DEFAULT_R=9, DEFAULT_THETA=0.4, DEFAULT_PHI=1.1;
  let localTheta=DEFAULT_THETA, localPhi=DEFAULT_PHI, localR=DEFAULT_R;

  canvas.addEventListener('mousedown',e=>{
    e.preventDefault();
    if(e.button===0) isDrag=true;
    if(e.button===2) isRightDrag=true;
    prevMX=e.clientX; prevMY=e.clientY;
  });
  window.addEventListener('mouseup',()=>{isDrag=false; isRightDrag=false;});
  window.addEventListener('mousemove',e=>{
    if(isDrag){ localTheta-=(e.clientX-prevMX)*.007; localPhi=Math.max(.15,Math.min(2.6,localPhi-(e.clientY-prevMY)*.007)); prevMX=e.clientX; prevMY=e.clientY; }
    else if(isRightDrag){ panX-=(e.clientX-prevMX)*.018; panY+=(e.clientY-prevMY)*.012; prevMX=e.clientX; prevMY=e.clientY; }
  });
  canvas.addEventListener('wheel',e=>{ e.preventDefault(); localR=Math.max(2.5,Math.min(28,localR+e.deltaY*.018)); },{passive:false});
  canvas.addEventListener('dblclick',()=>{ localTheta=DEFAULT_THETA; localPhi=DEFAULT_PHI; localR=DEFAULT_R; panX=0; panY=0; });
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    heroMX=(e.clientX-r.width/2)/r.width*3; heroMY=(e.clientY-r.height/2)/r.height*2;
  });

  let carT=0, t0=performance.now();
  function loop(){
    heroAnimId=requestAnimationFrame(loop);
    const now=performance.now(); const dt=(now-t0)/1000; t0=now;
    carT=(carT+dt*.028)%1;
    if(circuitCurve){
      const pos=circuitCurve.getPoint(carT), tang=circuitCurve.getTangent(carT);
      carGroup.position.copy(pos).add(new THREE.Vector3(0,.3,0));
      carGroup.lookAt(pos.clone().add(tang));
    }
    if(sparkParticles){
      sparkParticles.position.copy(carGroup.position).sub(new THREE.Vector3(0,.1,0));
      const sp=sparkParticles.geometry.attributes.position.array;
      for(let i=0;i<150;i+=3){
        sp[i]+=rand(-.035,.035); sp[i+1]+=rand(-.018,.008); sp[i+2]+=rand(-.035,.035);
        if(Math.abs(sp[i])>.28||Math.abs(sp[i+2])>.28){sp[i]=rand(-.04,.04);sp[i+1]=rand(0,.015);sp[i+2]=rand(-.04,.04);}
      }
      sparkParticles.geometry.attributes.position.needsUpdate=true;
    }
    if(!isDrag&&!isRightDrag) localTheta+=.0025;
    heroCamera.position.x=Math.sin(localTheta)*localR*Math.sin(localPhi)+panX+heroMX*.4;
    heroCamera.position.y=Math.cos(localPhi)*localR*.55+2.5+panY;
    heroCamera.position.z=Math.cos(localTheta)*localR*Math.sin(localPhi)+heroMY*.2;
    heroCamera.lookAt(panX,panY*.2,0);
    heroRenderer.render(heroScene,heroCamera);
  }
  loop();

  // Resize handler
  function onResize(){
    const w2=canvas.clientWidth||window.innerWidth, h2=canvas.clientHeight||window.innerHeight;
    heroCamera.aspect=w2/h2; heroCamera.updateProjectionMatrix(); heroRenderer.setSize(w2,h2);
  }
  window.addEventListener('resize', onResize);
  return ()=>{ window.removeEventListener('resize', onResize); if(heroAnimId) cancelAnimationFrame(heroAnimId); heroRenderer.dispose(); };
}
window.buildHeroScene = buildHeroScene;

/* ─── TYRE SCENE ─────────────────────────────────────────────────────────── */
function buildTyreScene(compound){
  const canvas=document.getElementById('tyre-canvas');
  if(!canvas) return;
  if(tyreRenderer){ tyreRenderer.dispose(); if(tyreAnimId) cancelAnimationFrame(tyreAnimId); }
  tyreScene=new THREE.Scene();
  tyreCamera=new THREE.PerspectiveCamera(45,1,.1,50);
  tyreCamera.position.set(0,0,3.8); tyreCamera.lookAt(0,0,0);
  tyreRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  tyreRenderer.setSize(170,170); tyreRenderer.setClearColor(0x000000,0);
  tyreScene.add(new THREE.AmbientLight(0xffffff,1.8));
  const dl2=new THREE.DirectionalLight(0xffffff,1.4); dl2.position.set(3,5,5); tyreScene.add(dl2);

  tyreMesh=new THREE.Group(); tyreScene.add(tyreMesh);

  const compoundColors={soft:0xff2222,medium:0xf5e642,hard:0xeeeeee,inter:0x39ff14,wet:0x00f5ff};
  const col=compoundColors[compound]||0xffffff;

  if(compound==='soft'){
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.44,28,72),new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:55,specular:0x222222})));
    for(let i=0;i<14;i++){
      const ang=i/14*Math.PI*2;
      [-0.32,0,0.32].forEach(off=>{
        const bl=new THREE.Mesh(new THREE.BoxGeometry(.06,.07,.28),new THREE.MeshBasicMaterial({color:0x303030}));
        bl.position.set(off,Math.cos(ang)*.96,Math.sin(ang)*.96); bl.rotation.z=ang; tyreMesh.add(bl);
      });
    }
    for(let gi=0;gi<4;gi++){
      const off=-0.27+gi*.18;
      const gr=new THREE.Mesh(new THREE.TorusGeometry(1.01,.03,6,72),new THREE.MeshBasicMaterial({color:0x080808}));
      gr.position.set(off,0,0); gr.rotation.y=Math.PI/2; tyreMesh.add(gr);
    }
    tyreMesh.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(1,.07,8,72),new THREE.MeshBasicMaterial({color:col}))));
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.54,.54,.55,24),new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:90}));
    rim.rotation.x=Math.PI/2; tyreMesh.add(rim);
  } else if(compound==='medium'){
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.46,28,72),new THREE.MeshPhongMaterial({color:0x1e1e1e,shininess:40})));
    for(let gi=0;gi<5;gi++){
      const off=-0.36+gi*.18;
      const gr=new THREE.Mesh(new THREE.TorusGeometry(1.01,.025,6,72),new THREE.MeshBasicMaterial({color:0x080808}));
      gr.position.set(off,0,0); gr.rotation.y=Math.PI/2; tyreMesh.add(gr);
    }
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.07,8,72),new THREE.MeshBasicMaterial({color:col})));
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.54,.54,.55,24),new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:90}));
    rim.rotation.x=Math.PI/2; tyreMesh.add(rim);
  } else if(compound==='hard'){
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.47,28,72),new THREE.MeshPhongMaterial({color:0x2a2a2a,shininess:30})));
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.065,8,72),new THREE.MeshBasicMaterial({color:col})));
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.6,24),new THREE.MeshPhongMaterial({color:0x444444,shininess:100}));
    rim.rotation.x=Math.PI/2; tyreMesh.add(rim);
  } else if(compound==='inter'){
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.43,28,72),new THREE.MeshPhongMaterial({color:0x111a11,shininess:40})));
    [-0.12,0.12].forEach(off=>{
      const stripe=new THREE.Mesh(new THREE.TorusGeometry(1,.035,8,72),new THREE.MeshBasicMaterial({color:col}));
      stripe.position.set(off,0,0); stripe.rotation.y=Math.PI/2; tyreMesh.add(stripe);
    });
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.53,.53,.54,24),new THREE.MeshPhongMaterial({color:0x0d1a0d,shininess:70}));
    rim.rotation.x=Math.PI/2; tyreMesh.add(rim);
  } else {
    tyreMesh.add(new THREE.Mesh(new THREE.TorusGeometry(1,.46,28,72),new THREE.MeshPhongMaterial({color:0x0a1520,shininess:60})));
    [-0.06,0.06].forEach(off=>{
      const stripe=new THREE.Mesh(new THREE.TorusGeometry(1,.04,8,72),new THREE.MeshBasicMaterial({color:col}));
      stripe.position.set(off,0,0); stripe.rotation.y=Math.PI/2; tyreMesh.add(stripe);
    });
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.54,.54,.58,24),new THREE.MeshPhongMaterial({color:0x0a1428,shininess:110}));
    rim.rotation.x=Math.PI/2; tyreMesh.add(rim);
  }

  function loop(){
    tyreAnimId=requestAnimationFrame(loop);
    tyreMesh.rotation.x+=.014; tyreMesh.rotation.y+=.005;
    tyreRenderer.render(tyreScene,tyreCamera);
  }
  loop();
}
window.buildTyreScene = buildTyreScene;

/* ─── 3D SCATTER SCENE ───────────────────────────────────────────────────── */
function buildScatterScene(){
  const canvas=document.getElementById('scatter3d-canvas');
  if(!canvas) return;
  const container=document.getElementById('card-scatter3d');
  const w=Math.max((canvas.parentElement||container).clientWidth-44||400,300), h=250;
  canvas.width=w; canvas.height=h;

  let labelCanvas=document.getElementById('scatter3d-labels');
  if(!labelCanvas){
    labelCanvas=document.createElement('canvas');
    labelCanvas.id='scatter3d-labels';
    labelCanvas.style.cssText='position:absolute;top:0;left:0;pointer-events:none;';
    canvas.parentNode.style.position='relative';
    canvas.parentNode.appendChild(labelCanvas);
  }
  labelCanvas.width=w; labelCanvas.height=h;
  labelCanvas.style.width=w+'px'; labelCanvas.style.height=h+'px';

  if(scatterRenderer){ scatterRenderer.dispose(); if(scatterAnimId) cancelAnimationFrame(scatterAnimId); }
  scatterScene=new THREE.Scene();
  scatterCamera=new THREE.PerspectiveCamera(55,w/h,.1,200);
  scatterCamera.position.set(8,5,8); scatterCamera.lookAt(0,0,0);
  scatterRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  scatterRenderer.setSize(w,h); scatterRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  scatterRenderer.setClearColor(0x000000,0);
  scatterScene.add(new THREE.AmbientLight(0x223344,3));
  const sdl=new THREE.DirectionalLight(0x00f5ff,1.2); sdl.position.set(5,8,5); scatterScene.add(sdl);

  const axMat=new THREE.LineBasicMaterial({color:0x223355});
  [[new THREE.Vector3(-5,0,0),new THREE.Vector3(5,0,0)],[new THREE.Vector3(0,-5,0),new THREE.Vector3(0,5,0)],[new THREE.Vector3(0,0,-5),new THREE.Vector3(0,0,5)]].forEach(([a,b])=>{
    scatterScene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),axMat));
  });
  [[0xe10600,new THREE.Vector3(5,0,0)],[0x39ff14,new THREE.Vector3(0,5,0)],[0x00f5ff,new THREE.Vector3(0,0,5)]].forEach(([c,pt])=>{
    const s=new THREE.Mesh(new THREE.SphereGeometry(.1,8,8),new THREE.MeshBasicMaterial({color:c}));
    s.position.copy(pt); scatterScene.add(s);
  });

  const circuitDefs={
    monaco:    {x:-3.5,y:0.0,z:3.5,col:0xff0090,hexStr:'#ff0090',label:'Monaco',sub:'Street · Low Speed'},
    silverstone:{x:1.5,y:-1.5,z:0.5,col:0x00f5ff,hexStr:'#00f5ff',label:'Silverstone',sub:'High Speed · Tech'},
    monza:     {x:3.8,y:-2.0,z:-3.0,col:0xff2222,hexStr:'#ff2222',label:'Monza',sub:'Power · Low Downforce'},
    spa:       {x:2.5,y:4.0,z:0.8,col:0x39ff14,hexStr:'#39ff14',label:'Spa',sub:'Full Mix · Elevation'},
    suzuka:    {x:0.8,y:-0.8,z:2.8,col:0xf5e642,hexStr:'#f5e642',label:'Suzuka',sub:'Technical · Figure-8'},
  };
  const spheres=[], labelAnchors=[];
  Object.values(circuitDefs).forEach(d=>{
    for(let s=0;s<5;s++){
      const sm=new THREE.Mesh(new THREE.SphereGeometry(s===4?.22:.13,10,10),
        new THREE.MeshPhongMaterial({color:d.col,shininess:90,emissive:d.col,emissiveIntensity:.28}));
      sm.position.set(d.x+rand(-.42,.42),d.y+rand(-.32,.32),d.z+rand(-.38,.38));
      scatterScene.add(sm); spheres.push(sm);
    }
    const hull=new THREE.Mesh(new THREE.SphereGeometry(.88,10,10),new THREE.MeshBasicMaterial({color:d.col,wireframe:true,transparent:true,opacity:.1}));
    hull.position.set(d.x,d.y,d.z); scatterScene.add(hull);
    labelAnchors.push({pos3d:new THREE.Vector3(d.x,d.y+1.2,d.z),label:d.label,sub:d.sub,hexStr:d.hexStr});
  });
  scatterScene.add(new THREE.GridHelper(14,14,0x0d1224,0x0d1224));

  function project(v){
    const vC=v.clone(); vC.project(scatterCamera);
    return{x:(vC.x*.5+.5)*w, y:(-.5*vC.y+.5)*h, visible:vC.z>-1&&vC.z<1};
  }
  const lctx=labelCanvas.getContext('2d');
  function drawLabels(){
    lctx.clearRect(0,0,w,h);
    labelAnchors.forEach(({pos3d,label,sub,hexStr})=>{
      const {x,y,visible}=project(pos3d);
      if(!visible||x<0||x>w||y<0||y>h) return;
      lctx.save(); lctx.shadowColor=hexStr; lctx.shadowBlur=10;
      lctx.beginPath(); lctx.arc(x,y,4,0,Math.PI*2); lctx.fillStyle=hexStr; lctx.fill(); lctx.restore();
      const bw=108, bh=34, bx=x+10, by=y-17;
      lctx.save(); lctx.globalAlpha=.82; lctx.fillStyle='rgba(3,3,14,.88)';
      lctx.beginPath(); if(lctx.roundRect) lctx.roundRect(bx,by,bw,bh,4); else lctx.rect(bx,by,bw,bh);
      lctx.fill(); lctx.strokeStyle=hexStr; lctx.lineWidth=1; lctx.globalAlpha=.5; lctx.stroke(); lctx.restore();
      lctx.save(); lctx.font="bold 11px 'Orbitron',monospace"; lctx.fillStyle=hexStr; lctx.shadowColor=hexStr; lctx.shadowBlur=6;
      lctx.fillText(label,bx+7,by+14); lctx.restore();
      lctx.save(); lctx.font="9px 'Share Tech Mono',monospace"; lctx.fillStyle='rgba(255,255,255,.5)';
      lctx.fillText(sub,bx+7,by+27); lctx.restore();
      lctx.save(); lctx.strokeStyle=hexStr; lctx.lineWidth=.5; lctx.globalAlpha=.35;
      lctx.beginPath(); lctx.moveTo(x+4,y); lctx.lineTo(bx,by+bh/2); lctx.stroke(); lctx.restore();
    });
    [{pos:new THREE.Vector3(5.5,0,0),text:'→ SPEED',col:'#e10600'},
     {pos:new THREE.Vector3(0,5.5,0),text:'↑ ELEVATION',col:'#39ff14'},
     {pos:new THREE.Vector3(0,0,5.5),text:'● TECHNICALITY',col:'#00f5ff'}].forEach(({pos,text,col})=>{
      const {x:ax,y:ay,visible}=project(pos); if(!visible) return;
      lctx.save(); lctx.font="bold 9px 'Share Tech Mono',monospace"; lctx.fillStyle=col; lctx.shadowColor=col; lctx.shadowBlur=4;
      lctx.fillText(text,ax-20,ay+4); lctx.restore();
    });
  }

  function loop(){
    scatterAnimId=requestAnimationFrame(loop);
    if(!scatterDrag) scatterTheta+=.004;
    const r=13;
    scatterCamera.position.x=Math.sin(scatterTheta)*r*Math.sin(scatterPhi);
    scatterCamera.position.y=Math.cos(scatterPhi)*r*.45+2;
    scatterCamera.position.z=Math.cos(scatterTheta)*r*Math.sin(scatterPhi);
    scatterCamera.lookAt(0,0,0);
    const t=performance.now()*.0018;
    spheres.forEach((s,i)=>s.scale.setScalar(1+.06*Math.sin(t+i*.5)));
    scatterRenderer.render(scatterScene,scatterCamera);
    drawLabels();
  }
  loop();
  canvas.addEventListener('mousedown',e=>{scatterDrag=true; prevSX=e.clientX; prevSY=e.clientY;});
  window.addEventListener('mouseup',()=>scatterDrag=false);
  canvas.addEventListener('mousemove',e=>{
    if(!scatterDrag) return;
    scatterTheta-=(e.clientX-prevSX)*.009;
    scatterPhi=Math.max(.2,Math.min(2.8,scatterPhi-(e.clientY-prevSY)*.009));
    prevSX=e.clientX; prevSY=e.clientY;
  });
}
window.buildScatterScene = buildScatterScene;
