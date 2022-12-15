# Gift List
This exercise demonstrates how you can use the Merkle tree to check if a data item is in a set without having to store the set.

In order to do this, the root of the Merkle tree is calculated and stored on the server. The client generates a proof that an element is in the set and sends it along with the element to be verified. The server calculates the root using the given proof and checks if it's equal to the stored root.

## Results
For this project, a typescript cryptography module was created with the following functions:
```typescript
function hashMessage(message: string) : Uint8Array

async function signMessage(message: string, privateKey: Uint8Array) : Promise<[string, number]>

function getAddress(publicKey: Uint8Array): string

function recoverKey(message: string, signature: string, recoveryBit: number): Uint8Array

function authenticate(message: string, signature: string, recoveryBit: number): [boolean, string]

// Added
type Proof = { data: string; left: boolean };

type HexProof = { data: Uint8Array; left: boolean };

class MerkleTree {
  leaves: Uint8Array[];
  
  getRoot() : string

  getProof(index: number, layer : Uint8Array[] = this.leaves, proof: Proof[] = []): Proof[]
}

function verifyProof(proof: Proof[], leaf: string, root: string) : boolean
```

The objective of the module is to provide the UI and the server with the same cryptographic functions so that they can communicate securely.
## Get Started
To get started with the repository, clone it and then run `npm install` in the top-level directory to install the depedencies.

There are three folders in this repository:

### Client

You can run the client from the top-level directory with `node client/index`. This file is a script which will send an HTTP request to the server.

Think of the client as the _prover_ here. It needs to prove to the server that some `name` is in the `MERKLE_ROOT` on the server. 

### Server

You can run the server from the top-level directory with `node server/index`. This file is an express server which will be hosted on port 1225 and respond to the client's request.

Think of the server as the _verifier_ here. It needs to verify that the `name` passed by the client is in the `MERKLE_ROOT`. If it is, then we can send the gift! 

### Utils

There are a few files in utils:

- The `niceList.json` which contains all the names of the people who deserve a gift this year (this is randomly generated, feel free to add yourself and others to this list!)
- The `example.js` script shows how we can generate a root, generate a proof and verify that some value is in the root using the proof. Try it out from the top-level folder with `node/example.js`
- The `MerkleTree.js` should look familiar from the Merkle Tree module! This one has been modified so you should not have to deal with any crypto type conversion. You can import this in your client/server
- The `verifyProof.js` should also look familiar. This was the last stage in the module. You can use this function to prove a name is in the merkle root, as show in the example.
