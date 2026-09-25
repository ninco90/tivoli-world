import * as THREE from 'three';
// Distance-based lap timing: gravity adds speed downhill, drag removes it on
// the flat, and a minimum chain speed carries vehicles uphill. Deterministic
// lookup keeps pauses and terrain rebuilding from introducing frame-rate drift.
export function rideMotion(curve,{min=1.5,max=10,gravity=6,drag=.3}={}){
 const n=900,length=curve.getLength(),ds=length/n,heights=Array.from({length:n+1},(_,i)=>curve.getPointAt(i/n).y);
 let speed=min;const speeds=[];
 for(let lap=0;lap<12;lap++)for(let i=0;i<n;i++){speed=Math.sqrt(THREE.MathUtils.clamp(speed*speed-2*gravity*(heights[i+1]-heights[i])-2*drag*ds,min*min,max*max));if(lap===11)speeds.push(speed);}
 const times=[0];for(let i=0;i<n;i++)times.push(times[i]+ds/speeds[i]);const duration=times[n];
 return {duration,length,at(time,phase=0){const t=((time+phase*duration)%duration+duration)%duration;let low=0,high=n;while(high-low>1){const m=(low+high)>>1;if(times[m]<=t)low=m;else high=m;}return (low+(t-times[low])/(times[high]-times[low]))/n;}};
}
export function orientOnTrack(object,tangent){const forward=tangent.clone().normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),forward).normalize(),up=new THREE.Vector3().crossVectors(forward,right).normalize();object.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,forward));}
