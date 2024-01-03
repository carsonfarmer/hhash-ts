// Copyright (c) 2023, Carson Farmer
// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { sha512 } from "npm:@noble/hashes/sha512";
import { sha256 } from "npm:@noble/hashes/sha256";
import { RistrettoPoint } from "npm:@noble/curves/ed25519";
import { type HomomorphicHasher, type Input } from "./interface.ts";

// Needed due to how the RistrettoPoint type is exported
type RistrettoPoint = InstanceType<typeof RistrettoPoint>;

export class RistrettoMultisetHash implements HomomorphicHasher {
  constructor(public accumulator: RistrettoPoint = RistrettoPoint.ZERO) {}

  static default() {
    return new RistrettoMultisetHash();
  }

  equals(other: RistrettoMultisetHash) {
    return this.accumulator.equals(other.accumulator);
  }

  insert(...items: Input[]) {
    const out = this.clone();
    for (const item of items) {
      const point = RistrettoPoint.hashToCurve(sha512(item));
      out.accumulator = out.accumulator.add(point);
    }
    return out;
  }

  remove(...items: Input[]) {
    const out = this.clone();
    for (const item of items) {
      const point = RistrettoPoint.hashToCurve(sha512(item));
      out.accumulator = out.accumulator.subtract(point);
    }
    return out;
  }

  union(other: RistrettoMultisetHash) {
    const out = this.clone();
    out.accumulator = this.accumulator.add(other.accumulator);
    return out;
  }

  difference(other: RistrettoMultisetHash) {
    const out = this.clone();
    out.accumulator = this.accumulator.subtract(other.accumulator);
    return out;
  }

  digest() {
    const bytes = this.accumulator.toRawBytes();
    return sha256(bytes);
  }

  clone() {
    return new RistrettoMultisetHash(this.accumulator) as this;
  }
}
