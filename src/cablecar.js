import {terrainFoundation} from './foundation.js';
import * as THREE from 'three';

// Footprint and tower positions: OSM 759608839 / 19745391. Heights are illustrative.
export async function buildCablecar({group,terrain,label}) {
 const response=await fetch('/cablecar.json');
 if(!response.ok)throw new Error('No se pudo cargar el trazado del teleférico.');
 const data=await response.json();
 const root=new THREE.Group();root.name='Teleférico existente — estación y apoyos OSM';
 // This assembly manages its own vertical coordinates, including relief toggling.
 root.userData.terrainLevel=0;group.add(root);
 const materials={};
 const mat=color=>materials[color]??(materials[color]=new THREE.MeshStandardMaterial({color,roughness:.7}));
 function mesh(parent,geometry,color,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(parent,x,y,z,w,h,d,color){return mesh(parent,new THREE.BoxGeometry(w,h,d),color,x,y+h/2,z);}
 function cylinder(parent,x,y,z,r,h,color){return mesh(parent,new THREE.CylinderGeometry(r,r,h,12),color,x,y+h/2,z);}
 const route=data.route.filter(n=>n.pylon||n===data.route[0]);
 const start=route[0].position,stationCenter=[89.41,196.33];
 const direction=new THREE.Vector2(route[1].position[0]-start[0],route[1].position[1]-start[1]).normalize();
 const across=new THREE.Vector2(direction.y,-direction.x),heading=Math.atan2(direction.x,direction.y),lane=2.6;
 const station=new THREE.Group();root.add(station);station.position.set(stationCenter[0],0,stationCenter[1]);
 const shape=new THREE.Shape();data.station.forEach(([x,z],i)=>i?shape.lineTo(x-stationCenter[0],-z+stationCenter[1]):shape.moveTo(x-stationCenter[0],-z+stationCenter[1]));shape.closePath();
 const slab=new THREE.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:false});slab.rotateX(-Math.PI/2);mesh(station,slab,0xd1d0ba);
 const terminal=new THREE.Group();station.add(terminal);terminal.rotation.y=heading;
 // Open-sided boarding hall: the outgoing ropes remain clearly visible.
 box(terminal,0,.7,-2,14,.45,21,0xd2c4a6);
 for(const x of [-6,6])for(const z of [-10,-3,5])cylinder(terminal,x,1,z,.3,7.1,0xe4e1cd);
 box(terminal,0,8,-2,15,.7,22,0x9baa9e);
 box(terminal,0,8.7,-2,8,.8,16,0xe0dec8);
 box(terminal,-5,1,-7,3.3,3.8,6,0xeee4ce);
 box(terminal,-5,2.4,-3.95,2.2,1.4,.12,0x678f94);
 box(terminal,5,1,-7,2,2.3,6,0x8d9d8d);
 const pulley=mesh(terminal,new THREE.TorusGeometry(lane,.25,8,36),0x485c5a,0,6.8,-4);pulley.rotation.x=Math.PI/2;
 for(const x of [-lane,lane])box(terminal,x,6.4,-1,.45,.35,13,0x536d65);
 box(terminal,0,4.8,-13.05,12,1.2,.25,0x316e76);
 const signCanvas=document.createElement('canvas');signCanvas.width=768;signCanvas.height=96;const ctx=signCanvas.getContext('2d');ctx.fillStyle='#316e76';ctx.fillRect(0,0,768,96);ctx.fillStyle='#ffffff';ctx.font='bold 43px Arial';ctx.textAlign='center';ctx.fillText('TELEFÉRICO · BENALMÁDENA',384,62);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(12,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),side:THREE.DoubleSide}));sign.position.set(0,5.45,-13.22);terminal.add(sign);
 const stationFoundation=terrainFoundation(root,data.station,0xb7b3a3);
 const heights=route.map((_,i)=>i===0?6.8:i===1?12:i===2?20:28);
 // The departure span rises gradually from the low station; requiring 12 m
 // clearance immediately after departure would artificially inflate tower one.
 for(let i=1;i<route.length;i++){const a=route[i-1].position,b=route[i].position,sag=Math.min(2.8,Math.hypot(b[0]-a[0],b[1]-a[1])*.014);for(let s=1;s<12;s++){const f=s/12,x=THREE.MathUtils.lerp(a[0],b[0],f),z=THREE.MathUtils.lerp(a[1],b[1],f),lineHeight=THREE.MathUtils.lerp(terrain.elevation(...a)+heights[i-1],terrain.elevation(...b)+heights[i],f),clearance=i===1?THREE.MathUtils.lerp(6.3,11.5,f):12,required=terrain.elevation(x,z)+clearance+sag*Math.sin(Math.PI*f);if(required>lineHeight)heights[i]=Math.min(i===1?16:36,heights[i]+(required-lineHeight)/Math.max(f,.2));}}
 const towers=[];
 for(let i=1;i<route.length;i++){const tower=new THREE.Group(),[x,z]=route[i].position;root.add(tower);tower.position.set(x,0,z);tower.rotation.y=heading;const h=heights[i];box(tower,0,0,0,4,1.1,4,0xadae9f);cylinder(tower,0,1,0,.65,h-1,0x89978d);box(tower,0,h-.7,0,8,.75,1.4,0x64786f);for(const side of [-1,1]){box(tower,side*lane,h-.45,0,1.1,.25,5,0x4d625d);for(let j=-2;j<=2;j++){const wheel=mesh(tower,new THREE.CylinderGeometry(.34,.34,.28,10),0x334841,side*lane,h,j*.8);wheel.rotation.z=Math.PI/2;}box(tower,side*3.8,h-1.8,0,.15,1.2,5,0x819185);}for(let y=1.5;y<h-1;y+=2)box(tower,.72,y,0,.55,.08,.6,0xa5b3a7);towers.push(tower);}
 const ropes=[-1,1].map(()=>{const rope=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x354e48}));root.add(rope);return rope;});
 const centers=[];let spans=[],totalLength=0;
 function refresh(){station.position.y=Math.max(...data.station.map(p=>terrain.relative(...p)));stationFoundation.update(station.position.y,terrain.relative);route.forEach((n,i)=>{const [x,z]=n.position;centers[i]=new THREE.Vector3(x,(i===0?station.position.y:terrain.relative(x,z))+heights[i],z);if(i)towers[i-1].position.y=terrain.relative(x,z);});spans=[];totalLength=0;for(let i=1;i<centers.length;i++){const length=centers[i].distanceTo(centers[i-1]);spans.push({start:totalLength,length,a:centers[i-1],b:centers[i]});totalLength+=length;}for(let side=0;side<2;side++){const pts=[];for(const span of spans)for(let j=0;j<=20;j++){const f=j/20,p=span.a.clone().lerp(span.b,f);p.y-=Math.sin(Math.PI*f)*Math.min(2.8,span.length*.014);p.x+=across.x*lane*(side?1:-1);p.z+=across.y*lane*(side?1:-1);pts.push(p);}ropes[side].geometry.dispose();ropes[side].geometry=new THREE.BufferGeometry().setFromPoints(pts);}}
 refresh();
 const cabins=[];
 for(const side of [-1,1])for(let i=0;i<7;i++){const cabin=new THREE.Group();root.add(cabin);cylinder(cabin,0,-2.1,0,.075,2.1,0x465d54);box(cabin,0,-4.4,0,2.4,.6,2,0x75a3a7);box(cabin,0,-3.8,0,2.35,1.7,1.95,0x386675);box(cabin,0,-2.1,0,2.5,.18,2.1,0xdbe0cc);for(const x of [-1.15,1.15])for(const z of [-.96,.96])box(cabin,x,-3.8,z,.12,1.7,.12,0xc9d5c6);box(cabin,0,-3.8,1,.1,1.7,.08,0xc9d5c6);cabins.push({object:cabin,side,phase:i/7});}
 let lastEnabled=terrain.enabled;
 function update(t){if(lastEnabled!==terrain.enabled){lastEnabled=terrain.enabled;refresh();}for(const cabin of cabins){const distance=((cabin.phase+t*2.5/totalLength)%1)*totalLength,progress=cabin.side===1?distance:totalLength-distance;const span=spans.find(s=>progress<=s.start+s.length)||spans.at(-1),f=THREE.MathUtils.clamp((progress-span.start)/span.length,0,1),p=span.a.clone().lerp(span.b,f);p.y-=Math.sin(Math.PI*f)*Math.min(2.8,span.length*.014);p.x+=across.x*lane*cabin.side;p.z+=across.y*lane*cabin.side;cabin.object.position.copy(p);cabin.object.rotation.y=heading+(cabin.side===1?0:Math.PI);cabin.object.visible=progress>5&&progress<totalLength-4;}}
 update(0);
 if(label){label(group,'Teleférico · estación de salida',stationCenter[0],stationCenter[1],14,'landmark','cablecar');const end=route.at(-1).position;label(group,'↑ Hacia el monte Calamorro',end[0],end[1],heights.at(-1)+8,'small');}
 return {update,root,station,targets:{cablecar:stationCenter},metadata:{source:data.source,sourceUrl:data.sourceUrl,operatorSource:data.operatorSource,note:data.note,supportCount:towers.length,cabinCount:cabins.length}};
}
