const express = require('express');
const {MerkleTree, verifyProof, authenticate} = require('cryptography');
const niceList = require('./../utils/niceList.json');

const port = 1225;

const app = express();
app.use(express.json());

// paste the hex string in here, without the 0x prefix
const state = { adminAddress: "0d085be9d01dc779321710087d152423bae7dbd5" };
function loadMerkleTree(list) {
  state.merkleTree = new MerkleTree(list);
  state.MERKLE_ROOT = (state.merkleTree.getRoot());
  delete state.merkleTree;
}

loadMerkleTree(niceList);

app.post('/gift', (req, res) => {
  // grab the parameters from the front-end here
  const { proof, name } = req.body;

  const isInTheList = verifyProof(proof, name, state.MERKLE_ROOT) ;
  if(isInTheList) {
    res.send("You got a toy robot!");
  }
  else {
    res.send("You are not on the list :(");
  }
});

app.post('/list', (req, res) => {
  const { list, signature, recoveryBit } = req.body;
  const [authenticated, sender] = authenticate(JSON.stringify(list), signature, recoveryBit);

  if(authenticated && sender === state.adminAddress) {
    loadMerkleTree(list );
    res.send("List updated! New merkle root:" + JSON.stringify(state.MERKLE_ROOT));
  }
  else {
    res.send("Incorrect address!");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
