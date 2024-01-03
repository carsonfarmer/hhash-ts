// Copyright (c) 2023, Carson Farmer
// Copyright (c) 2020 Pieter Wuille (SPDX-License-Identifier: MIT)
// SPDX-License-Identifier: Apache-2.0

import { chacha20 } from "npm:@noble/ciphers/chacha";
import { sha256 } from "npm:/@noble/hashes/sha256";
import { type HomomorphicHasher, type Input } from "./interface.ts";

const PRIME_DIFF = 1103717n;
// 2^3072 - 1103717, the largest 3072-bit safe prime number, is used as the modulus
const PRIME = (1n << 3072n) - PRIME_DIFF;
const BYTE_SIZE = 3072 / 8;
const NONCE = new Uint8Array(12);
const DATA = new Uint8Array(BYTE_SIZE);

function bigintFromBytes(bytes: Uint8Array) {
  const dataView = new DataView(bytes.buffer);
  let bigint = 0n;
  for (let i = 0; i < bytes.byteLength; i += 8) {
    bigint += dataView.getBigUint64(i, true) << BigInt(i * 8);
  }
  return bigint;
}

function bytesFromBigInt(bigint: bigint, output: Uint8Array) {
  const dataView = new DataView(output.buffer);
  let tempBigInt = bigint;
  for (let i = 0; i < output.byteLength; i += 8) {
    dataView.setBigUint64(i, tempBigInt & 0xFFFFFFFFFFFFFFFFn, true);
    tempBigInt >>= BigInt(64);
  }
  return output;
}

/**
 * Hash a 32-byte array data to a 3072-bit bigint using 6 Chacha20 operations.
 */
function bytesToNum3072(data: Uint8Array) {
  const hashBytes = chacha20(data, NONCE, DATA);
  return bigintFromBytes(hashBytes);
}

/**
 * Compute the modular inverse of `a` modulo `n` using the extended Euclidean Algorithm.
 * @see https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers.
 */
function modInv(a: bigint, n: bigint): bigint {
  let t1 = 0n, t2 = 1n;
  let r1: bigint = n, r2: bigint = a;

  while (r2 !== 0n) {
    const q: bigint = r1 / r2;
    [t1, t2] = [t2, t1 - q * t2];
    [r1, r2] = [r2, r1 - q * r2];
  }

  if (r1 > 1n) {
    throw new Error("non-invertible");
  }
  if (t1 < 0n) {
    t1 += n;
  }
  return t1;
}

export class MuHash implements HomomorphicHasher {
  constructor(public numerator: bigint = 1n, public denominator: bigint = 1n) {}

  static default() {
    return new MuHash();
  }

  equals(other: MuHash) {
    if (this.denominator === 1n && other.denominator === 1n) {
      // Normalized
      return this.numerator === other.numerator;
    }
    // Not normalized
    return this.numerator === other.numerator &&
      this.denominator === other.denominator;
  }

  insert(...items: Input[]) {
    const out = this.clone();
    for (const item of items) {
      const element = bytesToNum3072(sha256(item));
      out.numerator = (out.numerator * element) % PRIME;
    }
    return out;
  }

  remove(...items: Input[]) {
    const out = this.clone();
    for (const item of items) {
      const element = bytesToNum3072(sha256(item));
      out.denominator = (out.denominator * element) % PRIME;
    }
    return out;
  }

  digest() {
    const value = (this.numerator * modInv(this.denominator, PRIME)) % PRIME;
    const bytes = bytesFromBigInt(value, new Uint8Array(BYTE_SIZE));
    return sha256(bytes);
  }

  normalized() {
    const numerator = (this.numerator * modInv(this.denominator, PRIME)) %
      PRIME;
    return new MuHash(numerator);
  }

  union(other: MuHash) {
    const out = this.clone();
    out.numerator = (this.numerator * other.numerator) % PRIME;
    out.denominator = (this.denominator * other.denominator) % PRIME;
    return out;
  }

  difference(other: MuHash) {
    const out = this.clone();
    out.numerator = (this.numerator * modInv(other.denominator, PRIME)) %
      PRIME;
    out.denominator = (this.denominator * other.numerator) % PRIME;
    return out;
  }

  clone() {
    return new MuHash(this.numerator, this.denominator) as this;
  }
}
