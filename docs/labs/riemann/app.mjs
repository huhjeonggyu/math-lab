import {examples,bounds,integral,riemann,cutoffs,upperBounds,refinementCounts,math,fmt} from './math.mjs';
const $=id=>document.getElementById(id),motion=matchMedia('(prefers-reduced-motion: reduce)');
const state={example:examples[0],n:4,method:'left',spacing:'uniform',mode:'refine',boundary:2,speed:1,loop:true,playing:false,barFraction:.35};
let data,history,lastTick=0,holdUntil=0,areaMap=null;
const methodNames={left:'왼쪽',mid:'가운데',right:'오른쪽'};
for(const [kind,label] of [['finite','유한 구간 · 정적분'],['near','0 근처 · 이상적분'],['tail','무한 구간 · 이상적분']]){
 const group=document.createElement('p');group.className='group-label';group.textContent=label;$('examples').append(group);
 for(const example of examples.filter(e=>e.kind===kind)){
  const button=document.createElement('button');button.type='button';button.className='example-button';button.dataset.example=example.id;
  button.innerHTML=`<b>${example.name}</b><small>${example.description}</small>`;button.addEventListener('click',()=>selectExample(example));$('examples').append(button);
 }
}
function currentBounds(){return bounds(state.example,state.boundary);}
function spacing(){return state.example.kind==='finite'?'uniform':state.spacing;}
function boundaryValues(){return state.example.kind==='near'?cutoffs:upperBounds;}
function setPlaying(value){state.playing=value;lastTick=performance.now();holdUntil=0;$('play').textContent=value?'Ⅱ 일시정지':'▶ 재생';$('play').setAttribute('aria-pressed',String(value));}
function selectExample(example){
 state.example=example;state.n=example.kind==='finite'?4:64;state.boundary=2;state.mode='refine';state.spacing=example.kind==='finite'?'uniform':'geometric';state.barFraction=.35;
 for(const button of document.querySelectorAll('.example-button')){const selected=button.dataset.example===example.id;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));}
 $('example-name').textContent=example.name+' · '+example.interval;$('headline').textContent=example.headline;$('function-formula').innerHTML=math('<mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo></mrow><mo>=</mo>'+example.formula);
 $('mode-tabs').hidden=example.kind==='finite';$('boundary-control').hidden=example.kind==='finite';$('improper-result').hidden=example.kind==='finite';$('two-limits').hidden=example.kind==='finite';$('negative-legend').hidden=example.id!=='signed';
 $('boundary-mode').textContent=example.kind==='near'?'② ε를 0으로 보내기':'② R을 크게 늘리기';
 $('boundary').max=boundaryValues().length-1;$('boundary-end').textContent=example.kind==='near'?'0.001':'1,000';$('spacing').value=state.spacing;
 $('why').textContent=example.why;$('evidence').innerHTML=example.evidence;$('insight').textContent=example.insight;
 $('refinement-explanation').textContent=example.kind==='finite'?'이 예제의 함수는 닫힌 구간에서 연속이야. 구간을 고정하고 분할의 최대 폭 |P|를 0으로 보내면 표본점을 왼쪽·가운데·오른쪽 어디에서 잡아도 리만합은 같은 정적분으로 수렴해.':'ε > 0 또는 유한한 R을 고정하면, 현재 구간에서는 함수가 연속이고 유계야. 이 구간에서 분할의 최대 폭을 0으로 보내면 리만합은 유한한 정적분으로 수렴해. 전체 이상적분의 수렴과는 별개의 단계야.';
 $('reason-number').textContent=example.kind==='finite'?'02 — 이 예제의 적분':'02 — 구간의 끝점을 움직이면';$('reason-title').textContent=example.kind==='finite'?'합이 향하는 값은 '+example.limitLabel+'.':example.limit===null?'현재 적분값 자체가 끝없이 커져.':'전체 구간에서도 유한한 값에 도달해.';
 $('improper-result').classList.toggle('divergent',example.limit===null);$('full-result').textContent=example.limit===null?'∞로 발산':example.limitLabel+'로 수렴';
 updateModeUI();rebuildHistory();setPlaying(!motion.matches);render();
}
function updateModeUI(){
 $('refine-mode').setAttribute('aria-pressed',String(state.mode==='refine'));$('boundary-mode').setAttribute('aria-pressed',String(state.mode==='boundary'));
 $('trend-title').textContent=state.mode==='refine'?'같은 값으로 다가가기':'구간을 되돌려 보기';
 $('trend-legend').innerHTML=state.mode==='refine'?'<span class="blue-text">● 리만합 Aₙ</span><span class="green-text">┄ 현재 적분 I</span>':'<span class="blue-text">● 리만합 Aₙ</span><span class="green-text">● 정확한 적분 I</span>';
 $('trend-note').textContent=state.mode==='refine'?'가로축은 N의 로그 눈금이야. 점선은 현재 고정된 구간의 적분값이야.':'N을 고정해 두었어. 두 곡선의 간격은 현재 분할의 근사 오차야.';
}
function rebuildHistory(){
 const [a,b]=currentBounds(),example=state.example;
 if(state.mode==='refine')history=refinementCounts.map(n=>({n,value:riemann(example,a,b,n,state.method,spacing()).value,exact:integral(example,a,b)}));
 else history=boundaryValues().map((v,index)=>{const [lo,hi]=bounds(example,index);return {index,value:riemann(example,lo,hi,state.n,state.method,spacing()).value,exact:integral(example,lo,hi)};});
}
function render(){
 const example=state.example,[a,b]=currentBounds();data=riemann(example,a,b,state.n,state.method,spacing());const exact=integral(example,a,b);
 $('count').value=state.n;$('count-value').textContent=state.n;$('boundary').value=state.boundary;
 $('sum-value').textContent=fmt(data.value);$('integral-value').textContent=fmt(exact);$('error-value').textContent=fmt(Math.abs(data.value-exact));
 $('sample-label').textContent=methodNames[state.method]+' 표본점 · '+state.n+'개 직사각형';$('mesh-value').textContent='최대 폭 |P| = '+fmt(data.mesh);
 const interval=example.kind==='finite'?example.interval:'['+fmt(a,3)+', '+fmt(b,3)+']';$('interval-badge').textContent=interval;$('exact-interval').textContent='적분 구간 '+interval;
 $('boundary-label').innerHTML=example.kind==='near'?'잘라낸 끝점 <b>ε = '+fmt(a)+'</b>':'오른쪽 끝점 <b>R = '+fmt(b)+'</b>';
 $('mode-explanation').textContent=state.mode==='refine'?'구간 '+interval+'은 고정. 분할 개수 N을 늘리며 직사각형의 최대 폭을 줄여.':'분할 개수 N = '+state.n+'은 고정. '+(example.kind==='near'?'ε를 줄이며 0 근처의 넓이를 포함해.':'R을 늘리며 오른쪽 꼬리의 넓이를 포함해.');
 $('spacing-note').textContent=spacing()==='geometric'?'폭이 다른 분할 · 높이는 각 조각에서 선택':'모든 조각의 폭이 같아';
 $('axis-note').textContent=state.mode==='refine'?'분할 재생 중 축 고정 · 음수는 부호 있는 넓이로 합산':'구간이 바뀌면 넓이 그림의 축도 조정 · 오른쪽 추이 그래프의 축은 고정';
 if(example.kind!=='finite')$('cutoff-gap').textContent=example.limit===null?'분할을 아무리 늘려도 전체 이상적분의 발산은 바뀌지 않아.':'현재 구간 밖에 남은 정확한 적분 = '+fmt(example.limit-exact);
 $('step').disabled=state.mode==='refine'?state.n===512:state.boundary===boundaryValues().length-1;
 $('area-chart').setAttribute('aria-label',`${example.name}, ${interval}, N=${state.n}, ${methodNames[state.method]} 리만합 ${fmt(data.value)}, 정확한 적분 ${fmt(exact)}.`);
 drawArea();drawTrend();updateRectangle();
}
function setup(canvas){const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(w<10||h<10)return null;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.font='10px "Malgun Gothic",sans-serif';c.textBaseline='middle';return {c,w,h};}
function tickLabel(value){if(Math.abs(value)<1e-12)return '0';if(Math.abs(value)>=1e6)return (value/1e6).toFixed(1)+'M';if(Math.abs(value)>=1e4)return (value/1000).toFixed(0)+'k';return Number(value.toPrecision(3)).toString();}
function ticks(lo,hi){const raw=(hi-lo)/4,m=10**Math.floor(Math.log10(raw)),q=raw/m,step=(q<=1?1:q<=2?2:q<=2.5?2.5:q<=5?5:10)*m,out=[];for(let v=Math.ceil(lo/step)*step;v<hi+step*.01;v+=step)out.push(v);return out;}
function frame(c,box,lo,hi,xTicks,xMap,xLabel){
 const y=v=>box.bottom-(v-lo)*(box.bottom-box.top)/(hi-lo);
 c.lineWidth=1;c.textAlign='right';
 for(const value of ticks(lo,hi)){c.strokeStyle=Math.abs(value)<1e-12?'#bdcdbd':'#edf1e9';c.beginPath();c.moveTo(box.left,y(value));c.lineTo(box.right,y(value));c.stroke();c.fillStyle='#8a9a82';c.fillText(tickLabel(value),box.left-7,y(value));}
 c.textAlign='center';for(const value of xTicks){const p=xMap(value);c.strokeStyle='#f0f3ec';c.beginPath();c.moveTo(p,box.top);c.lineTo(p,box.bottom);c.stroke();c.fillStyle='#8a9a82';c.fillText(tickLabel(value),p,box.bottom+16);}
 c.textAlign='right';c.fillStyle='#97a58f';c.fillText(xLabel,box.right,box.bottom+31);return y;
}
function selectedBar(){return Math.min(data.rectangles.length-1,Math.floor(data.rectangles.length*state.barFraction));}
function updateRectangle(){const i=selectedBar(),bar=data.rectangles[i];$('rectangle-label').textContent='한 조각의 넓이 · i = '+(i+1);$('width-value').textContent=fmt(bar.width);$('height-value').textContent=fmt(bar.height);$('area-value').textContent=fmt(bar.area);}
function drawArea(){
 const canvas=$('area-chart'),s=setup(canvas);if(!s||!data)return;const {c,w,h}=s,[a,b]=currentBounds(),example=state.example;
 const box={left:47,right:w-15,top:21,bottom:h-39},[vmin,vmax]=example.range(a,b),span=vmax-vmin||1,lo=vmin-.09*span,hi=vmax+.13*span;
 const x=v=>box.left+(v-a)*(box.right-box.left)/(b-a),y=frame(c,box,lo,hi,[a,a+(b-a)/4,a+(b-a)/2,a+3*(b-a)/4,b],x,'x');
 areaMap={box,a,b};c.save();c.beginPath();c.rect(box.left,box.top,box.right-box.left,box.bottom-box.top);c.clip();
 for(const bar of data.rectangles){const yy=y(bar.height),zero=y(0),width=x(bar.right)-x(bar.left);c.fillStyle=bar.area>=0?'rgba(38,121,163,.24)':'rgba(198,106,57,.28)';c.fillRect(x(bar.left),Math.min(yy,zero),width,Math.abs(yy-zero));c.strokeStyle=bar.area>=0?'rgba(38,121,163,.65)':'rgba(198,106,57,.7)';c.lineWidth=state.n<100?.8:.4;c.strokeRect(x(bar.left),Math.min(yy,zero),width,Math.abs(yy-zero));}
 c.beginPath();c.strokeStyle='#3e7958';c.lineWidth=2;
 for(let i=0;i<=700;i++){const v=a+(b-a)*i/700,value=example.f(v);if(i===0)c.moveTo(x(v),y(value));else c.lineTo(x(v),y(value));}c.stroke();
 if(state.n<=64){c.fillStyle='#2d7492';for(const bar of data.rectangles){c.beginPath();c.arc(x(bar.sample),y(bar.height),1.8,0,Math.PI*2);c.fill();}}
 const selected=data.rectangles[selectedBar()];c.strokeStyle='#b28a35';c.lineWidth=2;c.strokeRect(x(selected.left),Math.min(y(selected.height),y(0)),x(selected.right)-x(selected.left),Math.abs(y(selected.height)-y(0)));
 c.restore();c.textAlign='left';c.fillStyle='#487b5e';c.fillText('f(x)',box.left-30,10);
}
function drawTrend(){
 const s=setup($('trend-chart'));if(!s||!history?.length)return;const {c,w,h}=s,box={left:41,right:w-17,top:23,bottom:h-40};
 const [a,b]=currentBounds(),exact=integral(state.example,a,b);let low=Math.min(...history.map(p=>Math.min(p.value,p.exact))),high=Math.max(...history.map(p=>Math.max(p.value,p.exact)));
 if(state.mode==='boundary'&&state.example.limit!==null){low=Math.min(low,state.example.limit);high=Math.max(high,state.example.limit);}
 const span=Math.max(high-low,Math.abs(exact)*.08,.1);low-=span*.18;high+=span*.23;
 const x=state.mode==='refine'?n=>box.left+(Math.log2(n)-2)/7*(box.right-box.left):i=>box.left+i/(history.length-1)*(box.right-box.left);
 let y;
 if(state.mode==='refine')y=frame(c,box,low,high,[4,16,64,256],x,'N (로그 눈금)');
 else {
  y=frame(c,box,low,high,[],x,state.example.kind==='near'?'ε ↓ (단계)':'R ↑ (단계)');
  c.textAlign='center';c.fillStyle='#8a9a82';for(const i of [0,Math.floor((history.length-1)/2),history.length-1])c.fillText(fmt(boundaryValues()[i],3),x(i),box.bottom+16);
 }
 const active=state.mode==='refine'?history.filter(p=>p.n<=state.n):history.filter(p=>p.index<=state.boundary);
 if(state.mode==='refine'&&!active.some(p=>p.n===state.n))active.push({n:state.n,value:data.value,exact});
 if(state.mode==='refine'||state.example.limit!==null){const target=state.mode==='refine'?exact:state.example.limit;c.setLineDash([4,4]);c.strokeStyle='#93ac81';c.lineWidth=1.2;c.beginPath();c.moveTo(box.left,y(target));c.lineTo(box.right,y(target));c.stroke();c.setLineDash([]);}
 for(const [key,color] of (state.mode==='boundary'?[['exact','#487b5e'],['value','#2679a3']]:[['value','#2679a3']])){
  c.strokeStyle=color;c.fillStyle=color;c.lineWidth=1.7;c.beginPath();active.forEach((p,i)=>{const xx=x(state.mode==='refine'?p.n:p.index),yy=y(p[key]);if(i===0)c.moveTo(xx,yy);else c.lineTo(xx,yy);});c.stroke();
  for(const p of active){c.beginPath();c.arc(x(state.mode==='refine'?p.n:p.index),y(p[key]),2.2,0,Math.PI*2);c.fill();}
 }
 c.fillStyle='#fff';c.strokeStyle='#2679a3';c.lineWidth=2;c.beginPath();c.arc(x(state.mode==='refine'?state.n:state.boundary),y(data.value),4,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='#6c8062';c.textAlign='left';c.fillText('리만합 / 적분',box.left-22,9);
}
function setMode(mode){state.mode=mode;if(mode==='boundary')state.boundary=0;updateModeUI();rebuildHistory();setPlaying(!motion.matches);render();}
function atEnd(){return state.mode==='refine'?state.n>=512:state.boundary>=boundaryValues().length-1;}
function advance(){if(state.mode==='refine')state.n=refinementCounts.find(n=>n>state.n)??512;else{state.boundary=Math.min(boundaryValues().length-1,state.boundary+1);}render();}
function restart(){if(state.mode==='refine')state.n=4;else state.boundary=0;lastTick=performance.now();holdUntil=0;render();}
$('refine-mode').addEventListener('click',()=>setMode('refine'));$('boundary-mode').addEventListener('click',()=>setMode('boundary'));
$('play').addEventListener('click',()=>{if(!state.playing&&atEnd())restart();setPlaying(!state.playing);});$('step').addEventListener('click',()=>{setPlaying(false);advance();});$('restart').addEventListener('click',restart);
$('count').addEventListener('input',e=>{setPlaying(false);state.n=Number(e.target.value);if(state.mode==='boundary')rebuildHistory();render();});
$('boundary').addEventListener('input',e=>{setPlaying(false);state.boundary=Number(e.target.value);if(state.mode==='refine')rebuildHistory();render();});
$('spacing').addEventListener('change',e=>{state.spacing=e.target.value;rebuildHistory();render();});
$('speed').addEventListener('change',e=>{state.speed=Number(e.target.value);lastTick=performance.now();});$('loop').addEventListener('change',e=>{state.loop=e.target.checked;});
for(const button of document.querySelectorAll('[data-method]'))button.addEventListener('click',()=>{state.method=button.dataset.method;for(const other of document.querySelectorAll('[data-method]'))other.setAttribute('aria-pressed',String(other===button));rebuildHistory();render();});
$('area-chart').addEventListener('click',e=>{if(!areaMap)return;const rect=e.currentTarget.getBoundingClientRect(),{a,b,box}=areaMap,value=a+(e.clientX-rect.left-box.left)/(box.right-box.left)*(b-a);let index=data.rectangles.findIndex(bar=>value<=bar.right);if(index<0)index=state.n-1;state.barFraction=(index+.5)/state.n;setPlaying(false);drawArea();updateRectangle();});
const observer=new ResizeObserver(()=>{if(data){drawArea();drawTrend();}});observer.observe($('area-chart'));observer.observe($('trend-chart'));
motion.addEventListener('change',()=>{if(motion.matches)setPlaying(false);});document.addEventListener('visibilitychange',()=>{lastTick=performance.now();holdUntil=0;});
function animate(t){if(state.playing&&!document.hidden){if(atEnd()){if(!state.loop)setPlaying(false);else if(!holdUntil)holdUntil=t+1500;else if(t>=holdUntil)restart();}else if(t-lastTick>=(state.mode==='refine'?200:950)/state.speed){advance();lastTick=t;}}requestAnimationFrame(animate);}
selectExample(examples[0]);requestAnimationFrame(animate);
