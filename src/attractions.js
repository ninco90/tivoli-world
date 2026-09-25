import {rideMotion,orientOnTrack} from './ride-motion.js';
import * as THREE from 'three';

// The 40 names come from the historic visitor guide. Small ride footprints and
// machinery are interpretive models, never a claim of surveyed dimensions.
export async function buildAttractions({group,mesh,box,cyl,poly,ribbon,line,label,terrain}) {
  const response=await fetch('/attractions.json');
  if(!response.ok) throw new Error('No se pudo cargar el catálogo de atracciones');
  const catalog=await response.json();
  const targets={},updates=[];
  const alreadyBuilt=new Set([1,2,3,4,6,8,10,15,18,27,28,29]);
  const palette=[0xb5634d,0x568b9a,0xc6a354,0x718c65,0xa8748b,0xb5ab82];
  const metal=0xc4c2aa, timber=0x8b684d, water=0x6aabb0;
  let models=0; const geometryCache=new Map(); let foundations=0;
  for(const item of catalog.items) {
    const id=`attraction-${item.number}`;
    targets[id]=[item.x,item.z];
    const el=label(group,`${item.number} · ${item.name}`,item.x,item.z,
      item.number===3?66:item.number===10?36:12,'attraction',id);
    if(el) el.title=`${item.name}. ${item.positionNote}`;
    if(alreadyBuilt.has(item.number)) continue;
    const g=new THREE.Group();g.position.set(item.x,1.45,item.z);
    g.userData.attraction=id;g.userData.positionConfidence=item.confidence;
    group.add(g);models++;
    const historicColors={2:0xd6ac35,4:0xb43b40,5:0xd3b04c,6:0x5387a3,9:0xb9443f,13:0x719b59,14:0xba5680,16:0x427a59,19:0xce8747,22:0x579fa7,26:0xc4584d,28:0x398b79,30:0xc94845,31:0x79a4b9,34:0x95454a,35:0x69a2a1,36:0xe0b95b,37:0x9f5a91,38:0xb26956};
    const color=historicColors[item.number]??palette[item.number%palette.length];
    const b=(x,y,z,w,h,d,c=color)=>box(g,x,y,z,w,h,d,c,id);
    const c=(x,y,z,r,h,col=color,r2=r)=>cyl(g,x,y,z,r,h,col,id,r2);
    const m=(geo,col,x=0,y=0,z=0)=>mesh(g,geo,col,x,y,z,id);
    const ball=(x,y,z,r,col=color)=>m(new THREE.SphereGeometry(r,10,7),col,x,y,z);
    const rod=(a,d,r=.12,col=metal)=>{
      const start=new THREE.Vector3(...a),end=new THREE.Vector3(...d);
      const obj=m(new THREE.CylinderGeometry(r,r,start.distanceTo(end),7),col);
      obj.position.copy(start).add(end).multiplyScalar(.5);
      obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
      return obj;
    };
    const ring=(radius,y,col=metal,tube=.12)=>{
      const o=m(new THREE.TorusGeometry(radius,tube,6,48),col,0,y,0);
      o.rotation.x=Math.PI/2;return o;
    };
    const car=(x,z,a=0,col=color,y=.25,scale=1)=>{
      const vehicle=new THREE.Group();vehicle.position.set(x,y,z);vehicle.rotation.y=a;g.add(vehicle);
      box(vehicle,0,.35,0,1.35*scale,.55*scale,2.1*scale,col,id);
      box(vehicle,0,.9,-.1,1*scale,.45*scale,.95*scale,0xc6d3cf,id);
      for(const sx of [-.7,.7])for(const sz of [-.6,.65]){
        const wheel=mesh(vehicle,new THREE.CylinderGeometry(.3*scale,.3*scale,.18*scale,9),0x4e5350,sx*scale,.4*scale,sz*scale,id);
        wheel.rotation.z=Math.PI/2;
      }
      return vehicle;
    };
    const boat=(x,z,a=0,col=color,y=.35)=>{
      const vessel=new THREE.Group();vessel.position.set(x,y,z);vessel.rotation.y=a;g.add(vessel);
      const hull=mesh(vessel,new THREE.SphereGeometry(1,12,7),col,0,.3,0,id);hull.scale.set(.9,.45,1.65);
      box(vessel,0,.45,0,1.1,.18,1.65,0xd7c3a0,id);
      box(vessel,0,.62,-.3,.75,.32,.38,0x8a6953,id);return vessel;
    };
    const ovalTrack=(rx,rz,width=1.4)=>{
      const pts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;pts.push([Math.cos(a)*rx,Math.sin(a)*rz]);}
      ribbon(g,pts,width,0x777971,.16,id);return pts;
    };
    const fence=(rx,rz)=>{
      for(let i=0;i<20;i++){const a=i/20*Math.PI*2;c(Math.cos(a)*rx,.1,Math.sin(a)*rz,.075,.9,metal);}
      const pts=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;pts.push([Math.cos(a)*rx,1,Math.sin(a)*rz]);}line(g,pts,metal);
    };
    const carousel=(radius=4, horses=false)=>{
      c(0,0,0,radius,.35,0xb7a488);c(0,.35,0,.28,4.4,metal);
      m(new THREE.ConeGeometry(radius+.6,2,16),color,0,5.25,0);
      ring(radius,4.25,0xd7bc77,.22);
      for(let i=0;i<8;i++){
        const a=i/8*Math.PI*2,x=Math.cos(a)*(radius-.8),z=Math.sin(a)*(radius-.8);
        c(x,.4,z,.07,3.7,metal);
        if(horses){const horse=ball(x,1.6,z,.55,0xe0d0ac);horse.scale.set(.55,.7,1.15);ball(x,2,z-.48,.24,0xe0d0ac);for(const dz of [-.28,.28])rod([x,1.5,z+dz],[x,.9,z+dz],.09,0xe0d0ac);}
        else {b(x,.45,z,1,.65,1.15,palette[i%6]);}
      }
    };
    switch(item.type) {
      case 'wheel': {
        const radius=item.number===4?6:3.7,cy=radius+1.5;
        const rim=m(new THREE.TorusGeometry(radius,.2,7,48),color,0,cy,0);
        for(let i=0;i<10;i++){const a=i*Math.PI/5,x=Math.cos(a)*radius,y=cy+Math.sin(a)*radius;rod([0,cy,0],[x,y,0],.07);b(x,y-.65,0,.95,.7,.9,palette[i%6]);b(x,y+.4,0,1.1,.12,1,0xe3d5af);for(const sx of [-.42,.42])rod([x+sx,y-.2,-.4],[x+sx,y+.4,-.4],.035,metal);}
        rod([-2,0,-1],[0,cy,0],.23);rod([2,0,1],[0,cy,0],.23);break;
      }
      case 'carousel': {
        if(item.number===36){c(0,0,0,3.7,.25,0xd5c49b);c(0,.25,0,.2,3,color);for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*2.7,z=Math.sin(a)*2.7;rod([0,2.7,0],[x,2.7,z],.1);const balloon=ball(x,4.4,z,.85,palette[i]);balloon.scale.y=1.35;b(x,2.1,z,.85,.5,.85,0xc5a47a);for(const sx of [-.3,.3])rod([x+sx,2.5,z],[x+sx,3.8,z],.03,metal);}}
        else {carousel(item.number===30?5:3.4,item.number===38||item.number===30);if(item.number===30){c(0,2.55,0,3.4,.25,0xd6c7a5);ring(3.35,3.65,0xe4c671,.12);for(let i=0;i<10;i++){const a=i*Math.PI/5,x=Math.cos(a)*3.25,z=Math.sin(a)*3.25;c(x,2.8,z,.07,.85,0xe4c671);if(i%2===0){const horse=ball(x*.75,3.4,z*.75,.42,0xeee3c5);horse.scale.set(.7,.7,1.2);}}}}
        break;
      }
      case 'tower': {
        b(0,0,0,4,.3,4,0xbcb199);for(const x of [-.55,.55])for(const z of [-.55,.55])c(x,.3,z,.13,9,color);
        for(let y=1;y<9;y+=1.2){rod([-.55,y,-.55],[.55,y+1,.55],.08);}
        b(0,2,0,2,.45,2,0xd3b16b);for(let i=0;i<4;i++)b((i-1.5)*.5,2.45,.9,.4,.6,.5,0x526d7f);break;
      }
      case 'coaster': {
        // Figure-eight footprint: the two central passes have 3 m vertical separation.
        const pts=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;pts.push(new THREE.Vector3(6.1*Math.sin(2*a),2.7+1.5*Math.cos(a),15*Math.sin(a)));}
        const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal');
        const frame=t=>{const p=curve.getPoint(t),v=curve.getTangent(t),normal=new THREE.Vector3(-v.z,0,v.x).normalize();return {p,v,normal};};
        for(const side of [-1,1]){const rail=[];for(let i=0;i<160;i++){const {p,normal}=frame(i/160);rail.push(p.addScaledVector(normal,side*.34));}m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail,true),200,.09,6,true),0xd18a39);}
        for(let i=0;i<90;i++){const {p,normal}=frame(i/90);rod(p.clone().addScaledVector(normal,-.48).toArray(),p.clone().addScaledVector(normal,.48).toArray(),.065,0x967449);}
        for(let i=0;i<28;i++){const {p,normal}=frame(i/28);for(const side of [-1,1]){const foot=p.clone().addScaledVector(normal,side*.68);rod([foot.x,.05,foot.z],[foot.x,p.y-.12,foot.z],.09,metal);}rod(p.clone().addScaledVector(normal,-.7).setY(p.y-.12).toArray(),p.clone().addScaledVector(normal,.7).setY(p.y-.12).toArray(),.09,metal);}
        const train=[];for(let i=0;i<3;i++)train.push(car(0,0,0,i%2?0xb95943:0xd6b353,0,.65));
        const motion=rideMotion(curve,{min:1.5,max:5.5,gravity:4,drag:.12}),length=curve.getLength();
        updates.push(t=>{const head=motion.at(t,.18);train.forEach((car,i)=>{const u=(head-i*1.55/length+1)%1;car.position.copy(curve.getPointAt(u)).add(new THREE.Vector3(0,.08,0));orientOnTrack(car,curve.getTangentAt(u));});});
        break;
      }
      case 'bumper': {
        const aquatic=item.number===27;b(0,0,0,12,.4,9,0xb6ada0);b(0,.42,0,11,.12,8,aquatic?water:0x777d79);
        for(let i=0;i<5;i++){const x=(i%3-1)*3,z=(Math.floor(i/3)-.5)*3;if(aquatic)boat(x,z,i*.7,palette[i%6]);else car(x,z,i*.8,palette[i%6]);}
        if(!aquatic){b(0,4.5,0,13,.4,10,0xc5baa2);for(const x of [-5.5,5.5])for(const z of [-4,4])c(x,0,z,.14,4.5);}
        break;
      }
      case 'boat': {
        if(item.number===27){b(0,0,0,11,.45,8,0x9c8669);b(0,.46,0,10,.12,7,water);for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.cos(a)*3.1,z=Math.sin(a)*1.9;c(x,.5,z,1,.35,0x4a5553);boat(x,z,a,palette[i],.65);}}
        else if(item.number===21){c(0,0,0,3.4,.3,0xc6b89d);c(0,.31,0,3,.12,water);for(let i=0;i<4;i++){const a=i*Math.PI/2;boat(Math.cos(a)*1.7,Math.sin(a)*1.7,a,palette[i]);}}
        else if([25,28].includes(item.number)){
          const v=boat(0,0,0,color,1.2);v.scale.set(1.8,1.6,2.5);c(0,1.3,0,.13,4.5,timber);
          b(.8,3.8,0,1.6,1.7,.1,0xd9cda9);rod([-3,0,0],[0,7,0],.2);rod([3,0,0],[0,7,0],.2);rod([0,7,0],[0,2,0],.09);
        }else{ovalTrack(4.8,3.2,2);for(let i=0;i<4;i++){const a=i*Math.PI/2;boat(Math.cos(a)*4.5,Math.sin(a)*3,a,palette[i]);}}
        break;
      }
      case 'karts': {
        ovalTrack(5.5,8.5,2.5);for(let i=0;i<4;i++){const a=i*Math.PI/2;car(Math.cos(a)*5.5,Math.sin(a)*8.5,-a,palette[i],.1,.6);}fence(7,10);break;
      }
      case 'train': {
        ovalTrack(5.5,8.5,.45);
        for(let i=0;i<4;i++){const a=.2+i*.28,x=Math.cos(a)*5.5,z=Math.sin(a)*8.5;const wagon=car(x,z,-a,color,.1,.6);if(i===0){box(wagon,0,1.3,-.5,.25,.7,.25,0x5b665d,id);}}
        b(-5,0,0,2.5,.2,3,0xc5b898);for(const z of [-1.2,1.2])c(-5,.2,z,.1,2.3,timber);b(-5,2.5,0,3,.22,3.5,0x965c4b);
        // Parallel rails, visible sleepers, engine boiler and station canopy.
        ovalTrack(5.05,8.05,.12);ovalTrack(5.95,8.95,.12);
        for(let i=0;i<36;i++){const a=i*Math.PI/18,x=Math.cos(a)*5.5,z=Math.sin(a)*8.5;const tie=b(x,.08,z,1.5,.08,.22,timber);tie.rotation.y=-a;}
        const a=.2,x=Math.cos(a)*5.5,z=Math.sin(a)*8.5;c(x,.85,z,.45,.7,color);b(x,1.3,z-.4,.9,.75,.65,color);b(x,2.05,z-.4,1.1,.12,.9,0x4d645c);break;
      }
      case 'playground': {
        b(0,0,0,8,.15,7,0xbcac83);
        if(item.number===40){b(-1,.2,0,4,.25,2.3,0x688b79);line(g,[[0,.45,-1.1],[0,.45,1.1]],0xe0ddd1);b(3,.2,0,1.5,2.5,.3,0x8b806b);}
        else{for(const x of [-2,2]){for(const z of [-2,2])c(x,0,z,.12,2.8,timber);b(x,2,0,1.8,.15,3.7,0xc4ad7f);}b(0,2,0,4,.12,1,0x8d8063);const slide=b(3,1,2,1.2,.12,4,0x739da7);slide.rotation.x=.55;for(let i=0;i<5;i++)b(-3,.2+i*.35,-1+i*.4,1,.15,.5,0xb79465);}
        break;
      }
      case 'building': {
        // Existing roof footprints are already traced elsewhere: add themed frontage only.
        b(0,.2,0,6,4,1.4,0x87765f);b(0,.2,.8,2,2.8,.12,0x3d4747);
        for(const x of [-2.5,2.5]){c(x,.2,0,.8,5,0x958a70);m(new THREE.ConeGeometry(1,1.8,5),0x675e67,x,6,0);}
        for(const x of [-1.8,1.8])b(x,2.7,.74,.65,.9,.12,0xd7b86f);break;
      }
      default: {
        if(item.number===1){
          ovalTrack(7,3.7,.5);for(let i=0;i<3;i++){const x=(i-1)*3,body=ball(x,1.3,0,.8,0x788968);body.scale.set(1.7,.7,.6);rod([x+.8,1.4,0],[x+1.35,2.2,0],.2,0x788968);ball(x+1.4,2.2,0,.25,0x788968);rod([x-1,1.2,0],[x-2,1,0],.15,0x788968);for(const dx of [-.7,.7])rod([x+dx,1,0],[x+dx,.15,0],.14,0x788968);}
        } else if(item.number===2){
          for(const z of [-2,2]){rod([-5,0,z],[0,6,z],.35);rod([5,0,z],[0,6,z],.35);}b(0,1,0,7,1,3,color);for(let i=0;i<7;i++)b((i-3)*.8,2,0,.5,.7,1.5,0x455e68);rod([0,6,-2],[0,1,-1.5],.18);rod([0,6,2],[0,1,1.5],.18);
        } else if(item.number===11){
          ovalTrack(4,6,.45);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*4,z=Math.sin(a)*6;const horse=ball(x,1.25,z,.6,palette[i]);horse.scale.set(.6,.8,1.25);ball(x,1.8,z-.55,.26,palette[i]);b(x,1.65,z,.45,.12,.65,0x594a40);for(const dx of [-.2,.2])for(const dz of [-.4,.4])rod([x+dx,1.1,z+dz],[x+dx,.25,z+dz],.08,palette[i]);c(x,.05,z,.09,1,metal);}
        } else if([20,29].includes(item.number)){
          ovalTrack(4,6,1.5);for(let i=0;i<4;i++){const a=i*Math.PI/2;car(Math.cos(a)*4,Math.sin(a)*6,-a,palette[i],.1,.65);}
        } else if(item.number===35){
          c(0,0,0,.3,5,metal);m(new THREE.ConeGeometry(4.3,1.4,16),color,0,5.4,0);for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.cos(a)*3.5,z=Math.sin(a)*3.5;rod([x,4.7,z],[x*1.16,1.3,z*1.16],.035);b(x*1.16,1.1,z*1.16,.7,.15,.7,palette[i%6]);b(x*1.16,1.25,z*1.16-.3,.7,.55,.12,palette[i%6]);rod([x+.28,4.7,z],[x*1.16+.28,1.3,z*1.16],.025);rod([x-.28,4.7,z],[x*1.16-.28,1.3,z*1.16],.025);}
        } else if(item.number===36){
          c(0,0,0,.2,3);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*3,z=Math.sin(a)*3;rod([0,2,0],[x,2,z],.1);const balloon=ball(x,4,z,.9,palette[i]);balloon.scale.y=1.35;b(x,2,z,.8,.65,.8,0xc5a47a);}
        } else if([22,32].includes(item.number)){
          c(0,0,0,.3,2);for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*3.5,z=Math.sin(a)*3.5;rod([0,1.4,0],[x,1.4,z],.12);const body=b(x,1.1,z,.7,.65,1.9,palette[i]);body.rotation.y=-a;b(x,1.3,z,2.2,.12,.6,palette[i]);}
        } else if(item.number===13){
          c(0,0,0,4,.3,0xb9ac93);c(0,.3,0,.6,2.5,color);for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*3,z=Math.sin(a)*3;rod([0,2,0],[x,.8,z],.15);b(x,.7,z,1,.65,1.2,palette[i%6]);}
        } else if(item.number===14){
          const pts=[];for(let i=0;i<=40;i++){const a=i*Math.PI/20;pts.push([Math.cos(a)*4,Math.sin(a)*3]);}ribbon(g,pts,2.3,0xc4b285,.35,id);for(let i=0;i<8;i++){const a=i*Math.PI/4;car(Math.cos(a)*4,Math.sin(a)*3,-a,palette[i%6],.5,.6);}ring(4.8,2.1,color,.15);
        } else {
          c(0,0,0,3.8,.25,0xb7aa8b);c(0,.25,0,.45,1.5,color);
          for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.cos(a)*2.8,z=Math.sin(a)*2.8;rod([0,1.3,0],[x,.6,z],.18);c(x,.3,z,1.1,.5,palette[i]);for(let j=0;j<3;j++){const aa=j*Math.PI*2/3;b(x+Math.cos(aa)*.7,.8,z+Math.sin(aa)*.7,.6,.5,.6,color);}}
        }
      }
    }
    // Level the ride footprint above its local high point. Each foundation foot
    // reaches the sampled DEM, avoiding ride bases cutting through a hillside.
    g.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(g),width=Math.min(19,bounds.max.x-bounds.min.x+.8),depth=Math.min(item.type==='coaster'?28:23,bounds.max.z-bounds.min.z+.8);
    g.rotation.y=item.rotationY||0;
    const groundAt=(x,z)=>{const a=g.rotation.y;return terrain?terrain.relative(item.x+x*Math.cos(a)+z*Math.sin(a),item.z-x*Math.sin(a)+z*Math.cos(a)):0;};
    if(item.type!=='building'){
      const samples=[[-width/2,-depth/2],[width/2,-depth/2],[-width/2,depth/2],[width/2,depth/2],[0,0],[-width/2,0],[width/2,0],[0,-depth/2],[0,depth/2]],centerElevation=terrain?terrain.relative(item.x,item.z):0;
      const localHeights=samples.map(([x,z])=>groundAt(x,z)),level=Math.max(centerElevation,...localHeights);
      if(terrain)g.userData.terrainLevel=level;
      if(item.number!==19)b(0,-.45,0,width,.45,depth,0xc0b79c);
      if(item.number!==19)samples.slice(0,4).forEach(([x,z],i)=>{const bottom=localHeights[i]-level-1.45,foot=b(x,bottom,z,.65,-bottom-.35,.65,0xa7a392);foot.userData.foundation=true;});
      if(item.number===19){for(let i=0;i<28;i++){const a=i/28*Math.PI*2,x=6.1*Math.sin(2*a),z=15*Math.sin(a),dx=12.2*Math.cos(2*a),dz=15*Math.cos(a),length=Math.hypot(dx,dz);for(const side of [-1,1]){const px=x-dz/length*side*.68,pz=z+dx/length*side*.68,bottom=groundAt(px,pz)-level-1.45;rod([px,bottom,pz],[px,.06,pz],.09,metal);b(px,bottom,pz,.35,.15,.35,0xa7a392);}}}
      // Discreet queue rail only where the small footprint leaves space.
      if(width>=6&&depth>=6&&item.type!=='coaster'&&item.type!=='karts'&&item.type!=='train'){
        const z=depth/2-.25;for(const x of [-width*.4,-width*.2,width*.2,width*.4])c(x,0,z,.055,1,metal);
        rod([-width*.4,.9,z],[-width*.2,.9,z],.045);rod([width*.2,.9,z],[width*.4,.9,z],.045);
        b(width*.38,.35,z,.45,.5,.08,color);
      }
      foundations++;
    }
    // Parent terrain application clones geometries, so cache only immutable
    // primitives inside these rigid assemblies; their local meshes remain shared.
    g.traverse(object=>{if(!object.isMesh||!object.geometry.parameters)return;const key=object.geometry.type+JSON.stringify(object.geometry.parameters);const shared=geometryCache.get(key);if(shared){if(shared!==object.geometry)object.geometry.dispose();object.geometry=shared;}else geometryCache.set(key,object.geometry);});
  }
  return {update(t){updates.forEach(update=>update(t));},targets,catalog,counts:{attractions:catalog.items.length,addedModels:models,foundations,sharedGeometries:geometryCache.size}};
}
