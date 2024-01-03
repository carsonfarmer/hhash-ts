// Copyright (c) 2023, Carson Farmer
// SPDX-License-Identifier: Apache-2.0

import { type Input } from "npm:@noble/hashes/utils";

export { Input };

export interface HomomorphicHasher {
  insert(...items: Input[]): this;
  remove(...items: Input[]): this;
  union(other: HomomorphicHasher): this;
  difference(other: HomomorphicHasher): this;
  digest(): Uint8Array;
  equals(other: HomomorphicHasher): boolean;
}
