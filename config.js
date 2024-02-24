const {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl
} = require('@solana/web3.js')
const bs58 = require('bs58')
const {
    Currency,
    Token,
    TxVersion,
    TOKEN_PROGRAM_ID,
    LOOKUP_TABLE_CACHE,
} = require('@raydium-io/raydium-sdk')

require('dotenv').config({ path: `.env.${process.env.NETWORK}` })

const connection = new Connection(process.env.RPC_URL); // helius

const myKeyPair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.PRIVATE_KEY)));

const makeTxVersion = TxVersion.V0;

const addLookupTableInfo = process.env.NETWORK == 'mainnet' ? LOOKUP_TABLE_CACHE : undefined;

const CONFIG_MAINNET_PROGRAM_ID = {
    AMM_OWNER: new PublicKey('GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ'),
    CREATE_POOL_FEE_ADDRESS: new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'),
}

const CONFIG_DEVNET_PROGRAM_ID = {
    AMM_OWNER: new PublicKey('Adm29NctkKwJGaaiU8CXqdV6WDTwR81JbxV8zoxn745Y'),
    CREATE_POOL_FEE_ADDRESS: new PublicKey('3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR'),
}

const CONFIG_PROGRAM_ID = process.env.NETWORK == 'mainent' ? CONFIG_MAINNET_PROGRAM_ID : CONFIG_DEVNET_PROGRAM_ID;

const DEFAULT_TOKEN = {
    'SOL': new Currency(9, 'USDC', 'USDC'),
    'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
    'KSPR': new Token(TOKEN_PROGRAM_ID, new PublicKey('4KQ2vqoAMwvo9qDtpxLdcURBuDkW1DVxcHgoxpEJNGDV'), 6, 'KSPR', 'KSPR'),
    'PLLE': new Token(TOKEN_PROGRAM_ID, new PublicKey('BHEJ7icZwFFDkDssoeULp288DNHkPAJwf4PZCMmRMkRk'), 6, 'PLLE', 'PLLE')
}

module.exports = {
    connection,
    myKeyPair,
    makeTxVersion,
    addLookupTableInfo,
    CONFIG_PROGRAM_ID,
    DEFAULT_TOKEN
};