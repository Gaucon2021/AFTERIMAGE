import {test} from "node:test";import assert from "node:assert/strict";import {replay,incident} from "./workbench.mjs";
test("baseline fails at event 2",()=>assert.equal(replay(incident).firstFailure,2));
test("early capacity fix passes",()=>assert.equal(replay(incident,{1:10}).status,"PASSED"));
test("late fix cannot erase prior failure",()=>assert.equal(replay(incident,{5:20}).status,"FAILED"));
test("bad dependency unknown",()=>assert.equal(replay([{...incident[0],dependsOn:[2]}]).status,"UNKNOWN"));
test("negative capacity unknown",()=>assert.equal(replay(incident,{1:-1}).status,"UNKNOWN"));
test("unknown intervention rejected",()=>assert.equal(replay(incident,{99:5}).status,"UNKNOWN"));
test("replay deterministic",()=>assert.deepEqual(replay(incident),replay(incident)));

test("override cannot repair malformed original evidence",()=>assert.equal(replay([{...incident[0],value:-1}],{1:10}).status,"UNKNOWN"));
test("duplicate dependencies rejected",()=>assert.equal(replay([incident[0],{...incident[1],dependsOn:[1,1]}]).status,"UNKNOWN"));
test("array intervention rejected",()=>assert.equal(replay(incident,[]).status,"UNKNOWN"));
