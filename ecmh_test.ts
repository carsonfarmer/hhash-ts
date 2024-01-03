import { hexToBytes, utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { RistrettoMultisetHash } from "./ecmh.ts";

Deno.test("basic ristretto", () => {
  const elements = ["apple", "banana", "kiwi"];
  const hash = RistrettoMultisetHash.default()
    .insert(utf8ToBytes(elements[0]))
    .insert(utf8ToBytes(elements[1]))
    .insert(utf8ToBytes(elements[2]))
    .remove(utf8ToBytes(elements[1]));
  const hashBis = RistrettoMultisetHash.default()
    .insert(utf8ToBytes(elements[0]))
    .insert(utf8ToBytes(elements[2]));

  assert(hash.equals(hashBis));
  assertEquals(hash.digest(), hashBis.digest());
  assertEquals(hash.digest().byteLength, 32);
});

Deno.test("union ristretto", () => {
  const left = RistrettoMultisetHash.default().insert(utf8ToBytes("hello"));

  const right = RistrettoMultisetHash.default().insert(
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

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
  const left = RistrettoMultisetHash.default().insert(
    utf8ToBytes("hello"),
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

  const right = RistrettoMultisetHash.default().insert(
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

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
  const hash = RistrettoMultisetHash.default()
    .insert(utf8ToBytes("hello"))
    .insert(utf8ToBytes("world"));
  const observed = hash.digest();
  const expected = hexToBytes(
    "ec5a062251b2700370ee74d7aa290d61e73fc15d35e41fb792fd609426f4bfdb",
  );
  assertEquals(observed, expected);
});

Deno.test("immutable ristretto", () => {
  const left = RistrettoMultisetHash.default().insert(utf8ToBytes("hello"));

  const right = RistrettoMultisetHash.default().insert(
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

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
    !left.equals(
      RistrettoMultisetHash.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});
