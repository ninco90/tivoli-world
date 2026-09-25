import * as THREE from 'three';

// Footprints come from the PNOA tracing. Vertical dimensions and seat counts are illustrative.
// Each whole structure is translated once by terrain.apply, retaining level architecture.
export async function buildSpecials({group,mesh,box,cyl,poly,ribbon,line,label,imageToWorld,terrain}){
 const response=await fetch('/current-specials.json');if(!response.ok)throw new Error('No se pudieron cargar auditorio y entrada');const data=await response.json();
 const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:.9,side:THREE.DoubleSide});
 const inside=(p,polygon)=>{let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
 function makeGroup(pixel,name){const p=imageToWorld(pixel),g=new THREE.Group();g.name=name;g.position.set(p[0],1.5,p[1]);group.add(g);return {g,p,P:q=>{const v=imageToWorld(q);return [v[0]-p[0],v[1]-p[1]]}};}
 function surface(g,points,height,color,id){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,height(pos.getX(i),pos.getZ(i)));geo.computeVertexNormals();return mesh(g,geo,color,0,0,0,id);}
 function sign(g,text,position,width,height,direction,color='#efeee5',background=null){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');if(background){c.fillStyle=background;c.fillRect(0,0,1024,256);}c.font='bold 164px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(text,512,136,985);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));m.position.copy(position);m.rotation.y=Math.atan2(direction.x,direction.z);g.add(m);return m;}

 // The theatre faces southeast, with the stage on the street side.
 const a=data.auditorium,{g:theatre,p:theatreAnchor,P:T}=makeGroup([680,815],'Auditorio histórico · unidad arquitectónica');
 const front=a.stage.frontLineImage.map(T),along=new THREE.Vector2(front[1][0]-front[0][0],front[1][1]-front[0][1]).normalize();
 const back=new THREE.Vector2(along.y,-along.x),origin=new THREE.Vector2((front[0][0]+front[1][0])/2,(front[0][1]+front[1][1])/2);
 const depth=(x,z)=>(x-origin.x)*back.x+(z-origin.y)*back.y;
 const floor=(x,z)=>.32+Math.max(0,depth(x,z))*.135;
 const boundary=a.boundaryImage.map(T);
 const ground=(x,z)=>terrain?.relative(x,z)??0;
 if(terrain)theatre.userData.terrainLevel=Math.max(...boundary.map(([x,z])=>ground(x+theatreAnchor[0],z+theatreAnchor[1])-floor(x,z)));
 function retaining(g,anchor,points,top,color){if(!terrain)return;const verts=[],level=g.userData.terrainLevel??ground(...anchor);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ya=ground(a[0]+anchor[0],a[1]+anchor[1])-level-.26,yb=ground(b[0]+anchor[0],b[1]+anchor[1])-level-.26;verts.push(a[0],ya,a[1],b[0],yb,b[1],b[0],top(...b),b[1],a[0],ya,a[1],b[0],top(...b),b[1],a[0],top(...a),a[1]);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,material(color));m.castShadow=true;g.add(m);}
 surface(theatre,boundary,floor,0xcac2ab,'existing-theatre');retaining(theatre,theatreAnchor,boundary,floor,0xbbb19c);
 const patches=a.seatingPatches.map(p=>({...p,points:p.pointsImage.map(T)}));
 const yaw=Math.atan2(-along.y,along.x),seats=[];let rowIndex=0;
 for(let d=2;d<44;d+=.9,rowIndex++){
  let segment=null;const spans=[];
  for(let u=-35;u<=35;u+=.62){const x=origin.x+along.x*u+back.x*d,z=origin.y+along.y*u+back.y*d;const patch=patches.find(p=>inside([x,z],p.points));if(patch){seats.push({x,z,y:.32+d*.135,color:patch.color});if(segment===null)segment=u;}else if(segment!==null){spans.push([segment,u-.62]);segment=null;}}
  if(segment!==null)spans.push([segment,35]);
  for(const [l,r] of spans){const mid=(l+r)/2,x=origin.x+along.x*mid+back.x*d,z=origin.y+along.y*mid+back.y*d,y=.32+d*.135;const step=box(theatre,x,y-.16,z,r-l+.58,.16,.88,0xc4beaa,'existing-theatre');step.rotation.y=yaw;}
 }
 const cushion=new THREE.InstancedMesh(new THREE.BoxGeometry(.46,.075,.43),material(0xffffff),seats.length);
 const rests=new THREE.InstancedMesh(new THREE.BoxGeometry(.46,.43,.07),material(0xffffff),seats.length);
 const legs=new THREE.InstancedMesh(new THREE.BoxGeometry(.075,.43,.18),material(0x625f54),seats.length);
 const dummy=new THREE.Object3D();seats.forEach((s,i)=>{dummy.rotation.set(0,yaw,0);dummy.position.set(s.x,s.y+.43,s.z);dummy.updateMatrix();cushion.setMatrixAt(i,dummy.matrix);cushion.setColorAt(i,new THREE.Color(s.color));dummy.position.set(s.x+back.x*.19,s.y+.67,s.z+back.y*.19);dummy.updateMatrix();rests.setMatrixAt(i,dummy.matrix);rests.setColorAt(i,new THREE.Color(s.color));dummy.position.set(s.x,s.y+.2,s.z);dummy.updateMatrix();legs.setMatrixAt(i,dummy.matrix);});for(const m of [cushion,rests,legs]){m.castShadow=true;m.receiveShadow=true;theatre.add(m);}
 for(const aisle of a.aisles){const points=aisle.pointsImage.map(T);for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i],v=new THREE.Vector2(q[0]-p[0],q[1]-p[1]),n=new THREE.Vector2(-v.y,v.x).normalize().multiplyScalar(.38);surface(theatre,[[p[0]+n.x,p[1]+n.y],[q[0]+n.x,q[1]+n.y],[q[0]-n.x,q[1]-n.y],[p[0]-n.x,p[1]-n.y]],(x,z)=>floor(x,z)+.08,0xded7c2,'existing-theatre');}}
 const stage=a.stage.pointsImage.map(T);poly(theatre,stage,0x746f61,1.1,0,'existing-theatre');poly(theatre,stage,0xb9b3a2,.12,1.1,'existing-theatre');poly(theatre,a.stageApron.pointsImage.map(T),0xa89e84,.7,.05,'existing-theatre');
 const wall=a.stage.backLineImage.map(T),wa=wall[0],wb=wall[1],wallLength=Math.hypot(wb[0]-wa[0],wb[1]-wa[1]),wallX=(wa[0]+wb[0])/2,wallZ=(wa[1]+wb[1])/2;
 const backdrop=box(theatre,wallX,1.1,wallZ,wallLength,5.2,.35,0x253a5b,'existing-theatre');backdrop.rotation.y=Math.atan2(-(wb[1]-wa[1]),wb[0]-wa[0]);
 sign(theatre,'Teatro Tivoli World',new THREE.Vector3(wallX+back.x*.22,4.9,wallZ+back.y*.22),wallLength*.91,1.7,new THREE.Vector3(back.x,0,back.y),'#e85d43');
 const stageWidth=front[0].map((v,i)=>front[1][i]-v),span=Math.hypot(...stageWidth);for(const p of front){cyl(theatre,p[0],1.1,p[1],.12,4.8,0xa8a9a3);box(theatre,p[0],2.1,p[1],.8,1.4,.6,0x30363a);}
 const beam=box(theatre,origin.x,5.7,origin.y,span,.16,.16,0xa8a9a3);beam.rotation.y=yaw;
 for(let i=1;i<9;i++){const t=i/9,x=THREE.MathUtils.lerp(front[0][0],front[1][0],t),z=THREE.MathUtils.lerp(front[0][1],front[1][1],t);const lamp=mesh(theatre,new THREE.CylinderGeometry(.16,.20,.4,8),0x34383a,x,5.4,z);lamp.rotation.x=.5;}

 // Radial barrel petals reproduce the scalloped entrance canopy instead of flat boxes.
 const e=data.entrance,{g:entry,p:entryAnchor,P:E}=makeGroup([820,1307],'Entrada histórica · unidad arquitectónica');
 const outer=new THREE.CatmullRomCurve3(e.outerEdgeImage.map(q=>{const p=E(q);return new THREE.Vector3(p[0],0,p[1])}));
 const inner=new THREE.CatmullRomCurve3(e.innerEdgeImage.map(q=>{const p=E(q);return new THREE.Vector3(p[0],0,p[1])}));
 const count=23,entryFootprint=e.canopyFootprintImage.map(E);
 if(terrain)entry.userData.terrainLevel=Math.max(...entryFootprint.map(([x,z])=>ground(x+entryAnchor[0],z+entryAnchor[1])));
 const entryGround=(p)=>terrain?ground(p.x+entryAnchor[0],p.z+entryAnchor[1])-entry.userData.terrainLevel-.25:.1;
 retaining(entry,entryAnchor,entryFootprint,()=>0,0xb6ab95);
 for(let i=0;i<count;i++){
  const t=(i+.5)/count,o=outer.getPointAt(t),n=inner.getPointAt(t),axis=n.clone().sub(o).normalize(),tangent=new THREE.Vector3(-axis.z,0,axis.x),next=inner.getPointAt(Math.min(1,(i+1)/count)),prev=inner.getPointAt(i/count),half=next.distanceTo(prev)*.52;
  const verts=[],frontVerts=[];const point=(across,longitudinal)=>o.clone().lerp(n,longitudinal).addScaledVector(tangent,across*half).setY(3.4+2.0*Math.sqrt(Math.max(0,1-across*across)));
  for(let j=0;j<12;j++){const s0=-1+j/6,s1=-1+(j+1)/6,a0=point(s0,0),a1=point(s1,0),b0=point(s0,1),b1=point(s1,1);verts.push(...a0,...a1,...b1,...a0,...b1,...b0);const c0=b0.clone().setY(3.25),c1=b1.clone().setY(3.25);frontVerts.push(...c0,...c1,...b1,...c0,...b1,...b0);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();const roof=new THREE.Mesh(geo,material(0xeae6d8));roof.castShadow=true;roof.receiveShadow=true;entry.add(roof);
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(frontVerts,3));fg.computeVertexNormals();entry.add(new THREE.Mesh(fg,material([0xf1bd34,0xe67b30,0xc34135][i%3])));
  const column=prev,base=entryGround(column);cyl(entry,column.x,base,column.z,.15,3.4-base,0xf0eddf);const rear=outer.getPointAt(i/count),rearBase=entryGround(rear);cyl(entry,rear.x,rearBase,rear.z,.11,3.4-rearBase,0xb8b3a2);
  // Small recessed booth or gate, with a cream lintel and dark ticket window.
  if(i%3!==1){const panel=box(entry,n.x-axis.x*.8,0,n.z-axis.z*.8,half*1.65,2.65,.3,0xe3ddca);panel.rotation.y=Math.atan2(axis.x,axis.z);const window=box(entry,n.x-axis.x*.62,1.15,n.z-axis.z*.62,half*1.05,.86,.06,0x455456);window.rotation.y=panel.rotation.y;}
  if(i>=8&&i<14){sign(entry,'TIVOLI'[i-8],n.clone().addScaledVector(axis,.045).setY(4.28),Math.max(.7,half*1.45),1.38,axis,'#fff6df');}
 }
 const last=inner.getPointAt(1),lastBase=entryGround(last);cyl(entry,last.x,lastBase,last.z,.15,3.4-lastBase,0xf0eddf);
 poly(entry,e.forecourtImage.map(E),0xc9bba0,.22,-.1,'existing-entry');
 return {targets:{theatre:theatreAnchor,entry:entryAnchor},counts:{individualSeats:seats.length,entrancePetals:count},groups:{theatre,entry}};
}
