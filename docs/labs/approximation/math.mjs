import {tr} from '../../assets/i18n.mjs';
export const math=body=>`<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${body}</mrow></math>`;
export const functions=[
 {id:'runge',name:tr("뾰족한 봉우리"),formula:'1 / (1 + 25x²)',f:x=>1/(1+25*x*x),range:[0,1],
  hint:tr("원점 중심 테일러 급수는 |x| < 0.2에서만 함수로 수렴해. 원점 부근에서 정확해도 [-1, 1] 전체의 근사는 나쁠 수 있어."),
  taylor:(degree,c)=>{const out=[1/(1+25*c*c)];for(let k=1;k<=degree;k++)out[k]=-(50*c*out[k-1]+(k>1?25*out[k-2]:0))/(1+25*c*c);return out;},
  radius:c=>Math.sqrt(c*c+1/25)},
 {id:'sine',name:tr("매끄러운 주기함수"),formula:'sin(πx)',f:x=>Math.sin(Math.PI*x),range:[-1,1],
  hint:tr("주기가 2인 사인 함수야. 푸리에에서는 첫 번째 사인 항 하나로 정확히 표현할 수 있어. 테일러도 차수를 높이면 전체 구간에서 좋아져."),
  taylor:(degree,c)=>{let scale=1;return Array.from({length:degree+1},(_,k)=>{if(k)scale*=Math.PI/k;return scale*Math.sin(Math.PI*c+k*Math.PI/2);});},radius:()=>Infinity},
 {id:'exponential',name:tr("주기적이지 않은 매끄러운 함수"),formula:'eˣ',f:Math.exp,range:[Math.exp(-1),Math.E],
  hint:tr("테일러 급수는 모든 실수에서 수렴해. 반면 푸리에는 양끝을 이어 주기 2로 반복하므로 경계에 점프가 생겨. 끝점 오차와 경계 근처 진동을 봐."),
  taylor:(degree,c)=>{let value=Math.exp(c);return Array.from({length:degree+1},(_,k)=>{if(k)value/=k;return value;});},radius:()=>Infinity},
 {id:'absolute',name:tr("원점에서 꺾이는 함수"),formula:'|x|',f:Math.abs,range:[0,1],
  hint:tr("|x|는 원점에서 미분되지 않아 원점 중심 테일러 전개를 만들 수 없어. 매끄러운 스플라인도 꺾인 모양을 정확히 그대로 재현하는 건 아니야."),
  taylor:()=>null,radius:()=>null}
];
export const methods=[
 {id:'taylor',name:tr("테일러"),color:'#c66a39',dash:[7,4]},
 {id:'leastSquares',name:tr("최소제곱 다항식"),color:'#2679a3',dash:[]},
 {id:'chebyshev',name:tr("체비쇼프 보간"),color:'#8c6bb0',dash:[3,3]},
 {id:'spline',name:tr("3차 스플라인"),color:'#398268',dash:[]},
 {id:'fourier',name:tr("푸리에"),color:'#ad8a2a',dash:[9,3,2,3]}
];
export function chebBasis(x,degree){const values=[1];if(degree>0)values.push(x);for(let k=2;k<=degree;k++)values.push(2*x*values[k-1]-values[k-2]);return values;}
export function evalCheb(coefficients,x){let b1=0,b2=0;for(let k=coefficients.length-1;k>=1;k--){const b=2*x*b1-b2+coefficients[k];b2=b1;b1=b;}return x*b1-b2+coefficients[0];}
export function evalTaylor(coefficients,c,x){if(!coefficients)return null;let value=0;for(let k=coefficients.length-1;k>=0;k--)value=value*(x-c)+coefficients[k];return value;}

// Reorthogonalized QR avoids normal equations and high-power Vandermonde columns.
export function leastSquares(f,degree,sampleCount=257){
 const nodes=Array.from({length:sampleCount},(_,j)=>-1+2*j/(sampleCount-1));
 const matrix=nodes.map(x=>chebBasis(x,degree)),target=nodes.map(f),q=[],r=Array.from({length:degree+1},()=>Array(degree+1).fill(0));
 for(let k=0;k<=degree;k++){
  const v=matrix.map(row=>row[k]);
  for(let pass=0;pass<2;pass++)for(let j=0;j<k;j++){let dot=0;for(let i=0;i<sampleCount;i++)dot+=q[j][i]*v[i];r[j][k]+=dot;for(let i=0;i<sampleCount;i++)v[i]-=dot*q[j][i];}
  r[k][k]=Math.sqrt(v.reduce((sum,x)=>sum+x*x,0));if(r[k][k]<1e-13)throw new Error('Rank-deficient least-squares system');q.push(v.map(x=>x/r[k][k]));
 }
 const rhs=q.map(col=>col.reduce((sum,x,i)=>sum+x*target[i],0)),coefficients=Array(degree+1).fill(0);
 for(let i=degree;i>=0;i--){let value=rhs[i];for(let j=i+1;j<=degree;j++)value-=r[i][j]*coefficients[j];coefficients[i]=value/r[i][i];}
 return {coefficients,nodes,evaluate:x=>evalCheb(coefficients,x)};
}
export function chebyshevInterpolation(f,degree){
 const count=degree+1,angles=Array.from({length:count},(_,j)=>Math.PI*(j+.5)/count),nodes=angles.map(Math.cos),values=nodes.map(f);
 const coefficients=Array.from({length:count},(_,k)=>2/count*values.reduce((sum,y,j)=>sum+y*Math.cos(k*angles[j]),0));coefficients[0]/=2;
 return {coefficients,nodes,evaluate:x=>evalCheb(coefficients,x)};
}
export function naturalSpline(f,knotCount){
 const nodes=Array.from({length:knotCount},(_,i)=>-1+2*i/(knotCount-1)),values=nodes.map(f),h=nodes.slice(1).map((x,i)=>x-nodes[i]);
 const lower=Array(knotCount).fill(0),diagonal=Array(knotCount).fill(0),upper=Array(knotCount).fill(0),rhs=Array(knotCount).fill(0);
 diagonal[0]=diagonal[knotCount-1]=1;
 for(let i=1;i<knotCount-1;i++){lower[i]=h[i-1];diagonal[i]=2*(h[i-1]+h[i]);upper[i]=h[i];rhs[i]=6*((values[i+1]-values[i])/h[i]-(values[i]-values[i-1])/h[i-1]);}
 for(let i=1;i<knotCount;i++){const factor=lower[i]/diagonal[i-1];diagonal[i]-=factor*upper[i-1];rhs[i]-=factor*rhs[i-1];}
 const second=Array(knotCount).fill(0);second[knotCount-1]=rhs[knotCount-1]/diagonal[knotCount-1];for(let i=knotCount-2;i>=0;i--)second[i]=(rhs[i]-upper[i]*second[i+1])/diagonal[i];
 const pieces=h.map((width,i)=>[values[i],(values[i+1]-values[i])/width-width*(2*second[i]+second[i+1])/6,second[i]/2,(second[i+1]-second[i])/(6*width)]);
 const evaluate=x=>{let i=Math.min(knotCount-2,Math.max(0,Math.floor((x+1)/2*(knotCount-1))));const t=x-nodes[i],a=pieces[i];return ((a[3]*t+a[2])*t+a[1])*t+a[0];};
 return {nodes,values,second,pieces,evaluate};
}
export function fourierProjection(f,harmonics,panels=2048){
 if(panels%2)throw new Error('Simpson quadrature needs an even panel count');
 const a=Array(harmonics+1).fill(0),b=Array(harmonics+1).fill(0),h=2/panels;
 for(let j=0;j<=panels;j++){
  const x=-1+j*h,weight=(j===0||j===panels)?1:j%2?4:2,value=weight*f(x)*h/3;a[0]+=value/2;
  for(let k=1;k<=harmonics;k++){a[k]+=value*Math.cos(k*Math.PI*x);b[k]+=value*Math.sin(k*Math.PI*x);}
 }
 const evaluate=x=>{let value=a[0];for(let k=1;k<=harmonics;k++)value+=a[k]*Math.cos(k*Math.PI*x)+b[k]*Math.sin(k*Math.PI*x);return value;};
 return {a,b,evaluate};
}
export function buildModels(example,degree=6,center=0){
 const coefficients=example.taylor(degree,center),least=leastSquares(example.f,degree),cheby=chebyshevInterpolation(example.f,degree),spline=naturalSpline(example.f,degree+1),fourier=fourierProjection(example.f,degree/2);
 return {
  taylor:coefficients?{coefficients,center,nodes:[center],evaluate:x=>evalTaylor(coefficients,center,x)}:null,
  leastSquares:least,chebyshev:cheby,spline,fourier
 };
}
export function errorMetrics(f,evaluate,count=1601){let squared=0,max=0;for(let i=0;i<count;i++){const x=-1+2*i/(count-1),e=Math.abs(f(x)-evaluate(x));squared+=e*e;max=Math.max(max,e);}return {rmse:Math.sqrt(squared/count),max};}
export function fmt(value){if(value===null||value===undefined)return '—';if(Math.abs(value)<1e-12)return '≈ 0';if(Math.abs(value)>=1e4||Math.abs(value)<1e-4)return value.toExponential(2);return value.toLocaleString('en-US',{maximumFractionDigits:5});}

