import {tr,initLanguage,restoredExperiment} from '../../assets/i18n.mjs';
import {examples,calculate,math,tailIndex,formatNumber as fmt} from './math.mjs?v=20261109-i18n';
const $=id=>document.getElementById(id);
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const state={example:examples[0],n:1,max:100,speed:1,playing:false,loop:true,band:false,epsilon:.1};
let data=calculate(state.example,state.max),lastTick=0,holdUntil=0;

for(const example of examples){
 const button=document.createElement('button');button.type='button';button.className='example-button';button.dataset.example=example.id;
 button.innerHTML=`<span class="name">${example.name}</span><span class="description">${example.short}</span>`;
 button.addEventListener('click',()=>selectExample(example));$('examples').append(button);
}

function play(value){
 state.playing=value;lastTick=performance.now();holdUntil=0;
 $('play').textContent=value?tr("Ⅱ 일시정지"):tr("▶ 재생");$('play').setAttribute('aria-pressed',String(value));
 $('play').setAttribute('aria-label',value?tr("애니메이션 일시정지"):tr("애니메이션 재생"));
}
function selectExample(example){
 state.example=example;state.n=1;data=calculate(example,state.max);
 $('harmonic-prediction').hidden=example.id!=='harmonic';
 $('prediction-reason').hidden=true;$('prediction-reveal').setAttribute('aria-expanded','false');
 $('prediction-response').textContent=tr("먼저 예상해 보고, 항을 늘리며 두 그래프를 비교해 봐.");
 document.querySelectorAll('[data-prediction]').forEach(b=>b.setAttribute('aria-pressed','false'));
 for(const button of document.querySelectorAll('.example-button')){
  const active=button.dataset.example===example.id;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 }
 $('example-name').textContent=example.name;$('headline').textContent=example.headline;
 $('term-formula').innerHTML=math('<msub><mi>a</mi><mi>n</mi></msub><mo>=</mo>'+example.expression);
 $('sequence-status').textContent=example.sequence;$('sequence-status').classList.toggle('diverge',example.seqLimit===null);
 $('series-status').textContent=example.series;$('series-status').classList.toggle('diverge',example.sumLimit===null);
 $('sequence-conclusion').textContent=example.sequence;
 $('series-conclusion').textContent=example.series+(example.sumKind==='absolute'?tr(" · 절대수렴"):example.sumKind==='conditional'?tr(" · 조건수렴"):'');
 $('sequence-why').textContent=example.sequenceWhy;$('series-why').textContent=example.seriesWhy;$('evidence').innerHTML=example.evidence;
 $('takeaway').textContent=example.takeaway;
 $('sequence-target').textContent=example.seqLimit===null?tr("유한한 극한 없음"):tr("점선: 극한 {0}", [fmt(example.seqLimit)]);
 $('series-target').textContent=example.sumLimit===null?tr("유한한 극한 없음"):tr("점선: 극한 {0}", [fmt(example.sumLimit)]);
 refreshBand();play(!motion.matches);render();
}
function refreshBand(){
 $('epsilon-control').hidden=!state.band;$('band-explanation').hidden=!state.band;
 for(const kind of ['sequence','series']){
  const el=$(kind+'-band-note'),threshold=tailIndex(state.example.id,kind,state.epsilon);
  el.hidden=!state.band;
  el.textContent=threshold===null?tr("유한한 극한이 없어 ε-띠를 그리지 않아."):tr("ε = {0} · n ≥ {1}이면 이후 모든 점이 띠 안에 있어.{2}", [state.epsilon, threshold, threshold>state.max?tr(" 관찰 범위를 늘려 봐."):'']);
 }
}
function render(){
 const n=state.n,term=data.terms[n],sum=data.sums[n],prev=data.sums[n-1];
 $('n-display').textContent=n;$('index-label').textContent=n;$('index').value=n;
 $('previous-value').textContent=fmt(prev);$('term-value').textContent=term<0?`(${fmt(term)})`:fmt(term);$('sum-value').textContent=fmt(sum);
 $('step').disabled=n>=state.max;
 $('sequence-chart').setAttribute('aria-label',tr("{0}: n={1}, 항 a_n={2}. {3}.", [state.example.name, n, fmt(term), state.example.sequence]));
 $('series-chart').setAttribute('aria-label',tr("{0}: n={1}, 부분합 S_n={2}. {3}.", [state.example.name, n, fmt(sum), state.example.series]));
 drawChart($('sequence-chart'),'sequence');drawChart($('series-chart'),'series');
}
function tickLabel(value){
 if(Math.abs(value)<1e-10)return '0';
 if(Math.abs(value)>=1000000)return (value/1e6).toFixed(1)+'M';
 if(Math.abs(value)>=10000)return (value/1000).toFixed(0)+'k';
 return Number(value.toPrecision(3)).toString();
}
function ticks(low,high,count=4){
 const raw=(high-low)/count,mag=10**Math.floor(Math.log10(raw)),ratio=raw/mag;
 const step=(ratio<=1?1:ratio<=2?2:ratio<=2.5?2.5:ratio<=5?5:10)*mag;
 const result=[];for(let v=Math.ceil(low/step)*step;v<=high+step*.01;v+=step)result.push(v);
 return result;
}
function drawChart(canvas,kind){
 const w=canvas.clientWidth,h=canvas.clientHeight;if(w<10||h<10)return;
 const ratio=Math.min(window.devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
 const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
 const a=kind==='sequence'?data.terms:data.sums,limit=kind==='sequence'?state.example.seqLimit:state.example.sumLimit;
 const color=kind==='sequence'?'#2679a3':'#c66a39';
 const box={left:45,right:w-15,top:27,bottom:h-36},pw=box.right-box.left,ph=box.bottom-box.top;
 let lo=0,hi=0;
 for(let i=1;i<=state.max;i++){lo=Math.min(lo,a[i]);hi=Math.max(hi,a[i]);}
 if(limit!==null){lo=Math.min(lo,limit-(state.band?state.epsilon:0));hi=Math.max(hi,limit+(state.band?state.epsilon:0));}
 const span=hi-lo||1;lo-=span*.12;hi+=span*.18;
 const x=k=>box.left+pw*k/state.max,y=v=>box.bottom-ph*(v-lo)/(hi-lo);
 ctx.font='10px "Malgun Gothic", sans-serif';ctx.textBaseline='middle';ctx.lineWidth=1;
 if(state.band&&limit!==null){
  ctx.fillStyle='#e5f0e3';ctx.fillRect(box.left,y(limit+state.epsilon),pw,y(limit-state.epsilon)-y(limit+state.epsilon));
  const threshold=tailIndex(state.example.id,kind,state.epsilon);
  if(threshold&&threshold<=state.max){
   ctx.strokeStyle='#a2b9a0';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x(threshold),box.top);ctx.lineTo(x(threshold),box.bottom);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#65805d';ctx.textAlign='left';ctx.fillText(`N₀=${threshold}`,Math.min(x(threshold)+4,box.right-40),box.top-11);
  }
 }
 for(const value of ticks(lo,hi)){
  ctx.strokeStyle=Math.abs(value)<1e-10?'#c4cec7':'#edf0eb';ctx.beginPath();ctx.moveTo(box.left,y(value));ctx.lineTo(box.right,y(value));ctx.stroke();
  ctx.fillStyle='#89978f';ctx.textAlign='right';ctx.fillText(tickLabel(value),box.left-7,y(value));
 }
 for(let i=0;i<=4;i++){
  const at=state.max*i/4;
  ctx.strokeStyle='#f0f2ee';ctx.beginPath();ctx.moveTo(x(at),box.top);ctx.lineTo(x(at),box.bottom);ctx.stroke();
  ctx.fillStyle='#89978f';ctx.textAlign='center';ctx.fillText(at.toLocaleString('en-US'),x(at),box.bottom+17);
 }
 ctx.fillStyle='#9aa69f';ctx.textAlign='right';ctx.fillText('n',box.right,box.bottom+31);
 if(limit!==null){
  ctx.setLineDash([4,4]);ctx.strokeStyle='#85a283';ctx.beginPath();ctx.moveTo(box.left,y(limit));ctx.lineTo(box.right,y(limit));ctx.stroke();ctx.setLineDash([]);
 }
 ctx.save();ctx.beginPath();ctx.rect(box.left-3,box.top-3,pw+6,ph+6);ctx.clip();
 // Lines are visual guides; the dots at integer indices are the sequence values.
 ctx.strokeStyle=color;ctx.globalAlpha=.3;ctx.lineWidth=1.1;ctx.beginPath();
 if(kind==='series')ctx.moveTo(x(0),y(0));
 for(let i=1;i<=state.n;i++){if(i===1&&kind==='sequence')ctx.moveTo(x(i),y(a[i]));else ctx.lineTo(x(i),y(a[i]));}ctx.stroke();
 if(state.max<=100){ctx.globalAlpha=.12;ctx.lineWidth=1;for(let i=1;i<=state.n;i++){ctx.beginPath();ctx.moveTo(x(i),y(0));ctx.lineTo(x(i),y(a[i]));ctx.stroke();}}
 ctx.globalAlpha=.8;ctx.fillStyle=color;
 const radius=state.max<=100?2.4:state.max<=500?1.5:1;
 for(let i=1;i<=state.n;i++){ctx.beginPath();ctx.arc(x(i),y(a[i]),radius,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;ctx.strokeStyle=color;ctx.fillStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x(state.n),y(a[state.n]),4.4,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
 const currentX=x(state.n);ctx.setLineDash([2,4]);ctx.strokeStyle=color;ctx.globalAlpha=.2;ctx.beginPath();ctx.moveTo(currentX,y(a[state.n])+7);ctx.lineTo(currentX,box.bottom);ctx.stroke();ctx.globalAlpha=1;ctx.setLineDash([]);
 ctx.fillStyle=color;ctx.textAlign='left';ctx.font='600 10px "Malgun Gothic", sans-serif';ctx.fillText(kind==='sequence'?'aₙ':'Sₙ',box.left-27,11);
}

$('play').addEventListener('click',()=>{
 if(!state.playing&&state.n===state.max){state.n=1;render();}
 play(!state.playing);
});
$('step').addEventListener('click',()=>{play(false);state.n=Math.min(state.max,state.n+1);render();});
$('restart').addEventListener('click',()=>{state.n=1;lastTick=performance.now();holdUntil=0;render();});
$('index').addEventListener('input',e=>{play(false);state.n=Number(e.target.value);render();});
$('speed').addEventListener('change',e=>{state.speed=Number(e.target.value);lastTick=performance.now();});
$('loop').addEventListener('change',e=>{state.loop=e.target.checked;});
$('horizon').addEventListener('change',e=>{
 play(false);state.max=Number(e.target.value);state.n=Math.min(state.n,state.max);data=calculate(state.example,state.max);
 $('index').max=state.max;$('horizon-label').textContent=tr("최대 {0}", [state.max.toLocaleString('en-US')]);refreshBand();render();
});
$('show-band').addEventListener('change',e=>{state.band=e.target.checked;refreshBand();render();});
$('epsilon').addEventListener('change',e=>{state.epsilon=Number(e.target.value);refreshBand();render();});
for(const id of ['sequence-chart','series-chart']){
 $(id).title=tr("그래프를 누르면 해당 n으로 이동해");
 $(id).addEventListener('click',e=>{const rect=e.currentTarget.getBoundingClientRect();play(false);state.n=Math.max(1,Math.min(state.max,Math.round((e.clientX-rect.left-45)/(rect.width-60)*state.max)));render();});
}
const observer=new ResizeObserver(()=>render());observer.observe($('sequence-chart'));observer.observe($('series-chart'));
motion.addEventListener('change',()=>{if(motion.matches)play(false);});
document.addEventListener('visibilitychange',()=>{lastTick=performance.now();holdUntil=0;});
function animate(time){
 if(state.playing&&!document.hidden){
  if(state.n===state.max){
   if(!state.loop)play(false);
   else if(!holdUntil)holdUntil=time+1300;
   else if(time>=holdUntil){state.n=1;lastTick=time;holdUntil=0;render();}
  }else if(time-lastTick>=360/state.speed){state.n++;lastTick=time;render();}
 }
 requestAnimationFrame(animate);
}
document.querySelectorAll('[data-prediction]').forEach(button=>button.addEventListener('click',()=>{
 play(false);document.querySelectorAll('[data-prediction]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 $('prediction-response').textContent=tr("‘{0}’라고 예상했어. 1,000개 항에서 비교한 뒤 이유를 확인해 봐.", [tr(button.textContent)]);
}));
$('prediction-experiment').addEventListener('click',()=>{
 play(false);state.max=1000;state.n=1000;data=calculate(state.example,state.max);$('horizon').value='1000';$('index').max=1000;$('horizon-label').textContent=tr("최대 1,000");refreshBand();render();
 $('prediction-response').textContent=tr("N = 1,000에서 항은 0.001, 부분합은 약 7.485야. 항이 작아진다는 사실만으로 합의 수렴을 판단할 수 있을까?");
});
$('prediction-reveal').addEventListener('click',()=>{const expanded=$('prediction-reason').hidden;$('prediction-reason').hidden=!expanded;$('prediction-reveal').setAttribute('aria-expanded',String(expanded));});
selectExample(examples[0]);requestAnimationFrame(animate);


const restored=restoredExperiment();
if(restored&&examples.some(e=>e.id===restored.example)){
 selectExample(examples.find(e=>e.id===restored.example));
 const {prediction,predictionObserved,revealed,...saved}=restored;
 Object.assign(state,saved,{example:state.example});
 data=calculate(state.example,state.max);
 $('horizon').value=state.max;$('index').max=state.max;$('horizon-label').textContent=tr('최대 {0}',[state.max.toLocaleString('en-US')]);
 $('speed').value=state.speed;$('loop').checked=state.loop;$('show-band').checked=state.band;$('epsilon').value=state.epsilon;
 if(prediction)document.querySelector(`[data-prediction="${prediction}"]`)?.click();
 if(predictionObserved)$('prediction-response').textContent=tr('N = 1,000에서 항은 0.001, 부분합은 약 7.485야. 항이 작아진다는 사실만으로 합의 수렴을 판단할 수 있을까?');
 $('prediction-reason').hidden=!revealed;$('prediction-reveal').setAttribute('aria-expanded',String(revealed));
 refreshBand();render();play(saved.playing);
}
initLanguage({snapshot:()=>({...state,example:state.example.id,prediction:document.querySelector('[data-prediction][aria-pressed="true"]')?.dataset.prediction,predictionObserved:$('prediction-response').textContent.includes('N = 1,000'),revealed:!$('prediction-reason').hidden})});
