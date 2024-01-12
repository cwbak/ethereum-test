import { Provider } from "@ethersproject/providers";
import { BigNumber, Contract, ethers, Signer } from "ethers";
import { ABI } from "./erc20-abi";

export class ERC20 {
    private signer?: Signer
    private readonly provider: Provider
    private contract: Contract
    private readonly _address: string
    private _decimals?: BigNumber
    private _symbol?: string

    get address(): string {
        return this._address
    }

    constructor(provider: Provider, contractAddress: string) {
        this._address = contractAddress
        this.provider = provider
        this.contract = new ethers.Contract(contractAddress, ABI, this.provider)
    }

    public connect(signer: Signer) {
        this.signer = signer
        this.contract = this.contract.connect(this.signer)
    }

    public async balanceOf(account: string): Promise<BigNumber> {
        return await this.contract.balanceOf(account)
    }

    public async decimals(): Promise<BigNumber> {
        if (this._decimals == null) {
            this._decimals = await this.contract.decimals()
        }
        return this._decimals!
    }

    public async symbol(): Promise<string> {
        if (this._symbol == null) {
            this._symbol = await this.contract.symbol()
        }
        return this._symbol!
    }

    public async allowance(owner: string, spender: string): Promise<BigNumber> {
        return await this.contract.allowance(owner, spender)
    }

    public async totalSupply() : Promise<BigNumber> {
        return await this.contract.totalSupply()
    }

    public async approve(spender: string, amount: string): Promise<boolean> {
        const tx = await this.contract.approve(spender, amount)
        const receipt = await tx.wait()
        return receipt.status == "0x1"
    }

    public async approveTx(spender: string, amount: string): Promise<any> {
        return await this.contract.populateTransaction.approve(spender, amount)
    }

    public async transfer(recipient: string, amount: string) {
        const response = await this.contract.transfer(recipient, amount)
        console.log(`TxHash: ${response!.hash}`)

        const receipt = await response.wait()
        return receipt.status == "0x1"
    }

    public async transferTx(recipient: string, amount: string) : Promise<any> {
        return await this.contract.populateTransaction.transfer(recipient, amount)
    }
}
