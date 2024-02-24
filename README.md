# Instructions

1: Install node modules by running 'yarn' on termial.
node version : 18.19.0

2: Place wallet private key to be used for deployment inside .env.devnet, .env.mainnet files.
note: The private keys should be from Solana, not EVM

3: Put private keys(Solana) inside 'wallets.txt' file for buying purposes.
The file content should resemble the following format.

2mjopv3aetJWammAfRHLQ5tdeWd1EzsVDo4bkMA6DNmruMdgePppDK9UHKbDGc39dYjVCBAzuWRCT9RWHoKZSdcL
4TCkd2SLdDVyKtU5MdXdiU7y6dR3WiyfxitVibQ5mgZL4Wdnw5c3d84axZpZescw8jNsTn8ckqCMneFFLff93mfz
bQ5mgZL4Wdnw5c3h84axZpZescw8jNsTn8ckqCMneFFLffd3mfz4TCkd2SLdDVyKtU5MdXdiU7y6dR3WiyfxitVi
...
Ensure to top up each wallet with some SOL balance.
devnet faucet link: https://faucet.solana.com/

4: Inside package.json, defined two scripts for deploying on devent and mainnet.
    "deploy-dev": "NETWORK=devnet node main.js",
    "deploy-main": "NETWORK=mainnet node main.js",

Run 'npm run deploy-dev' or 'yarn deploy-dev' on terminal to deploy on devnet.

5: Input required information for deployment.
Simly press Enter to proceed with default values.
