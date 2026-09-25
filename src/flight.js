import * as THREE from 'three';

export function flightStep(camera,target,keys,dt){
 const forward=camera.getWorldDirection(new THREE.Vector3());
 const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize();
 const direction=new THREE.Vector3()
  .addScaledVector(forward,Number(keys.has('KeyW'))-Number(keys.has('KeyS')))
  .addScaledVector(right,Number(keys.has('KeyD'))-Number(keys.has('KeyA')));
 direction.y+=Number(keys.has('KeyE'))-Number(keys.has('KeyQ'));
 if(direction.lengthSq()<1e-8)return false;
 const fast=keys.has('ShiftLeft')||keys.has('ShiftRight');
 direction.normalize().multiplyScalar((fast?160:45)*Math.min(.05,Math.max(0,dt)));
 camera.position.add(direction);target.add(direction);
 return true;
}

export function installFlight(camera,controls,onMove){
 const keys=new Set(),movement=new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE']);
 const editable=element=>element?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),dialog,[role="dialog"]');
 document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||editable(event.target)||document.querySelector('dialog[open]')){keys.clear();return;}
  if(movement.has(event.code)){event.preventDefault();keys.add(event.code);onMove();}
  else if(event.code==='ShiftLeft'||event.code==='ShiftRight')keys.add(event.code);
 });
 document.addEventListener('keyup',event=>keys.delete(event.code));
 window.addEventListener('blur',()=>keys.clear());
 document.addEventListener('visibilitychange',()=>keys.clear());
 document.addEventListener('focusin',event=>{if(editable(event.target))keys.clear();});
 return {update(dt){if(flightStep(camera,controls.target,keys,dt)){onMove();controls.update();}}};
}
