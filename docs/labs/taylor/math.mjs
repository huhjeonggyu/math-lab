const frac = (a,b) => '<mfrac>'+a+b+'</mfrac>';
const mi = x => '<mi>'+x+'</mi>';
const mn = x => '<mn>'+x+'</mn>';
const mo = x => '<mo>'+x+'</mo>';
const row = x => '<mrow>'+x+'</mrow>';
const pow = (a,b) => '<msup>'+a+b+'</msup>';
const sum = (lo,hi,body) => '<munderover><mo>∑</mo>'+row(lo)+row(hi)+'</munderover>'+body;
const sn=row('<msub><mi>S</mi><mi>N</mi></msub><mo>(</mo><mi>x</mi><mo>)</mo>')+mo('=');
const m = x => '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>'+x+'</mrow></math>';
export const presets = {
  sine: {name:'사인 함수',tag:'TAYLOR SERIES',label:'sin x · 테일러 급수',fn:'sin x',
    formula:m(sn+sum(mi('k')+mo('=')+mn(0),mi('N')+mo('−')+mn(1),frac(row(pow(row(mo('(')+mo('−')+mn(1)+mo(')')),mi('k'))+pow(mi('x'),row(mn(2)+mi('k')+mo('+')+mn(1)))),row(mo('(')+mn(2)+mi('k')+mo('+')+mn(1)+mo(')')+mo('!'))))),
    max:18,range:[-6.3,6.3],yrange:[-2.3,2.3],probe:2,domain:'모든 실수에서 수렴',hint:'원점 근처부터 사인 곡선에 가까워진다. 항이 늘어나면 더 넓은 구간에서도 근사가 좋아진다.',detail:'N은 다항식의 차수가 아니라 0이 아닌 항의 개수다. 차수는 2N − 1이다.'},
  exponential: {name:'지수 함수',tag:'TAYLOR SERIES',label:'eˣ · 테일러 급수',fn:'eˣ',
    formula:m(sn+sum(mi('k')+mo('=')+mn(0),mi('N')+mo('−')+mn(1),frac(pow(mi('x'),mi('k')),row(mi('k')+mo('!'))))),
    max:24,range:[-3,3],yrange:[-2,23],probe:1,domain:'모든 실수에서 수렴',hint:'상수에서 직선, 포물선으로. 항을 더할 때마다 지수함수의 굽은 모양이 드러난다.',detail:'첫 N개 항을 더한다. 이 경우 다항식의 차수는 N − 1이다.'},
  geometric: {name:'등비급수',tag:'GEOMETRIC SERIES',label:'1 / (1 − x) · 등비급수',fn:'1 / (1 − x)',
    formula:m(sn+sum(mi('k')+mo('=')+mn(0),mi('N')+mo('−')+mn(1),pow(mi('x'),mi('k')))),
    max:60,range:[-1.6,1.6],yrange:[-4,5],probe:.5,domain:'−1 < x < 1 에서 수렴',interval:[-1,1],hint:'같은 급수도 x에 따라 다르다. 초록 구간 안에서는 수렴하고, 바깥에서는 크기가 커지거나 부호가 번갈아 바뀐다.',detail:'비교 함수 1/(1−x)는 x ≠ 1에서 정의된다. 급수가 그 함수로 수렴하는 범위는 |x| < 1뿐이다.'},
  logarithm: {name:'로그 함수',tag:'TAYLOR SERIES',label:'log(1 + x) · 테일러 급수',fn:'log(1 + x)',
    formula:m(sn+sum(mi('k')+mo('=')+mn(1),mi('N'),frac(row(pow(row(mo('(')+mo('−')+mn(1)+mo(')')),row(mi('k')+mo('+')+mn(1)))+pow(mi('x'),mi('k'))),mi('k')))),
    max:80,range:[-1.5,2],yrange:[-3.5,2.5],probe:1,domain:'−1 < x ≤ 1 에서 수렴',interval:[-1,1],hint:'경계도 살펴보자. x = 1에서는 log 2로 천천히 수렴하지만, x = −1에서는 발산한다.',detail:'로그 함수 자체는 x > −1에서 정의된다. 함수의 정의역과 급수의 수렴 구간은 서로 다르다.'},
  arctangent: {name:'아크탄젠트',tag:'TAYLOR SERIES',label:'arctan x · 테일러 급수',fn:'arctan x',
    formula:m(sn+sum(mi('k')+mo('=')+mn(0),mi('N')+mo('−')+mn(1),frac(row(pow(row(mo('(')+mo('−')+mn(1)+mo(')')),mi('k'))+pow(mi('x'),row(mn(2)+mi('k')+mo('+')+mn(1)))),row(mn(2)+mi('k')+mo('+')+mn(1))))),
    max:80,range:[-2,2],yrange:[-2.5,2.5],probe:1,domain:'−1 ≤ x ≤ 1 에서 수렴',interval:[-1,1],hint:'양쪽 끝점에서도 수렴하지만 느리다. x = 1에서 π/4에 가까워지는 과정을 관찰해 보자.',detail:'N은 0이 아닌 항의 개수다. 이 급수의 다항식 차수는 2N − 1이다.'},
  fourier: {name:'사각파',tag:'FOURIER SERIES',label:'사각파 · 푸리에 급수',fn:'사각파 (주기 2π)',
    formula:m(sn+frac(mn(4),mi('π'))+sum(mi('k')+mo('=')+mn(1),mi('N'),frac(row(mi('sin')+mo('(')+mo('(')+mn(2)+mi('k')+mo('−')+mn(1)+mo(')')+mi('x')+mo(')')),row(mn(2)+mi('k')+mo('−')+mn(1))))),
    max:80,range:[-6.3,6.3],yrange:[-1.7,1.7],probe:1,domain:'불연속점에서는 좌우 극한의 평균 0으로 수렴',hint:'매끄러운 사인파를 더하면 사각파가 된다. 점프 근처의 돌출은 폭이 좁아져도 최대 높이가 사라지지 않는다.',detail:'기브스 현상: 불연속점 근처의 최대 오차는 0으로 가지 않는다. 불연속점에서 급수의 값은 0이다.'}
};
export function target(id,x) {
  switch(id) {
    case 'sine': return Math.sin(x);
    case 'exponential': return Math.exp(x);
    case 'geometric': return Math.abs(1-x)<1e-10 ? null : 1/(1-x);
    case 'logarithm': return x<=-1 ? null : Math.log1p(x);
    case 'arctangent': return Math.atan(x);
    case 'fourier': return Math.abs(Math.sin(x))<1e-10 ? 0 : Math.sign(Math.sin(x));
    default: return null;
  }
}
export function partial(id,x,n) {
  let total=0, compensation=0, term=1;
  for(let k=0;k<n;k++){
    if(id==='geometric') { if(k) term*=x; }
    else if(id==='exponential') { if(k) term*=x/k; }
    else if(id==='sine') { term=k ? term*(-x*x)/((2*k)*(2*k+1)) : x; }
    else if(id==='logarithm') { term=k ? term*(-x)*k/(k+1) : x; }
    else if(id==='arctangent') { term=k ? term*(-x*x)*(2*k-1)/(2*k+1) : x; }
    else if(id==='fourier') term=(4/Math.PI)*Math.sin((2*k+1)*x)/(2*k+1);
    const adjusted=term-compensation, next=total+adjusted;
    compensation=(next-total)-adjusted; total=next;
  }
  return total;
}
export function converges(id,x){
  if(id==='geometric')return Math.abs(x)<1;
  if(id==='logarithm')return x>-1 && x<=1;
  if(id==='arctangent')return Math.abs(x)<=1;
  return true;
}
