export const math = body => `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${body}</mrow></math>`;
const n='<mi>n</mi>', one='<mn>1</mn>', two='<mn>2</mn>';
const frac=(a,b)=>`<mfrac>${a}${b}</mfrac>`;
const pow=(a,b)=>`<msup>${a}${b}</msup>`;
const alt=pow('<mrow><mo>(</mo><mo>−</mo><mn>1</mn><mo>)</mo></mrow>','<mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow>');
export const examples = [
 {id:'harmonic', name:'조화수열 · 조화급수', short:'작아지는 항, 커지는 합', expression:frac(one,n), term:n=>1/n, seqLimit:0,sumLimit:null,sequence:'0으로 수렴',series:'∞로 발산',sumKind:'diverge',
  headline:'항이 0으로 가도, 합은 계속 커질 수 있어.',
  sequenceWhy:'n이 커질수록 1/n은 작아져. 원하는 만큼 작은 양수 ε를 정해도, n > 1/ε 뒤에는 모든 항이 ε보다 작아.',
  seriesWhy:'항을 2개, 4개, 8개씩 묶어 보자. 각 묶음의 합은 적어도 1/2이야. 이런 묶음이 끝없이 생기므로 부분합은 위로 제한되지 않아.',
  evidence:math('<mrow><mo>(</mo><mfrac><mn>1</mn><mn>3</mn></mfrac><mo>+</mo><mfrac><mn>1</mn><mn>4</mn></mfrac><mo>)</mo></mrow><mo>≥</mo><mfrac><mn>2</mn><mn>4</mn></mfrac><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac>'),
  takeaway:'aₙ → 0은 급수 수렴의 필요조건이지만, 충분조건은 아니야.'},
 {id:'square',name:'제곱 역수',short:'충분히 빠르게 작아지는 항',expression:frac(one,pow(n,two)),term:n=>1/(n*n),seqLimit:0,sumLimit:Math.PI**2/6,sequence:'0으로 수렴',series:'π²/6으로 수렴',sumKind:'absolute',
  headline:'둘 다 0으로 가지만, 합의 운명은 달라.',
  sequenceWhy:'1/n²은 1/n보다 더 빠르게 0으로 내려가. n > 1/√ε이면 그 뒤의 모든 항이 ε보다 작아.',
  seriesWhy:'적분 비교로 남은 꼬리합은 1/n 이하야. 그러므로 부분합은 유한한 값에 수렴해. 정확한 극한 π²/6의 계산은 별도의 결과야.',
  evidence:math('<mn>0</mn><mo>&lt;</mo><mfrac><msup><mi>π</mi><mn>2</mn></msup><mn>6</mn></mfrac><mo>−</mo><msub><mi>S</mi><mi>n</mi></msub><mo>≤</mo><msubsup><mo>∫</mo><mi>n</mi><mi>∞</mi></msubsup><mfrac><mn>1</mn><msup><mi>x</mi><mn>2</mn></msup></mfrac><mi>d</mi><mi>x</mi><mo>=</mo><mfrac><mn>1</mn><mi>n</mi></mfrac>'),
  takeaway:'급수의 수렴은 항의 극한뿐 아니라, 작아지는 속도와 부호에도 달려 있어.'},
 {id:'geometric',name:'양의 등비급수',short:'절반씩 남기는 합',expression:pow(frac(one,two),n),term:n=>2**(-n),seqLimit:0,sumLimit:1,sequence:'0으로 수렴',series:'1로 수렴',sumKind:'absolute',
  headline:'남은 거리를 절반씩 채우면 어디에 닿을까?',
  sequenceWhy:'매번 이전 항의 절반이 돼. 공비의 절댓값이 1보다 작은 등비수열이므로 0으로 수렴해.',
  seriesWhy:'n번째 부분합은 정확히 1 − 2⁻ⁿ이야. 1까지 남은 거리도 2⁻ⁿ이므로 부분합은 아래에서 1에 다가가.',
  evidence:math('<msub><mi>S</mi><mi>n</mi></msub><mo>=</mo><mn>1</mn><mo>−</mo><msup><mn>2</mn><mrow><mo>−</mo><mi>n</mi></mrow></msup><mo>→</mo><mn>1</mn>'),
  takeaway:'무한히 많은 양수를 더해도, 합이 유한할 수 있어.'},
 {id:'negativeGeometric',name:'부호가 바뀌는 등비급수',short:'위아래로 좁혀 가는 합',expression:frac(alt,pow(two,n)),term:n=>(n%2?1:-1)*2**(-n),seqLimit:0,sumLimit:1/3,sequence:'0으로 수렴',series:'1/3로 수렴',sumKind:'absolute',
  headline:'오르내리는 부분합도 한 값에 모일 수 있어.',
  sequenceWhy:'부호는 매번 바뀌지만, 크기는 절반씩 줄어. 양수 항과 음수 항 모두 0에 가까워져.',
  seriesWhy:'부분합은 1/3의 위아래를 번갈아 지나가. 절댓값을 모두 더해도 양의 등비급수의 합 1이 되므로 절대수렴해.',
  evidence:math('<msub><mi>S</mi><mi>n</mi></msub><mo>=</mo><mfrac><mn>1</mn><mn>3</mn></mfrac><mo>[</mo><mn>1</mn><mo>−</mo><msup><mrow><mo>(</mo><mo>−</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>)</mo></mrow><mi>n</mi></msup><mo>]</mo><mo>→</mo><mfrac><mn>1</mn><mn>3</mn></mfrac>'),
  takeaway:'단조롭게 움직여야만 수렴하는 건 아니야.'},
 {id:'alternating',name:'교대조화급수',short:'부호 하나가 바꾸는 결과',expression:frac(alt,n),term:n=>(n%2?1:-1)/n,seqLimit:0,sumLimit:Math.LN2,sequence:'0으로 수렴',series:'log 2로 수렴',sumKind:'conditional',
  headline:'같은 크기의 항인데, 부호를 바꾸니 수렴해.',
  sequenceWhy:'양수 항과 음수 항이 번갈아 나오지만 절댓값은 1/n이므로 0으로 수렴해.',
  seriesWhy:'항의 크기가 단조롭게 0으로 가므로 교대급수 판정법을 적용할 수 있어. 오차는 다음 항의 크기 이하야. 절댓값의 급수는 조화급수라 발산하므로 조건수렴이야.',
  evidence:math('<mo>|</mo><msub><mi>S</mi><mi>n</mi></msub><mo>−</mo><mi>log</mi><mn>2</mn><mo>|</mo><mo>≤</mo><mfrac><mn>1</mn><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></mfrac>'),
  takeaway:'교대조화급수는 조건수렴해. 부호를 없애면 다시 발산해.'},
 {id:'grandi',name:'1, −1, 1, −1, …',short:'줄어들지 않는 진동',expression:alt,term:n=>n%2?1:-1,seqLimit:null,sumLimit:null,sequence:'진동하며 발산',series:'진동하며 발산',sumKind:'diverge',
  headline:'계속 오르내리기만 하면, 극한은 생기지 않아.',
  sequenceWhy:'홀수 번째 항은 1, 짝수 번째 항은 −1이야. 두 부분수열의 극한이 달라서 전체 수열의 극한이 없어.',
  seriesWhy:'부분합도 홀수 n에서는 1, 짝수 n에서는 0이야. 한 값으로 모이지 않으므로 보통의 급수 의미에서는 발산해.',
  evidence:math('<msub><mi>S</mi><mrow><mn>2</mn><mi>m</mi></mrow></msub><mo>=</mo><mn>0</mn><mo>,</mo><mspace width="1em"/><msub><mi>S</mi><mrow><mn>2</mn><mi>m</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>=</mo><mn>1</mn>'),
  takeaway:'값들이 유계라고 해서 수렴하는 건 아니야.'},
 {id:'nonzero',name:'n / (n + 1)',short:'항은 수렴하지만 합은 발산',expression:frac(n,'<mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow>'),term:n=>n/(n+1),seqLimit:1,sumLimit:null,sequence:'1로 수렴',series:'∞로 발산',sumKind:'diverge',
  headline:'수열이 수렴한다고, 그 급수도 수렴할까?',
  sequenceWhy:'n/(n+1) = 1 − 1/(n+1)이므로 1로 수렴해. 수열의 극한은 꼭 0일 필요가 없어.',
  seriesWhy:'급수가 수렴하려면 항은 반드시 0으로 가야 해. 여기서는 각 항이 적어도 1/2이므로 부분합은 n/2 이상으로 계속 커져.',
  evidence:math('<msub><mi>a</mi><mi>n</mi></msub><mo>≥</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mspace width="1em"/><mo>⇒</mo><mspace width="1em"/><msub><mi>S</mi><mi>n</mi></msub><mo>≥</mo><mfrac><mi>n</mi><mn>2</mn></mfrac><mo>→</mo><mi>∞</mi>'),
  takeaway:'“수열의 극한이 존재한다”와 “그 항을 더한 급수가 수렴한다”는 다른 말이야.'},
 {id:'natural',name:'1, 2, 3, 4, …',short:'항도 합도 끝없이 증가',expression:n,term:n=>n,seqLimit:null,sumLimit:null,sequence:'∞로 발산',series:'∞로 발산',sumKind:'diverge',
  headline:'항은 일정하게 커지고, 합은 더 빠르게 커져.',
  sequenceWhy:'어떤 양의 기준을 잡아도 충분히 뒤의 모든 항이 그 기준보다 커져. 유한한 극한은 없어.',
  seriesWhy:'처음 n개 자연수의 합은 n(n+1)/2야. 항은 n에 비례하지만 부분합은 n²의 속도로 커져.',
  evidence:math('<msub><mi>S</mi><mi>n</mi></msub><mo>=</mo><mfrac><mrow><mi>n</mi><mo>(</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow><mn>2</mn></mfrac><mo>→</mo><mi>∞</mi>'),
  takeaway:'급수는 새로운 대상이 아니라, 부분합이라는 수열의 극한을 묻는 거야.'}
];

export function calculate(example, max) {
 const terms=new Float64Array(max+1), sums=new Float64Array(max+1);
 let total=0, compensation=0;
 for(let n=1;n<=max;n++) {
  const term=example.term(n);terms[n]=term;
  const y=term-compensation,t=total+y;
  compensation=(t-total)-y;total=t;sums[n]=total;
 }
 return {terms,sums};
}

// A sufficient index for all subsequent points to lie strictly within epsilon.
export function tailIndex(id, kind, epsilon) {
 const safe=n=>Math.max(1,n);
 if(kind==='sequence') {
  if(id==='harmonic'||id==='alternating')return Math.floor(1/epsilon)+1;
  if(id==='square')return Math.floor(1/Math.sqrt(epsilon))+1;
  if(id==='geometric'||id==='negativeGeometric')return safe(Math.floor(Math.log2(1/epsilon))+1);
  if(id==='nonzero')return safe(Math.floor(1/epsilon));
 } else {
  if(id==='geometric')return safe(Math.floor(Math.log2(1/epsilon))+1);
  if(id==='negativeGeometric')return safe(Math.floor(Math.log2(1/(3*epsilon)))+1);
  if(id==='alternating')return safe(Math.floor(1/epsilon));
  if(id==='square')return Math.floor(1/epsilon)+1;
 }
 return null;
}

export function formatNumber(value) {
 if(value===0)return '0';
 if(Math.abs(value)<0.00001){
  const [mantissa,exponent]=value.toExponential(2).split('e');
  const superscripts={'-':'⁻','+':'⁺','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  return mantissa+' × 10'+[...exponent].map(c=>superscripts[c]).join('');
 }
 if(Math.abs(value)>=10000)return value.toLocaleString('en-US',{maximumFractionDigits:2});
 return value.toFixed(6).replace(/\.?0+$/,'');
}
