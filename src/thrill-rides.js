import * as THREE from 'three';
import {terrainFoundation} from './foundation.js';

// Continuous descent velocity at brake entry; cubic deceleration reaches zero speed at loading height.
export function dropHeight(t){
 const p=((t%32)+32)%32,top=53,low=1.5,brake=16,fallTime=2.8;
 if(p<3)return low;
 if(p<19){const u=(p-3)/16;return low+(top-low)*(u*u*(3-2*u));}
 if(p<22)return top;
 if(p<22+fallTime){const u=(p-22)/fallTime;return top-(top-brake)*u*u;}
 const speed=2*(top-brake)/fallTime,duration=3*(brake-low)/speed,u=(p-22-fallTime)/duration;
 return u<1?low+(brake-low)*(1-u)**3:low;
}

// Dragon appearance follows the user's historic photographs. Dimensions and cycles
// are illustrative; these animations do not represent a currently operating park.
export function buildThrillRides({group,terrain,box,cyl,mesh,label,imageToWorld:P}){
 const updates=[],foundations=[];
 const yellow=0xe6b927,dark=0x444b49,steel=0xb9c0b6,blue=0x397899;
 function rod(g,a,b,r,color,id){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const m=mesh(g,new THREE.CylinderGeometry(r,r,d.length(),8),color,0,0,0,id);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
 function unit(pixel,w,d,id){const [x,z]=P(pixel),g=new THREE.Group();g.position.set(x,0,z);g.userData.terrainLevel=Math.max(...[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>terrain.relative(x+a,z+b)));group.add(g);box(g,0,0,0,w,.5,d,0xc5b99f,id);const root=new THREE.Group();root.userData.terrainLevel=0;group.add(root);const skirt=terrainFoundation(root,[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]],0xa99c83);foundations.push(()=>skirt.update(terrain.enabled?g.userData.terrainLevel:0,terrain.relative));return g;}
 function seat(g,x,y,z,id){box(g,x,y,z,.55,.18,.62,blue,id);box(g,x,y+.18,z-.25,.57,.92,.16,blue,id);for(const side of [-1,1]){rod(g,[x+side*.19,y+.94,z-.17],[x+side*.19,y+.38,z+.23],.045,dark,id);}rod(g,[x-.19,y+.38,z+.23],[x+.19,y+.38,z+.23],.045,dark,id);}
 function fence(g,w,d,id){for(const z of [-d/2,d/2]){for(let x=-w/2;x<=w/2;x+=1.5)rod(g,[x,.5,z],[x,1.55,z],.04,steel,id);rod(g,[-w/2,1.5,z],[w/2,1.5,z],.055,steel,id);}}

 const dragon=unit([393,482],19,15,'attraction-2');dragon.name='Tívoli Dragón · doble giro';
 // The fixed A frames hold an axle across the two sides of the ride.
 for(const x of [-8.1,8.1]){for(const z of [-5.3,5.3])rod(dragon,[x,.5,z],[x,10,0],.36,yellow,'attraction-2');box(dragon,x-.55,.5,-.7,1.1,7,1.4,dark,'attraction-2');const hub=cyl(dragon,x,9.45,0,.85,1.1,yellow,'attraction-2');hub.rotation.z=Math.PI/2;}
 rod(dragon,[-8.5,10,0],[8.5,10,0],.19,0xdfdfcc,'attraction-2');
 for(let x=-8;x<8;x+=1.3)rod(dragon,[x,10,0],[x+.55,10,0],.2,0xc64638,'attraction-2');
 const arms=new THREE.Group();arms.position.y=10;dragon.add(arms);
 for(const x of [-7.7,7.7]){box(arms,x-.3,-6.8,-.42,.6,8.5,.84,yellow,'attraction-2');for(let y=-6.4;y<1.1;y+=1.15){const stripe=box(arms,x-.31,y,-.44,.62,.45,.89,dark,'attraction-2');stripe.rotation.z=.42;}box(arms,x-.3,1.85,-.42,1.3,1.3,1.4,dark,'attraction-2');}
 const gondola=new THREE.Group();gondola.position.y=-6.8;arms.add(gondola);
 box(gondola,0,-.45,0,14.7,.55,3.2,dark,'attraction-2');
 for(let i=0;i<16;i++){const x=(i-7.5)*.82;seat(gondola,x,0,.82,'attraction-2');seat(gondola,x,.55,-.65,'attraction-2');const stripe=box(gondola,x,-.44,1.64,.5,.5,.055,yellow,'attraction-2');stripe.rotation.z=.35;}
 for(const x of [-7.2,7.2]){box(gondola,x,.1,0,.3,1.4,3.1,steel,'attraction-2');rod(gondola,[x,1.5,-1.5],[x,1.5,1.5],.06,steel,'attraction-2');}
 fence(dragon,18,14,'attraction-2');
 updates.push(t=>{const angle=t*.36-Math.sin(t*.36)*.35;arms.rotation.x=angle;gondola.rotation.x=-angle+t*1.65+.65*Math.sin(t*.85);});

 const tower=unit([355,537],11,11,'existing-tower');tower.name='Caída Libre · torre y góndola móvil';
 // Closed blue polygonal shaft and exterior white guides, as in the photographs.
 const shaft=mesh(tower,new THREE.CylinderGeometry(1.35,1.35,55,8),0x347f9d,0,28,0,'existing-tower');
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.sin(a)*1.43,z=Math.cos(a)*1.43;rod(tower,[x,.5,z],[x,55.5,z],.105,0xe4e2d5,'existing-tower');for(let y=2;y<55;y+=2.5){const bracket=box(tower,x,y,z,.34,.18,.34,0xc9cbbb,'existing-tower');}}
 for(const x of [-.2,.2])rod(tower,[x,1,1.49],[x,55,1.49],.04,dark,'existing-tower');
 box(tower,0,54.9,0,3.8,.4,3.8,0xe0ded1,'existing-tower');
 cyl(tower,0,55.6,0,3.4,4.7,0x262b2d,'existing-tower');
 cyl(tower,0,60.3,0,3.48,.2,steel,'existing-tower');
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#252a2d';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#ede8d7';ctx.font='bold 82px Georgia';ctx.textAlign='center';ctx.fillText('PAUL VERSAN',512,155);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const capLabel=new THREE.Mesh(new THREE.CylinderGeometry(3.42,3.42,4.3,48,1,true),new THREE.MeshStandardMaterial({map:texture,roughness:.85}));capLabel.position.y=57.95;tower.add(capLabel);
 }
 for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;rod(tower,[Math.sin(a)*3.2,60.5,Math.cos(a)*3.2],[Math.sin(a)*3.2,61.3,Math.cos(a)*3.2],.035,steel);rod(tower,[Math.sin(a)*3.2,61.3,Math.cos(a)*3.2],[Math.sin(b)*3.2,61.3,Math.cos(b)*3.2],.035,steel);}
 const carriage=new THREE.Group();tower.add(carriage);
 const ring=mesh(carriage,new THREE.TorusGeometry(2.65,.33,8,40),0xb7372e,0,0,0,'existing-tower');ring.rotation.x=Math.PI/2;
 for(let i=0;i<20;i++){const a=i*Math.PI/10,s=new THREE.Group();s.position.set(Math.sin(a)*2.65,0,Math.cos(a)*2.65);s.rotation.y=a;carriage.add(s);seat(s,0,0,0,'existing-tower');rod(carriage,[Math.sin(a)*1.55,.5,Math.cos(a)*1.55],[Math.sin(a)*2.65,.1,Math.cos(a)*2.65],.07,steel,'existing-tower');}
 fence(tower,10,10,'existing-tower');
 updates.push(t=>{carriage.position.y=dropHeight(t);});

 // Fan-shaped stepped seating visible west/northwest of the tower in the supplied overhead photo.
 const amphitheatre=new THREE.Group();amphitheatre.position.copy(tower.position);amphitheatre.userData.terrainLevel=tower.userData.terrainLevel;amphitheatre.name='Graderío junto a Caída Libre';group.add(amphitheatre);
 const centre=P([355,537]),bottomAngle=2.15,topAngle=4.42;
 const skirtRoot=new THREE.Group();skirtRoot.userData.terrainLevel=0;group.add(skirtRoot);
 function sector(r0,r1,a0,a1){const pts=[];for(let i=0;i<=32;i++){const a=a0+(a1-a0)*i/32;pts.push([Math.cos(a)*r1,Math.sin(a)*r1]);}for(let i=32;i>=0;i--){const a=a0+(a1-a0)*i/32;pts.push([Math.cos(a)*r0,Math.sin(a)*r0]);}return pts;}
 function terrace(pts,height,color){const shape=new THREE.Shape();pts.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);mesh(amphitheatre,geo,color,0,height,0,'park');const footprint=pts.map(([x,z])=>[x+centre[0],z+centre[1]]);const base=terrainFoundation(skirtRoot,footprint,0xb6a68a);foundations.push(()=>base.update((terrain.enabled?tower.userData.terrainLevel:0)+height,terrain.relative));}
 for(let row=0;row<10;row++){const r0=7.5+row*.92,r1=r0+.92,h=.65+row*.33;terrace(sector(r0,r1,bottomAngle,topAngle),h,row%2?0xd2bc8b:0xc8b487);for(const angle of [2.95,3.65]){const x=Math.cos(angle)*(r0+.46),z=Math.sin(angle)*(r0+.46);const tread=box(amphitheatre,x,h+.02,z,.62,.025,.8,0xe4d6b3,'park');tread.rotation.y=-angle;}}
 for(const angle of [bottomAngle,topAngle,2.95,3.65]){for(let i=0;i<5;i++){const r=8+i*1.85,y=.65+(r-7.5)/.92*.33;rod(amphitheatre,[Math.cos(angle)*r,y,Math.sin(angle)*r],[Math.cos(angle)*r,y+1,Math.sin(angle)*r],.045,steel);}rod(amphitheatre,[Math.cos(angle)*7.5,1.65,Math.sin(angle)*7.5],[Math.cos(angle)*16.7,4.95,Math.sin(angle)*16.7],.045,steel);}
 // Warm-coloured plaza segments at the foot of the seating.
 for(let i=0;i<10;i++)terrace(sector(5.6,7.5,bottomAngle+(topAngle-bottomAngle)*i/10,bottomAngle+(topAngle-bottomAngle)*(i+1)/10),.53,[0xcda661,0xb67c64,0x96aaa9][i%3]);
 const lp=P([320,520]);label(group,'Graderío junto a Caída Libre · aproximado',lp[0],lp[1],6,'small');
 function updateTerrain(){foundations.forEach(f=>f());}
 updateTerrain();updates.forEach(f=>f(0));
 return {update:t=>updates.forEach(f=>f(t)),updateTerrain,dragon,tower,arms,gondola,carriage};
}
