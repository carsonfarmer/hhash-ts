// Copyright (c) 2023, Carson Farmer
// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { sha512 } from "npm:@noble/hashes/sha512";
import { sha256 } from "npm:@noble/hashes/sha256";
import { RistrettoPoint } from "npm:@noble/curves/ed25519";
import { type HomomorphicHasher, type Input } from "./interface.ts";

// Needed due to how the RistrettoPoint type is exported
export type RistrettoPoint = InstanceType<typeof RistrettoPoint>;

export class RistrettoMultisetHash implements HomomorphicHasher {
  constructor(public accumulator: RistrettoPoint = RistrettoPoint.ZERO) {}

  static default() {
    return new RistrettoMultisetHash();
  }

  equals(other: RistrettoMultisetHash) {
    return this.accumulator.equals(other.accumulator);
  }

  insert(...items: Input[]) {
    for (const item of items) {
      const point = RistrettoPoint.hashToCurve(sha512(item));
      this.accumulator = this.accumulator.add(point);
    }
    return this;
  }

  remove(...items: Input[]) {
    for (const item of items) {
      const point = RistrettoPoint.hashToCurve(sha512(item));
      this.accumulator = this.accumulator.subtract(point);
    }
    return this;
  }

  union(other: RistrettoMultisetHash) {
    this.accumulator = this.accumulator.add(other.accumulator);
    return this;
  }

  difference(other: RistrettoMultisetHash) {
    this.accumulator = this.accumulator.subtract(other.accumulator);
    return this;
  }

  digest() {
    const bytes = this.accumulator.toRawBytes();
    return sha256(bytes);
  }
}
