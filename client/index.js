const axios = require('axios');
const prompt = require('prompt-sync')();
const { MerkleTree } = require('cryptography');
const niceList = require('./../utils/niceList.json');

const serverUrl = 'http://localhost:1225';

async function main() {
  let merkleTree = new MerkleTree(niceList);
  const name = prompt('What is your name? (blank for "Axel Wismer") ') || 'Axel Wismer';
  let index = niceList.findIndex(n => n === name);
  let proof = merkleTree.getProof(index);
  const root = merkleTree.getRoot();
  
  if (index === -1) {
    console.log('\nYour name is not on the list!');
    console.log('Attempting to create a fake proof >:) ...\n');
    // Replacing one element of the list with the incorrect name
    index = 0;
    niceList[0] = name;
    merkleTree = new MerkleTree(niceList);
    proof = merkleTree.getProof(index);
    console.log("Since a leaf changed, the root of the tree changed");
    console.log("Original root: ", root);
    console.log("New root:      ", merkleTree.getRoot());
  }
  const { data: gift } = await axios.post(`${serverUrl}/gift`, {
    proof,
    name
  });

  console.log("\nResponse:",gift);
}

main();