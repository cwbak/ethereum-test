import { BigNumber, utils } from "ethers";
import inquirer, { Answers } from "inquirer";
import { NormalizeAnswer } from "../common/answers";
import { Transaction, TransactionParam, TransactionType } from "./transaction";

const menuItem = {
    GetFeeData: 'Show Fee Data',
    CreateRawTxStringLegacy: 'Create Raw Transaction String (signed)',
    CreateRawTxStringType2:  'Create Raw Transaction String EIP-1559 (signed)',
    //SignTx: 'Sign Transaction Data',
    // SignTxType2: 'Sign Transaction Data (1559)',
    // SignTxType2Manual: 'Sign Transaction Data (1559 manual)',
    SendRawTx: 'Send Raw Transaction',
    Back: 'Back'
}

interface TransactionAnswer {
    from: string
    to: string
    amount: string
    nonce?: number
    maxFeePerGas?: number
    maxPriorityFeePerGas?: number
    data?: string
    gasPrice?: number
    gasLimit?: number
}

export class TransactionMenu {
    private readonly _transaction: Transaction
    #prevMenu?: () => void
    private savedAnswer: TransactionAnswer

    constructor(transaction: Transaction) {
        this._transaction = transaction
        this.savedAnswer = {
            from: "0",
            to: "1",
            amount: "0.01"
        }
    }

    private saveAnswers(answers: Answers) {
        this.savedAnswer = {
            from: answers.from,
            to: answers.to,
            amount: answers.amount,
            nonce: answers.nonce,
            data: answers.data,
            maxFeePerGas: answers.maxFeePerGas,
            maxPriorityFeePerGas: answers.maxPriorityFeePerGas,
            gasPrice: answers.gasPrice,
            gasLimit: answers.gasLimit
        }
    }

    async main(prevMenu: () => void) {
        this.#prevMenu = prevMenu
        await this.menu()
    }

    private async menu() {
        const answer = await inquirer
            .prompt([{
                type: 'list',
                name: 'command',
                pageSize: 10,
                message: 'Select Command',
                choices: Object.values(menuItem)
            }])

        switch (answer.command) {
            case menuItem.GetFeeData:
                await this._transaction.printFeeData()
                await this.menu()
                break
            case menuItem.CreateRawTxStringLegacy:
                await this.createRawTxMenu()
                await this.menu()
                break
            case menuItem.CreateRawTxStringType2:
                await this.createRawTxType2Menu()
                await this.menu()
                break
            /*
            case menuItem.SignTx:
                await this.signTxMenu()
                await this.menu()
                break
            case menuItem.SignTxType2:
                await this.signTxType2()
                await this.menu()
                break
            case menuItem.SignTxType2Manual:
                await this.signTxType2Manual()
                await this.menu()
                break
            */
            case menuItem.SendRawTx:
                await this.sendRawTxMenu()
                await this.menu()
                break
            case menuItem.Back:
                this.#prevMenu!()
                break
            default:
                console.log(`NOT IMPLEMENTED: ${answer.command}`)
                await this.menu()
                break
        }
    }

    private async createRawTxMenu() {
        const question = basicTxQuestionEx(this.savedAnswer, {
            name: 'gasPrice',
            message: 'Gas Price (gwei)',
            default: null
        })
        const answers = NormalizeAnswer(await inquirer.prompt(question))
        const value = utils.parseUnits(answers.amount, "ether").toString()
        let gasPrice = answers.gasPrice ? utils.parseUnits(answers.gasPrice, "gwei") : undefined
        const param: TransactionParam = {
            nonce: answers.nonce ? answers.nonce : undefined,
            gasPrice: gasPrice,
            gasLimit: answers.gasLimit ? BigNumber.from(answers.gasLimit) : undefined,
            type: TransactionType.Legacy
        }

        const info = await this._transaction.createRawTxNew(answers.from, answers.to, value, answers.data, param)
        info.print()
        this.saveAnswers(answers)
    }

    private async createRawTxType2Menu() {
        const question = basicTxQuestionEx(this.savedAnswer,
            {
                name: 'maxFeePerGas',
                message: `Max fee (gwei)`,
                default: null,
            },
            {
                name: 'maxPriorityFeePerGas',
                message: `Tip (gwei)`,
                default: null,
            })
        const answers = NormalizeAnswer(await inquirer.prompt(question))
        const value = utils.parseUnits(answers.amount, "ether").toString()
        let maxFeePerGas = answers.gasPrice ? utils.parseUnits(answers.maxFeePerGas, "gwei") : undefined
        let maxPriorityFeePerGas = answers.gasPrice ? utils.parseUnits(answers.gasPrice, "maxPriorityFeePerGas") : undefined
        const param: TransactionParam = {
            nonce: answers.nonce ? answers.nonce : undefined,
            gasLimit: answers.gasLimit ? BigNumber.from(answers.gasLimit) : undefined,
            maxFeePerGas,
            maxPriorityFeePerGas,
            type: TransactionType.Type2
        }

        const info = await this._transaction.createRawTxNew(answers.from, answers.to, value, answers.data, param)
        info.print()
        this.saveAnswers(answers)
    }

    private async sendRawTxMenu() {
        const answers = await inquirer.prompt([
            {
                name: 'rawTx',
                message: 'Raw transaction data to send',
                default: this._transaction.info?.rawTx
            }
        ])
        const receipt = await this._transaction.send(answers.rawTx)
        console.log(receipt)
    }
}

export function basicTxQuestion(answers: any, ...rest: Object[]) {
    return [
        {
            name: 'from',
            message: 'fromIndex',
            default: answers.from
        },
        {
            name: 'to',
            message: 'toIndex or receiver address (w/ 0x prefix)',
            default: answers.to
        },
        {
            name: 'amount',
            message: `Amounts to transfer (UI format)`,
            default: answers.amount
        },
        ...rest
    ]
}


export function basicTxQuestionEx(answers: any, ...rest: Object[]) {
    return basicTxQuestion(answers, ...[
        {
            name: 'data',
            message: `Transaction Data`,
            default: answers.data,
        },
        {
            name: 'nonce',
            message: `Nonce (transaction count)`,
            default: answers.nonce
        },
        ...rest
    ])
}

    // private async signTxMenu() {
    //     const question = this.signTxQuestion(this.savedFrom, this.savedTo, this.savedAmount)
    //     const answers = await inquirer.prompt(question)
    //     const value = utils.parseEther(answers.amount).toString()
    //     const info = await this._transaction.signTx(answers.from, answers.to, value, answers.data, answers.gasLimit)
    //
    //     console.log(info.toString())
    //     this.saveVariables(answers)
    // }

    // private async signTxMenu() {
    //     const question = basicTxQuestionEx(this.savedAnswer,{
    //         name: 'gasPrice',
    //         message: 'Gas Price (gwei)',
    //         default: null
    //     })
    //     const answers = NormalizeAnswer(await inquirer.prompt(question))
    //     const value = utils.parseUnits(answers.amount, "ether").toString()
    //     let gasPrice = answers.gasPrice ? utils.parseUnits(answers.gasPrice, "gwei") : undefined
    //     const param : TransactionParam = {
    //         nonce: answers.nonce ? answers.nonce : undefined,
    //         gasPrice: gasPrice,
    //         gasLimit: answers.gasLimit ? BigNumber.from(answers.gasLimit) : undefined,
    //         type: TransactionType.Legacy
    //     }
    //
    //     const info = await this._transaction.createRawTxNew(answers.from, answers.to, value, answers.data, param)
    //     console.log(info.toString())
    //     this.saveVariables(answers)
    // }
/*
    private signTxQuestion(from: string, to: string, amount: string, ...rest: Object[]) {
        return basicTxQuestion(from, to, amount, 'ETH',
            {
                name: 'data',
                message: 'Transaction Data'
            },
            {
                name: 'gasLimit',
                message: 'Gas limit',
                default: "300000"
            },
            ...rest
        )
    }


    private async signTxType2() {
        const question = this.signTxQuestion(this.savedFrom, this.savedTo, this.savedAmount)
        const answers = await inquirer.prompt(question)
        const value = utils.parseEther(answers.amount).toString()
        const info = await this._transaction.signTxType2(answers.from, answers.to, value, answers.data, answers.gasLimit)

        console.log(info.toString())
        this.saveVariables(answers)
    }

    private async signTxType2Manual() {
        const question = this.signTxQuestion(this.savedFrom, this.savedTo, this.savedAmount,
            {
                name: 'maxFeePerGas',
                message: 'MaxFee per gas',
                default: this.savedMaxFeePerGas
            }, {
                name: 'maxPriorityFeePerGas',
                message: 'MaxPriorityFee per gas',
                default: this.savedMaxPriorityFeePerGas
            })

        const answers = await inquirer.prompt(question)
        const value = utils.parseEther(answers.amount).toString()
        const info = await this._transaction.signTxType2(answers.from, answers.to, value, answers.data, answers.gasLimit, answers.maxFeePerGas, answers.maxPriorityFeePerGas)

        console.log(info.toString())
        this.saveVariables(answers)
    }
*/

