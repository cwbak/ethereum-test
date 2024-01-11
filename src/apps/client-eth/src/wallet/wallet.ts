import { BaseProvider } from "@ethersproject/providers"
import { ethers, Signer, utils, Wallet } from "ethers";
import { readFileSync, writeFileSync } from "fs";

const WalletFilePathname = './keystore.json'

export class WalletManager {
    private readonly _wallets = new Map<string, Wallet>()
    private readonly _provider: BaseProvider

    constructor(phrase: string, provider: string) {
        this._provider = new ethers.providers.JsonRpcProvider(provider)
        this.load(phrase)
    }

    get provider() { return this._provider }

    createRandom() {
        const w = ethers.Wallet.createRandom()
        this._wallets.set(w.address, w)
    }

    createWithPrivateKey(key: string) {
        const w = new ethers.Wallet(key)
        this._wallets.set(w.address, w)

        console.log(this._wallets)
    }

    get(index: number): Wallet {
        if (index > this._wallets.size) {
            throw new Error("Invalid index number")
        }
        return Array.from(this._wallets.values())[index]
    }

    getAddress(indexOrAddress: string): string {
        return indexOrAddress.startsWith("0x") ? indexOrAddress : this.get(Number(indexOrAddress)).address
    }

    getSigner(index: string): Signer {
        const wallet = this.get(Number(index)).connect(this._provider)
        return wallet.connect(this._provider)
    }

    async getBalance(index: number, format = true): Promise<string> {
        const wallet = this.get(index)
        const address = await wallet.getAddress()
        const balance = await this._provider.getBalance(address)
        return format ? utils.formatEther(balance) : balance.toString()
    }

    async getBalanceOfAddress(address: string, format = true): Promise<string> {
        const balance = await this._provider.getBalance(address)
        return format ? utils.formatEther(balance) : balance.toString()
    }

    async transfer(from: string, to: string, formattedAmount: string) {
        const signer = this.getSigner(from)
        const receiver = this.getAddress(to)

        const tx = {
            to: receiver,
            value: ethers.utils.parseEther(formattedAmount)
        }
        const result = await signer.sendTransaction(tx)
        const receipt = await result.wait()
        console.log(receipt)
    }

    load(phrase: string) {
        const encrypted = readFileSync(WalletFilePathname)
        const list = JSON.parse(encrypted.toString())
        for (const e of list) {
            const s = JSON.stringify(e)
            const w = ethers.Wallet.fromEncryptedJsonSync(s, phrase)
            this._wallets.set(w.address, w)
        }
    }

    async save(phrase: string) {
        let encrypted: any[] = []
        const promises = Array.from(this._wallets.values()).map(w => w.encrypt(phrase, {
            scrypt: {
                N: (1 << 1)
            }
        }))
        const result = await Promise.all(promises)
        result.forEach(elem => {
            encrypted.push(JSON.parse(elem))
        })

        const json = JSON.stringify(encrypted)
        writeFileSync(WalletFilePathname, json)
    }

    async print() {
        class w {
            constructor(
                public address: string,
                public balance: string) {
            }
        }

        let list = [];
        const wallets = Array.from(this._wallets.values())
        for (const wallet of wallets) {
            const balance = await this.getBalanceOfAddress(wallet.address)
            const elem = new w(wallet.address, balance)
            list.push(elem)
        }

        console.table(list)
    }

    async printWithKeys() {
        class w {
            constructor(
                public address: string,
                public privateKey: string,
                public publicKey: string,
                public balance: string) {
            }
        }

        let list = [];
        const wallets = Array.from(this._wallets.values())
        for (const wallet of wallets) {
            const balance = await this.getBalanceOfAddress(wallet.address)
            const elem = new w(wallet.address, wallet.privateKey, wallet.publicKey, balance)
            list.push(elem)
        }

        console.table(list)
    }
}
