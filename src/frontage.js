// Visual reconciliation only: retain original plan and render coordinates as source data.
// The avenue stays fixed. Offsets are illustrative, not surveyed setbacks.
export function frontageAlignment(roads) {
 const road=roads.find(r=>String(r.id)==='23896111')?.points;
 if(!road) return {boundary:p=>p,green:p=>p,roof:p=>p};
 function nearest(p){
  let best=null;
  for(let i=1;i<road.length;i++){
   const a=road[i-1],b=road[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
   const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(len*len)));
   const q=[a[0]+dx*t,a[1]+dz*t],distance=Math.hypot(p[0]-q[0],p[1]-q[1]);
   if(!best||distance<best.distance)best={q,distance,n:[dz/len,-dx/len]};
  }
  return best;
 }
 const inFront=p=>p[0]>=-163&&p[0]<=40&&p[1]>60&&p[1]<192;
 const offset=(p,d)=>{const {q,n}=nearest(p);return [q[0]+n[0]*d,q[1]+n[1]*d];};
 return {
  boundary:p=>inFront(p)&&nearest(p).distance<13?offset(p,8):p,
  green:p=>inFront(p)?offset(p,nearest(p).distance<8?8:14):p,
  roof:p=>inFront(p)&&nearest(p).distance<34?offset(p,19):p,
 };
}
