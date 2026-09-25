import {terrainFoundation} from './foundation.js';
import * as THREE from 'three';

// Render-derived footprint; elevations and structural sections remain interpretive.
export async function buildProposal({group:g,terrain,mesh,box,cyl,poly,ribbon,label,wheel,tree,alignFrontage=p=>p}) {
 const data=await fetch('/reference/new-project-geometry.json').then(r=>r.json());
 const outer=data.roofPolygons[0].map(alignFrontage),level=z=>104-.045*z;
 const mean=ps=>ps.reduce((a,p)=>[a[0]+p[0]/ps.length,a[1]+p[1]/ps.length],[0,0]);
 const P=([u,v])=>[.597053235*u-.005292296*v-440.062941,.000462871*u+.615100638*v-336.134613];
 const E=z=>level(z)-terrain.datum;
 const access=P([835,738]),accessGround=terrain.relative(...access),targets={'future-entry':access};
 const shapeOf=(pts,holes=[])=>{const s=new THREE.Shape();pts.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();for(const pts of holes){const h=new THREE.Path();pts.forEach(([x,z],i)=>i?h.lineTo(x,-z):h.moveTo(x,-z));h.closePath();s.holes.push(h);}return s;};
 function surface(pts,holes,color,height){const geo=new THREE.ShapeGeometry(shapeOf(pts,holes));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(p.getX(i),p.getZ(i)));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.85,side:THREE.DoubleSide}));m.userData.fixedElevation=true;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function wall(a,b,ta,tb,ba,bb,color){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([a[0],ba,a[1],b[0],bb,b[1],b[0],tb,b[1],a[0],ba,a[1],b[0],tb,b[1],a[0],ta,a[1]],3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.55}));m.userData.fixedElevation=true;m.castShadow=true;m.receiveShadow=true;g.add(m);}
 // Partition each façade into adjoining faces; never overlay glass on a full wall.
 function facade(a,b,ta,tb,ba,bb,bands,baseColor){
  let bottomA=ba,bottomB=bb;
  for(const band of bands.sort((a,b)=>a.ba-b.ba)){
   if(band.ba>bottomA||band.bb>bottomB)wall(a,b,band.ba,band.bb,bottomA,bottomB,baseColor);
   wall(a,b,band.ta,band.tb,band.ba,band.bb,band.color);
   bottomA=band.ta;bottomB=band.tb;
  }
  if(ta>bottomA||tb>bottomB)wall(a,b,ta,tb,bottomA,bottomB,baseColor);
 }
 const interp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 const subAt=(x,z,y)=>{const sub=new THREE.Group();sub.position.set(x,0,z);sub.userData.terrainLevel=y;g.add(sub);return sub;};
 // A single continuous roof surface prevents giant triangular ramps at arbitrary z thresholds.
 surface(outer,data.atria,0xcbb599,(_,z)=>E(z));
 for(let i=0;i<outer.length;i++){
  const a=outer[i],b=outer[(i+1)%outer.length],len=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.ceil(len/4);
  for(let j=0;j<n;j++){
   const p=interp(a,b,j/n),q=interp(a,b,(j+1)/n),ta=E(p[1]),tb=E(q[1]),ba=terrain.relative(...p)-.2,bb=terrain.relative(...q)-.2;
   const bands=[];
   for(let f=1;f<=4;f++){const ya=ta-f*3.1,yb=tb-f*3.1;if(ya>ba+1&&yb>bb+1){bands.push({ba:ya,bb:yb,ta:ya+.3,tb:yb+.3,color:0xdedacf},{ba:ya+.3,bb:yb+.3,ta:ya+2.65,tb:yb+2.65,color:0x668486});}}
   const entranceBay=Math.hypot((p[0]+q[0])/2-access[0],(p[1]+q[1])/2-access[1])<12;
   if(entranceBay)wall(p,q,ta,tb,Math.min(ta-.5,accessGround+5.5),Math.min(tb-.5,accessGround+5.5),0xe7e3d8);
   else facade(p,q,ta,tb,Math.min(ba,ta-.5),Math.min(bb,tb-.5),bands,0xe7e3d8);
   if(ta-ba>3){const sub=subAt(p[0],p[1],ba);const post=box(sub,0,0,0,.14,Math.max(.5,ta-ba),.14,0xa29171,'commercial');}
  }
  wall(a,b,E(a[1])+.7,E(b[1])+.7,E(a[1]),E(b[1]),0xe4dfd1);
 }
 for(let k=0;k<data.atria.length;k++){
  const pts=data.atria[k],c=mean(pts),floor=E(c[1])-8.4;
  surface(pts,[],0xbbaa8c,()=>floor);
  for(let i=0;i<pts.length;i++){
   const a=pts[i],b=pts[(i+1)%pts.length],ta=E(a[1]),tb=E(b[1]);
   const bands=[];for(let f=0;f<3;f++){const y=floor+f*2.7;bands.push({ba:y,bb:y,ta:y+.3,tb:y+.3,color:0xe6ded0},{ba:y+.3,bb:y+.3,ta:Math.min(y+2.35,ta),tb:Math.min(y+2.35,tb),color:0x64878b});}
   facade(a,b,ta,tb,floor,floor,bands,0x896c54);
   const len=Math.hypot(a[0]-b[0],a[1]-b[1]);for(let t=2;t<len;t+=4){const p=interp(a,b,t/len),sub=subAt(p[0],p[1],floor);box(sub,0,0,0,.16,E(p[1])-floor,.16,0xa68f6d,'commercial');}
  }
  const inner=pts.map(([x,z])=>[c[0]+(x-c[0])*.32,c[1]+(z-c[1])*.32]);
  surface(inner,[],0x627f50,()=>floor+.35);
  for(const q of [[c[0],c[1]],[c[0]+2,c[1]+1],[c[0]-2,c[1]-2]]){const sub=subAt(q[0],q[1],floor);tree(sub,0,0,1,.8);}
  // D clearly shows open courts: preserve voids and gardens instead of giant blue funnels.
  // Narrow blue-grey parapet glazing reflects A without claiming a pool or glazed roof.
  const rim=pts.map(([x,z])=>[x+(c[0]-x)*.08,z+(c[1]-z)*.08]);
  for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;surface([pts[i],pts[j],rim[j],rim[i]],[],0x79989b,(_,z)=>E(z)-.22);}
  label(g,`Patio ${k+1} · interpretación del render`,c[0],c[1],E(c[1])+10-terrain.relative(...c),'small','commercial');
 }
 // Four horizontal garden terraces match the photographed polygons; vertical edges close their bases.
 for(const pts of data.greenRoofs){const c=mean(pts),top=Math.max(...pts.map(p=>E(p[1])))+1.6;surface(pts,[],0x68804f,()=>top);for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];wall(a,b,top,top,E(a[1]),E(b[1]),0xe4ded1);wall(a,b,top+.35,top+.35,top,top,0xe7e0d4);}for(let i=0;i<pts.length;i++){const q=interp(c,pts[i],.7),sub=subAt(q[0],q[1],top);cyl(sub,0,0,0,.7,.6,0x57704c,'green');}}
 // Brick plazas, stair flights and timber pergolas between the polygonal roof gardens.
 for(const pixels of [[[741,548],[759,548],[767,615],[744,615]],[[841,486],[875,488],[877,547],[858,555]],[[800,714],[904,603],[921,616],[815,733]]]){
  const pts=pixels.map(P);surface(pts,[],0xb87561,(_,z)=>E(z)+.035);
  const a=pts[0],b=pts[1],d=pts[3],c=pts[2];for(let j=0;j<16;j++){const u=j/16,v=(j+.13)/16,p=interp(a,d,u),q=interp(b,c,u),r=interp(b,c,v),s=interp(a,d,v);surface([p,q,r,s],[],0xddc9aa,(_,z)=>E(z)+.055);}
 }
 for(const pix of [[1002,535],[1014,579],[891,627],[846,679],[779,748]]){const p=P(pix),sub=subAt(p[0],p[1],E(p[1]));sub.rotation.y=-.55;for(const x of [-5,5])for(const z of [-3,3])cyl(sub,x,0,z,.12,3.2,0xa29a81);for(let i=-6;i<=6;i++)box(sub,i,3.2,0,.24,.18,8,0xbbb6a3,'commercial');}
 for(const pix of [[577,639],[694,643],[709,591],[791,758],[920,594],[966,598]]){const p=P(pix),sub=subAt(p[0],p[1],E(p[1]));box(sub,0,0,0,4,.65,2,0xc7bda6,'green');box(sub,0,.65,0,3.6,.3,1.6,0x66844f,'green');cyl(sub,5,0,1,.075,2.7,0xb5a98a);mesh(sub,new THREE.ConeGeometry(2,1,8),0xdfd2b3,5,3.1,1);cyl(sub,5,0,1,.8,.8,0xbbaa8b);}
 // Landscape islands and the long pavilion visible beside the northern kart course.
 for(const patch of [
 [[700,163],[816,174],[844,232],[818,271],[792,251],[780,181]],
 [[855,183],[930,203],[976,256],[959,302],[922,290],[879,252]],
 [[545,265],[577,287],[605,354],[568,419],[549,390]],
 [[940,322],[978,300],[986,397],[958,466],[924,468],[936,414]],
 [[698,367],[726,355],[756,373],[774,419],[739,465],[713,459]],
 [[650,454],[701,468],[724,488],[695,514],[647,491]]
 ]){poly(g,patch.map(P),0x91a174,.2,1.18,'green');}
 const pavilion=[[720,251],[777,229],[795,264],[735,291]].map(P),pavCenter=mean(pavilion),pav=new THREE.Group();pav.position.set(pavCenter[0],0,pavCenter[1]);pav.userData.terrainLevel=Math.max(...pavilion.map(p=>terrain.relative(...p)));g.add(pav);const local=pavilion.map(p=>[p[0]-pavCenter[0],p[1]-pavCenter[1]]);poly(pav,local,0xbcb49c,4,1.4,'park');poly(pav,local,0x686d62,.3,5.4,'park');
 // Northern attractions follow two distinct visible render footprints, never a generic oval clone.
 function tracked(pixels,color,maxHeight){const ps=pixels.map(P),c=mean(ps),sub=new THREE.Group();sub.position.set(...[c[0],0,c[1]]);g.add(sub);const base=terrain.relative(...c);const curve=new THREE.CatmullRomCurve3(ps.map(([x,z],i)=>new THREE.Vector3(x-c[0],terrain.relative(x,z)-base+3+Math.sin(i*.63)**2*maxHeight,z-c[1])),true);mesh(sub,new THREE.TubeGeometry(curve,190,.35,7,true),color);for(let i=0;i<45;i++){const p=curve.getPoint(i/45),bottom=terrain.relative(c[0]+p.x,c[1]+p.z)-base-.15;cyl(sub,p.x,bottom,p.z,.15,Math.max(.2,p.y-bottom),0xa67e50,'park');}}
 tracked([[740,319],[756,303],[790,293],[820,287],[844,300],[846,316],[824,330],[794,340],[765,341],[746,331]],0xb9863d,11);
 tracked([[874,342],[893,326],[915,332],[929,353],[932,385],[918,409],[899,429],[879,433],[865,417],[867,395],[883,376],[901,364],[908,384],[896,408]],0xa65a3c,22);
 const kart=[[743,181],[757,179],[768,196],[778,226],[765,237],[746,235],[735,218],[736,203],[752,201],[759,220],[750,223],[744,212]].map(P);ribbon(g,kart,3.8,0x705a4d,1.4,'park');
 const splash=P([607,264]);cyl(g,splash[0],1.3,splash[1],14,.5,0x86bcc0,'park');const slideGroup=new THREE.Group();slideGroup.position.set(splash[0],0,splash[1]);g.add(slideGroup);box(slideGroup,0,12,-12,13,1,6,0xc9c6b1,'park');for(const x of [-5,5])cyl(slideGroup,x,0,-12,.25,12,0xa8b0a3);for(let k=0;k<4;k++){const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-4+k*2.4,12,-10),new THREE.Vector3(-4+k*2.4,9,-3),new THREE.Vector3(-4+k*2.4,2,6),new THREE.Vector3(-4+k*2.4,1.8,11)]);mesh(slideGroup,new THREE.TubeGeometry(path,28,.7,7,false),[0x61a05c,0xcdab46,0x649dbc,0xa86a6a][k]);}
 const fountain=P([680,442]);cyl(g,...[fountain[0],1.5,fountain[1],13,.8,0xcdbfa6]);cyl(g,fountain[0],2.3,fountain[1],10,.12,0x88b3b5);cyl(g,fountain[0],2.4,fountain[1],1.3,2,0xdad6be);
 for(const route of [[[607,314],[639,369],[680,400],[702,455],[754,496]],[[690,223],[716,288],[727,349],[752,402],[835,469]],[[754,402],[812,371],[849,337],[900,303]]])ribbon(g,route.map(P),5,0xcdb798,1.4,'park');
 // Only the striped pavilion and octagonal ride actually visible in A are represented.
 const oct=P([675,306]);cyl(g,oct[0],1.4,oct[1],9,.6,0xc4ad75,'park');cyl(g,oct[0],2,oct[1],5,.2,0x847e93,'park');
 const tent=P([820,402]),tentGroup=new THREE.Group();tentGroup.position.set(tent[0],0,tent[1]);g.add(tentGroup);cyl(tentGroup,0,1.4,0,6,.3,0xc9b590,'park');for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,7,0,Math.cos(a)*6,4,Math.sin(a)*6,Math.cos(b)*6,4,Math.sin(b)*6],3));geo.computeVertexNormals();mesh(tentGroup,geo,i%2?0xe6d9c2:0xb77b4c);}

 const wp=P([838,367]),wheelGroup=new THREE.Group();wheelGroup.position.set(wp[0],0,wp[1]);g.add(wheelGroup);wheel(wheelGroup,0,0,1,14);wheelGroup.userData.interpretation='Posición aproximada separada del trazado de raíles; el render no es plano técnico.';
 const tp=P([580,343]);cyl(g,tp[0],1.4,tp[1],.7,49,0xb35e52,'park');
 const hotel=data.hotel[0],hotelGroup=new THREE.Group();hotelGroup.userData.terrainLevel=Math.max(...hotel.map(p=>terrain.relative(...p)));g.add(hotelGroup);poly(hotelGroup,hotel,0xe6e2d9,23,1,'hotel');for(let i=0;i<6;i++)for(let j=0;j<hotel.length;j++)ribbon(hotelGroup,[hotel[j],hotel[(j+1)%hotel.length]],.35,0xb0b6af,2+i*3.5,'hotel');
 const hotelBase=new THREE.Group();hotelBase.userData.terrainLevel=0;g.add(hotelBase);
 const hotelFoundation=terrainFoundation(hotelBase,hotel,0xb6b09d);
 function updateTerrain(){hotelFoundation.update((terrain.enabled?hotelGroup.userData.terrainLevel:0)+1,terrain.relative);}
 updateTerrain();
 // Vegetation follows islands and perimeter strips in the concept, leaving attraction paths open.
 const groves=[[[576,192],[615,182],[650,184],[679,191]],[[799,162],[841,172],[890,182],[932,198],[975,238]],[[976,274],[986,306],[975,345],[968,390],[950,426]],[[657,257],[686,272],[707,265]],[[677,331],[692,352],[711,372]],[[743,367],[766,374],[791,360]],[[833,346],[846,359],[848,388]],[[769,430],[789,448],[819,442]],[[566,418],[566,446],[573,466],[588,481]],[[630,484],[650,476],[710,478]]];
 for(let k=0;k<groves.length;k++)for(let i=0;i<groves[k].length;i++){const [u,v]=groves[k][i];for(let j=0;j<3;j++){const a=(i*2.3+j*2.1+k),p=P([u+Math.cos(a)*5,v+Math.sin(a)*5]);tree(g,p[0],p[1],1,.72+(i+j)%3*.12);}}
 // Curved arc of low pavilions west of the central fountain, visible in the aerial reference.
 const plaza=P([622,406]);cyl(g,plaza[0],1.2,plaza[1],17,.15,0xc5ae90,'park');
 for(let i=0;i<8;i++){const a=2.15+i*.19,u=642+Math.cos(a)*59,v=408+Math.sin(a)*59,p=P([u,v]),sub=new THREE.Group();sub.position.set(p[0],0,p[1]);sub.rotation.y=-a;g.add(sub);box(sub,0,1.3,0,7,3.5,6,0xc5b49a,'park');box(sub,0,4.8,0,7.5,.45,7,0x6f807b,'park');box(sub,0,1.7,3.05,4,2.1,.12,0x647d7a,'park');}
 // Southeast covered forecourt inferred from A/D. This is not a confirmed park ticket gate.
 const entrance=new THREE.Group();entrance.position.set(access[0],0,access[1]);entrance.userData.terrainLevel=accessGround;entrance.rotation.y=-.72;g.add(entrance);
 box(entrance,0,.1,4,29,.18,17,0xbbaa8f,'future-entry');
 box(entrance,0,5.3,3,28,.5,12,0xe6e2d7,'future-entry');
 box(entrance,0,4.5,8.6,28,.8,.3,0xd7d4c8,'future-entry');
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#e8e5da';ctx.fillRect(0,0,1024,160);
  ctx.fillStyle='#b33425';ctx.font='bold 105px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TÍVOLI WORLD',512,83);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(21,3.28),new THREE.MeshStandardMaterial({map:texture,roughness:.8,side:THREE.DoubleSide}));
  sign.position.set(0,5.9,8.83);sign.userData.zone='future-entry';entrance.add(sign);
 }

 for(const x of [-12,-6,6,12])cyl(entrance,x,.25,7,.18,5.1,0x989b8f,'future-entry');
 for(const x of [-9,-3,3,9])box(entrance,x,1,-2.2,5,3.5,.16,0x526f70,'future-entry');
 for(const x of [-11,11]){box(entrance,x,.3,11,3,.6,3,0xbcae90,'green');tree(entrance,x,11,.9,.6);}
 label(g,'Acceso interpretado · boceto',access[0],access[1],10,'zone','future-entry');
 // Slim horizontal slab returns emphasize the stepped retail frontage in D without enlarged blocks.
 const terraceBands=[[[797,775],[922,633]],[[798,760],[913,632]],[[796,746],[905,632]]];
 for(let i=0;i<terraceBands.length;i++){const [a,b]=terraceBands[i].map(P),c=mean([a,b]),sub=subAt(c[0],c[1],E(c[1])-i*2.7),dx=b[0]-a[0],dz=b[1]-a[1],beam=box(sub,0,0,0,Math.hypot(dx,dz),.32,1.7,0xe2ddce,'commercial');beam.rotation.y=-Math.atan2(dz,dx);}
 return {updateTerrain,data,level,outer,targets,accessHeight:accessGround+4,interpretations:{access:'Plaza cubierta de acceso al complejo interpretada desde A y D; no entrada controlada al parque confirmada.',roof:'Borde norte retraído para no convertir el parque central en cubierta comercial; alturas interpretativas.',sources:['/reference/new-project-a.jpg','/reference/new-project-d.jpg']}};
}
