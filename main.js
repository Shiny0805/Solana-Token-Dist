const fs = require('fs');
const readline = require('readline');

const { PublicKey } = require('@solana/web3.js')
const {
    Token,
    Percent,
    TokenAmount,
    TOKEN_PROGRAM_ID
} = require('@raydium-io/raydium-sdk')

const { createToken } = require('./src/create_token.js')
const { createMarket } = require('./src/create_market.js')
const { createPool } = require('./src/create_pool.js')
const { execSwap } = require('./src/exec_swap.js')

const {
    connection,
    myKeyPair,
    DEFAULT_TOKEN,
} = require('./config.js')

const {
    getWalletTokenAccount,
    sleepTime
} = require('./src/util.js')

const prompt = require('prompt-sync')({ sigint: true });
const BN = require('bn.js');

require('dotenv').config({ path: `.env.${process.env.NETWORK}` })

// const secretKeyString = fs.readFileSync('./id.json', 'utf8');
// const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
// const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);

console.log("...Token Info Input...")
const amount = Number(prompt('amount(default: 10000): ')) || 10000;
const decimals = Number(prompt('amount(default: 9): ')) || 9;
const symbol = prompt('amount(default: "TMT"): ') || 'TMT';
const tokenName = prompt('amount(default: "Test Mock Token"): ') || 'Test Mock Token';

const tokenInfo = {
    amount,
    decimals,
    metadata: "",
    symbol,
    tokenName
}

console.log("...Market Info Input...")
const lotSize = Number(prompt('Lot Size(default: 0.1): ')) || 0.1;
const tickSize = Number(prompt('Tick Size(default: 0.001): ')) || 0.001;

console.log("...Pool Info Input...")
const addBaseAmountNumber = Number(prompt('token amount for pool(default: 1000): ')) || 1000;
const addQuoteAmountNumber = Number(prompt('SOL amount for pool(default: 1): ')) || 1;
const poolLockTime = Number(prompt('pool available after _hours(default: 0): ')) || 0;

console.log("...Swap Amount Input...")
const swapAmountInSOL = Number(prompt('SOL amount to swap in wallets(default: 0,01): ')) || 0.01;

main()

async function main() {
    console.log("Creating Token...")
    const mintAddress = await createToken(tokenInfo)

    const baseToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(mintAddress), tokenInfo.decimals, tokenInfo.symbol, tokenInfo.tokenName)
    const quoteToken = DEFAULT_TOKEN.WSOL

    console.log("Creating Market...")
    const targetMarketId = await createMarket({
        baseToken,
        quoteToken,
        lotSize,
        tickSize,
        wallet: myKeyPair,
    })

    // create pool
    const addBaseAmount = new BN(addBaseAmountNumber * (10 ** tokenInfo.decimals)) // custom token
    const addQuoteAmount = new BN(addQuoteAmountNumber * (10 ** 9)) // WSOL

    const startTime = Math.floor(Date.now() / 1000) + poolLockTime * 60 * 60
    // const startTime = Math.floor(Date.now() / 1000) // start immediately

    // console.log("wait 10 seconds for changes to apply...")
    // await sleepTime(10000)

    // check if minted token appeared in wallet
    let walletTokenAccounts;
    let found = false;
    while (!found) {
        walletTokenAccounts = await getWalletTokenAccount(connection, myKeyPair.publicKey)
        walletTokenAccounts.forEach((tokenAccount) => {
            if (tokenAccount.accountInfo.mint.toString() == mintAddress) {
                found = true;
                return;
            }
        });

        if (!found) {
            console.log("checking new token in wallet...")
            await sleepTime(1000); // Wait for 1 seconds before retrying
        }
    }

    console.log("Creating Pool...")
    const targetPoolPubkey = await createPool({
        baseToken,
        quoteToken,
        addBaseAmount,
        addQuoteAmount,
        targetMarketId,
        startTime,
        walletTokenAccounts
    })

    // const targetPool = '9cAk6wsiehHoPyEwUJ9Vy8fpb5iHz5uCupgAMRKxVfbN' // replace pool id
    const targetPool = targetPoolPubkey.toString()

    console.log("Executing Swaps...")

    // read wallet private keys from file
    const walletArray = [];
    const readInterface = readline.createInterface({
        input: fs.createReadStream('wallets.txt'), // Specify the path to your file here
        output: process.stdout,
        console: false
    });

    readInterface.on('line', function (line) {
        walletArray.push(line);
    });

    readInterface.on('close', function () {
        // file read finished

        // const baseToken = new Token(TOKEN_PROGRAM_ID, new PublicKey("D8VCsDwkTBMTAcsBLF9UZ8vYD4U7FvcJp1fMi9n9QqhE"), tokenInfo.decimals, tokenInfo.symbol, tokenInfo.tokenName)
        // const quoteToken = DEFAULT_TOKEN.WSOL

        const inputToken = quoteToken // WSOL
        const outputToken = baseToken // custom token
        const inputTokenAmount = new TokenAmount(inputToken, swapAmountInSOL * 10 ** 9)
        const slippage = new Percent(1, 100)

        walletArray.forEach(async wallet => {
            const res = await execSwap({
                targetPool,
                inputTokenAmount,
                outputToken,
                slippage,
                wallet
            })
        });
    });


}


