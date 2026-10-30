import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// Project only whole, locally aligned triangles. A decal cannot bridge from a
// breast, shoulder or calf onto its neighbouring surface while it is dragged.
export function makeTattooGeometry(body, anchor, height, rotation) {
 const positions=body.geometry.attributes.position, normals=body.geometry.attributes.normal;
 const radius=height*1.1+.035, depth=Math.min(Math.max(height*.46,.16),.42), patchPositions=[], patchNormals=[];
 const p=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
 const n=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
 const centroid=new THREE.Vector3(), averageNormal=new THREE.Vector3();
 for(let i=0;i<positions.count;i+=3){
  for(let j=0;j<3;j++){
   p[j].fromBufferAttribute(positions,i+j).applyMatrix4(body.matrixWorld);
   n[j].fromBufferAttribute(normals,i+j).transformDirection(body.matrixWorld);
  }
  centroid.copy(p[0]).add(p[1]).add(p[2]).multiplyScalar(1/3);
  averageNormal.copy(n[0]).add(n[1]).add(n[2]).normalize();
  if(centroid.distanceToSquared(anchor.point)>radius*radius||averageNormal.dot(anchor.normal)<.3)continue;
  for(let j=0;j<3;j++){
   patchPositions.push(p[j].x,p[j].y,p[j].z);
   patchNormals.push(n[j].x,n[j].y,n[j].z);
  }
 }
 const patch=new THREE.BufferGeometry();
 patch.setAttribute('position',new THREE.Float32BufferAttribute(patchPositions,3));
 patch.setAttribute('normal',new THREE.Float32BufferAttribute(patchNormals,3));
 const up=Math.abs(anchor.normal.y)>.97?new THREE.Vector3(0,0,-1):new THREE.Vector3(0,1,0);
 const basis=new THREE.Matrix4().lookAt(anchor.normal,new THREE.Vector3(),up);
 const q=new THREE.Quaternion().setFromRotationMatrix(basis);
 q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),THREE.MathUtils.degToRad(rotation)));
 const mesh=new THREE.Mesh(patch);
 const result=new DecalGeometry(mesh,anchor.point,new THREE.Euler().setFromQuaternion(q),new THREE.Vector3(height*.78,height,depth));
 const v=result.attributes.position,normal=result.attributes.normal;
 for(let i=0;i<v.count;i++)v.setXYZ(i,v.getX(i)+normal.getX(i)*.004,v.getY(i)+normal.getY(i)*.004,v.getZ(i)+normal.getZ(i)*.004);
 patch.dispose();mesh.material.dispose();return result;
}

export function anchorFromHit(hit,body) {
 return {point:hit.point.clone(),normal:(hit.normal||hit.face.normal).clone().transformDirection(body.matrixWorld).normalize()};
}

export function parseMannequin(buffer) {
 const [vertexCount,indexCount]=new Uint32Array(buffer,0,2);
 if(buffer.byteLength!==8+vertexCount*24+indexCount*4)throw new Error('Invalid mannequin data');
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,8,vertexCount*3),3));
 geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(buffer,8+vertexCount*12,vertexCount*3),3));
 geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,8+vertexCount*24,indexCount),1));
 const surface=geometry.toNonIndexed();geometry.dispose();surface.computeBoundingSphere();return surface;
}
