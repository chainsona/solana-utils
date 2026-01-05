import { test } from "node:test";
import assert from "node:assert";
import { uint8ToBs58, bs58ToUint8, checkMatch } from "../utils.js";
import bs58 from "bs58";

test("uint8ToBs58 converts correctly", () => {
  const input = "[1, 2, 3]";
  // 1,2,3 in hex is 010203
  // bs58 of 010203 is Ldp
  const expected = bs58.encode(new Uint8Array([1, 2, 3]));
  assert.strictEqual(uint8ToBs58(input), expected);
});

test("uint8ToBs58 handles loose input", () => {
  const input = "1, 2, 3";
  const expected = bs58.encode(new Uint8Array([1, 2, 3]));
  assert.strictEqual(uint8ToBs58(input), expected);
});

test("bs58ToUint8 converts correctly", () => {
  const input = bs58.encode(new Uint8Array([1, 2, 3]));
  const result = bs58ToUint8(input);
  assert.deepStrictEqual(result, new Uint8Array([1, 2, 3]));
});

test("checkMatch matches prefix", () => {
  const pubkey = "SoL123456789";
  assert.strictEqual(checkMatch(pubkey, "SoL", "", false), true);
  assert.strictEqual(checkMatch(pubkey, "sol", "", false), false);
});

test("checkMatch matches suffix", () => {
  const pubkey = "123456789SoL";
  assert.strictEqual(checkMatch(pubkey, "", "SoL", false), true);
});

test("checkMatch ignores case", () => {
  const pubkey = "SoL123456789";
  assert.strictEqual(checkMatch(pubkey, "sol", "", true), true);
});

test("checkMatch handles both start and end", () => {
  const pubkey = "SoL...End";
  assert.strictEqual(checkMatch(pubkey, "SoL", "End", false), true);
  assert.strictEqual(checkMatch(pubkey, "sol", "end", false), false);
  assert.strictEqual(checkMatch(pubkey, "sol", "end", true), true);
});
