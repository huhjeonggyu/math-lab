export const math=body=>`<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${body}</mrow></math>`;
export const cutoffs=[.5,.2,.1,.05,.02,.01,.005,.002,.001];
export const upperBounds=[2,3,5,10,20,50,100,200,500,1000];
const square='<msup><mi>x</mi><mn>2</mn></msup>';
const inverse='<mfrac><mn>1</mn><mi>x</mi></mfrac>';
const invSquare=`<mfrac><mn>1</mn>${square}</mfrac>`;
export const examples=[
 {id:'square',name:'x²',description:'곡선 아래를 직사각형으로',kind:'finite',formula:square,interval:'[0, 1]',a:0,b:1,f:x=>x*x,primitive:x=>x*x*x/3,range:()=>[0,1],limit:1/3,limitLabel:'1/3',
  headline:'조각을 작게 만들수록, 곡선 아래에 가까워져.',
  why:'x²은 [0, 1]에서 연속이야. 분할의 최대 폭을 0으로 보내면 왼쪽·가운데·오른쪽 표본점 모두 같은 적분값 1/3에 도달해.',
  insight:'왼쪽은 작게, 오른쪽은 크게 잡아. N을 늘리면서 두 합 사이의 간격도 줄어드는지 봐.',
  evidence:math('<msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup>'+square+'<mi>d</mi><mi>x</mi><mo>=</mo><mfrac><mn>1</mn><mn>3</mn></mfrac>')},
 {id:'sine',name:'sin x · 반 주기',description:'둥근 곡선 아래의 넓이',kind:'finite',formula:'<mi>sin</mi><mi>x</mi>',interval:'[0, π]',a:0,b:Math.PI,f:Math.sin,primitive:x=>-Math.cos(x),range:()=>[0,1],limit:2,limitLabel:'2',
  headline:'직사각형의 높이를 어디에서 읽을까?',
  why:'[0, π]에서 sin x는 연속이고 음이 아니야. 직사각형의 부호 있는 넓이가 곧 보통의 넓이이므로, 그 합은 곡선 아래 넓이 2로 수렴해.',
  insight:'왼쪽·가운데·오른쪽을 바꿔 봐. 작은 N에서 차이가 나도, 촘촘해지면 같은 값으로 가.',
  evidence:math('<msubsup><mo>∫</mo><mn>0</mn><mi>π</mi></msubsup><mi>sin</mi><mi>x</mi><mi>d</mi><mi>x</mi><mo>=</mo><mn>2</mn>')},
 {id:'signed',name:'sin x · 한 주기',description:'아래쪽 넓이는 음수로',kind:'finite',formula:'<mi>sin</mi><mi>x</mi>',interval:'[0, 2π]',a:0,b:2*Math.PI,f:Math.sin,primitive:x=>-Math.cos(x),range:()=>[-1,1],limit:0,limitLabel:'0',
  headline:'넓이를 더한다는 건, 부호까지 더한다는 뜻이야.',
  why:'x축 위의 직사각형은 양수, 아래의 직사각형은 음수로 더해. 한 주기의 양·음의 적분은 서로 상쇄돼. 절댓값으로 센 전체 넓이는 4지만 정적분은 0이야.',
  insight:'등분된 한 주기에서는 대칭 때문에 작은 N에서도 합이 0이 될 수 있어. 직사각형이 곡선과 같아졌다는 뜻은 아니야.',
  evidence:math('<msubsup><mo>∫</mo><mn>0</mn><mrow><mn>2</mn><mi>π</mi></mrow></msubsup><mi>sin</mi><mi>x</mi><mi>d</mi><mi>x</mi><mo>=</mo><mn>0</mn><mo>,</mo><mspace width="1em"/><msubsup><mo>∫</mo><mn>0</mn><mrow><mn>2</mn><mi>π</mi></mrow></msubsup><mo>|</mo><mi>sin</mi><mi>x</mi><mo>|</mo><mi>d</mi><mi>x</mi><mo>=</mo><mn>4</mn>')},
 {id:'rootSingular',name:'1 / √x · 0 근처',description:'함수는 무한대, 적분은 유한',kind:'near',formula:'<mfrac><mn>1</mn><msqrt><mi>x</mi></msqrt></mfrac>',interval:'(0, 1]',f:x=>1/Math.sqrt(x),primitive:x=>2*Math.sqrt(x),range:(a)=>[0,1/Math.sqrt(a)],limit:2,limitLabel:'2',
  headline:'높이는 무한해져도, 넓이의 합은 유한할 수 있어.',
  why:'먼저 ε를 고정하고 [ε, 1]에서 리만합을 적분값에 가깝게 만들어. 그다음 ε를 0으로 보내면 I(ε) = 2(1 − √ε)가 2로 수렴해.',
  insight:'① 분할을 늘려 근사 오차를 줄이고, ② ε를 줄여 잘라낸 구간을 되돌려 보자. 두 과정은 달라.',
  evidence:math('<mi>I</mi><mo>(</mo><mi>ε</mi><mo>)</mo><mo>=</mo><mn>2</mn><mo>(</mo><mn>1</mn><mo>−</mo><msqrt><mi>ε</mi></msqrt><mo>)</mo><mo>→</mo><mn>2</mn>')},
 {id:'inverseSingular',name:'1 / x · 0 근처',description:'천천히, 끝없이 커지는 넓이',kind:'near',formula:inverse,interval:'(0, 1]',f:x=>1/x,primitive:Math.log,range:a=>[0,1/a],limit:null,limitLabel:'∞로 발산',
  headline:'분할 오차가 줄어도, 전체 적분이 수렴하는 건 아니야.',
  why:'ε > 0을 고정하면 [ε, 1]에서는 리만합이 유한한 값 −ln ε로 수렴해. 하지만 ε 자체를 0으로 보내면 이 적분값은 끝없이 커져.',
  insight:'N → ∞는 현재 구간의 근사를 정확하게 만들 뿐이야. 발산 여부는 ε → 0일 때 I(ε)를 보고 판단해.',
  evidence:math('<mi>I</mi><mo>(</mo><mi>ε</mi><mo>)</mo><mo>=</mo><mo>−</mo><mi>ln</mi><mi>ε</mi><mo>→</mo><mi>∞</mi>')},
 {id:'squareSingular',name:'1 / x² · 0 근처',description:'더 빠르게 폭증하는 넓이',kind:'near',formula:invSquare,interval:'(0, 1]',f:x=>1/(x*x),primitive:x=>-1/x,range:a=>[0,1/(a*a)],limit:null,limitLabel:'∞로 발산',
  headline:'끝점에 가까이 갈수록 더 많은 넓이가 나타나.',
  why:'잘라낸 구간의 적분은 I(ε) = 1/ε − 1이야. ε를 반으로 줄일 때 새로 포함하는 넓이도 커져. 따라서 이상적분은 +∞로 발산해.',
  insight:'발산 예제에서도 ε를 고정한 채 분할만 늘리면 수렴해. 어느 극한을 보고 있는지 구분하자.',
  evidence:math('<mi>I</mi><mo>(</mo><mi>ε</mi><mo>)</mo><mo>=</mo><mfrac><mn>1</mn><mi>ε</mi></mfrac><mo>−</mo><mn>1</mn><mo>→</mo><mi>∞</mi>')},
 {id:'squareTail',name:'1 / x² · 무한 구간',description:'꼬리가 충분히 빨리 줄어들면',kind:'tail',formula:invSquare,interval:'[1, ∞)',f:x=>1/(x*x),primitive:x=>-1/x,range:()=>[0,1],limit:1,limitLabel:'1',
  headline:'구간이 무한히 길어져도, 적분은 수렴할 수 있어.',
  why:'먼저 [1, R]의 적분을 구하면 I(R) = 1 − 1/R이야. R을 무한대로 보내면 남은 꼬리 1/R이 0이 되어, 전체 적분은 1로 수렴해.',
  insight:'똑같은 1/x²도 0 근처에서는 발산하고, 무한대 쪽에서는 수렴해. 구간이 중요해.',
  evidence:math('<mi>I</mi><mo>(</mo><mi>R</mi><mo>)</mo><mo>=</mo><mn>1</mn><mo>−</mo><mfrac><mn>1</mn><mi>R</mi></mfrac><mo>→</mo><mn>1</mn>')},
 {id:'inverseTail',name:'1 / x · 무한 구간',description:'높이는 0으로 가지만 넓이는 발산',kind:'tail',formula:inverse,interval:'[1, ∞)',f:x=>1/x,primitive:Math.log,range:()=>[0,1],limit:null,limitLabel:'∞로 발산',
  headline:'함수가 0으로 가는 것만으로는 충분하지 않아.',
  why:'[1, R]의 적분은 ln R이야. 함수 높이는 0으로 가지만, 넓이의 누적은 멈추지 않아. R → ∞에서 이상적분은 +∞로 발산해.',
  insight:'조화급수와 닮았지? 더해지는 항이나 높이가 작아져도 전체 합이 유한하다는 보장은 없어.',
  evidence:math('<mi>I</mi><mo>(</mo><mi>R</mi><mo>)</mo><mo>=</mo><mi>ln</mi><mi>R</mi><mo>→</mo><mi>∞</mi>')}
];
export function bounds(example,index=2){return example.kind==='near'?[cutoffs[index],1]:example.kind==='tail'?[1,upperBounds[index]]:[example.a,example.b];}
export function integral(example,a,b){const value=example.primitive(b)-example.primitive(a);return Math.abs(value)<1e-14?0:value;}
export function partition(a,b,n,spacing='uniform'){
 if(!Number.isInteger(n)||n<1||!(b>a)||!Number.isFinite(a+b))throw new RangeError('Invalid interval or partition count');
 if(spacing==='geometric'&&a<=0)throw new RangeError('Geometric spacing requires a positive lower bound');
 const points=Array.from({length:n+1},(_,i)=>spacing==='geometric'?a*Math.exp(Math.log(b/a)*i/n):a+(b-a)*i/n);points[0]=a;points[n]=b;return points;
}
export function riemann(example,a,b,n,method='mid',spacing='uniform'){
 if(!['left','mid','right'].includes(method))throw new RangeError('Unknown sampling rule');
 const points=partition(a,b,n,spacing),rectangles=[];let total=0,c=0,positive=0,negative=0,mesh=0;
 for(let i=0;i<n;i++){
  const left=points[i],right=points[i+1],width=right-left,sample=method==='left'?left:method==='right'?right:(left+right)/2;
  const height=example.f(sample),area=height*width;
  if(!Number.isFinite(area))throw new RangeError('Sample hits a singularity');
  const corrected=area-c,next=total+corrected;c=(next-total)-corrected;total=next;
  if(area>=0)positive+=area;else negative+=area;mesh=Math.max(mesh,width);
  rectangles.push({left,right,width,sample,height,area});
 }
 if(Math.abs(total)<1e-14)total=0;
 return {value:total,positive,negative,mesh,rectangles,points};
}
export const refinementCounts=[4,5,6,7,8,9,10,11,12,13,14,15,16,20,24,28,32,36,40,44,48,52,56,60,64,80,96,112,128,160,192,224,256,288,320,352,384,416,448,480,512];
export function fmt(value,digits=6){if(value===null)return '∞';if(Math.abs(value)<1e-12)return '0';if(Math.abs(value)<1e-5)return value.toExponential(2);return value.toLocaleString('en-US',{maximumFractionDigits:digits});}
