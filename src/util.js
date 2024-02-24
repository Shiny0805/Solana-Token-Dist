const {
    Liquidity,
    Market,
    MarketV2,
    buildSimpleTransaction,
    findProgramAddress,
    SPL_ACCOUNT_LAYOUT,
    LIQUIDITY_STATE_LAYOUT_V4,
    MARKET_STATE_LAYOUT_V3,
    SPL_MINT_LAYOUT,
    TOKEN_PROGRAM_ID,
} = require('@raydium-io/raydium-sdk')
const {
    PublicKey,
    VersionedTransaction,
} = require('@solana/web3.js')

const {
    myKeyPair,
    connection,
    makeTxVersion,
    addLookupTableInfo
} = require('../config')

async function sendTx(
    connection,
    payer,
    txs,
    options
) {
    const txids = [];
    for (const iTx of txs) {
        if (iTx instanceof VersionedTransaction) {
            iTx.sign([payer]);
            txids.push(await connection.sendTransaction(iTx, options));
        } else {
            txids.push(await connection.sendTransaction(iTx, [payer], options));
        }
    }
    return txids;
}

async function getWalletTokenAccount(connection, myKeyPair) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(myKeyPair, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}

async function buildAndSendTx(innerSimpleV0Transaction, options) {
    const willSendTx = await buildSimpleTransaction({
        connection,
        makeTxVersion,
        payer: myKeyPair.publicKey,
        innerTransactions: innerSimpleV0Transaction,
        addLookupTableInfo: addLookupTableInfo,
    })

    return await sendTx(connection, myKeyPair, willSendTx, options)
}

function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );
    return { publicKey, nonce };
}

async function sleepTime(ms) {
    // console.log((new Date()).toLocaleString(), 'sleepTime', ms)
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function formatAmmKeysById(id) {
    const account = await connection.getAccountInfo(new PublicKey(id))

    if (account === null) throw Error(' get id info error ')
    const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data)

    const marketId = info.marketId
    const marketAccount = await connection.getAccountInfo(marketId)
    if (marketAccount === null) throw Error(' get market info error')
    const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data)

    const lpMint = info.lpMint
    const lpMintAccount = await connection.getAccountInfo(lpMint)
    if (lpMintAccount === null) throw Error(' get lp mint info error')
    const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data)

    return {
        id,
        baseMint: info.baseMint.toString(),
        quoteMint: info.quoteMint.toString(),
        lpMint: info.lpMint.toString(),
        baseDecimals: info.baseDecimal.toNumber(),
        quoteDecimals: info.quoteDecimal.toNumber(),
        lpDecimals: lpMintInfo.decimals,
        version: 4,
        programId: account.owner.toString(),
        authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
        openOrders: info.openOrders.toString(),
        targetOrders: info.targetOrders.toString(),
        baseVault: info.baseVault.toString(),
        quoteVault: info.quoteVault.toString(),
        withdrawQueue: info.withdrawQueue.toString(),
        lpVault: info.lpVault.toString(),
        marketVersion: 3,
        marketProgramId: info.marketProgramId.toString(),
        marketId: info.marketId.toString(),
        marketAuthority: Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
        marketBaseVault: marketInfo.baseVault.toString(),
        marketQuoteVault: marketInfo.quoteVault.toString(),
        marketBids: marketInfo.bids.toString(),
        marketAsks: marketInfo.asks.toString(),
        marketEventQueue: marketInfo.eventQueue.toString(),
        lookupTableAccount: PublicKey.default.toString()
    }
}

module.exports = {
    sendTx,
    getWalletTokenAccount,
    buildAndSendTx,
    getATAAddress,
    sleepTime,
    formatAmmKeysById
};