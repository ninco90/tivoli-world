import * as THREE from 'three';

// Retaining skirt under a horizontal platform. Sample the slope along every edge.
export function terrainFoundation(parent,footprint,color){
 const geometry=new THREE.BufferGeometry();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.95,side:THREE.DoubleSide}));
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
 function update(top,ground){
  const vertices=[];
  for(let i=0;i<footprint.length;i++){
   const a=footprint[i],b=footprint[(i+1)%footprint.length],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));
   for(let j=0;j<steps;j++){
    const p=[a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps];
    const q=[a[0]+(b[0]-a[0])*(j+1)/steps,a[1]+(b[1]-a[1])*(j+1)/steps];
    const lowP=Math.min(top-.05,ground(...p)-1.5),lowQ=Math.min(top-.05,ground(...q)-1.5);
    vertices.push(p[0],lowP,p[1],q[0],lowQ,q[1],q[0],top,q[1],p[0],lowP,p[1],q[0],top,q[1],p[0],top,p[1]);
   }
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.computeVertexNormals();geometry.computeBoundingSphere();
 }
 return {mesh,update};
}
