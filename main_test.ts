import { bytesToHex, hexToBytes, utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { MatrixHash, RistrettoMultisetHash } from "./main.ts";

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
  console.log(hash.accumulator.toRawBytes());
  const observed = hash.digest();
  const expected = hexToBytes(
    "ec5a062251b2700370ee74d7aa290d61e73fc15d35e41fb792fd609426f4bfdb",
  );
  assertEquals(observed, expected);
});

Deno.test("matrix hash", () => {
  const hash = MatrixHash.default();
  const elements = ["apple", "banana", "kiwi"];
  hash.insert(utf8ToBytes(elements[0]));
  hash.insert(utf8ToBytes(elements[1]));
  hash.insert(utf8ToBytes(elements[2]));
  assertEquals(
    hash.digest(),
    hexToBytes(
      "0894a59c39f6b3ec3ad17d4f121644e20775d254912e00d496bb6be00cf02362",
    ),
  );
  assertEquals(hash.digest().byteLength, 32);
});

Deno.test("union matrix", () => {
  const left = MatrixHash.default();
  left.insert(utf8ToBytes("hello"));

  const right = MatrixHash.default();
  right.insert(utf8ToBytes("world"), utf8ToBytes("lucas"));

  assert(
    left.concat(right).equals(
      MatrixHash.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );

  assert(
    !left.concat(right).equals(
      MatrixHash.default().insert(
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("interoperability matrix", () => {
  const hash = MatrixHash.default();
  hash.insert(utf8ToBytes("hello"));
  hash.insert(utf8ToBytes("world"));
  const observed = hash.digest();
  const expected = hexToBytes(
    "7490f1de60815b8db68009c957fbe27eaee09818dd71c4d11ed63288b77820cb",
  );
  assertEquals(observed, expected);
});

Deno.test("matrix hash proof", () => {
  // I'm tracking this stuff
  const left = MatrixHash.default();
  left.insert(utf8ToBytes("hello"), utf8ToBytes("world"));

  // I'd like to prove that this element is in the set
  const value = "prove me wrong";

  // Here's the stuff that came after the element I care about
  const right = MatrixHash.default();
  right.insert(utf8ToBytes("lucas"));

  // This is what my peer and I have been tracking
  const root = MatrixHash.default().insert(
    utf8ToBytes("hello"),
    utf8ToBytes("world"),
    utf8ToBytes(value),
    utf8ToBytes("lucas"),
  );

  // Witness
  const w = { left, value, right };
  const proof = w.left.insert(utf8ToBytes(w.value)).concat(w.right);
  assertEquals(proof.digest(), root.digest());
});
