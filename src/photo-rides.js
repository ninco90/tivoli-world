import * as THREE from 'three';

// Exterior details reconstructed from the visitor photographs supplied by the user.
// Footprints retain the historic catalogue's approximate locations; no surveyed dimensions.
export async function buildPhotoRides({group,terrain,mesh,box,cyl,imageToWorld}) {
  const response=await fetch('/attractions.json');
  if(!response.ok)throw Error('No se pudo cargar el catÃ¡logo de atracciones');
  const {items}=await response.json(),updates=[],targets={};
  const metal=0xaab4b9,gold=0xd8b45c,blue=0x347998,red=0x903c3c;
  function unit(number,x,z,w,d){
    const id=`attraction-${number}`,g=new THREE.Group();g.position.set(x,0,z);
    const level=Math.max(...[-1,1].flatMap(sx=>[-1,1].map(sz=>terrain.relative(x+sx*w/2,z+sz*d/2))));
    g.userData.terrainLevel=level;g.name=`photo-${id}`;group.add(g);targets[id]=[x,z];
    // Separate piers support the rigid platform across the sampled terrain slope.
    for(const sx of [-1,1])for(const sz of [-1,1]){
      const px=sx*(w/2-.6),pz=sz*(d/2-.6),bottom=terrain.relative(x+px,z+pz)-level-.3;
      box(g,px,bottom,pz,1.15,.35-bottom,1.15,0xb6aa8e,id);
    }
    box(g,0,.15,0,w,.28,d,0xc5b796,id);
    return {g,id};
  }
  function rod(g,a,b,r=.08,color=metal,id){
    const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b);
    const o=mesh(g,new THREE.CylinderGeometry(r,r,p.distanceTo(q),6),color,0,0,0,id);
    o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),q.sub(p).normalize());return o;
  }
  function tube(g,points,r,color,id,closed=false){return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed),points.length*4,r,5,closed),color,0,0,0,id);}
  function fence(g,w,d,id){for(const z of [-d/2,d/2]){rod(g,[-w/2,1.5,z],[w/2,1.5,z],.055,metal,id);for(let x=-w/2;x<=w/2;x+=.75)rod(g,[x,.4,z],[x,1.5,z],.035,metal,id);}}
  function wheel(number,anchor,r,count,small){
    const {g,id}=unit(number,...anchor,r*1.45,small?5:8),cy=r+2.1,color=small?blue:metal;
    for(const x of [-r*.48,r*.48])for(const z of [-2,2]){
      rod(g,[x,.4,z],[0,cy,z*.4],small?.18:.28,color,id);
      for(let k=1;k<6;k++){
        const y1=.4+(cy-.4)*k/7,y2=.4+(cy-.4)*(k+1)/7;
        const x1=x*(1-k/7),x2=x*(1-(k+1)/7);
        rod(g,[x1-.25,y1,z*(1-k/10)],[x2+.25,y2,z*(1-(k+1)/10)],.055,color,id);
      }
    }
    rod(g,[-r*.37,cy*.24,-2],[r*.37,cy*.24,-2],.12,color,id);
    const rotor=new THREE.Group();rotor.position.y=cy;g.add(rotor);
    for(const z of [-.45,.45])mesh(rotor,new THREE.TorusGeometry(r,.085,5,96),small?0xf0e9cd:gold,0,0,z,id);
    const cabins=[];
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2,x=Math.cos(a)*r,y=Math.sin(a)*r;
      for(const z of [-.45,.45])rod(rotor,[0,0,z],[x,y,z],.055,color,id);
      if(!small){const aa=a+Math.PI*4/count;rod(rotor,[x,y,-.45],[Math.cos(aa)*r,Math.sin(aa)*r,.45],.035,metal,id);}
      else {
        const heart=[];
        for(let j=0;j<=32;j++){const t=j/32*Math.PI*2;heart.push(new THREE.Vector3(Math.pow(Math.sin(t),3)*1.7,(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.105,0));}
        const decor=new THREE.Group();decor.position.set(x*.65,y*.65,0);decor.rotation.z=a-Math.PI/2;rotor.add(decor);tube(decor,heart,.045,i%2?0xc46166:0xf0eadc,id,true);
      }
      const cabin=new THREE.Group();cabin.position.set(x,y,0);rotor.add(cabin);cabins.push(cabin);
      const cw=small?1.05:1.4,ch=small?.8:1.05;
      cyl(cabin,0,-ch-.3,0,cw*.65,ch,small?0xdcd6b9:red,id);
      for(const sx of [-1,1])for(const sz of [-1,1])rod(cabin,[sx*cw*.5,-.4,sz*.5],[sx*cw*.5,.95,sz*.5],.045,gold,id);
      const roof=mesh(cabin,new THREE.ConeGeometry(cw*.95,.35,small?4:6),small?0x5f797e:red,0,1.05,0,id);if(small)roof.rotation.y=Math.PI/4;
      for(const z of [-.61,.61]){
        rod(cabin,[-cw*.55,-.7,z],[cw*.55,-.7,z],.06,gold,id);
        for(const x of [-cw*.35,0,cw*.35])mesh(cabin,new THREE.TorusGeometry(.13,.027,4,12),gold,x,-.98,z,id);
      }
      box(cabin,0,-1.05,0,cw*.8,.16,.75,0x654d43,id);
    }
    mesh(rotor,new THREE.CylinderGeometry(.6,.6,1.2,16),gold,0,0,0,id).rotation.x=Math.PI/2;
    fence(g,r*1.45,small?5:8,id);
    updates.push(t=>{const a=t*(small?.085:.043);rotor.rotation.z=a;cabins.forEach(c=>c.rotation.z=-a);});
  }
  wheel(10,imageToWorld([850,500]),14,24,false);
  const small=items.find(i=>i.number===4);wheel(4,[small.x,small.z],6,8,true);

  // Twister: inclined lifting-paratrooper rotor, hanging two-person gondolas.
  {
    const item=items.find(i=>i.number===6),{g,id}=unit(6,item.x,item.z,18,18);
    cyl(g,0,.43,0,8.6,.25,0x8a9a8b,id);box(g,0,.68,6,3,2.5,3,blue,id);
    // Rear hinge carries a lifting boom; the rotor translates as the boom rises.
    const lift=new THREE.Group();lift.name='Twister · brazo elevador';lift.position.set(0,3.2,6);g.add(lift);
    rod(g,[-1.8,3.2,6],[1.8,3.2,6],.48,gold,id);
    for(const x of [-.5,.5])rod(lift,[x,0,0],[x,0,-8],.28,0xd5a02f,id);
    for(let z=-1;z>-8;z-=1.4)rod(lift,[-.5,0,z],[.5,0,z-1],.1,gold,id);
    const tilt=new THREE.Group();tilt.position.z=-8;lift.add(tilt);
    const hydraulic=rod(g,[0,.9,4.7],[0,4,1],.22,metal,id);
    const hydraulicBase=new THREE.Vector3(0,.9,4.7),hydraulicEnd=new THREE.Vector3(),axis=new THREE.Vector3(0,1,0);
    const hydraulicLength=hydraulic.geometry.parameters.height;
    const rotor=new THREE.Group();tilt.add(rotor);const cars=[];
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5,x=7.1*Math.cos(a),y=7.1*Math.sin(a);
      rod(rotor,[0,0,-.5],[x,y,0],.11,i%2?red:gold,id);
      rod(rotor,[0,0,.4],[x,y,0],.06,0xe0ba63,id);
      const b=a+Math.PI/5;rod(rotor,[x,y,0],[7.1*Math.cos(b),7.1*Math.sin(b),0],.055,red,id);
      const car=new THREE.Group();car.position.set(x,y,0);rotor.add(car);cars.push(car);
      const color=[0x3d8796,0xb24738,0x558747,0xd49b36][i%4];
      for(const sx of [-.85,.85])rod(car,[sx,0,0],[sx,-1.7,0],.055,metal,id);
      box(car,0,-1.9,0,1.9,.4,1.3,color,id);box(car,0,-1.5,-.45,1.8,.8,.2,color,id);
      rod(car,[-.8,-1.15,.45],[.8,-1.15,.45],.06,metal,id);
      const roof=mesh(car,new THREE.CylinderGeometry(1.1,1.1,.12,20),color,0,.2,0,id);
      roof.rotation.x=.12;
      for(let k=0;k<8;k++){const a=k*Math.PI/4;mesh(car,new THREE.SphereGeometry(.11,5,4),gold,Math.cos(a)*.6,.28,Math.sin(a)*.6,id);}
    }
    fence(g,18,18,id);
    const q=new THREE.Quaternion();updates.push(t=>{const angle=.12+.96*(.5-.5*Math.cos(t*.16));lift.rotation.x=angle;
      tilt.rotation.x=Math.PI/2-2*angle;rotor.rotation.z=t*.38;
      hydraulicEnd.set(0,0,-5).applyQuaternion(lift.quaternion).add(lift.position);
      hydraulic.position.copy(hydraulicBase).add(hydraulicEnd).multiplyScalar(.5);
      hydraulic.scale.y=hydraulicBase.distanceTo(hydraulicEnd)/hydraulicLength;
      hydraulic.quaternion.setFromUnitVectors(axis,hydraulicEnd.sub(hydraulicBase).normalize());
      q.copy(lift.quaternion).multiply(tilt.quaternion).multiply(rotor.quaternion).invert();cars.forEach(c=>c.quaternion.copy(q));});
  }
  // Guided vintage Ford cars: distinct engine bonnet, radiator, canopy and spoked wheels.
  {
    const item=items.find(i=>i.number===29),{g,id}=unit(29,item.x,item.z,21,13);
    const path=new THREE.CatmullRomCurve3([[-8,0,-3],[-4,0,-5],[5,0,-4],[8,0,0],[5,0,4],[-4,0,4],[-8,0,2]].map(p=>new THREE.Vector3(...p)),true);
    for(const offset of [-.64,.64]){
      const ps=[];for(let k=0;k<100;k++){const u=k/100,p=path.getPointAt(u),v=path.getTangentAt(u);ps.push(new THREE.Vector3(p.x+v.z*offset,.48,p.z-v.x*offset));}tube(g,ps,.065,0x665d50,id,true);
    }
    const cars=[];
    for(let i=0;i<4;i++){
      const c=new THREE.Group();g.add(c);cars.push(c);const color=[0xd5aa36,0x963e3e,0x427a84,0x648151][i];
      box(c,0,.44,0,1.25,.25,2.5,color,id);box(c,0,.7,.65,.85,.65,1.1,color,id);
      box(c,0,.72,1.24,.9,.76,.1,0xc9c9b2,id);for(let j=-3;j<=3;j++)box(c,j*.105,.77,1.303,.025,.6,.018,0x525454,id);
      box(c,0,.83,-.7,1.06,.48,.25,0x513d34,id);box(c,0,.67,-.4,1.06,.17,.72,0x513d34,id);
      box(c,0,2,-.32,1.42,.14,1.7,0x393b38,id);
      for(const x of [-.61,.61])for(const z of [-1,.42])rod(c,[x,.7,z],[x,2,z],.038,metal,id);
      for(const x of [-.73,.73])for(const z of [-.78,.83]){
        const w=mesh(c,new THREE.CylinderGeometry(.38,.38,.17,14),0x373a38,x,.45,z,id);w.rotation.z=Math.PI/2;
        for(let j=0;j<6;j++){const a=j*Math.PI/3;rod(c,[x*1.13,.45,z],[x*1.13,.45+Math.cos(a)*.29,z+Math.sin(a)*.29],.025,gold,id);}
      }
      for(const x of [-.52,.52])mesh(c,new THREE.SphereGeometry(.12,8,6),0xeee0ac,x,1.12,1.25,id);
      const steer=mesh(c,new THREE.TorusGeometry(.2,.035,4,12),0x292b29,.27,1.14,.08,id);steer.rotation.x=-.65;
    }
    updates.push(t=>cars.forEach((c,i)=>{const u=(t*.012+i/4)%1,p=path.getPointAt(u),v=path.getTangentAt(u);c.position.set(p.x,.48,p.z);c.rotation.y=Math.atan2(v.x,v.z);}));
  }
  return {targets,update(t){for(const update of updates)update(t);}};
}
