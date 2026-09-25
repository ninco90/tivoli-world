import {buildKarting} from './karting.js';
import {buildWaterDetails} from './water-details.js';
import {buildPhotoRides} from './photo-rides.js';
import {buildNorthCoaster} from './north-coaster.js';
import {buildPhotoLandmarks} from './photo-landmarks.js';
import {buildThrillRides} from './thrill-rides.js';
import {buildAttractions} from './attractions.js';
import {buildSpecials} from './specials.js';
import * as THREE from 'three';

// Image coordinates are manually traced on the 1472 x 1692 display of the IGN orthophoto.
// Full image: 1600 x 1840. CRS:84 bbox -4.5432,36.5983,-4.5378,36.6033.
export const imageToWorld=([u,v])=>[( -.0024+u/1472*.0054)*111320*Math.cos(36.6006*Math.PI/180),(-.0027+v/1692*.005)*111320];
export async function buildExisting({group:g,mesh,box,cyl,poly,ribbon,line,label,old,inside,terrain}){
 const buildings=await fetch('/current-buildings.json').then(r=>r.json());
 const P=imageToWorld, paths=[], features={};

 const heightAt=(x,z)=>terrain?.relative(x,z)??0;
 // Capture already-built world-space pieces as one level architectural unit.
 const rigidUnit=(start,anchor,name,level=heightAt(...anchor))=>{const parts=g.children.slice(start),unit=new THREE.Group();unit.name=name;unit.position.set(anchor[0],0,anchor[1]);unit.userData.terrainLevel=level;for(const part of parts){g.remove(part);part.position.x-=anchor[0];part.position.z-=anchor[1];unit.add(part);}g.add(unit);return unit;};
 const beam=(parent,a,b,r,color)=>{const v=b.clone().sub(a),m=mesh(parent,new THREE.CylinderGeometry(r,r,v.length(),8),color);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;};
 const foundation=(points,level,color)=>{const vertices=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ya=heightAt(...a)-level+1.15,yb=heightAt(...b)-level+1.15;vertices.push(a[0],ya,a[1],b[0],yb,b[1],b[0],1.4,b[1],a[0],ya,a[1],b[0],1.4,b[1],a[0],1.4,a[1]);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}));g.add(m);};
 const addPath=(pixels,width=4,color=0xd4c4a8)=>{const pts=pixels.map(P);paths.push({pts,width});ribbon(g,pts,width,color,1.4,'park');return pts};
 const smooth=(pixels,width=4,color=0xd4c4a8,y=1.4)=>{const curve=new THREE.CatmullRomCurve3(pixels.map(p=>{const q=P(p);return new THREE.Vector3(q[0],y,q[1])}));const pts=curve.getPoints(70).map(v=>[v.x,v.z]);paths.push({pts,width});ribbon(g,pts,width,color,y,'park');return curve};
 const disk=(pixel,r,c,y=1.4,h=.2)=>{const [x,z]=P(pixel);return cyl(g,x,y,z,r,h,c,'park')};
 const feature=(id,name,pixel,y=12)=>{const [x,z]=P(pixel);features[id]=[x,z];if(!['existing-water','existing-coaster','existing-wheel','existing-tower'].includes(id))label(g,name,x,z,y,'existing',id)};
 const groundPatch=poly(g,old,0x9f9d79,1.2,0,'park');
 groundPatch.userData.groundSurface=true;groundPatch.userData.drape=true;
 const texture=await new THREE.TextureLoader().loadAsync('/reference/pnoa.jpg');texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
 const shape=new THREE.Shape();old.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);
 const pos=geo.attributes.position,uv=geo.attributes.uv;const [minX,minZ]=P([0,0]),[maxX,maxZ]=P([1472,1692]);
 for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)-minX)/(maxX-minX),1-(pos.getZ(i)-minZ)/(maxZ-minZ));
 const aerial=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:texture,roughness:1,color:0xe8e5d8}));aerial.position.y=1.24;aerial.userData.drape=true;aerial.userData.groundSurface=true;aerial.receiveShadow=true;g.add(aerial);
 // The actual spine curves through the southern gardens and around the central circular plaza.
 smooth([[796,1390],[715,1295],[623,1230],[549,1180],[518,1090],[500,1009],[477,937],[472,857],[484,804]],5.4);
 smooth([[821,1220],[725,1202],[649,1132],[598,1070],[551,1021],[545,974]],4.6);
 smooth([[367,1184],[425,1178],[499,1197],[569,1210],[628,1253]],4);
 smooth([[290,1110],[363,1100],[429,1093],[469,1067],[485,1010]],4.2);
 smooth([[307,943],[363,953],[414,965],[470,989],[527,986]],3.7);
 smooth([[326,880],[375,841],[443,824],[484,804]],4);
 smooth([[367,744],[409,780],[454,793],[484,804]],4);
 smooth([[495,638],[493,589],[507,536],[518,464],[489,393],[462,341]],4.8);
 smooth([[416,470],[463,486],[514,522],[576,565],[635,607],[665,638]],4.4);
 smooth([[566,663],[605,633],[636,600],[663,568],[687,541]],5.3);
 smooth([[642,688],[720,679],[787,669],[843,649],[882,603],[893,544]],4.8);
 smooth([[558,353],[601,332],[631,306],[649,262]],4.2);
 smooth([[582,465],[629,463],[675,468],[728,455],[791,434]],4.2);
 // Circular plaza and the concentric fountain are anchored to the photograph.
 disk([550,719],29.3,0xd8c6a2,1.4);const fountainStart=g.children.length;disk([550,719],13.0,0x8a7358,1.65,.6);disk([550,719],11.1,0xc1c0ae,2.25,.5);disk([550,719],9.9,0x849e9b,2.75,.15);disk([550,719],5.4,0xd9d4be,2.9,.22);disk([550,719],4.2,0x849e9b,3.12,.12);disk([550,719],1.7,0xe3d9be,3.25,1.6);
 const [fx,fz]=P([550,719]);for(let i=0;i<12;i++){const a=i*Math.PI/6,x=fx+Math.cos(a)*12.2,z=fz+Math.sin(a)*12.2;cyl(g,x,2,z,.32,1.5,0xd6caaa)}
 rigidUnit(fountainStart,P([550,719]),'Fuente · conjunto rígido');
 feature('existing-fountain','Plaza de España · fuente',[550,719],9);
 const specials=await buildSpecials({group:g,mesh,box,cyl,poly,ribbon,line,label,imageToWorld:P,terrain});
 feature('existing-theatre','Teatro Tívoli · auditorio',[680,820],13);
 const waterDetails=buildWaterDetails({group:g,terrain,mesh,box,cyl,label,imageToWorld:P});
 feature('existing-water','Tívoli Agua',[960,655],18);
 const northCoaster=buildNorthCoaster({group:g,terrain,mesh,box,cyl,imageToWorld:P});
 feature('existing-coaster','Montaña rusa · sector norte',[690,273],20);
 const photoRides=await buildPhotoRides({group:g,terrain,mesh,box,cyl,imageToWorld:P});
 const photoLandmarks=buildPhotoLandmarks({group:g,terrain,mesh,box,cyl,poly,label,imageToWorld:P,buildings:buildings.buildings});
 feature('existing-wheel','Noria gigante',[850,500],36);
 // Drop tower base is west of the central spine, as opposed to the invented north-centre position.
 const thrill=buildThrillRides({group:g,terrain,mesh,box,cyl,label,imageToWorld:P});feature('existing-tower','Caída Libre · 60 m',[355,537],65);
 // Kart track has an asymmetric figure-eight footprint rather than a generic oval.
 const karting=buildKarting({group:g,terrain,mesh,box,cyl,imageToWorld:P});
 feature('existing-entry','Entrada histórica · taquillas',[803,1300],12);
 // Roof footprints are independently traced from PNOA. No generic grid of pavilions is used here.
 for(const b of buildings.buildings){if(b.name==='Cubierta oeste')continue;const buildingStart=g.children.length,buildingAnchor=b.points.reduce((a,p)=>[a[0]+p[0]/b.points.length,a[1]+p[1]/b.points.length],[0,0]),buildingLevel=Math.max(...b.points.map(p=>heightAt(...p)));foundation(b.points,buildingLevel,0xb7aa91);poly(g,b.points,0xd8c6a4,b.height,1.4,'park');poly(g,b.points,b.roof==='tile'?0xae7860:b.roof==='shed'?0xc5c2b1:0xc7baa0,.35,1.4+b.height,'park');if(b.roof==='tile'&&b.points.length===4){let p=[...b.points];if(Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1])>Math.hypot(p[2][0]-p[1][0],p[2][1]-p[1][1]))p=[p[1],p[2],p[3],p[0]];const y=1.8+b.height,r1=[(p[0][0]+p[1][0])/2,y+1.5,(p[0][1]+p[1][1])/2],r2=[(p[2][0]+p[3][0])/2,y+1.5,(p[2][1]+p[3][1])/2],a=p.map(q=>[q[0],y,q[1]]),verts=[...a[0],...a[1],...r1,...a[2],...a[3],...r2,...a[0],...r1,...r2,...a[0],...r2,...a[3],...a[1],...a[2],...r2,...a[1],...r2,...r1];const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));roofGeo.computeVertexNormals();const roof=new THREE.Mesh(roofGeo,new THREE.MeshStandardMaterial({color:0xae7860,side:THREE.DoubleSide,roughness:1}));roof.castShadow=true;g.add(roof);}const c=b.points.reduce((a,p)=>[a[0]+p[0]/b.points.length,a[1]+p[1]/b.points.length],[0,0]);for(let i=0;i<b.points.length;i++){const a=b.points[i],d=b.points[(i+1)%b.points.length],len=Math.hypot(a[0]-d[0],a[1]-d[1]);for(let t=2.5;t<len-1;t+=4){const x=a[0]+(d[0]-a[0])*t/len,z=a[1]+(d[1]-a[1])*t/len;const win=box(g,x,2.2,z,1.4,1.9,.12,0x637568);win.rotation.y=Math.atan2(-(d[1]-a[1]),d[0]-a[0]);}}rigidUnit(buildingStart,buildingAnchor,b.name||'Pabellón histórico',buildingLevel);}
 const trees=await fetch('/current-trees.json').then(r=>r.json());
 trees.points=trees.points.filter(([x,z,size])=>!waterDetails.clearance(x,z,2+size)&&!karting.clearance(x,z,2+size));
 const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.25,.4,1,7),new THREE.MeshStandardMaterial({color:0x776b52}),trees.points.length);
 const crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),trees.points.length*3);const dummy=new THREE.Object3D();
 trees.points.forEach(([x,z,size],i)=>{const h=4+size*.8;dummy.position.set(x,1.4+h/2,z);dummy.scale.set(1,h,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);for(let k=0;k<3;k++){const a=i*2.399+k*2.1;dummy.position.set(x+Math.cos(a)*size*.6,1.4+h+Math.sin(a)*size*.25,z+Math.sin(a)*size*.6);dummy.scale.set(size*(k? .8:1),size*.8,size*(k? .8:1));dummy.rotation.y=a;dummy.updateMatrix();crowns.setMatrixAt(i*3+k,dummy.matrix);crowns.setColorAt(i*3+k,new THREE.Color().setHSL(.26+(i%7)*.005,.21+(i%5)*.025,.31+(i%8)*.014));}});trunks.castShadow=true;crowns.castShadow=true;crowns.receiveShadow=true;g.add(trunks,crowns);
 // A ring of slim palms is legible around the plaza without filling its open paved space.
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const x=fx+Math.cos(a)*27,z=fz+Math.sin(a)*27;cyl(g,x,1.4,z,.22,7,0xa38e6b);for(let j=0;j<6;j++){const leaf=mesh(g,new THREE.SphereGeometry(1,5,3),0x647e51,x+Math.cos(j)*1.4,8.5,z+Math.sin(j)*1.4);leaf.scale.set(2.4,.35,.7);leaf.rotation.y=-j;}}
 const attractions=await buildAttractions({group:g,mesh,box,cyl,poly,ribbon,line,label,terrain});
 return {update(t){attractions.update(t);karting.update(t);thrill.update(t);waterDetails.update(t);photoRides.update(t);northCoaster.update(t);photoLandmarks.update(t)},updateTerrain(){karting.updateTerrain();thrill.updateTerrain();waterDetails.updateTerrain();photoLandmarks.updateTerrain()},targets:{...features,...attractions.targets,...photoLandmarks.targets},setAerial(v){aerial.visible=v},counts:{buildings:buildings.buildings.length,trees:trees.points.length,paths:paths.length,features:Object.keys(features).length,...specials.counts,...attractions.counts}};
}
