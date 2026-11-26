import {compare} from "./workbench.mjs";
export function canonical(v){
 if(v===null||typeof v==="boolean"||typeof v==="string")return JSON.stringify(v);
 if(typeof v==="number"&&Number.isFinite(v))return JSON.stringify(v);
 if(Array.isArray(v))return "["+v.map(canonical).join(",")+"]";
 if(v&&Object.getPrototypeOf(v)===Object.prototype)return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canonical(v[k])).join(",")+"}";
 throw Error("Unsupported evidence value");
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
