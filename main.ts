import { sha512 } from "npm:@noble/hashes/sha512";
import { sha256 } from "npm:@noble/hashes/sha256";
import { RistrettoPoint } from "npm:@noble/curves/ed25519";

// Needed due to how the RistrettoPoint type is exported
export type RistrettoPoint = InstanceType<typeof RistrettoPoint>;

export class RistrettoMultisetHash<Data extends Uint8Array> {
  constructor(public accumulator: RistrettoPoint = RistrettoPoint.ZERO) {}

  static default<Data extends Uint8Array>() {
    return new RistrettoMultisetHash<Data>();
  }

  equals(other: RistrettoMultisetHash<Data>) {
    return this.accumulator.equals(other.accumulator);
  }

  insert(...items: Data[]) {
    for (const item of items) {
      const point = RistrettoPoint.hashToCurve(sha512(item));
      this.accumulator = this.accumulator.add(point);
    }
    return this;
  }

  remove(...items: Data[]) {
    for (const item of items) {
      const point = RistrettoPoint.hashToCurve(sha512(item));
      this.accumulator = this.accumulator.subtract(point);
    }
    return this;
  }

  union(other: RistrettoMultisetHash<Data>) {
    this.accumulator = this.accumulator.add(other.accumulator);
    return this;
  }

  difference(other: RistrettoMultisetHash<Data>) {
    this.accumulator = this.accumulator.subtract(other.accumulator);
    return this;
  }

  digest() {
    const bytes = this.accumulator.toRawBytes();
    return sha256(bytes);
  }
}
