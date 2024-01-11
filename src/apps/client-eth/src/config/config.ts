export interface WalletConfig {
    "walletPhrase": string
}

export interface Token {
    "symbol": string,
    "address": string,
}

export interface Config {
    "providerUrl": string
    "wallet": WalletConfig,
    "tokens": Token[],
}
