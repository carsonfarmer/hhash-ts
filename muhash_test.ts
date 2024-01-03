import { hexToBytes, utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { chacha20 } from "npm:@noble/ciphers/chacha";
import { MuHash } from "./muhash.ts";

Deno.test("basic muhash", () => {
  const hash = MuHash.default();
  const elements = ["apple", "banana", "kiwi"];
  hash.insert(utf8ToBytes(elements[0]));
  hash.insert(utf8ToBytes(elements[1]));
  hash.insert(utf8ToBytes(elements[2]));
  hash.remove(utf8ToBytes(elements[1]));
  const hashBis = MuHash.default();
  hashBis.insert(utf8ToBytes(elements[0]));
  hashBis.insert(utf8ToBytes(elements[2]));

  assert(!hash.equals(hashBis));
  // We have to normalize the hash before comparing it
  assert(hash.normalize().equals(hashBis));
  assertEquals(hash.digest(), hashBis.digest());
  assertEquals(hash.digest().byteLength, 32);
});

Deno.test("union muhash", () => {
  const left = MuHash.default();
  left.insert(utf8ToBytes("hello"));

  const right = MuHash.default();
  right.insert(utf8ToBytes("world"), utf8ToBytes("lucas"));

  assert(
    left.union(right).equals(
      MuHash.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );

  assert(
    !left.union(right).equals(
      MuHash.default().insert(
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("difference muhash", () => {
  const left = MuHash.default();
  left.insert(utf8ToBytes("hello"), utf8ToBytes("world"), utf8ToBytes("lucas"));

  const right = MuHash.default();
  right.insert(utf8ToBytes("world"), utf8ToBytes("lucas"));

  assert(
    left.difference(right).normalize().equals(
      MuHash.default().insert(
        utf8ToBytes("hello"),
      ),
    ),
  );

  assert(
    !left.difference(right).normalize().equals(
      MuHash.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("interoperability muhash", () => {
  const hash = MuHash.default();
  hash.insert(new Uint8Array(32));
  hash.insert(new Uint8Array([1].concat(new Array(31).fill(0))));
  hash.remove(new Uint8Array([2].concat(new Array(31).fill(0))));
  // This mirrors the result in the C++ MuHash3072 unit test
  const observed = hash.digest().toReversed();
  // This matches with a rust implementation
  const expected = hexToBytes(
    "10d312b100cbd32ada024a6646e40d3482fcff103668d2625f10002a607d5863",
  );
  assertEquals(observed, expected);
});

Deno.test("basic chacha20", () => {
  const BYTE_SIZE = 3072 / 8;
  const NONCE = new Uint8Array(12);
  const DATA = new Uint8Array(BYTE_SIZE);
  // Test vectors from https://tools.ietf.org/html/draft-agl-tls-chacha20poly1305-04#section-7
  // Since the nonce is hardcoded to 0 in our function we only use those
  // vectors.
  let key = new Uint8Array(32);
  let observed = chacha20(key, NONCE, DATA).slice(0, 64);
  let expected = hexToBytes(
    "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586",
  );
  assertEquals(observed, expected);

  key = new Uint8Array(32);
  key[key.byteLength - 1] = 1;
  observed = chacha20(key, NONCE, DATA).slice(0, 64);
  expected = hexToBytes(
    "4540f05a9f1fb296d7736e7b208e3c96eb4fe1834688d2604f450952ed432d41bbe2a0b6ea7566d2a5d1e7e20d42af2c53d792b1c43fea817e9ad275ae546963",
  );
  assertEquals(observed, expected);
});
