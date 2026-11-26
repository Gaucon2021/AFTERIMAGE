import {test} from "node:test";import assert from "node:assert/strict";import {webcrypto} from "node:crypto";import{canonical,freeze,verifyBundle}from "./evidence.mjs";import{incident}from "./workbench.mjs";
if(!globalThis.crypto)Object.defineProperty(globalThis,"crypto",{value:webcrypto});
test("canonical keys",()=>assert.equal(canonical({b:2,a:1}),canonical({a:1,b:2})));
test("valid round trip",async()=>assert.equal((await verifyBundle(await freeze(incident,{1:10}))).status,"REPLAY_MATCH"));
test("edited outcome rejected",async()=>{const p=await freeze(incident,{1:10});p.result.baseline.status="PASSED";await assert.rejects(verifyBundle(p));});
test("edited input rejected",async()=>{const p=await freeze(incident,{1:10});p.events[0].value=99;await assert.rejects(verifyBundle(p));});
test("bad original trace rejected",async()=>assert.rejects(freeze([{...incident[0],seq:9}],{})));
test("invalid intervention rejected",async()=>assert.rejects(freeze(incident,{99:8})));
test("hash stable",async()=>assert.equal((await freeze(incident,{1:10})).sha256,(await freeze(incident,{1:10})).sha256));
