// Copyright (c) 2023, Carson Farmer
// Copyright (c) 2023, RunTime Machines AG
// SPDX-License-Identifier: Apache-2.0

import { shake128 } from "npm:@noble/hashes/sha3";
import { type HomomorphicHasher, type Input } from "./interface.ts";

// These constants amount to a 16 byte hash, which is ~2kbs.
// Anything bigger is too large and anything smaller isn't secure enough
const SUM_SIZE = 1024; // Uint16 size
const HASH_SIZE = SUM_SIZE * 2; // Uint8 size
const DEFAULT_HASH: HashFunction = shake128;

// From npm:@noble/curves
function equalBytes(b1: Uint8Array, b2: Uint8Array) {
  // We don't care about timing attacks here
  if (b1.length !== b2.length) {
    return false;
  }
  for (let i = 0; i < b1.length; i++) {
    if (b1[i] !== b2[i]) return false;
  }
  return true;
}

export type HashFunction = (msg: Input, opts?: { dkLen: number }) => Uint8Array;

export class LtHash16 implements HomomorphicHasher {
  constructor(
    public accumulator: Uint16Array = new Uint16Array(SUM_SIZE),
    public hash: HashFunction = DEFAULT_HASH,
  ) {}

  static default() {
    return new LtHash16();
  }

  #addOne(item: Uint8Array) {
    const y = new DataView(item.buffer);
    for (let i = 0; i < HASH_SIZE; i += 2) {
      const idx = Math.floor(i / 2);
      const xi = this.accumulator[idx];
      const yi = y.getUint16(i, true);
      const sum = (xi + yi) & 0xFFFF;
      this.accumulator[idx] = sum;
    }
  }

  #removeOne(item: Uint8Array) {
    const y = new DataView(item.buffer);
    for (let i = 0; i < HASH_SIZE; i += 2) {
      const idx = Math.floor(i / 2);
      const xi = this.accumulator[idx];
      const yi = y.getUint16(i, true);
      const sub = (xi - yi) & 0xFFFF;
      this.accumulator[idx] = sub;
    }
  }

  insert(...items: Input[]) {
    const out = this.clone();
    for (const item of items) {
      const hash = this.hash(item, { dkLen: HASH_SIZE });
      out.#addOne(hash);
    }
    return out;
  }

  remove(...items: Input[]) {
    const out = this.clone();
    for (const item of items) {
      const hash = this.hash(item, { dkLen: HASH_SIZE });
      out.#removeOne(hash);
    }
    return out;
  }

  digest() {
    return new Uint8Array(this.accumulator.buffer);
  }

  equals(other: LtHash16) {
    return equalBytes(this.digest(), other.digest());
  }

  union(other: LtHash16) {
    const out = this.clone();
    for (let i = 0; i < SUM_SIZE; i++) {
      out.accumulator[i] = (out.accumulator[i] + other.accumulator[i]) &
        0xFFFF;
    }
    return out;
  }

  difference(other: LtHash16) {
    const out = this.clone();
    for (let i = 0; i < SUM_SIZE; i++) {
      out.accumulator[i] = (out.accumulator[i] - other.accumulator[i]) &
        0xFFFF;
    }
    return out;
  }

  clone() {
    return new LtHash16(this.accumulator, this.hash) as this;
  }
}
