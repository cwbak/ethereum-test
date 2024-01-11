import inquirer, { Answers } from "inquirer";
import { NormalizeAnswer } from "../common/answers";
import { Common } from "../common/menu";
import { basicTxQuestion } from "../transaction/menu";
import { WalletManager } from "./wallet";

const menuItem = {
    ShowWallet: 'Show wallet',
    Transfer: 'Transfer Ethers',
    ShowWalletWithKeys: 'Show wallet (w/ Keys)',
    CreateWithPK: 'Create wallet (w/ private key)',
    Save: 'Save',
    Back: 'Back'
}

interface WalletAnswer {
    from: string
    to: string
    amount: string
}

export class WalletMenu {
    private readonly wm: WalletManager
    private prevMenu?: () => void
    private _savedAnswer: WalletAnswer

    constructor(wm: WalletManager) {
        this.wm = wm

        this._savedAnswer = {
            from: "0",
            to: "1",
            amount: "0.01"
        }
    }

    private saveAnswers(answers: Answers) {
        this._savedAnswer = {
            from: answers.from,
            to: answers.to,
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

        try {
            switch (answer.command) {
                case menuItem.ShowWallet:
                    await this.wm.print()
                    await this.menu()
                    break
                case menuItem.Transfer:
                    await this.transferMenu()
                    await this.menu()
                    break
                case menuItem.ShowWalletWithKeys:
                    await this.wm.printWithKeys()
                    await this.menu()
                    break
                case menuItem.CreateWithPK:
                    await this.createWithPKMenu()
                    await this.menu()
                    break
                case menuItem.Save:
                    await this.saveMenu()
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
        } catch(err) {
            await Common.checkAndRestart(err, this.menu.bind(this))
        }
    }

    private async transferMenu() {
        const question = basicTxQuestion(this._savedAnswer)
        const answers = NormalizeAnswer(await inquirer.prompt(question))

        await this.wm.transfer(answers.from, answers.to, answers.amount)
        this.saveAnswers(answers)
    }

    private async saveMenu() {
        const answers = await inquirer.prompt([
            {
                name: 'phrase',
                message: 'Password to unlock',
                default: ""
            }
        ])

        await this.wm.save(answers.phrase)
    }

    private async createWithPKMenu() {
        const answers = await inquirer.prompt([
            {
                name: 'pk',
                message: 'PrivateKey',
                default: ""
            }
        ])

        await this.wm.createWithPrivateKey(answers.pk)
    }
}
