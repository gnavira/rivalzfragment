const { ethers } = require('ethers');
const chains = require('./chains');
const provider = chains.testnet.rivalzTestnet.provider();
const explorer = chains.testnet.rivalzTestnet.explorer;
const fs = require('fs');
const moment = require('moment-timezone');
const { displayHeader, delay } = require('./chains/utils/utils');
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
const { RIVALZ_ABI } = require('./abi/abi');
const CLAIM_CA = '0xF0a66d18b46D4D5dd9947914ab3B2DDbdC19C2C0';

function appendLog(message) {
  fs.appendFileSync('log.txt', message + '\n');
}

async function doClaim(privateKey) {
  const wallet = new ethers.Wallet(privateKey, provider);
  try {
    const gasLimit = 300000;
    const claimContract = new ethers.Contract(
      CLAIM_CA,
      RIVALZ_ABI,
      wallet
    );
    const txClaim = await claimContract.claim({
      gasLimit: gasLimit
    });
    const receipt = await txClaim.wait(10);
    const successMessage = `Transaction Confirmed in block ${receipt.blockNumber}`;
    console.log(successMessage.blue);
    appendLog(successMessage);
    return txClaim.hash;

  } catch (error) {
    const errorMessage = `[$timezone] Error executing transaction: ${error.message}`;
    console.log(errorMessage.red);
    appendLog(errorMessage);
  }
}

async function runClaim() {
  displayHeader();
  const timezone = moment().tz('Asia/Jakarta').format('HH:mm:ss [WIB] DD-MM-YYYY');
  for (const PRIVATE_KEY of PRIVATE_KEYS) {
    try {
	 for (let i = 0; i < 20; i++) {
      await delay(5000);
      const receiptTx = await doClaim(PRIVATE_KEY);
      if (receiptTx) {
        const successMessage = `[${timezone}] Transaction Hash: ${explorer.tx(receiptTx)}`;
        console.log(successMessage.cyan);
        appendLog(successMessage);
      }
      console.log('');
	}
    } catch (error) {
      const errorMessage = `[${timezone}] Error processing transaction. Please try again later.`;
      console.log(errorMessage.red);
      appendLog(errorMessage);
      console.log('');
	}
  }
 appendLog('');
}
runClaim();
