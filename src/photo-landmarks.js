import * as THREE from 'three';
import {terrainFoundation} from './foundation.js';
export function buildPhotoLandmarks({group,terrain,mesh,box,cyl,poly,label,imageToWorld:P,buildings}){
 const foundations=[],boats=[];
 function rod(g,a,b,r,c){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),m=mesh(g,new THREE.CylinderGeometry(r,r,d.length(),6),c);m.position.set(...a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 function sign(g,text,x,y,z,w){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#ddd1a3';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#3f4334';ctx.font='bold 115px Georgia';ctx.textAlign='center';ctx.fillText(text,512,120);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/6.4),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(x,y,z);g.add(m);}
 const source=buildings.find(b=>b.name==='Cubierta oeste'),points=source.points,center=points.reduce((s,p)=>[s[0]+p[0]/points.length,s[1]+p[1]/points.length],[0,0]);
 const dino=new THREE.Group();dino.position.set(...[center[0],0,center[1]]);dino.userData.terrainLevel=Math.max(...points.map(p=>terrain.relative(...p)));group.add(dino);dino.name='Dinolandia · edificio almenado detrás de Dragón';
 const local=points.map(p=>[p[0]-center[0],p[1]-center[1]]);poly(dino,local,0xd3cbae,7,0,'attraction-1');poly(dino,local,0xafa58a,.18,7,'attraction-1');
 for(let i=0;i<local.length;i++){const a=local[i],b=local[(i+1)%local.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=.5;t<length;t+=1.8){const u=t/length;box(dino,a[0]+(b[0]-a[0])*u,7.18,a[1]+(b[1]-a[1])*u,.82,.85,.82,0xded7bb,'attraction-1');}}
 const front=new THREE.Group();front.position.set((local[2][0]+local[3][0])/2,0,(local[2][1]+local[3][1])/2+.12);front.rotation.y=-Math.atan2(local[2][1]-local[3][1],local[2][0]-local[3][0]);dino.add(front);
 const entry=new THREE.Group();entry.name='Dinolandia � entrada opuesta al Drag�n';entry.position.set((local[0][0]+local[1][0])/2,0,(local[0][1]+local[1][1])/2-.15);entry.rotation.y=Math.PI-Math.atan2(local[1][1]-local[0][1],local[1][0]-local[0][0]);dino.add(entry);
 for(let i=0;i<6;i++){const x=(i-2.5)*4.6;mesh(front,new THREE.CircleGeometry(.86,28),0x33382f,x,5.45,.02,'attraction-1');mesh(front,new THREE.TorusGeometry(.95,.11,8,28),0xa27966,x,5.45,.09,'attraction-1');box(entry,x,0,.05,3.9,3.1,.18,0x615d46,'attraction-1');for(let j=0;j<5;j++)mesh(entry,new THREE.IcosahedronGeometry(.6,0),0x8b8865,x-1.5+j*.75,2.5,.25,'attraction-1');}
 sign(entry,'DINOLANDIA',0,3.5,.26,13);
 const baseRoot=new THREE.Group();baseRoot.userData.terrainLevel=0;group.add(baseRoot);const df=terrainFoundation(baseRoot,points,0xa39375);foundations.push(()=>df.update(terrain.enabled?dino.userData.terrainLevel:0,terrain.relative));
 // The showboat and pool are a historical reconstruction, not a claim of water today.
 const anchor=P([585,1015]),ship=new THREE.Group();ship.position.set(anchor[0],.6,anchor[1]);ship.userData.terrainLevel=terrain.relative(...anchor);group.add(ship);ship.name='Show Boat · tres cubiertas';
 const lakePts=[[514,956],[561,943],[611,967],[650,1015],[638,1060],[586,1079],[532,1046],[509,1002]].map(P).map(p=>[p[0]-anchor[0],p[1]-anchor[1]]);
 // Use the lower access side, and recess the uphill ground instead of lifting the lake.
 ship.userData.terrainLevel=Math.min(...lakePts.map(([x,z])=>terrain.relative(anchor[0]+x,anchor[1]+z)))+.85;
 terrain.addBasin(lakePts.map(([x,z])=>[anchor[0]+x,anchor[1]+z]),ship.userData.terrainLevel+.25);
 const lakeBase=terrainFoundation(baseRoot,lakePts.map(([x,z])=>[anchor[0]+x,anchor[1]+z]),0xa8bbb3);foundations.push(()=>lakeBase.update((terrain.enabled?ship.userData.terrainLevel:0)+.6,terrain.relative));
 poly(ship,lakePts,0x78b7c0,.22,-.22,'attraction-27');for(let i=0;i<lakePts.length;i++){const a=lakePts[i],b=lakePts[(i+1)%lakePts.length];rod(ship,[a[0],.1,a[1]],[b[0],.1,b[1]],.19,0xcbd6cc);}
 const hull=new THREE.Group();hull.rotation.y=-.42;ship.add(hull);
 function outline(rx,rz){return Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2;return [Math.cos(a)*rx,Math.sin(a)*rz]});}
 poly(hull,outline(4.3,13),0x9e3c39,1.4,.1,'attraction-28');poly(hull,outline(4.45,13.15),0xd5bba0,.22,1.5,'attraction-28');
 for(let floor=0;floor<3;floor++){const y=1.72+floor*2.7,rx=4.15-floor*.27,rz=11.6-floor*1.15;box(hull,0,y,0,5.8-floor*.5,2.45,17-floor*1.4,0xe4ded1,'attraction-28');poly(hull,outline(rx,rz),0xd2c4a6,.18,y+2.5,'attraction-28');for(const side of [-1,1]){for(let z=-rz+.6;z<=rz-.5;z+=1.7){box(hull,side*rx,y,z,.11,2.55,.11,0xa64d44,'attraction-28');rod(hull,[side*rx,y+.2,z],[side*rx,y+1,z],.035,0xe9e4d7);if(Math.abs(z)<8-floor)box(hull,side*(3-floor*.25),y+.6,z,.08,1.3,.9,0x3b5960,'attraction-28');}rod(hull,[side*rx,y+1,-rz+.6],[side*rx,y+1,rz-.6],.055,0xd9e2d6);for(const z of [-7,-3,3,7]){const lifering=mesh(hull,new THREE.TorusGeometry(.43,.1,7,18),0xae453b,side*(rx+.08),y+.9,z,'attraction-28');lifering.rotation.y=Math.PI/2;}}}
 box(hull,0,9.9,4,3,2.1,3.7,0xe5e1d5,'attraction-28');box(hull,0,10.3,5.88,2.5,1.25,.1,0x3c5a60,'attraction-28');
 for(const x of [-1.5,1.5]){cyl(hull,x,9.7,-3,.25,7,0x30383a,'attraction-28');cyl(hull,x,16.7,-3,.6,.55,0xb29852,'attraction-28',.32);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod(hull,[x,17,-3],[x+Math.cos(a)*.6,18.1,-3+Math.sin(a)*.6],.035,0x343938);}}
 sign(hull,'SHOW BOAT',0,4.7,11.25,5);
 for(let i=0;i<5;i++){const boat=new THREE.Group();ship.add(boat);const ring=mesh(boat,new THREE.TorusGeometry(.85,.3,8,20),0xc5483d,0,.45,0,'attraction-27');ring.rotation.x=Math.PI/2;box(boat,0,.3,0,.9,.4,1.1,0xf0ddad,'attraction-27');box(boat,0,.7,-.25,.75,.5,.2,0x3a4646,'attraction-27');boats.push({boat,phase:i/5});}
 label(group,'Show Boat · barco misterioso',anchor[0],anchor[1],14,'existing','attraction-28');
 function update(t){for(const {boat,phase} of boats){const a=phase*Math.PI*2+t*.075;boat.position.set(Math.cos(a)*8+.5,.08,Math.sin(a)*15.5);boat.rotation.y=-a;}}
 const updateTerrain=()=>foundations.forEach(f=>f());updateTerrain();update(0);
 return {update,updateTerrain,targets:{'attraction-1':center,'attraction-28':anchor,'attraction-27':P([548,1040])}};
}
