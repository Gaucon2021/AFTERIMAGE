import {compare} from "./workbench.mjs";
export function canonical(value){
 let budget=50000;
 function encode(v,depth){
  if(--budget<0||depth>32)throw Error("Evidence structure exceeds limits");
  if(typeof v==="string"){if(v.length>12000)throw Error("Evidence string exceeds limit");return JSON.stringify(v);}
  if(v===null||typeof v==="boolean")return JSON.stringify(v);
  if(typeof v==="number"&&Number.isFinite(v))return JSON.stringify(v);
  if(Array.isArray(v)){
   if(v.length>5000)throw Error("Evidence array exceeds limit");
   const entries=[];for(let i=0;i<v.length;i++){if(!Object.hasOwn(v,i))throw Error("Sparse evidence array");entries.push(encode(v[i],depth+1));}
   return "["+entries.join(",")+"]";
  }
  if(v&&Object.getPrototypeOf(v)===Object.prototype){const keys=Object.keys(v).sort();if(keys.length>5000)throw Error("Evidence object exceeds limit");return "{"+keys.map(k=>{if(k.length>1000)throw Error("Evidence key exceeds limit");return JSON.stringify(k)+":"+encode(v[k],depth+1)}).join(",")+"}";}
  throw Error("Unsupported evidence value");
 }
 const text=encode(value,0);if(text.length>2000000)throw Error("Evidence exceeds size limit");return text;
}
async function hash(v){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(canonical(v)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");}
export async function freeze(events,intervention){
 const e=JSON.parse(canonical(events)),i=JSON.parse(canonical(intervention)),result=compare(e,i);
 if(result.baseline.status==="UNKNOWN"||result.alternative.status==="UNKNOWN")throw Error("Invalid trace or intervention");
 const body={schema:"afterimage.replay.v1",model:"capacity-load-dependencies.v1",events:e,intervention:i,result};
 return {...body,sha256:await hash(body)};
}
export async function verifyBundle(bundle){
 if(!bundle||bundle.schema!=="afterimage.replay.v1"||bundle.model!=="capacity-load-dependencies.v1"||typeof bundle.sha256!=="string"||!(/^[a-f0-9]{64}$/).test(bundle.sha256))throw Error("Unsupported evidence bundle");
 const expected=await freeze(bundle.events,bundle.intervention);
 if(canonical(expected)!==canonical(bundle))throw Error("Bundle differs from independent deterministic replay");
 return {status:"REPLAY_MATCH",sha256:expected.sha256,baseline:expected.result.baseline.status,alternative:expected.result.alternative.status,limitations:"Integrity and reproducibility only; not an authenticated real-world incident or author signature."};
}
