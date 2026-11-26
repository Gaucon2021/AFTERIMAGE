export function replay(events, intervention={}) {
 if(!Array.isArray(events)||!events.length||events.length>300||!intervention||typeof intervention!=="object"||Array.isArray(intervention))return {status:"UNKNOWN",reason:"Invalid trace"};
 const services=new Map(),trace=[],seen=new Set();let firstFailure=null;
 for(const [i,event] of events.entries()){
  if(!event||event.seq!==i+1||typeof event.service!=="string"||!event.service||!Array.isArray(event.dependsOn)||new Set(event.dependsOn).size!==event.dependsOn.length||event.dependsOn.some(id=>!seen.has(id)))return {status:"UNKNOWN",reason:"Missing or unordered dependency",trace};
  const value=Object.hasOwn(intervention,event.seq)?intervention[event.seq]:event.value;
  if(!Number.isFinite(event.value)||event.value<0||!Number.isFinite(value)||value<0||!["capacity","load"].includes(event.type))return {status:"UNKNOWN",reason:"Invalid event",trace};
  const state=services.get(event.service)||{capacity:10,load:0};state[event.type]=value;services.set(event.service,state);
  const failed=state.load>state.capacity,dependencyFailed=event.dependsOn.some(id=>trace[id-1].failed||trace[id-1].dependencyFailed);
  const row={seq:event.seq,service:event.service,type:event.type,value,capacity:state.capacity,load:state.load,failed,dependencyFailed,intervened:Object.hasOwn(intervention,event.seq),parents:event.dependsOn};
  if((failed||dependencyFailed)&&!firstFailure)firstFailure=row.seq;
  trace.push(row);seen.add(event.seq);
 }
 if(Object.keys(intervention).some(k=>!seen.has(Number(k))||String(Number(k))!==k))return {status:"UNKNOWN",reason:"Intervention points outside trace",trace};
 return {status:firstFailure===null?"PASSED":"FAILED",firstFailure,trace};
}
export const incident=[
 {seq:1,service:"queue",type:"capacity",value:3,dependsOn:[]},
 {seq:2,service:"queue",type:"load",value:8,dependsOn:[1]},
 {seq:3,service:"worker",type:"load",value:4,dependsOn:[2]},
 {seq:4,service:"api",type:"load",value:5,dependsOn:[3]},
 {seq:5,service:"queue",type:"capacity",value:10,dependsOn:[4]}
];
export function compare(events,overrides){const baseline=replay(events);return {baseline,alternative:baseline.status==="UNKNOWN"?{status:"UNKNOWN",reason:"Baseline evidence invalid"}:replay(events,overrides),model:"synthetic dependency propagation; not production causal proof"};}
