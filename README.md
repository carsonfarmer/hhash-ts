# Homomorphic Hashing

[![Test](https://github.com/carsonfarmer/hhash-ts/actions/workflows/test.yml/badge.svg)](https://github.com/carsonfarmer/hhash-ts/actions)
[![Docs](https://github.com/carsonfarmer/hhash-ts/actions/workflows/docs.yml/badge.svg)](https://github.com/carsonfarmer/hhash-ts/actions)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-ok-green.svg)](https://github.com/RichardLitt/standard-readme)

> Homomorphic hashing in Typescript

# Table of Contents

- [Title](#homomorphic-hashing)
- [Table of Contents](#table-of-contents)
- [Background](#background)
- [Development](#development)
  - [Benchmarks](#benchmarks)
  - [Tests](#tests)
  - [Linting](#linting)
  - [Docs](#docs)
- [Contributing](#contributing)
- [License](#license)
- [See Also](#see-also)

# Background

Bellare, Goldreich, and Goldwasser [introduced the concept](https://cseweb.ucsd.edu/~mihir/papers/inc1.pdf) of an “incremental” (homomorphic) hash function, and subsequently proposed the ["randomize-then-combine" paradigm](https://cseweb.ucsd.edu/~mihir/papers/inc-hash.pdf) for constructing a set homomorphic (a.k.a. “incremental”) hash function, which was further extended to the multiset hash setting by [Clarke et al](https://people.csail.mit.edu/devadas/pubs/mhashes.pdf). For an input set S = {x1,...,xn} ∈ P({0, 1}∗), a commutative group G with operation ◦, and an underlying hash function h : {0, 1}∗ → G modeled as a random oracle, the set homomorphic hash H is defined as H(S) = h(x1) ◦ h(x2) ◦ ··· ◦ h(xn). Using this paradigm, Bellare and Micciancio and others describe various instantiations of H: AdHash, MuHash, and LtHash. AdHash is generally [considered impractical](https://arxiv.org/pdf/1601.06502.pdf) due to the extremely large hash code sizes required for sufficient security. Conversely, MuHash has shown a good deal of promise, and an [implementation exists within Bitcoin Core](https://doxygen.bitcoincore.org/class_mu_hash3072.html). LtHash is an alternative to MuHash, in particular due to its simplicity, though it does have a relatively suboptimal output size compared with some alternatives based on elliptic curves. The ECMH ([elliptic curve multiset hash](https://arxiv.org/pdf/1601.06502.pdf)) is a recent alternative to multiplication modulo a prime (as in MuHash) which uses an elliptic curve group G where the discrete logarithm (DL) problem is hard.

# Usage

```typescript
import { utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { RistrettoMultisetHash } from "./ecmh.ts";

Deno.test("main", () => {
  const hash = RistrettoMultisetHash.default();
  const elements = ["apple", "banana", "kiwi"];
  hash.insert(utf8ToBytes(elements[0]));
  hash.insert(utf8ToBytes(elements[1]));
  hash.insert(utf8ToBytes(elements[2]));
  hash.remove(utf8ToBytes(elements[1]));
  const hashBis = RistrettoMultisetHash.default();
  hashBis.insert(utf8ToBytes(elements[0]));
  hashBis.insert(utf8ToBytes(elements[2]));

  assert(hash.equals(hashBis));
  assertEquals(hash.digest(), hashBis.digest());
  assertEquals(hash.digest().byteLength, 32);
});
```

# Development

## Benchmarks

TODO

## Tests

```bash
deno test
```

## Linting

```bash
deno lint
```

## Docs

```bash
deno doc mod.ts
```

# Contributing

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

# License

Copyright 2023 Carson Farmer <carson.farmer@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# See Also

- https://github.com/runtime-machines/lthash-rs
- https://github.com/lukechampine/lthash
- https://github.com/MystenLabs/fastcrypto
- https://github.com/Bitcoin-ABC/bitcoin-abc
