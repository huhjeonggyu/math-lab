import assert from 'node:assert/strict';
import {examples,bounds,integral,partition,riemann,cutoffs,upperBounds} from '../docs/labs/riemann/math.mjs';
const model=id=>examples.find(e=>e.id===id),near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} versus ${b}`);
for(const n of [4,7,16,64,512]){
 near(riemann(model('square'),0,1,n,'left').value,(n-1)*(2*n-1)/(6*n*n));
 near(riemann(model('square'),0,1,n,'right').value,(n+1)*(2*n+1)/(6*n*n));
 near(riemann(model('square'),0,1,n,'mid').value,1/3-1/(12*n*n));
 for(const method of ['left','mid','right'])near(riemann(model('signed'),0,2*Math.PI,n,method).value,0);
}
near(integral(model('rootSingular'),.01,1),1.8);near(integral(model('inverseSingular'),.01,1),Math.log(100));near(integral(model('squareSingular'),.01,1),99);
near(integral(model('squareTail'),1,1000),.999);near(integral(model('inverseTail'),1,1000),Math.log(1000));
for(const ex of examples){
 const indices=ex.kind==='near'?cutoffs.map((_,i)=>i):ex.kind==='tail'?upperBounds.map((_,i)=>i):[0];
 for(const index of indices){
  const [a,b]=bounds(ex,index),exact=integral(ex,a,b);
  for(const spacing of ex.kind==='finite'?['uniform']:['uniform','geometric']){
   let previousMesh=Infinity;
   for(const n of [4,16,64,512]){
    const points=partition(a,b,n,spacing);near(points[0],a);near(points[n],b);
    const result=riemann(ex,a,b,n,'mid',spacing);
    assert.ok(result.mesh<previousMesh);previousMesh=result.mesh;
    near(result.rectangles.reduce((v,r)=>v+r.width,0),b-a,1e-8);
    assert.ok(result.rectangles.every(r=>Number.isFinite(r.height)&&Number.isFinite(r.area)&&r.width>0));
    if(ex.id==='signed')assert.ok(result.positive>0&&result.negative<0);
   }
   for(const method of ['left','mid','right']){
    const coarse=riemann(ex,a,b,4,method,spacing).value,fine=riemann(ex,a,b,512,method,spacing).value;
    assert.ok(Math.abs(fine-exact)<=Math.abs(coarse-exact)+1e-10,`${ex.id} ${method} ${spacing}`);
   }
  }
 }
}
assert.throws(()=>partition(0,1,10,'geometric'));
assert.throws(()=>riemann(model('inverseSingular'),0,1,10,'left'));
console.log('Riemann checks passed: closed-form sums, signed areas, eight antiderivatives, all cutoff levels, sampling rules and mesh refinement.');
