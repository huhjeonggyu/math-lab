import assert from 'node:assert/strict';
import {examples,calculate,tailIndex} from '../docs/labs/sequences/math.mjs';
const close=(a,b,tol=1e-12)=>assert.ok(Math.abs(a-b)<tol,`${a} versus ${b}`);
const model=id=>examples.find(e=>e.id===id);
const sum=(id,n)=>calculate(model(id),n).sums[n];
close(sum('harmonic',4),25/12);close(sum('geometric',10),1-2**-10);
close(sum('negativeGeometric',10),(1-(-.5)**10)/3);close(sum('alternating',4),7/12);
assert.equal(sum('grandi',99),1);assert.equal(sum('grandi',100),0);
close(sum('natural',1000),500500);close(sum('nonzero',100),101-sum('harmonic',101));
assert.ok(sum('harmonic',1000)>Math.log(1001));
const square=sum('square',1000);assert.ok(Math.PI**2/6-square>0&&Math.PI**2/6-square<1/1000);
assert.ok(Math.abs(sum('alternating',1000)-Math.LN2)<=1/1001);
for(const ex of examples){
 const values=calculate(ex,3000);assert.ok([...values.terms,...values.sums].every(Number.isFinite));
 for(const eps of [.2,.1,.05,.01])for(const kind of ['sequence','series']){
  const N=tailIndex(ex.id,kind,eps),limit=kind==='sequence'?ex.seqLimit:ex.sumLimit;
  if(limit===null){assert.equal(N,null);continue;}
  assert.ok(Number.isInteger(N)&&N>=1);
  const arr=kind==='sequence'?values.terms:values.sums;
  for(let i=N;i<=3000;i++)assert.ok(Math.abs(arr[i]-limit)<eps+1e-14,`${ex.id} ${kind} n=${i}, epsilon=${eps}`);
 }
}
console.log('Math checks passed: 8 examples, exact partial sums, analytic tail bounds and epsilon thresholds.');
