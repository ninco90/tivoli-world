import * as THREE from 'three';
// Centreline traced from the IGN aerial image. Bridge clearance is illustrative.
export function buildKarting({group,terrain,mesh,box,cyl,imageToWorld:P}){
 const root=new THREE.Group();root.name='Go-karts · ocho con paso elevado';root.userData.terrainLevel=0;group.add(root);
 const traced=[[300,412],[425,393],[610,400],[807,410],[925,375],[982,290],[979,193],[941,136],[875,137],[785,188],[702,261],[633,339],[590,432],[553,514],[462,606],[365,656],[290,648],[247,604],[248,535],[270,465]];
 const xy=traced.map(([x,y])=>P([(680+x/4.5)*.92,(445+y/4.5)*.92]));let curve;const cars=[];
 function beam(a,b,r,color){const d=b.clone().sub(a),m=mesh(root,new THREE.CylinderGeometry(r,r,d.length(),6),color);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
 function rebuild(){root.traverse(o=>o.geometry?.dispose());root.clear();cars.length=0;
 const base=new THREE.CatmullRomCurve3(xy.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
 const level=Math.max(...xy.slice(0,5).map(([x,z])=>terrain.relative(x,z)))+5;
 const ps=[];for(let i=0;i<400;i++){const t=i/400,p=base.getPoint(t),v=t*xy.length,blend=v<=4?Math.min(1,Math.max(0,v/1.3),Math.max(0,(4-v)/1.3)):0;p.y=THREE.MathUtils.lerp(terrain.relative(p.x,p.z)+1.5,level,THREE.MathUtils.smoothstep(blend,0,1));ps.push(p);}
 curve=new THREE.CatmullRomCurve3(ps,true,'centripetal');const edges=[[],[]],verts=[],under=[];
 for(let i=0;i<=400;i++){const t=i/400,p=curve.getPoint(t),v=curve.getTangent(t),n=new THREE.Vector3(-v.z,0,v.x).normalize();edges[0].push(p.clone().addScaledVector(n,2.45));edges[1].push(p.clone().addScaledVector(n,-2.45));}
 for(let i=1;i<=400;i++){const a=edges[0][i-1],b=edges[1][i-1],c=edges[1][i],d=edges[0][i];verts.push(...a,...b,...c,...a,...c,...d);for(const edge of edges){const p=edge[i-1],q=edge[i],r=q.clone().add(new THREE.Vector3(0,-.35,0)),s=p.clone().add(new THREE.Vector3(0,-.35,0));under.push(...p,...q,...r,...p,...r,...s);}}
 function surface(vertices,color){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const m=mesh(root,geo,color,0,0,0,'attraction-18');m.material.side=THREE.DoubleSide;return m;}
 surface(verts,0x636764);surface(under,0xb0aea0);
 for(let i=0;i<200;i++){const t=i/200,p=curve.getPoint(t),v=curve.getTangent(t),n=new THREE.Vector3(-v.z,0,v.x).normalize();for(const side of [-1,1]){const q=p.clone().addScaledVector(n,side*2.43);const curb=box(root,q.x,q.y+.025,q.z,.3,.18,.72,i%2?0xd9d5bf:0x984c43,'attraction-18');curb.rotation.y=Math.atan2(v.x,v.z);if(i%3===0){beam(q,q.clone().add(new THREE.Vector3(0,.85,0)),.055,0xa0a59c);}}
 }
 for(const edge of edges){const rail=edge.map(v=>v.clone().add(new THREE.Vector3(0,.8,0)));mesh(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail),400,.065,5),0xb8bcb0,0,0,0,'attraction-18');}
 // Piers flank the underpass instead of blocking the crossing itself.
 for(const t of [.062,.146]){const p=curve.getPoint(t),v=curve.getTangent(t),n=new THREE.Vector3(-v.z,0,v.x).normalize();for(const side of [-1,1]){const q=p.clone().addScaledVector(n,side*2),floor=terrain.relative(q.x,q.z)+1.2;box(root,q.x,floor,q.z,.5,Math.max(.1,q.y-.35-floor),.65,0xb5b09c,'attraction-18');}}
 for(let i=0;i<6;i++){const car=new THREE.Group();root.add(car);box(car,0,.15,0,1,.2,1.7,[0xb64135,0xd5ad37,0x367487][i%3],'attraction-18');box(car,0,.35,-.2,.52,.45,.35,0x333936,'attraction-18');box(car,0,.35,.5,.75,.22,.5,0xd9d0b1,'attraction-18');for(const x of [-.5,.5])for(const z of [-.5,.5]){const w=cyl(car,x,.05,z,.22,.15,0x292f2e,'attraction-18');w.rotation.z=Math.PI/2;}cars.push(car);}
 }
 rebuild();return {update(t){cars.forEach((car,i)=>{const u=(t*.025+i/6)%1,p=curve.getPointAt(u),v=curve.getTangentAt(u);car.position.copy(p);car.rotation.set(-Math.atan2(v.y,Math.hypot(v.x,v.z)),Math.atan2(v.x,v.z),0,'YXZ');});},updateTerrain:rebuild,clearance(x,z,r){return curve.getPoints(120).some(p=>Math.hypot(p.x-x,p.z-z)<r+2.5);}};
}
