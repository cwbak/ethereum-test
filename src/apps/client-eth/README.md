# ETHEREUM TEST CLIENT
## CONFIG
```
{
    "providerUrl": "http://127.0.0.1:8545",
    "wallet": {
        "walletPhrase": "rotonda"
    },
    "platform": {
        "hostUrl": "http://127.0.0.1:6699",
        "userEmail": "promer111@gmail.com",
        "userPassword": "1111"
    }
}
```
- providerUrl: Ethereum JSON RPC URL
- wallet.walletPhrase: keystore.json 의 암호
- platform (optional : 현재 login 에서만 사용)
- platform.hostUrl: API server url

## RUN
```
$ yarn start
```
