import assert from 'node:assert/strict';
import {partial,target,converges,presets,gibbsPeak} from '../docs/labs/taylor/math.mjs';
const near=(actual,expected,tolerance=1e-10)=>assert.ok(Math.abs(actual-expected)<tolerance,actual+' versus '+expected);
near(partial('geometric',.5,12),(1-.5**12)/(1-.5));
near(partial('geometric',-1,6),0);near(partial('geometric',-1,7),1);
near(partial('geometric',1,60),60);
for(const x of [-2,-.5,0,.7,2]){
  near(partial('sine',x,18),Math.sin(x));
  near(partial('exponential',x,24),Math.exp(x));
}
near(partial('logarithm',.5,80),Math.log1p(.5));
near(partial('arctangent',.5,80),Math.atan(.5));
near(partial('fourier',0,80),0);
near(partial('fourier',Math.PI/2,80),1,.005);
assert.ok(Math.abs(partial('logarithm',1,80)-Math.log(2))<1/81);
assert.ok(Math.abs(partial('arctangent',1,80)-Math.PI/4)<1/161);
assert.equal(target('logarithm',-1),null);assert.equal(target('geometric',1),null);
assert.equal(converges('logarithm',1),true);assert.equal(converges('logarithm',-1),false);
assert.equal(converges('arctangent',-1),true);assert.equal(converges('geometric',1),false);
for(const [id,p] of Object.entries(presets)){
  for(const n of [1,2,p.max])for(const x of [p.range[0]*1.5,0,p.range[1]*1.5])assert.ok(Number.isFinite(partial(id,x,n)),id+' finite');
}
for(const n of [1,5,20,80]){
 const peak=gibbsPeak(n),delta=peak.x*.001;
 near(peak.x,Math.PI/(2*n));
 assert.ok(peak.height>partial('fourier',peak.x-delta,n));
 assert.ok(peak.height>partial('fourier',peak.x+delta,n));
 assert.ok(peak.overshoot>.1789 && peak.overshoot<.274);
 // A near-jump error is much larger than the overshoot, even at high N.
 assert.ok(Math.abs(partial('fourier',1e-6/n,n)-1)>.99999);
}
near(gibbsPeak(80).height,1.178979744,2e-5);
console.log('All six series: reference values, endpoints, domains, finite values and Gibbs peak/near-jump distinction verified.');
