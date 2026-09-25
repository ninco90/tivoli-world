import {rideMotion} from './ride-motion.js';
import * as THREE from 'three';

// The footprint is traced from the orthophoto. Heights and intermediate turns are
// a photographic reconstruction, not a manufacturer or survey drawing.
export function buildNorthCoaster({group,terrain,mesh,box,cyl,imageToWorld:P}){
 const id='existing-coaster',anchor=P([690,273]);
 const ground=(x,z)=>terrain?.relative(x,z)??0;
 const level=ground(...anchor),root=new THREE.Group();
 root.name='Montaña rusa norte · estructura fotográfica y tren animado';
 root.position.set(anchor[0],0,anchor[1]);root.userData.terrainLevel=level;group.add(root);
 const p=(u,v,h)=>{const q=P([u,v]);return new THREE.Vector3(q[0]-anchor[0],h,q[1]-anchor[1]);};
 const groundAt=q=>ground(q.x+anchor[0],q.z+anchor[1])-level+1.3;
 // Long lift, high turnaround, falling outer run, stacked southern turns and
 // inner return. Separate passes occupy different heights, unlike the old oval.
 const knots=[
  [663,280,4],[657,252,8],[658,223,16],[665,209,18],[682,211,18],
  [699,229,17],[714,258,10],[725,287,5],[728,314,6],[720,333,12],
  [705,344,14],[689,336,14],[680,317,13],[684,299,12],[698,294,11],
  [715,307,10],[718,327,9],[706,336,8],[694,328,7],[693,311,6],
  [701,290,5],[697,266,5],[681,247,6],[668,240,5],[667,256,3],
  [675,280,3],[681,302,3],[682,321,3],[674,319,3],[666,301,3]
 ];
 // Keep the lowest passes above the highest local ground under them.
 const minClearance=Math.max(0,...knots.map(([u,v,h])=>groundAt(p(u,v,h))+1.5-h));
 const curve=new THREE.CatmullRomCurve3(knots.map(([u,v,h])=>p(u,v,h+minClearance)),true,'centripetal');
 curve.arcLengthDivisions=1800;
 const beam=(a,b,r,color,parent=root)=>{const delta=b.clone().sub(a);if(delta.length()<.005)return;const m=mesh(parent,new THREE.CylinderGeometry(r,r,delta.length(),5),color,0,0,0,id);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;};
 const normal=t=>{const d=curve.getTangentAt(t);return new THREE.Vector3(-d.z,0,d.x).normalize();};
 const rails=[[],[]],count=720;
 for(let i=0;i<=count;i++){
  const t=i/count,q=curve.getPointAt(t),n=normal(t);
  rails[0].push(q.clone().addScaledVector(n,.58));rails[1].push(q.clone().addScaledVector(n,-.58));
  if(i%3===0)beam(rails[0][i],rails[1][i],.052,0x9c6253);
 }
 for(const pts of rails)mesh(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),720,.105,6,false),0x9c5547,0,0,0,id);
 // Repeated slender blue-grey portals with braced rectangular bays.
 const frames=[];
 for(let i=0;i<88;i++){
  const t=i/88,q=curve.getPointAt(t),n=normal(t),feet=[],tops=[];
  for(const s of [-1,1]){
   const top=q.clone().addScaledVector(n,s*1.13);top.y-=.22;
   const foot=top.clone();foot.y=groundAt(foot);feet.push(foot);tops.push(top);
   beam(foot,top,.085,0x879cab);
   box(root,foot.x,foot.y-.18,foot.z,.65,.22,.65,0xbab5a4,id);
  }
  beam(tops[0],tops[1],.072,0x879cab);
  if(i%2===0&&q.y>5){beam(feet[0].clone().lerp(tops[0],.18),tops[1],.045,0x8999a3);}
  const prev=frames.at(-1);
  if(prev&&prev.tops[0].distanceTo(tops[0])<6){for(let j=0;j<2;j++){const a=prev.feet[j].clone().lerp(prev.tops[j],.45),b=feet[j].clone().lerp(tops[j],.45);beam(a,b,.055,0x8d9ca5);if(i%2===0)beam(prev.feet[j],tops[j],.039,0x8d9ca5);}}
  frames.push({feet,tops});
 }
 // Visible chain and service walkway along the climbing western straight.
 for(let i=0;i<60;i++){
  const a=p(663+(658-663)*i/60,280+(223-280)*i/60,4+(16-4)*i/60+minClearance-.12);
  const b=p(663+(658-663)*(i+1)/60,280+(223-280)*(i+1)/60,4+(16-4)*(i+1)/60+minClearance-.12);
  beam(a,b,.11,0x4e5458);
 }
 // Four open cars with side panels, benches, restraints and wheels.
 const cars=[];
 for(let i=0;i<4;i++){
  const car=new THREE.Group();root.add(car);cars.push(car);
  box(car,0,.12,0,1.22,.33,1.9,i%2?0xa84430:0xc29c47,id);
  for(const z of [-.47,.38]){
   box(car,0,.43,z,.98,.12,.56,0x353b39,id);
   box(car,0,.5,z-.27,1,.51,.13,0x85402f,id);
   beam(new THREE.Vector3(-.44,.82,z+.16),new THREE.Vector3(.44,.82,z+.16),.045,0xd3ccac,car);
  }
  for(const x of [-.64,.64]){box(car,x,.4,0,.1,.45,1.9,0x9e4735,id);for(const z of [-.64,.64]){const w=mesh(car,new THREE.CylinderGeometry(.17,.17,.13,8),0x343b3e,x,.08,z,id);w.rotation.z=Math.PI/2;}}
 }
 const length=curve.getLength(),up=new THREE.Vector3(0,1,0),m=new THREE.Matrix4();
 const motion=rideMotion(curve,{min:2.2,max:14,gravity:7,drag:.2});
 function update(time){
  const head=motion.at(time,.06);
  for(let i=0;i<cars.length;i++){
   const t=(head-i*2.12/length+1)%1,q=curve.getPointAt(t),forward=curve.getTangentAt(t).normalize();
   const right=new THREE.Vector3().crossVectors(up,forward).normalize(),normalUp=new THREE.Vector3().crossVectors(forward,right).normalize();
   m.makeBasis(right,normalUp,forward);cars[i].quaternion.setFromRotationMatrix(m);cars[i].position.copy(q).addScaledVector(normalUp,.16);
  }
 }
 update(0);
 return {update,targets:{[id]:anchor},curve,root};
}
