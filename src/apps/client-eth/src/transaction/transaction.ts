import {
    Provider,
    TransactionReceipt,
    TransactionRequest,
} from "@ethersproject/providers";
import { BigNumber, ethers, } from "ethers";
import { WalletManager } from "../wallet/wallet";
import { TransactionInfo } from "./transaction-info";

export enum TransactionType {
    Legacy = 0,
    Type2 = 2
}

export interface TransactionParam {
    nonce?: number
    gasLimit?: BigNumber
    gasPrice?: BigNumber
    maxFeePerGas?: BigNumber
    maxPriorityFeePerGas?: BigNumber
    type: TransactionType
}

export class Transaction {
    private readonly _provider: Provider
    private readonly _wm: WalletManager
    private _info?: TransactionInfo

    get info() { return this._info }

    constructor(wm: WalletManager) {
        this._wm = wm
        this._provider = wm.provider
    }

    async printFeeData() {
        const feeData = await this._provider.getFeeData()

        console.table({
            gasPrice: ethers.utils.formatUnits(feeData.gasPrice ?? 0, "gwei") + " gwei",
            maxFeePerGas: ethers.utils.formatUnits(feeData.maxFeePerGas ?? 0, "gwei") + " gwei",
            maxPriorityFeePerGas: ethers.utils.formatUnits(feeData.maxPriorityFeePerGas ?? 0, "gwei") + " gwei"
        })
    }

    async createRawTxNew(from: string, to: string, value: string, data = "0x", param?: TransactionParam): Promise<TransactionInfo> {
        let nonce: number
        const signer = this._wm.getSigner(from)
        const network = await this._provider.getNetwork()

        if (param?.nonce == null) {
            nonce = await this._provider.getTransactionCount(await signer.getAddress())
        } else {
            nonce = BigNumber.from(param.nonce).toNumber()
        }

        const request: TransactionRequest = {
            from: this._wm.getAddress(from),
            to: this._wm.getAddress(to),
            value: BigNumber.from(value),
            data: data,
            chainId: network.chainId,
            nonce,
        }

        let gasLimit: BigNumber
        if (param?.gasLimit == null) {
            if (data == null || data == "" || data == "0x") {
                gasLimit = BigNumber.from(21000)
            }
            gasLimit = await this._provider.estimateGas(request)
        } else {
            gasLimit = param.gasLimit
        }
        request.gasLimit = gasLimit

        const feeData = await this._provider.getFeeData()
        const type = param?.type ?? TransactionType.Legacy

        switch (type) {
            case TransactionType.Legacy:
                request.gasPrice = param?.gasPrice ?? feeData.gasPrice!
                break

            case TransactionType.Type2:
                request.maxPriorityFeePerGas = param?.maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas!
                request.maxFeePerGas = param?.maxFeePerGas ?? feeData.maxFeePerGas!
                request.type = 2
                break
            default:
                throw new Error("Invalid transaction type")
        }

        const rawTx= await signer.signTransaction(request)
        this._info = new TransactionInfo(request, rawTx)
        return this._info
    }

    async send(rawTx: string): Promise<TransactionReceipt> {
        const response = await this._provider.sendTransaction(rawTx)
        if (response == null) {
            throw new Error("Failed to send rawTransaction")
        }
        console.log(`TxHash: ${response!.hash}`)

        return await response!.wait()
    }



/*
    async createRawTx(from: string, to: string, value: string, _nonce: string, gasLimit: string = "0x21000", type: TransactionType = TransactionType.Legacy, gasPriceMultiplier = 1): Promise<TransactionInfo> {
        let nonce: number
        const signer = this._wm.getSigner(from)
        const network = await this._provider.getNetwork()
        if (_nonce == "-1") {
            nonce = await this._provider.getTransactionCount(await signer.getAddress())
        } else {
            nonce = BigNumber.from(_nonce).toNumber()
        }

        const feeData = await this._provider.getFeeData()
        const request: TransactionRequest = {
            to: this._wm.getAddress(to),
            value: BigNumber.from(value),
            nonce,
            gasLimit
        }

        switch (type) {
            case TransactionType.Legacy:
                request.gasPrice = feeData.gasPrice!.mul(gasPriceMultiplier)
                break
            case TransactionType.Type2:
                request.chainId = network.chainId
                request.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!
                request.maxFeePerGas = feeData.maxFeePerGas!
                request.type = 2
                break
            default:
                throw new Error("Invalid transaction type")
        }

        const rawTx= await signer.signTransaction(request)
        this._info = new TransactionInfo(request, rawTx)
        return this._info
    }

    async createRawTxType2(from: string, to: string, value: string, nonce: string, gasLimit: string = "0x21000") {
        return this.createRawTx(from, to, value, nonce, gasLimit, TransactionType.Type2)
    }

    async signTxType2(from: string, to: string, value: string, txData: string, gasLimit: string = "0x21000", maxFeePerGas?: number, maxPriorityFeePerGas?: number): Promise<TransactionInfo> {
        const signer = this._wm.getSigner(from)
        const network = await this._provider.getNetwork()
        const nonce = await this._provider.getTransactionCount(await signer.getAddress())
        const feeData = await this._provider.getFeeData()

        const request: TransactionRequest = {
            to: this._wm.getAddress(to),
            value: BigNumber.from(value),
            nonce,
            gasLimit: BigNumber.from(gasLimit),
            data: txData,
            chainId: network.chainId,
            maxFeePerGas: maxFeePerGas ?? feeData.maxFeePerGas!,
            maxPriorityFeePerGas: maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas!,
            type: 2
        }

        const rawTx= await signer.signTransaction(request)
        this._info = new TransactionInfo(request, rawTx)
        return this._info
    }
 */
}
