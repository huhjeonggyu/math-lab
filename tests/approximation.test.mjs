import assert from 'node:assert/strict';
import {functions,chebBasis,evalCheb,evalTaylor,leastSquares,chebyshevInterpolation,naturalSpline,fourierProjection,buildModels,errorMetrics} from '../docs/labs/approximation/math.mjs';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(const degree of [2,6,10,16]){
 const f=x=>2-3*x+4*x*x,ls=leastSquares(f,degree),cb=chebyshevInterpolation(f,degree);
 for(let x=-1;x<=1;x+=.037){near(ls.evaluate(x),f(x));near(cb.evaluate(x),f(x));}
 const runge=functions[0],fit=leastSquares(runge.f,degree);
 for(let k=0;k<=degree;k++){const dot=fit.nodes.reduce((sum,x)=>sum+(fit.evaluate(x)-runge.f(x))*chebBasis(x,degree)[k],0);assert.ok(Math.abs(dot)<1e-9,'Least-squares residual orthogonality');}
 const interp=chebyshevInterpolation(runge.f,degree);for(const x of interp.nodes)near(interp.evaluate(x),runge.f(x));
 const spline=naturalSpline(runge.f,degree+1);for(const x of spline.nodes)near(spline.evaluate(x),runge.f(x));near(spline.second[0],0);near(spline.second.at(-1),0);
 for(let i=0;i<spline.pieces.length-1;i++){const a=spline.pieces[i],b=spline.pieces[i+1],h=spline.nodes[i+1]-spline.nodes[i];near(a[1]+2*a[2]*h+3*a[3]*h*h,b[1],1e-9);near(2*a[2]+6*a[3]*h,2*b[2],1e-9);}
}
const linear=naturalSpline(x=>2*x+1,9);for(let x=-1;x<=1;x+=.07)near(linear.evaluate(x),2*x+1);
const fourier=fourierProjection(x=>.5+2*Math.cos(2*Math.PI*x)-.7*Math.sin(3*Math.PI*x),4);
for(let x=-1;x<=1;x+=.037)near(fourier.evaluate(x),.5+2*Math.cos(2*Math.PI*x)-.7*Math.sin(3*Math.PI*x));
for(const ex of functions){
 for(const degree of [2,6,16])for(const c of [-.75,0,.75]){
  const models=buildModels(ex,degree,c);
  for(const [id,model] of Object.entries(models))if(model){const metric=errorMetrics(ex.f,model.evaluate);assert.ok(Number.isFinite(metric.rmse)&&Number.isFinite(metric.max),ex.id+' '+id);}
  if(models.taylor){near(models.taylor.evaluate(c),ex.f(c));if(degree===16)near(models.taylor.evaluate(c+.001),ex.f(c+.001));}
 }
}
assert.equal(buildModels(functions[3],6,0).taylor,null);
near(evalTaylor(functions[0].taylor(6,0),0,.1),1-.25+.25**2-.25**3);
near(functions[0].radius(0),.2);
const expFourier=fourierProjection(Math.exp,6);near(expFourier.a[0],Math.sinh(1),1e-10);for(let k=1;k<=6;k++){near(expFourier.a[k],2*(-1)**k*Math.sinh(1)/(1+(k*Math.PI)**2),2e-9);near(expFourier.b[k],-2*(-1)**k*k*Math.PI*Math.sinh(1)/(1+(k*Math.PI)**2),2e-9);}
console.log('Approximation checks passed: polynomial reproduction, LS optimality, Chebyshev interpolation, spline C2/natural conditions, analytic Fourier coefficients and shifted Taylor expansions.');
