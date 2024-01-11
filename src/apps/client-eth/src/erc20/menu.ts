import { Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import inquirer from "inquirer";
import { NormalizeAnswer } from "../common/answers";
import { Token } from "../config/config";
import { WalletManager } from "../wallet/wallet";
import { ERC20 } from "./erc20";

const menuItem = {
    ShowBalances: 'Show ERC20 balances',
    Transfer: 'Transfer',
    TransferTx: 'Create Transfer Transaction (unsigned)',
    Allowance: 'Allowance',
    Approve: 'Approve',
    /*
    CreateApproveTxString: 'Create Approve Transaction String',
    */
    ShowTokens: 'Show Tokens',
    Back: 'Back'
}

interface ERC20Answers {
    symbol?: string
    address?: string
    owner?: string
    recipient?: string
    spender?: string
    amount?: string
}

export class Erc20Menu {
    private readonly _wm: WalletManager
    private readonly _provider: Provider
    private prevMenu?: () => void
    private _tokenMap = new Map<string, string>()
    private _savedContract?: ERC20
    private _savedAnswer: ERC20Answers

    constructor(wm: WalletManager, tokens: Token[]) {
        this._wm = wm
        this._provider = wm.provider
        this._savedAnswer = {
            address: '0',
            owner: '0',
            recipient: '1',
            spender: '1',
            amount: '1',
        }
        for (const token of tokens) {
            this._tokenMap.set(token.symbol, token.address)
        }
        this._savedAnswer.symbol = this._tokenMap.entries().next().value[0]
    }

    private saveAnswers(answers: ERC20Answers) {
        this._savedAnswer = {
            symbol: answers.symbol,
            address: answers.address,
            owner: answers.owner,
            recipient: answers.recipient,
            spender: answers.spender,
            amount: answers.amount,
        }
    }

    async main(prevMenu: () => void) {
        this.prevMenu = prevMenu
        await this.menu()
    }

    private async menu() {
        const answer = await inquirer
            .prompt([{
                type: 'list',
                name: 'command',
                message: 'Select Command',
                choices: Object.values(menuItem)
            }])

        switch (answer.command) {
            case menuItem.ShowBalances:
                await this.showBalancesMenu()
                await this.menu()
                break
            case menuItem.Transfer:
                await this.transferMenu()
                await this.menu()
                break
            case menuItem.TransferTx:
                await this.transferTxMenu()
                await this.menu()
                break
            case menuItem.Allowance:
                await this.allowanceMenu()
                await this.menu()
                break
            case menuItem.Approve:
                await this.approveMenu()
                await this.menu()
                break
/*
            case menuItem.CreateApproveTxString:
                await this.createApproveTxString()
                await this.menu()
                break
  */

            case menuItem.ShowTokens:
                console.table(this._tokenMap.entries())
                await this.menu()
                break
            case menuItem.Back:
                this.prevMenu!()
                break
            default:
                console.log(`NOT IMPLEMENTED: ${answer.command}`)
                await this.menu()
                break
        }
    }

    private async getContract(symbolOrAddress: string): Promise<ERC20> {
        if (!symbolOrAddress.startsWith("0x")) {
            const address = this._tokenMap.get(symbolOrAddress)
            if (address == null) {
                throw new Error("Invalid symbol or index")
            }
            symbolOrAddress = address
        }
        if (this._savedContract == null || this._savedContract.address == symbolOrAddress) {
            this._savedContract = new ERC20(this._provider, symbolOrAddress)
        }
        return this._savedContract
    }

    private async showBalancesMenu() {
        const answers = await inquirer.prompt([
            {
                name: 'symbol',
                message: 'ERC20 symbol or token contract address',
                default: this._savedAnswer?.symbol
            },
            {
                name: 'address',
                message: 'index or address (w/ 0x prefix)',
                default: this._savedAnswer?.address,
            }
        ])

        const erc20 = await this.getContract(answers.symbol)
        const [balance, decimal, symbol] = await Promise.all([
            erc20.balanceOf(this._wm.getAddress(answers.address)),
            erc20.decimals(),
            erc20.symbol(),
        ])
        console.log(ethers.utils.formatUnits(balance, decimal) + " " + symbol)
        this.saveAnswers(answers)
    }

    private async transferMenu() {
        const question = basicErc20TransferQuestion(this._savedAnswer)
        const answers = await inquirer.prompt(question)

        const erc20 = await this.getContract(answers.symbol)
        const decimal = await erc20.decimals()
        const amount = ethers.utils.parseUnits(answers.amount, decimal)
        erc20.connect(this._wm.getSigner(answers.owner))

        const recipient = this._wm.getAddress(answers.recipient)
        await erc20.transfer(recipient, amount.toString())
        this.saveAnswers(answers)
    }

    private async transferTxMenu() {
        const question = basicErc20TransferQuestion(this._savedAnswer)
        const answers = await inquirer.prompt(question)

        const erc20 = await this.getContract(answers.symbol)
        const decimal = await erc20.decimals()
        const amount = ethers.utils.parseUnits(answers.amount, decimal)
        erc20.connect(this._wm.getSigner(answers.owner))

        const recipient = this._wm.getAddress(answers.recipient)
        const tx = await erc20.transferTx(recipient, amount.toString())
        console.log(tx)

        this.saveAnswers(answers)
    }

    private async allowanceMenu() {
        const question = basicErc20Question(this._savedAnswer)
        const answers = NormalizeAnswer(await inquirer.prompt(question))

        const erc20 = await this.getContract(answers.symbol)
        const decimal = await erc20.decimals()
        const result = await erc20.allowance(this._wm.getAddress(answers.owner), this._wm.getAddress(answers.recipient))

        console.log(ethers.utils.formatUnits(result, decimal))
        this.saveAnswers(answers)
    }

    private async approveMenu() {
        const question = basicErc20TransferQuestion(this._savedAnswer)
        const answers = NormalizeAnswer(await inquirer.prompt(question))

        const erc20 = await this.getContract(answers.symbol)
        const decimal = await erc20.decimals()
        const amount = ethers.utils.parseUnits(answers.amount, decimal)
        erc20.connect(this._wm.getSigner(answers.owner))

        const result = await erc20.approve(this._wm.getAddress(answers.recipient), amount.toString())
        console.log(result)
        this.saveAnswers(answers)
    }
}

function basicErc20Question(answers: ERC20Answers, ...rest: Object[]) {
    return [
        {
            name: 'symbol',
            message: 'ERC20 symbol or token contract address',
            default: answers.symbol
        },
        {
            name: 'owner',
            message: 'ownerIndex',
            default: answers.owner
        },
        {
            name: 'recipient',
            message: 'recipientIndex or recipient address (w/ 0x prefix)',
            default: answers.recipient
        },
        ...rest
    ]
}

function basicErc20TransferQuestion(answers: ERC20Answers, ...rest: Object[]) {
    return basicErc20Question(answers, ...[
        {
            name: 'amount',
            message: 'amount (UI format)',
            default: answers.amount
        },
        ...rest
    ])
}


/*


private async createApproveTxString() {
    const question = erc20QuestionWithAmount(this.savedSymbol, this.savedOwner, this.savedSpender, this.savedAmount)
    const answers = await inquirer.prompt(question)

    const signer = await this._wm.getSigner(answers.owner)
    const erc20 = await Erc20Menu.createErc20(signer, answers.symbol)
    const data = await erc20.approveTx(this._wm.getAddress(answers.spender), answers.amount)

    console.log(data)
    this.saveVariables(answers)
}
}
export function erc20QuestionWithAmount(symbol: string, owner: string, spender: string, amount: string) {
return basicErc20Question(symbol, owner, spender, {
    name: 'amount',
    message: 'Amounts',
    default: amount
})
}

*/
