// Copyright (c) 2023, Carson Farmer
// SPDX-License-Identifier: Apache-2.0

import { type Input } from "npm:@noble/hashes/utils";

export { Input };

/**
 * An "incremental" (set homomorphic) hash function based on the "randomize-then-combine" paradigm.
 * @see https://cseweb.ucsd.edu/~mihir/papers/inc-hash.pdf
 */
export interface HomomorphicHasher {
  /**
   * Insert items into the accumulator. Items are hashed and then added to the accumulator.
   * @param items Items to insert into the accumulator.
   */
  insert(...items: Input[]): this;
  /**
   * Remove items from the accumulator. Items are hashed and then removed from the accumulator.
   * @param items Items to remove from the accumulator.
   */
  remove(...items: Input[]): this;
  /**
   * Compute the union of two accumulators.
   * @param other The other accumulator to union with.
   */
  union(other: HomomorphicHasher): this;
  /**
   * Compute the difference of two accumulators.
   * @param other The other accumulator to difference with.
   */
  difference(other: HomomorphicHasher): this;
  /**
   * Compute the digest of the accumulator. This is the finalized hash.
   */
  digest(): Uint8Array;
  /**
   * Determine if two accumulators are equal.
   */
  equals(other: HomomorphicHasher): boolean;
  /**
   * Clone the accumulator.
   */
  clone(): this;
}
