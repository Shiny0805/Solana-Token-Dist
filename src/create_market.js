const {
    MarketV2,
    MAINNET_PROGRAM_ID,
    DEVNET_PROGRAM_ID
} = require('@raydium-io/raydium-sdk')

const {
    connection,
    makeTxVersion,
} = require('../config.js')
const { buildAndSendTx } = require('./util')

async function createMarket(input) {
    const RAYDIUM_PROGRAM_ID = process.env.NETWORK == 'mainnet' ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID

    // -------- step 1: make instructions --------
    const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
        connection,
        wallet: input.wallet.publicKey,
        baseInfo: input.baseToken,
        quoteInfo: input.quoteToken,
        lotSize: input.lotSize, // default 1
        tickSize: input.tickSize, // default 0.01
        dexProgramId: RAYDIUM_PROGRAM_ID.OPENBOOK_MARKET,
        makeTxVersion,
    })

    marketId = createMarketInstruments.address.marketId

    txids = await buildAndSendTx(createMarketInstruments.innerTransactions, { skipPreflight: true })
    console.log('Market Created')
    console.log('Create Market Transactions :', txids)
    console.log('Market Address :', marketId)

    return marketId
}

async function howToUse() {
    // const baseToken = DEFAULT_TOKEN.LITS // RAY
    // const quoteToken = DEFAULT_TOKEN.WSOL // USDC

    // createMarket({
    //     baseToken,
    //     quoteToken,
    //     wallet: wallet,
    // }).then(({ txids }) => {
    //     /** continue with txids */
    //     console.log('txids', txids)
    // })
}

module.exports = {
    createMarket
};