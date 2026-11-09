import {functions,methods,buildModels,errorMetrics,fmt} from './math.mjs';
const $=id=>document.getElementById(id);
const ui={fn:$('function'),degree:$('degree'),center:$('center'),probe:$('probe'),nodes:$('nodes'),scale:$('scale'),play:$('play'),curve:$('curve'),error:$('error')};
let example=functions[0],models,metrics={},selected=new Set(['taylor','leastSquares']),running=false,last=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const presets={
 local:{fn:'runge',selected:['taylor','leastSquares'],degree:6,nodes:false,tip:'중심에서는 테일러가 정확해도, 구간 전체에서는 다른 결과가 나와. 차수를 올린 뒤 RMSE와 중심에서 먼 점의 오차를 비교해 봐.'},
 nodes:{fn:'runge',selected:['leastSquares','chebyshev'],degree:8,nodes:true,tip:'보라색 점에서는 체비쇼프 보간이 함수를 정확히 통과해. 최소제곱은 257개 점의 제곱오차 합을 줄이는 방법이야. 점 사이의 오차도 비교해 봐.'},
 pieces:{fn:'runge',selected:['leastSquares','spline'],degree:6,nodes:true,tip:'파란색은 구간 전체에서 다항식 하나, 초록색은 구간마다 3차 다항식이야. n을 늘리면 파란색의 차수와 초록색의 조각 수가 각각 늘어나.'},
 periodic:{fn:'sine',selected:['leastSquares','fourier'],degree:4,nodes:false,tip:'sin(πx)는 푸리에 기저에 이미 들어 있어. 함수 선택을 eˣ로 바꿔 보면, 양끝을 주기적으로 연결하는 것이 왜 중요한지 드러나.'}
};
let preset='local';
$('method-controls').innerHTML=methods.map(m=>`<label class="check" id="label-${m.id}"><input type="checkbox" value="${m.id}" ${selected.has(m.id)?'checked':''}><span class="swatch" style="background:${m.color}"></span>${m.name}</label>`).join('');
function stop(){running=false;ui.play.textContent='▶ 차수 늘려 보기';ui.play.setAttribute('aria-pressed','false');}
function clearPreset(){preset=null;document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function chosen(){return methods.filter(m=>selected.has(m.id)&&models[m.id]);}
function sizeLabel(id){const n=+ui.degree.value;return id==='spline'?`${n}개 구간 · 각 구간 3차`:id==='fourier'?`${n/2}차 주파수까지`:`${n}차 이하 다항식`;}
function updateModels(){
 example=functions.find(f=>f.id===ui.fn.value);
 if(example.id==='absolute')ui.center.value='0';
 ui.center.disabled=example.id==='absolute';
 models=buildModels(example,+ui.degree.value,+ui.center.value);
 for(const m of methods){const input=document.querySelector(`input[value="${m.id}"]`);input.disabled=!models[m.id];$('label-'+m.id).classList.toggle('disabled',!models[m.id]);input.checked=selected.has(m.id);if(models[m.id])metrics[m.id]=errorMetrics(example.f,models[m.id].evaluate);}
 $('degree-value').textContent=`n = ${ui.degree.value}`;
 $('center-value').textContent=`x₀ = ${Number(ui.center.value).toFixed(2).replace(/\.?0+$/,'')||'0'}`;
 $('size-note').textContent=`스플라인 ${ui.degree.value}개 구간 · 푸리에 ${+ui.degree.value/2}차까지 · 자유 계수 ${+ui.degree.value+1}개`;
 $('center-note').textContent=example.id==='absolute'?'이 예제는 원점의 꺾임을 보려고 x₀ = 0으로 고정해. 테일러 전개는 정의되지 않아.':example.id==='runge'?`현재 중심의 수렴 반지름 ≈ ${fmt(example.radius(+ui.center.value))}. 음영은 그 반지름 안의 구간이야.`:'테일러만 중심점을 바꿔. 이 함수의 테일러 급수는 모든 실수에서 수렴해.';
 $('formula').textContent=`f(x) = ${example.formula}`;
 $('observation').textContent=preset?presets[preset].tip:example.hint;
 updateValues();draw();
}
function updateValues(){
 const x=+ui.probe.value;$('probe-value').textContent=`x = ${x.toFixed(2)}`;
 $('true-value').textContent=`f(${x.toFixed(2)}) = ${fmt(example.f(x))}`;
 const visible=chosen();
 $('metrics').innerHTML=visible.length?visible.map(m=>`<tr data-method="${m.id}"><td><span class="dot" style="background:${m.color}"></span>${m.name}<small>${sizeLabel(m.id)}</small></td><td>${fmt(metrics[m.id].rmse)}</td><td>${fmt(metrics[m.id].max)}</td><td>${fmt(models[m.id].evaluate(x))}</td><td>${fmt(Math.abs(models[m.id].evaluate(x)-example.f(x)))}</td></tr>`).join(''):'<tr><td colspan="5">함께 볼 근사를 하나 이상 선택해 봐.</td></tr>';
}
function context(canvas){const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);return {c,w,h};}
function chart(canvas,lo,hi,isLog=false){
 const {c,w,h}=context(canvas),left=isLog?51:43,right=14,top=16,bottom=26,pw=w-left-right,ph=h-top-bottom;
 const x=v=>left+(v+1)/2*pw,y=v=>top+(hi-v)/(hi-lo)*ph;
 c.font='10px "Malgun Gothic", sans-serif';c.lineWidth=1;c.textAlign='center';c.textBaseline='top';
 for(const t of [-1,-.5,0,.5,1]){const px=x(t);c.strokeStyle='#edf0e9';c.beginPath();c.moveTo(px,top);c.lineTo(px,top+ph);c.stroke();c.fillStyle='#7a8b7a';c.fillText(String(t),px,top+ph+7);}
 c.textAlign='right';c.textBaseline='middle';
 const ticks=isLog?Array.from({length:5},(_,i)=>lo+i*(hi-lo)/4):Array.from({length:5},(_,i)=>lo+i*(hi-lo)/4);
 for(const v of ticks){const py=y(v);c.strokeStyle='#edf0e9';c.beginPath();c.moveTo(left,py);c.lineTo(left+pw,py);c.stroke();c.fillStyle='#7a8b7a';c.fillText(isLog?`1e${Math.round(v)}`:tick(v),left-7,py);}
 if(!isLog&&lo<=0&&hi>=0){c.strokeStyle='#c7d2c3';c.beginPath();c.moveTo(left,y(0));c.lineTo(left+pw,y(0));c.stroke();}
 c.save();c.beginPath();c.rect(left,top,pw,ph);c.clip();return {c,w,h,left,top,pw,ph,x,y,lo,hi};
}
function tick(v){if(Math.abs(v)<1e-10)return '0';if(Math.abs(v)>=1000||Math.abs(v)<.001)return v.toExponential(0);return Number(v.toPrecision(3)).toString();}
function line(chart,evaluate,color,dash=[],width=2){const {c,x,y}=chart;c.strokeStyle=color;c.setLineDash(dash);c.lineWidth=width;c.beginPath();for(let i=0;i<=800;i++){const v=-1+2*i/800,px=x(v),py=Math.max(-1e6,Math.min(1e6,y(evaluate(v))));if(i===0)c.moveTo(px,py);else c.lineTo(px,py);}c.stroke();c.setLineDash([]);}
function probeLine(chart){const {c,x,top,ph}=chart;c.lineWidth=1;c.strokeStyle='#809080';c.setLineDash([3,4]);c.beginPath();c.moveTo(x(+ui.probe.value),top);c.lineTo(x(+ui.probe.value),top+ph);c.stroke();c.setLineDash([]);}
function draw(){
 if(!models)return;
 let [lo,hi]=example.range;const visible=chosen();
 if(ui.scale.value==='all')for(const m of visible)for(let i=0;i<=800;i++){const value=models[m.id].evaluate(-1+2*i/800);lo=Math.min(lo,value);hi=Math.max(hi,value);}
 const span=Math.max(.1,hi-lo);lo-=span*.12;hi+=span*.14;
 const p=chart(ui.curve,lo,hi);
 if(example.id==='runge'&&selected.has('taylor')){const center=+ui.center.value,r=example.radius(center);p.c.fillStyle='#c66a3910';p.c.fillRect(p.x(Math.max(-1,center-r)),p.top,p.x(Math.min(1,center+r))-p.x(Math.max(-1,center-r)),p.ph);}
 line(p,example.f,'#263b3b',[],2.8);
 for(const m of visible)line(p,models[m.id].evaluate,m.color,m.dash,1.9);
 if(ui.nodes.checked)for(const m of visible.filter(m=>m.id==='chebyshev'||m.id==='spline'))for(const node of models[m.id].nodes){p.c.fillStyle='white';p.c.strokeStyle=m.color;p.c.lineWidth=1.6;p.c.beginPath();p.c.arc(p.x(node),p.y(example.f(node)),3.4,0,2*Math.PI);p.c.fill();p.c.stroke();}
 if(selected.has('taylor')&&models.taylor){const cx=+ui.center.value;p.c.fillStyle='#c66a39';p.c.beginPath();p.c.arc(p.x(cx),p.y(example.f(cx)),4,0,2*Math.PI);p.c.fill();}
 probeLine(p);p.c.fillStyle='#263b3b';p.c.beginPath();p.c.arc(p.x(+ui.probe.value),p.y(example.f(+ui.probe.value)),3.5,0,2*Math.PI);p.c.fill();p.c.restore();
 const clipped=visible.filter(m=>Array.from({length:801},(_,i)=>models[m.id].evaluate(-1+i/400)).some(y=>y<lo||y>hi));
 $('clip-note').textContent=clipped.length?`${clipped.map(m=>m.name).join(', ')} 곡선 일부가 화면 밖에 있어. ‘선택한 곡선 모두’로 세로축을 바꿀 수 있어.`:ui.scale.value==='all'?'모든 곡선에 맞춰 세로축을 조절했어. 큰 값이 있으면 원래 함수가 납작해 보일 수 있어.':'같은 세로축에서 원래 함수와 근사를 비교해 봐.';
 // One fixed log scale across degrees makes growth visible; the table retains unclipped values.
 const logTop=example.id==='runge'?12:4,ep=chart(ui.error,-12,logTop,true);
 for(const m of visible)line(ep,x=>Math.max(-12,Math.log10(Math.max(1e-16,Math.abs(models[m.id].evaluate(x)-example.f(x))))),m.color,m.dash,1.8);
 probeLine(ep);ep.c.restore();
}
for(const control of [ui.fn,ui.degree,ui.center])control.addEventListener('input',()=>{stop();clearPreset();updateModels();});
ui.probe.addEventListener('input',()=>{updateValues();draw();});
ui.scale.addEventListener('change',draw);ui.nodes.addEventListener('change',draw);
$('method-controls').addEventListener('change',e=>{if(e.target.checked)selected.add(e.target.value);else selected.delete(e.target.value);clearPreset();$('observation').textContent=example.hint;updateValues();draw();});
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{stop();preset=button.dataset.preset;const value=presets[preset];ui.fn.value=value.fn;ui.degree.value=value.degree;ui.center.value='0';ui.probe.value='.6';ui.scale.value='target';ui.nodes.checked=value.nodes;selected=new Set(value.selected);document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateModels();}));
ui.play.addEventListener('click',()=>{if(running){stop();return;}if(+ui.degree.value===16){ui.degree.value='2';updateModels();}running=true;last=performance.now();ui.play.textContent='Ⅱ 잠깐 멈추기';ui.play.setAttribute('aria-pressed','true');});
function frame(t){if(running&&!document.hidden&&t-last>=1400){last=t;ui.degree.value=String(Math.min(16,+ui.degree.value+2));updateModels();if(+ui.degree.value===16)stop();}requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
const observer=new ResizeObserver(draw);observer.observe(ui.curve);observer.observe(ui.error);
updateModels();requestAnimationFrame(frame);
