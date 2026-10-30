import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {parseMannequin,makeTattooGeometry,anchorFromHit} from '../src/tattoo-surface.js';

for(const kind of ['woman','man']){
 test(`${kind}: refined anatomy supports continuous surface placement front and back`,()=>{
  const file=readFileSync(new URL(`../public/models/preview/${kind}-anatomical.mesh`,import.meta.url));
  const geometry=parseMannequin(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength));
  geometry.computeBoundingBox();
  const size=geometry.boundingBox.getSize(new THREE.Vector3());
  assert.ok(size.y>3.15&&size.y<3.21);
  assert.ok(size.x>1.8&&size.x<2.2);
  assert.ok(geometry.attributes.position.count>300000,'subdivided anatomy');
  assert.ok(geometry.attributes.normal.array.every(Number.isFinite));
  const body=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());body.updateMatrixWorld(true);
  for(const side of [-1,1])for(const x of [-.16,-.08,0,.08,.16]){
   const ray=new THREE.Raycaster(new THREE.Vector3(x,2.05,3*side),new THREE.Vector3(0,0,-side));
   const hit=ray.intersectObject(body)[0];assert.ok(hit,'ray hits torso');
   const anchor=anchorFromHit(hit,body);
   assert.ok(Math.abs(anchor.normal.length()-1)<.0001);
   const decal=makeTattooGeometry(body,anchor,.3,25);
   assert.ok(decal.attributes.position.count>0);
   assert.ok(decal.attributes.position.array.every(Number.isFinite));
   // Every projected triangle faces the chosen side, including back projections.
   const normals=decal.attributes.normal;
   for(let i=0;i<normals.count;i+=3){
    const a=new THREE.Vector3().fromBufferAttribute(normals,i),b=new THREE.Vector3().fromBufferAttribute(normals,i+1),c=new THREE.Vector3().fromBufferAttribute(normals,i+2);
    assert.ok(Math.max(a.dot(anchor.normal),b.dot(anchor.normal),c.dot(anchor.normal))>0);
   }
   decal.dispose();
  }
  // Curved chest surfaces must still retain one continuous local decal.
  for(const x of [-.2,.2]){
   const ray=new THREE.Raycaster(new THREE.Vector3(x,2.2,3),new THREE.Vector3(0,0,-1));
   const hit=ray.intersectObject(body)[0];assert.ok(hit,'ray hits curved chest');
   const decal=makeTattooGeometry(body,anchorFromHit(hit,body),.46,0);
   assert.ok(decal.attributes.position.count>300,'curved chest keeps a usable decal');
   const bounds=new THREE.Box3().setFromBufferAttribute(decal.attributes.position);
   assert.ok(bounds.getSize(new THREE.Vector3()).z<.32,'decal does not bridge far surfaces');
   decal.dispose();
  }
  geometry.dispose();body.material.dispose();
 });
}
test('invalid mannequin assets fail explicitly',()=>assert.throws(()=>parseMannequin(new Uint32Array([10,30]).buffer),/Invalid mannequin/));
