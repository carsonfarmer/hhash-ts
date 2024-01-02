import { type Input } from "npm:@noble/hashes/utils";
import { shake128 } from "npm:@noble/hashes/sha3";

// From npm:@noble/curves
export function equalBytes(b1: Uint8Array, b2: Uint8Array) {
  // We don't care about timing attacks here
  if (b1.length !== b2.length) {
    return false;
  }
  for (let i = 0; i < b1.length; i++) {
    if (b1[i] !== b2[i]) return false;
  }
  return true;
}

export type HashFunction = (
  msg: Input,
  opts?: { dkLen: number } | undefined,
) => Uint8Array;

// These consts amount to a 16 byte hash, which is ~2kbs.
// Anything bigger is too large and anything smaller isn't secure enough
export const SUM_SIZE = 1024; // Uint16 size
const HASH_SIZE = 2048; // Uint8 size
const DEFAULT_HASH: HashFunction = shake128;

export class LtHash16 {
  hash: HashFunction;
  accumulator: Uint16Array = new Uint16Array(SUM_SIZE);

  constructor(hasher: HashFunction = DEFAULT_HASH) {
    this.hash = hasher;
  }

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
    for (const item of items) {
      const hash = this.hash(item, { dkLen: HASH_SIZE });
      this.#addOne(hash);
    }
    return this;
  }

  remove(...items: Input[]) {
    for (const item of items) {
      const hash = this.hash(item, { dkLen: HASH_SIZE });
      this.#removeOne(hash);
    }
    return this;
  }

  digest() {
    return new Uint8Array(this.accumulator.buffer);
  }

  equals(other: LtHash16) {
    return equalBytes(this.digest(), other.digest());
  }

  union(other: LtHash16) {
    for (let i = 0; i < SUM_SIZE; i++) {
      this.accumulator[i] = (this.accumulator[i] + other.accumulator[i]) &
        0xFFFF;
    }
    return this;
  }

  difference(other: LtHash16) {
    for (let i = 0; i < SUM_SIZE; i++) {
      this.accumulator[i] = (this.accumulator[i] - other.accumulator[i]) &
        0xFFFF;
    }
    return this;
  }
}
