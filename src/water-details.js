import {rideMotion,orientOnTrack} from './ride-motion.js';
import * as THREE from 'three';

// Route is traced on PNOA; rock scenery and slopes are interpreted from user photographs.
export function buildWaterDetails({group,terrain,mesh,box,cyl,label,imageToWorld:P}) {
 const root=new THREE.Group();root.name='Tívoli Agua · canales abiertos y decorado rocoso';root.userData.terrainLevel=0;group.add(root);
 const jets=new THREE.Group();jets.name='Fuente · surtidores';jets.userData.terrainLevel=0;group.add(jets);
 const boats=[], jetDrops=[];let curve,motion;
 const ground=(x,z)=>terrain.relative(x,z);
 const beam=(g,a,b,r,c)=>{const d=b.clone().sub(a);const m=mesh(g,new THREE.CylinderGeometry(r,r,d.length(),6),c);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;};
 const geoMesh=(g,verts,c)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:c,roughness:.82,side:THREE.DoubleSide}));m.castShadow=true;m.receiveShadow=true;m.userData.id='existing-water';g.add(m);return m;};
 const dispose=(g)=>{g.traverse(o=>{o.geometry?.dispose();});g.clear();};
 function rebuild(){
  dispose(root);dispose(jets);boats.length=0;jetDrops.length=0;
  // Re-traced against the IGN orthophoto: long diagonal lanes, compact inner
  // hairpin and the separate outer northern turn. Heights remain interpretive.
  const pixels=[[895,760,1.6],[884,754,1.6],[886,740,1.6],[900,711,1.7],[916,681,6],[931,653,11],[938,640,11],[947,622,4],[958,600,1.6],[969,579,1.6],[978,568,1.6],[978,557,1.6],[968,551,1.6],[958,555,1.6],[953,565,1.6],[956,578,1.6],[953,592,1.6],[944,610,1.6],[933,624,1.6],[923,627,1.6],[917,619,1.6],[924,600,1.6],[937,575,1.6],[948,545,1.6],[957,525,1.6],[968,517,1.6],[978,521,1.6],[984,539,1.6],[988,568,1.6],[993,602,6],[998,625,12],[1000,639,12],[992,656,5],[983,668,1.7],[967,687,1.6],[941,718,1.6],[914,750,1.6],[904,762,1.6]];
  curve=new THREE.CatmullRomCurve3(pixels.map(([u,v,h])=>{const [x,z]=P([u,v]);return new THREE.Vector3(x,ground(x,z)+h,z);}),true,'centripetal');
  motion=rideMotion(curve,{min:1.25,max:10,gravity:6,drag:.55});
  const points=curve.getPoints(400),left=[],right=[];
  points.forEach((q,i)=>{const t=curve.getTangent(i/400),n=new THREE.Vector3(-t.z,0,t.x).normalize();left.push(q.clone().addScaledVector(n,1.12));right.push(q.clone().addScaledVector(n,-1.12));});
  const bed=[],sides=[];
  for(let i=1;i<points.length;i++){
   const a=left[i-1],b=right[i-1],c=right[i],d=left[i];bed.push(...a,...b,...c,...a,...c,...d);
   for(const edge of [left,right]){const a=edge[i-1],b=edge[i],c=b.clone().add(new THREE.Vector3(0,.85,0)),d=a.clone().add(new THREE.Vector3(0,.85,0));sides.push(...a,...b,...c,...a,...c,...d);}
  }
  geoMesh(root,bed,0x438d99);geoMesh(root,sides,0xa9bdc1);
  for(const edge of [left,right])mesh(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge.map(q=>q.clone().add(new THREE.Vector3(0,.86,0)))),400,.09,5),0xdbe1d0);
  for(let i=0;i<70;i++){const q=curve.getPoint(i/70),floor=ground(q.x,q.z)+1.3;beam(root,new THREE.Vector3(q.x,floor,q.z),q.clone().add(new THREE.Vector3(0,-.1,0)),.2,0x9e8b77);cyl(root,q.x,floor-.1,q.z,.55,.22,0xb0a18d);}
  // Solid rock embankments follow the actual channel, including its grade and bends.
  // Previously two independent thin triangles did not line up with the slopes.
  for(const [first,last] of [[3,8],[28,33]]){
   const sections=[],count=40;
   for(let k=0;k<=count;k++){
    const t=(first+(last-first)*k/count)/pixels.length,q=curve.getPoint(t),v=curve.getTangent(t),n=new THREE.Vector3(-v.z,0,v.x).normalize();
    const foot=ground(q.x,q.z)+1.25,height=Math.max(.15,q.y-foot-.1);
    const spread=1.45+Math.min(2.7,height*.24),top=q.y-.12;
    const at=(offset,y)=>new THREE.Vector3(q.x+n.x*offset,y,q.z+n.z*offset);
    sections.push({q,n,foot,height,vertices:[at(-spread,foot-.35),at(-1.32,top),at(1.32,top),at(spread,foot-.35)]});
   }
   const rock=[];
   for(let k=1;k<sections.length;k++)for(let side=0;side<3;side++){
    const a=sections[k-1].vertices[side],b=sections[k].vertices[side],c=sections[k].vertices[side+1],d=sections[k-1].vertices[side+1];
    rock.push(...a,...b,...c,...a,...c,...d);
   }
   for(const k of [0,count]){const [a,b,c,d]=sections[k].vertices;rock.push(...a,...b,...c,...a,...c,...d);}
   const rockMesh=geoMesh(root,rock,0xb59676);
   const colors=[],palette=[0xad8c6b,0xc0a184,0xb99a79,0xa98869,0xc3a68a];
   for(let i=0;i<rock.length/9;i++){const c=new THREE.Color(palette[Math.floor(i/2)%palette.length]);for(let j=0;j<3;j++)colors.push(c.r,c.g,c.b);}
   rockMesh.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));rockMesh.material.color.setHex(0xffffff);rockMesh.material.vertexColors=true;
   // Shallow weathered grooves on the broad sides, rather than projecting fins.
   for(let k=3;k<count-2;k+=3){const s=sections[k];if(s.height<3)continue;for(const side of [-1,1]){
    const bottom=s.vertices[side<0?0:3],top=s.vertices[side<0?1:2];
    const a=bottom.clone().lerp(top,.12),b=bottom.clone().lerp(top,.87);a.addScaledVector(s.n,side*.04);b.addScaledVector(s.n,side*.04);beam(root,a,b,.045,0x947658);
   }}
   // The uphill leg has a dark conveyor belt and a maintenance handrail.
   for(let k=1;k<sections.length;k++){const a=sections[k-1],b=sections[k];if(b.q.y<=a.q.y)continue;
    beam(root,a.q.clone().add(new THREE.Vector3(0,.06,0)),b.q.clone().add(new THREE.Vector3(0,.06,0)),.19,0x56584f);
    if(k%3===0){const p=b.q.clone().addScaledVector(b.n,1.6);beam(root,p,p.clone().add(new THREE.Vector3(0,1.25,0)),.04,0xd1cfc1);}
   }
  }
  // Shaded loading platform and small flights of stairs.
  const [sx,sz]=P([913,614]);const sy=ground(sx,sz)+1.5;
  box(root,sx,sy,sz,4.8,.45,9,0xa78664);box(root,sx,sy+4.2,sz,5.2,.23,9.5,0xac6e4c);
  for(const x of [-2,2])for(const z of [-4,4])cyl(root,sx+x,sy,sz+z,.12,4.2,0x7d6150);
  for(let j=0;j<6;j++){const boat=new THREE.Group();root.add(boat);box(boat,0,0,0,1.5,.42,3.6,0xb67232);for(const x of [-.67,.67]){box(boat,x,.35,0,.19,.44,3.35,0xd39b4d);}for(const z of [-.9,0,.9]){box(boat,0,.32,z,1.12,.24,.56,0xcc4835);box(boat,0,.52,z-.22,1.12,.5,.15,0x883b2c);}const nose=mesh(boat,new THREE.SphereGeometry(.75,8,4),0xc98a3c,0,.18,1.65);nose.scale.set(1,.4,.55);boats.push({boat,offset:j/6});}
  const [fx,fz]=P([550,719]),fy=ground(fx,fz);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const pts=[];for(let k=0;k<=20;k++){const t=k/20,r=8.5*(1-t)+2*t;pts.push(new THREE.Vector3(fx+Math.cos(a)*r,fy+3+4*Math.sin(Math.PI*t),fz+Math.sin(a)*r));}const jet=mesh(jets,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.055,5),0xb5e5e3);jet.material.transparent=true;jet.material.opacity=.68;const drop=mesh(jets,new THREE.SphereGeometry(.1,5,4),0xf2ffff);jetDrops.push({drop,pts:new THREE.CatmullRomCurve3(pts),offset:i/16});}
  cyl(jets,fx,fy+4.8,fz,.13,2.9,0xb4e9e5);
 }
 rebuild();
 return {clearance(x,z,r=3){return curve.getPoints(160).some(p=>Math.hypot(p.x-x,p.z-z)<r+(p.y-ground(p.x,p.z)>5?3:1));},targets:{'existing-water':P([960,655])},update(t){for(const {boat,offset} of boats){const u=motion.at(t,offset),q=curve.getPointAt(u),tan=curve.getTangentAt(u);boat.position.copy(q).add(new THREE.Vector3(0,.09,0));orientOnTrack(boat,tan);}for(const {drop,pts,offset} of jetDrops)drop.position.copy(pts.getPoint((t*.7+offset)%1));},updateTerrain:rebuild};
}
