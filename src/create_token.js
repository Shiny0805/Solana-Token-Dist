const {
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction
} = require('@solana/web3.js')
const {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    getMinimumBalanceForRentExemptMint,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
} = require('@solana/spl-token')
const { createCreateMetadataAccountV3Instruction, PROGRAM_ID } = require('@metaplex-foundation/mpl-token-metadata')

const {
    connection,
    myKeyPair
} = require('../config.js')

async function createToken(tokenInfo) {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();
    const myPublicKey = myKeyPair.publicKey;

    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, myPublicKey);
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
            metadata: PublicKey.findProgramAddressSync(
                [
                    Buffer.from("metadata"),
                    PROGRAM_ID.toBuffer(),
                    mintKeypair.publicKey.toBuffer(),
                ],
                PROGRAM_ID,
            )[0],
            mint: mintKeypair.publicKey,
            mintAuthority: myPublicKey,
            payer: myPublicKey,
            updateAuthority: myPublicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: tokenInfo.tokenName,
                    symbol: tokenInfo.symbol,
                    uri: tokenInfo.metadata,
                    creators: null,
                    sellerFeeBasisPoints: 0,
                    uses: null,
                    collection: null,
                },
                isMutable: true,
                collectionDetails: null,
            },
        },
    );

    const createNewTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: myPublicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports: lamports,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            tokenInfo.decimals,
            myPublicKey,
            myPublicKey,
            TOKEN_PROGRAM_ID),
        createAssociatedTokenAccountInstruction(
            myPublicKey,
            tokenATA,
            myPublicKey,
            mintKeypair.publicKey,
        ),
        createMintToInstruction(
            mintKeypair.publicKey,
            tokenATA,
            myPublicKey,
            tokenInfo.amount * Math.pow(10, tokenInfo.decimals),
        ),
        createMetadataInstruction
    );
    createNewTokenTransaction.feePayer = myKeyPair.publicKey

    let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    console.log("blockhash", blockhash)
    createNewTokenTransaction.recentBlockhash = blockhash;

    const signature = await sendAndConfirmTransaction(connection, createNewTokenTransaction, [myKeyPair, mintKeypair]);

    // console.log('Token mint transaction sent. Signature:', signature);
    console.log('Token Created : ', tokenInfo);
    console.log('Token Mint Address :', mintKeypair.publicKey);

    return mintKeypair.publicKey
}

module.exports = {
    createToken
}