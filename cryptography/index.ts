import { keccak256 } from "ethereum-cryptography/keccak";
import {
  utf8ToBytes,
  toHex,
  bytesToHex,
  hexToBytes,
} from "ethereum-cryptography/utils";
import { sign, recoverPublicKey } from "ethereum-cryptography/secp256k1";

export function hashMessage(message: string): Uint8Array {
  return keccak256(utf8ToBytes(message));
}

export async function signMessage(
  message: string,
  privateKey: Uint8Array
): Promise<[string, number]> {
  const [signature, recoveryBit] = await sign(
    hashMessage(message),
    privateKey,
    { recovered: true }
  );
  return [toHex(signature), recoveryBit];
}

export function getAddress(publicKey: Uint8Array): string {
  return toHex(keccak256(publicKey.slice(1)).slice(-20));
}

export function recoverKey(
  message: string,
  signature: string,
  recoveryBit: number
): Uint8Array {
  return recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

export function authenticate(
  message: string,
  signature: string,
  recoveryBit: number
): [boolean, string] {
  let address = "";
  let authenticated = true;
  try {
    address = getAddress(recoverKey(message, signature, recoveryBit));
  } catch (error) {
    authenticated = false;
  }
  return [authenticated, address];
}

type Proof = { data: string; left: boolean };
function concat(left: any, right: any): Uint8Array {
  return keccak256(Buffer.concat([left, right]));
}

export class MerkleTree {
  leaves: Uint8Array[];
  constructor(leaves: string[]) {
    this.leaves = leaves.map(Buffer.from).map(keccak256);
  }

  getRoot() {
    return bytesToHex(this._getRoot(this.leaves));
  }

  getProof(index: number, layer = this.leaves, proof: Proof[] = []): Proof[] {
    if (layer.length === 1) {
      return proof;
    }

    const newLayer = [];

    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1];

      if (!right) {
        newLayer.push(left);
      } else {
        newLayer.push(concat(left, right));

        if (i === index || i === index - 1) {
          let isLeft = !(index % 2);
          proof.push({
            data: isLeft ? bytesToHex(right) : bytesToHex(left),
            left: !isLeft,
          });
        }
      }
    }

    return this.getProof(Math.floor(index / 2), newLayer, proof);
  }

  // private function
  _getRoot(leaves = this.leaves): Uint8Array {
    if (leaves.length === 1) {
      return leaves[0];
    }

    const layer = [];

    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = leaves[i + 1];

      if (right) {
        layer.push(concat(left, right));
      } else {
        layer.push(left);
      }
    }

    return this._getRoot(layer);
  }
}

type HexProof = { data: Uint8Array; left: boolean };

export function verifyProof(proof: Proof[], leaf: string, root: string) {
  const hexProof: HexProof[] = proof.map(({ data, left }) => ({
    left,
    data: hexToBytes(data),
  }));
  let data = keccak256(Buffer.from(leaf));

  for (let i = 0; i < hexProof.length; i++) {
    if (hexProof[i].left) {
      data = concat(hexProof[i].data, data);
    } else {
      data = concat(data, hexProof[i].data);
    }
  }

  return bytesToHex(data) === root;
}
