import {presets,target,partial,converges,gibbsPeak} from './math.mjs';
const $=id=>document.getElementById(id), canvas=$('plot'),ctx=canvas.getContext('2d');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const state={id:'sine',n:1,playing:!reduced.matches,speed:1,loop:true,view:1,x:2,last:0};
let width=0,height=0,bounds=null,cached=null;
const colors={partial:'#087e79',target:'#606a73',grid:'#edf0e9',axis:'#9ba49f',label:'#7b8584',band:'rgba(175,205,140,.14)',boundary:'#90ae76',probe:'#be643e'};
function range(){const p=presets[state.id];return [p.range[0]*state.view,p.range[1]*state.view];}
function format(x){
  if(x===null||!Number.isFinite(x))return '—';
  if(Math.abs(x)<1e-12)return '0.000000';
  if(Math.abs(x)>=1e5||Math.abs(x)<1e-5)return x.toExponential(3);
  return x.toFixed(6).replace(/-0\.000000/,'0.000000');
}
function tickStep(span,count){const raw=span/count,base=10**Math.floor(Math.log10(raw)),v=raw/base;return (v<=1?1:v<=2?2:v<=5?5:10)*base;}
function tickLabel(v){return Math.abs(v)<1e-8?'0':Number(v.toFixed(3)).toString();}
function prepare(){
  const p=presets[state.id],[xmin,xmax]=range(),[ymin,ymax]=p.yrange;
  bounds={left:width<420?36:43,right:width-14,top:20,bottom:height-32,xmin,xmax,ymin,ymax};
  const count=Math.max(500,Math.floor(width*1.5));
  const xs=Array.from({length:count+1},(_,i)=>xmin+(xmax-xmin)*i/count);
  // Include jump points and nearby extrema even on a narrow mobile canvas.
  if(state.id==='fourier')for(let k=Math.ceil(xmin/Math.PI);k<=Math.floor(xmax/Math.PI);k++)for(const delta of [-Math.PI/(2*state.n),0,Math.PI/(2*state.n)]){const x=k*Math.PI+delta;if(x>=xmin&&x<=xmax)xs.push(x);}
  cached=xs.sort((a,b)=>a-b).map(x=>({x,f:target(state.id,x),s:partial(state.id,x,state.n)}));
}
function draw(){
  if(!width||!height)return;
  if(!cached)prepare();
  const b=bounds,p=presets[state.id],w=b.right-b.left,h=b.bottom-b.top;
  const px=x=>b.left+(x-b.xmin)/(b.xmax-b.xmin)*w,py=y=>b.bottom-(y-b.ymin)/(b.ymax-b.ymin)*h;
  ctx.clearRect(0,0,width,height);
  ctx.save();ctx.beginPath();ctx.rect(b.left,b.top,w,h);ctx.clip();
  if(p.interval){ctx.fillStyle=colors.band;ctx.fillRect(px(p.interval[0]),b.top,px(p.interval[1])-px(p.interval[0]),h);}
  const dx=tickStep(b.xmax-b.xmin,width<450?5:8),dy=tickStep(b.ymax-b.ymin,6);
  ctx.strokeStyle=colors.grid;ctx.lineWidth=1;ctx.beginPath();
  for(let x=Math.ceil(b.xmin/dx)*dx;x<=b.xmax;x+=dx){ctx.moveTo(px(x),b.top);ctx.lineTo(px(x),b.bottom);}
  for(let y=Math.ceil(b.ymin/dy)*dy;y<=b.ymax;y+=dy){ctx.moveTo(b.left,py(y));ctx.lineTo(b.right,py(y));}ctx.stroke();
  ctx.strokeStyle=colors.axis;ctx.beginPath();ctx.moveTo(px(0),b.top);ctx.lineTo(px(0),b.bottom);ctx.moveTo(b.left,py(0));ctx.lineTo(b.right,py(0));ctx.stroke();
  if(p.interval){ctx.setLineDash([3,5]);ctx.strokeStyle=colors.boundary;ctx.beginPath();p.interval.forEach(x=>{ctx.moveTo(px(x),b.top);ctx.lineTo(px(x),b.bottom);});ctx.stroke();ctx.setLineDash([]);}
  function curve(key,color,dash,lineWidth){
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dash);ctx.lineJoin='round';ctx.beginPath();let prev=null;
    for(const d of cached){
      const value=d[key];
      const discontinuity=key==='f'&&prev&&((state.id==='fourier'&&Math.abs(value-prev.value)>.7)||(state.id==='geometric'&&(d.x-1)*(prev.x-1)<=0));
      if(value===null||!Number.isFinite(value)){prev=null;continue;}
      const y=Math.max(b.ymin-2*(b.ymax-b.ymin),Math.min(b.ymax+2*(b.ymax-b.ymin),value));
      if(!prev||discontinuity)ctx.moveTo(px(d.x),py(y));else ctx.lineTo(px(d.x),py(y));
      prev={x:d.x,value};
    }ctx.stroke();ctx.setLineDash([]);
  }
  curve('f',colors.target,[5,5],1.6);curve('s',colors.partial,[],2.6);
  if(state.id==='fourier'){const peak=gibbsPeak(state.n);ctx.fillStyle=colors.probe;ctx.beginPath();ctx.arc(px(peak.x),py(peak.height),4,0,Math.PI*2);ctx.fill();}
  const sx=px(state.x);ctx.strokeStyle='#c3ccc7';ctx.setLineDash([2,5]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,b.top);ctx.lineTo(sx,b.bottom);ctx.stroke();ctx.setLineDash([]);
  [[target(state.id,state.x),colors.target],[partial(state.id,state.x,state.n),colors.partial]].forEach(([y,c])=>{
    if(y===null||!Number.isFinite(y)||y<b.ymin||y>b.ymax)return;ctx.fillStyle='#fff';ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx,py(y),4,0,Math.PI*2);ctx.fill();ctx.stroke();
  });ctx.restore();
  ctx.font='11px "Segoe UI", sans-serif';ctx.fillStyle=colors.label;ctx.textBaseline='middle';ctx.textAlign='center';
  for(let x=Math.ceil(b.xmin/dx)*dx;x<=b.xmax+1e-8;x+=dx)ctx.fillText(tickLabel(x),px(x),b.bottom+17);
  ctx.textAlign='right';for(let y=Math.ceil(b.ymin/dy)*dy;y<=b.ymax+1e-8;y+=dy)ctx.fillText(tickLabel(y),b.left-9,py(y));
  ctx.font='italic 12px Georgia, serif';ctx.textAlign='right';ctx.fillText('x',b.right+4,b.bottom+17);ctx.fillText('y',b.left-9,b.top-9);
}
function updateReadout(){
  const x=state.x,f=target(state.id,x),s=partial(state.id,x,state.n);
  $('x-value').textContent='x = '+x.toFixed(2);
  $('target-value').textContent=f===null?'정의되지 않음':format(f);
  $('partial-value').textContent=format(s);$('error-value').textContent=f===null?'—':format(Math.abs(s-f));
  const ok=converges(state.id,x);
  $('point-state').textContent=state.id==='fourier'?(Math.abs(Math.sin(x))<1e-10?'점프점: 좌우 평균 0으로 수렴':'이 고정된 점에서는 사각파 값으로 수렴'):ok?'수렴 구간 안의 점':'수렴 구간 밖의 점';
  $('point-state').style.color=ok?'#49776d':'#b65537';
  canvas.setAttribute('aria-label',`${presets[state.id].name}, ${state.n}개 항. x=${x.toFixed(3)}에서 함수값 ${f===null?'정의되지 않음':format(f)}, 부분합 ${format(s)}. ${$('point-state').textContent}.`);
}
function status(){
  $('play').textContent=state.playing?'Ⅱ 일시정지':'▶ 재생';
  $('play').setAttribute('aria-pressed',String(state.playing));
  $('play').setAttribute('aria-label',state.playing?'애니메이션 일시정지':'애니메이션 재생');
  $('frame-status').textContent=state.playing?'부분합을 재생하는 중':'멈춘 부분합을 살펴봐';
}
function setN(n,announce=false){
  state.n=Math.max(1,Math.min(presets[state.id].max,Math.round(n)));
  $('n-value').textContent=state.n;$('terms').value=state.n;cached=null;updateReadout();draw();
  if(state.id==='fourier'){const peak=gibbsPeak(state.n);$('gibbs-location').textContent=peak.x.toFixed(5);$('gibbs-height').textContent=peak.height.toFixed(5);$('gibbs-overshoot').textContent=peak.overshoot.toFixed(5);}
  if(announce)$('announcement').textContent=presets[state.id].name+', '+state.n+'개 항의 부분합';
}
function choose(id){
  state.id=id;const p=presets[id];state.n=1;state.x=p.probe;state.view=1;state.last=performance.now();state.playing=!reduced.matches;
  $('series-name').textContent=p.name;$('series-tag').textContent=p.tag;$('formula').innerHTML=p.formula;
  $('convergence').textContent=p.domain;$('hint').textContent=p.hint;$('detail').textContent=p.detail;
  $('terms').max=p.max;$('max-label').textContent='최대 '+p.max+'항';$('band-legend').hidden=!p.interval;
  $('gibbs').hidden=id!=='fourier';
  $('radius-note').textContent=id==='fourier'?'푸리에는 거듭제곱급수의 수렴 반지름을 쓰지 않아.':p.interval?'원점 중심 · 수렴 반지름 R = 1 · 끝점은 따로 확인해.':'원점 중심 · 수렴 반지름 R = ∞';
  $('view').value='1';updateProbeRange();status();setN(1);$('announcement').textContent=p.name+' 선택. '+p.domain;
}
function updateProbeRange(){const [lo,hi]=range();$('probe').min=lo;$('probe').max=hi;state.x=Math.max(lo,Math.min(hi,state.x));$('probe').value=state.x;}
$('preset').addEventListener('change',e=>choose(e.target.value));
$('play').addEventListener('click',()=>{state.playing=!state.playing;state.last=performance.now();status();});
$('step').addEventListener('click',()=>{state.playing=false;status();setN(state.n<presets[state.id].max?state.n+1:state.n,true);});
$('restart').addEventListener('click',()=>{state.last=performance.now();setN(1,true);});
$('terms').addEventListener('input',e=>{state.playing=false;status();setN(+e.target.value,true);});
$('speed').addEventListener('change',e=>{state.speed=+e.target.value;state.last=performance.now();});
$('loop').addEventListener('change',e=>state.loop=e.target.checked);
$('view').addEventListener('change',e=>{state.view=+e.target.value;updateProbeRange();cached=null;draw();updateReadout();});
$('probe').addEventListener('input',e=>{state.x=+e.target.value;draw();updateReadout();});
$('gibbs-probe').addEventListener('click',()=>{state.playing=false;status();state.x=gibbsPeak(state.n).x;$('probe').value=state.x;draw();updateReadout();$('x-value').textContent='x ≈ '+state.x.toFixed(5);});
canvas.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||!bounds)return;
  const r=canvas.getBoundingClientRect(),cx=e.clientX-r.left,b=bounds;
  if(cx<b.left||cx>b.right)return;
  state.x=+(b.xmin+(cx-b.left)/(b.right-b.left)*(b.xmax-b.xmin)).toFixed(2);
  $('probe').value=state.x;draw();updateReadout();
});
new ResizeObserver(entries=>{
  const r=entries[0].contentRect; width=r.width;height=r.height;const dpr=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);cached=null;draw();
}).observe(canvas.parentElement);
document.addEventListener('visibilitychange',()=>state.last=performance.now());
reduced.addEventListener('change',e=>{if(e.matches){state.playing=false;status();}});
function animate(now){
  if(state.playing&&!document.hidden){
    const duration=state.n===presets[state.id].max?1700:700/state.speed;
    if(now-state.last>=duration){
      if(state.n<presets[state.id].max)setN(state.n+1);
      else if(state.loop)setN(1);
      else {state.playing=false;status();}
      state.last=now;
    }
  }
  requestAnimationFrame(animate);
}
choose(state.id);requestAnimationFrame(animate);

const compact=window.matchMedia("(max-width: 760px)");
function layoutDetails(){ $("observation").open=!compact.matches; }
layoutDetails();compact.addEventListener("change",layoutDetails);
