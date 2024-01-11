import { TransactionRequest } from "@ethersproject/providers";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { TransactionType } from "./transaction";

export class TransactionInfo {
    readonly type: TransactionType
    readonly nonce: BigNumberish
    readonly gasLimit: BigNumberish
    readonly rawTx: string

    readonly chainId: number
    readonly gasPrice?: BigNumberish
    readonly maxFeePerGas?: BigNumberish
    readonly maxPriorityFeePerGas?: BigNumberish

    constructor(req: TransactionRequest, rawTx: string) {
        this.nonce = req.nonce!
        this.gasLimit = req.gasLimit!
        this.rawTx = rawTx

        switch (req.type) {
            case undefined:
            case 0:
                this.type = TransactionType.Legacy
                this.chainId = req.chainId!
                this.gasPrice = req.gasPrice
                break
            case 2:
                this.type = TransactionType.Type2
                this.chainId = req.chainId!
                this.maxFeePerGas = req.maxFeePerGas
                this.maxPriorityFeePerGas = req.maxPriorityFeePerGas
                break
            default:
                throw new Error(`Unexpected transaction type ${req.type}`)
        }
    }

    print() {
        interface txoutput {
            chainId: number
            nonce: string
            gasLimit: string
            gasPrice?: string
            maxFeePerGas?: string
            maxPriorityFeePerGas?: string
            feeUI?: string
        }
        const output: txoutput = {
            chainId: this.chainId,
            nonce: this.nonce.toString(),
            gasLimit: this.gasLimit.toString(),
        }

        let fee: BigNumber
        switch (this.type) {
            case TransactionType.Legacy:
                const gasPrice = ethers.utils.formatUnits(this.gasPrice!, "gwei")
                output.gasPrice = `${gasPrice} gwei`

                fee = BigNumber.from(this.gasPrice).mul(BigNumber.from(this.gasLimit))
                break

            case TransactionType.Type2:
                const maxFeePerGas = ethers.utils.formatUnits(this.maxFeePerGas!, "gwei")
                const maxPriorityFeePerGas = ethers.utils.formatUnits(this.maxPriorityFeePerGas!, "gwei")
                output.maxFeePerGas = `${maxFeePerGas} gwei`
                output.maxPriorityFeePerGas = `${maxPriorityFeePerGas} gwei`

                fee = BigNumber.from(this.maxFeePerGas).mul(BigNumber.from(this.gasLimit))
                break
            default:
                throw new Error(`Invalid type ${this.type}`)
        }
        output.feeUI = `${ethers.utils.formatEther(fee)} ETH (${fee.toString()} WEI)`

        console.table(output)
        console.log(`RawTX: ${this.rawTx}`)
    }
}
