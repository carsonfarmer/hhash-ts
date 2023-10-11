# Homomorphic Hashing

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Homomorphic hashing in Typescript

# Table of Contents

- [Title](#homomorphic-hashing)
- [Table of Contents](#table-of-contents)
- [Background](#background)
- [Development](#development)
  - [Benchmarks](#benchmarks)
  - [Tests](#tests)
- [Contributing](#contributing)
- [License](#license)

# Background

Bellare, Goldreich, and Goldwasser [introduced the concept](https://cseweb.ucsd.edu/~mihir/papers/inc1.pdf) of an “incremental” (homomorphic) hash function, and subsequently proposed the ["randomize-then-combine" paradigm](https://cseweb.ucsd.edu/~mihir/papers/inc-hash.pdf) for constructing a set homomorphic (a.k.a. “incremental”) hash function, which was further extended to the multiset hash setting by [Clarke et al](https://people.csail.mit.edu/devadas/pubs/mhashes.pdf). For an input set S = {x1,...,xn} ∈ P({0, 1}∗), a commutative group G with operation ◦, and an underlying hash function h : {0, 1}∗ → G modeled as a random oracle, the set homomorphic hash H is defined as H(S) = h(x1) ◦ h(x2) ◦ ··· ◦ h(xn). Using this paradigm, Bellare and Micciancio and others describe various instantiations of H: AdHash, MuHash, and LtHash. AdHash is generally [considered impractical](https://arxiv.org/pdf/1601.06502.pdf) due to the extremely large hash code sizes required for sufficient security. Conversely, MuHash has shown a good deal of promise, and an [implementation exists within Bitcoin Core](https://doxygen.bitcoincore.org/class_mu_hash3072.html). LtHash is an alternative to MuHash, in particular due to its simplicity, though it does have a relatively suboptimal output size compared with some alternatives based on elliptic curves.

The ECMH ([elliptic curve multiset hash](https://arxiv.org/pdf/1601.06502.pdf)) is a recent alternative to multiplication modulo a prime (as in MuHash) which uses an elliptic curve group G where the discrete logarithm (DL) problem is hard. Concretely, each element is hashed to a point on such an elliptic curve (e.g. Ristretto group in Curve25519, secp256k1), and the hash is the sum of all such points. The curve's group operations are used to add and remove multisets. Associativity and commutativity then follow. Extremely [fast and constant time algorithms exist](https://arxiv.org/pdf/1601.06502.pdf), but only for char-2 curves. Here we leverage a implementation over the Ristretto group in Curve25519 (based on [this implementation](https://github.com/MystenLabs/fastcrypto/blob/main/fastcrypto/src/hash.rs#L263)), and another using [RFC 9380](https://datatracker.ietf.org/doc/rfc9380/) to hash to a point on the secp256r1 curve. Other formulations exist and appear fast, for example, Tomas van der Wansem [provides an implementation](https://reviews.bitcoinabc.org/D1072#change-bEnKePuHRgCO) that uses [trial-and-hash](https://eprint.iacr.org/2009/226.pdf) to convert the hash into point on the secp256k1 curve.

[In general terms](https://eprint.iacr.org/2019/227.pdf), a set homomorphic hash function H : P({0, 1}∗) → G is defined as transforming a set of input bit-strings in {0, 1}∗ to elements of a commutative group (G, ◦) with two properties: set homomorphism and collision resistance. We say that the function H is set homomorphic for a commutative group (G, ◦) if for any two disjoint sets S, T ∈ P({0, 1}∗), we have that H(S ∪ T) = H(S) ◦ H(T). In addition to the commutative property of the group, the combining operation ◦ must also be associative, such that H(H(S,T),U) = H(S,H(T,U)). Further, we say that H is collision resistant if a computationally bounded adversary A cannot produce two input sets S,T ∈ P({0,1}∗) such that S ≠ T and H(S) = H(T) with non-negligible probability. Note that this is simply the standard definition of collision resistance applied to the function H.

# Usage

```typescript
import { utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { RistrettoMultisetHash } from "./main.ts";

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

# Contributing

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

# License

MIT AND Apache-2.0, © 2023 Carson Farmer <carson.farmer@gmail.com>
