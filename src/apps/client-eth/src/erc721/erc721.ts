import { Provider } from "@ethersproject/providers";
import { BigNumber, Contract, ethers, Signer } from "ethers";
import { ABI } from "./erc721-abi";

export class ERC721 {
    private readonly signer: Signer
    private readonly provider: Provider
    private contract: Contract

    constructor(contractAddress: string, signer: Signer) {
        this.signer = signer
        this.provider = signer.provider!
        if (this.provider == null) {
            throw new Error("Provider is required")
        }
        this.contract = new ethers.Contract(contractAddress, ABI, this.provider)
        this.contract = this.contract.connect(this.signer)
    }

    public async ownerOf(tokenId: string): Promise<string> {
        const owner = await this.contract.callStatic.ownerOf(tokenId)
        return owner
    }

    public async approve(to: string, tokenId: string): Promise<boolean> {
        const tx = await this.contract.approve(to, tokenId)
        const receipt = await tx.wait()
        {
            const addr = await this.contract.getApproved(tokenId)
            console.log("---------------")
            console.log(addr)
            console.log("---------------")
        }

        return receipt.status == "0x1"
    }

    public async approveTx(to: string, tokenId: string): Promise<any> {
        return await this.contract.populateTransaction.approve(to, tokenId)
    }

    public async transfer(from: string, to: string, tokenId: string) {
        console.log("--------------")
        console.log(from, to, tokenId)
        console.log("--------------")
        const tx = await this.contract.transferFrom(from, to, tokenId)
        const receipt = await tx.wait()
        return receipt.status == "0x1"
    }

    public async transferTx(from: string, to: string, tokenId: string) {
        return await this.contract.populateTransaction.transferFrom(from, to, tokenId)
    }
}