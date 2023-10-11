import { hexToBytes, utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { RistrettoMultisetHash } from "./main.ts";

Deno.test("basic ristretto", () => {
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

Deno.test("union ristretto", () => {
  const left = RistrettoMultisetHash.default();
  left.insert(utf8ToBytes("hello"));

  const right = RistrettoMultisetHash.default();
  right.insert(utf8ToBytes("world"), utf8ToBytes("lucas"));

  assert(
    left.union(right).equals(
      RistrettoMultisetHash.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );

  assert(
    !left.union(right).equals(
      RistrettoMultisetHash.default().insert(
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("difference ristretto", () => {
  const left = RistrettoMultisetHash.default();
  left.insert(utf8ToBytes("hello"), utf8ToBytes("world"), utf8ToBytes("lucas"));

  const right = RistrettoMultisetHash.default();
  right.insert(utf8ToBytes("world"), utf8ToBytes("lucas"));

  assert(
    left.difference(right).equals(
      RistrettoMultisetHash.default().insert(
        utf8ToBytes("hello"),
      ),
    ),
  );

  assert(
    !left.difference(right).equals(
      RistrettoMultisetHash.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("interoperability ristretto", () => {
  const hash = RistrettoMultisetHash.default();
  hash.insert(utf8ToBytes("hello"));
  hash.insert(utf8ToBytes("world"));
  const observed = hash.digest();
  const expected = hexToBytes(
    "ec5a062251b2700370ee74d7aa290d61e73fc15d35e41fb792fd609426f4bfdb",
  );
  assertEquals(observed, expected);
});
