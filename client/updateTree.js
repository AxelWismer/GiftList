const axios = require('axios');
const niceList = require('./../utils/niceList.json');
const { signMessage } = require('cryptography');

const serverUrl = 'http://localhost:1225';
const PRIVATE_KEY = "696357864c1561c89cbad78b9ebecd04087fe1d3665b7fbf59f1c69961f24baf";

async function main() {
  console.log("As an administrator I update the list to include only the first names")
  let list = niceList.map(e => e.split(' ')[0])

  let [signature, recoveryBit] = await signMessage(JSON.stringify(list), PRIVATE_KEY);
  let { data } = await axios.post(`${serverUrl}/list`, { signature, recoveryBit, list});

  console.log("Response:", data);
  
  // Acting as another actor
  console.log("\nAnother actor trying to change the data with another private key");

  list = ['Me'];
  [signature, recoveryBit] = await signMessage(JSON.stringify(list), "a341b79ad095722cd354f1334701b126a0581308e15ac03da4b2b437bb22605f");
  data = (await axios.post(`${serverUrl}/list`, { signature, recoveryBit, list})).data;
  
  console.log("Response:", data);

}

main();