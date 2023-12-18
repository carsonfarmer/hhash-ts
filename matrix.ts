import { sha256 } from "npm:@noble/hashes/sha256";

function multiply(
  A: ArrayLike<number>,
  B: ArrayLike<number>,
  n: number = size(A.length, true),
  d = 256,
): ArrayLike<number> {
  const result = new Array(A.length).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i <= j; i++) {
      let sum = 0;
      for (let k = i; k <= j; k++) {
        const ai = (k * (k + 1)) / 2 + i; // Index in column-major order
        const bi = (j * (j + 1)) / 2 + k;
        sum = (sum + A[ai] * B[bi]) % d;
      }
      const z = (j * (j + 1)) / 2 + i;
      result[z] = sum;
    }
  }
  return result;
}

function toUpperTriangular(
  inputArray: ArrayLike<number>,
  singular = true,
): number[] {
  const length = inputArray.length;
  const n = size(length, false);
  const outputArray: number[] = [];
  let inputIndex = 0;

  for (let j = 0; j < n; j++) {
    for (let i = 0; i <= j; i++) {
      if (i === j) {
        // Insert 1 for diagonal elements, insert 0 for ~middle element
        if (singular && i === Math.floor(n / 2)) {
          outputArray.push(0);
        } else {
          outputArray.push(1);
        }
      } else {
        // Insert element from the input array
        if (inputIndex < length) {
          outputArray.push(inputArray[inputIndex]);
          inputIndex++;
        } else {
          // If the input array is exhausted, fill with zeros
          outputArray.push(0);
        }
      }
    }
  }
  return outputArray;
}

function fromUpperTriangular(outputArray: ArrayLike<number>): number[] {
  const n = size(outputArray.length, true); // Assuming size() is a function that computes the size of the matrix
  const inputArray: number[] = [];
  let outputIndex = 0;

  for (let j = 0; j < n; j++) {
    for (let i = 0; i <= j; i++) {
      if (i === j) {
        // Skip diagonal and ~middle element
        outputIndex++;
      } else {
        // Extract elements that were originally in the input array
        inputArray.push(outputArray[outputIndex]);
        outputIndex++;
      }
    }
  }

  return inputArray;
}

function equals(arr1: ArrayLike<number>, arr2: ArrayLike<number>) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function size(u: number, diagonal = true) {
  // n × (n - 1) / 2 ≥ u
  // n^2 − n − 2 × u ≥ 0
  return Math.ceil(((diagonal ? -1 : 1) + Math.sqrt(1 + 8 * u)) / 2);
}

const DEFAULT_SIZE = 32;

export class MatrixHash<Data extends Uint8Array = Uint8Array> {
  constructor(
    public accumulator: ArrayLike<number> = toUpperTriangular(
      new Array(DEFAULT_SIZE).fill(0),
      false,
    ),
  ) {}

  static default<Data extends Uint8Array>() {
    return new MatrixHash<Data>();
  }

  equals(other: MatrixHash<Data>) {
    return equals(this.accumulator, other.accumulator);
  }

  insert(...items: Data[]) {
    for (const item of items) {
      const matrix = toUpperTriangular(sha256(item));
      this.accumulator = multiply(
        this.accumulator,
        matrix,
      );
    }
    return this;
  }

  concat(other: MatrixHash<Data>) {
    this.accumulator = multiply(
      this.accumulator,
      other.accumulator,
    );
    return this;
  }

  digest() {
    return Uint8Array.from(
      fromUpperTriangular(this.accumulator).slice(0, DEFAULT_SIZE),
    );
  }
}
