import { BufferGeometry, BufferAttribute } from 'three';
import { readFileSync, writeFileSync } from 'node:fs';
// MakeHuman hm08 + adult macro targets (CC0). See assets/mannequins/LICENSE.md.
// Only anatomical surface and eye shells are exported; rig/clothing helpers excluded.
const source='assets/mannequins/';
const vertices=[],faces=[];let group='';
for(const line of readFileSync(source+'base.obj','utf8').split('\n')){
 const [tag,...values]=line.trim().split(/\s+/);
 if(tag==='v')vertices.push(values.map(Number));
 if(tag==='g')group=values[0];
 if(tag==='f'&&(group==='body'||group==='helper-l-eye'||group==='helper-r-eye'))faces.push(values.map(v=>Number(v.split('/')[0])-1));
}
// One Catmull–Clark pass refines silhouettes, knuckles and facial features.
function subdivide(vertices,faces){
 const add=(a,b)=>a.map((v,i)=>v+b[i]);
 const mul=(a,k)=>a.map(v=>v*k);
 const avg=list=>mul(list.reduce(add,[0,0,0]),1/list.length);
 const fp=faces.map(face=>avg(face.map(i=>vertices[i])));
 const vertexFaces=vertices.map(()=>[]),vertexEdges=vertices.map(()=>[]),edges=new Map();
 const key=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
 faces.forEach((face,fi)=>face.forEach((a,i)=>{
  vertexFaces[a].push(fi);const b=face[(i+1)%face.length],k=key(a,b);
  if(!edges.has(k)){const e={a,b,faces:[]};edges.set(k,e);vertexEdges[a].push(e);vertexEdges[b].push(e);}
  edges.get(k).faces.push(fi);
 }));
 const next=vertices.map((p,i)=>{
  const es=vertexEdges[i],fs=vertexFaces[i],boundary=es.filter(e=>e.faces.length===1);
  if(!fs.length)return p;
  if(boundary.length===2)return add(mul(p,.75),mul(add(...boundary.map(e=>vertices[e.a===i?e.b:e.a])),.125));
  const F=avg(fs.map(f=>fp[f])),R=avg(es.map(e=>avg([vertices[e.a],vertices[e.b]])));
  return mul(add(add(F,mul(R,2)),mul(p,fs.length-3)),1/fs.length);
 });
 for(const e of edges.values()){e.index=next.length;next.push(avg([vertices[e.a],vertices[e.b],...e.faces.map(f=>fp[f])]));}
 const faceOffset=next.length;next.push(...fp);
 const quads=[];faces.forEach((face,fi)=>face.forEach((a,i)=>quads.push([a,edges.get(key(a,face[(i+1)%face.length])).index,faceOffset+fi,edges.get(key(face[(i+face.length-1)%face.length],a)).index])));
 // Compact away unused rig/helper vertices before writing the mesh.
 const used=[...new Set(quads.flat())],remap=new Map(used.map((id,i)=>[id,i]));
 return {points:used.map(i=>next[i]),faces:quads.map(f=>f.map(i=>remap.get(i)))};
}
for(const [kind,sex] of [['woman','female'],['man','male']]){
 const points=vertices.map(p=>p.slice());
 for(const race of ['african','asian','caucasian']){
  for(const line of readFileSync(`${source}${race}-${sex}-young.target`,'utf8').split('\n')){
   if(!/^\d/.test(line))continue;
   const [i,x,y,z]=line.trim().split(/\s+/).map(Number);
   points[i][0]+=x/3;points[i][1]+=y/3;points[i][2]+=z/3;
  }
 }
 const used=new Set(faces.flat());const ymin=Math.min(...[...used].map(i=>points[i][1])),ymax=Math.max(...[...used].map(i=>points[i][1]));
 const scale=3.2/(ymax-ymin);
 for(const p of points){p[0]*=scale;p[1]=(p[1]-ymin)*scale;p[2]*=scale;}
 const smooth=subdivide(points,faces);
 const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(smooth.points.flat()),3));
 const indices=[];for(const f of smooth.faces)for(let i=1;i<f.length-1;i++)indices.push(f[0],f[i],f[i+1]);
 geometry.setIndex(indices);geometry.computeVertexNormals();
 const position=geometry.attributes.position.array,normal=geometry.attributes.normal.array,index=new Uint32Array(indices);
 const header=new Uint32Array([position.length/3,index.length]);
 writeFileSync(`public/models/preview/${kind}-anatomical.mesh`,Buffer.concat([Buffer.from(header.buffer),Buffer.from(position.buffer),Buffer.from(normal.buffer),Buffer.from(index.buffer)]));
 console.log(kind,indices.length/3,'triangles',position.length/3,'vertices','height 3.2');
}
