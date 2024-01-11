import inquirer from 'inquirer';
import { Common } from "../common/menu";
import { Config } from "../config/config";
import { Erc20Menu } from "../erc20/menu";
import { Erc721Menu } from "../erc721/menu";
import { TransactionMenu } from "../transaction/menu";
import { Transaction } from "../transaction/transaction";
import { WalletMenu } from "../wallet/menu";
import { WalletManager } from "../wallet/wallet";

const menuItem = {
    Transaction: 'Transaction',
    ERC20: 'ERC20',
    ERC721: 'ERC721',
    Wallet: 'Wallet',
    Exit: 'Exit'
}

export class Cli {
    private readonly _wallet: WalletMenu
    private readonly _transaction: TransactionMenu
    private readonly _erc20: Erc20Menu
    private readonly _erc721: Erc721Menu

    constructor(cfg: Config) {
        const wm = new WalletManager(cfg.wallet.walletPhrase, cfg.providerUrl)
        const transaction = new Transaction(wm)

        this._wallet = new WalletMenu(wm)
        this._transaction = new TransactionMenu(transaction)
        this._erc20 = new Erc20Menu(wm, cfg.tokens)
        this._erc721 = new Erc721Menu(wm)
    }

    async mainMenu() {
        const answer = await inquirer
            .prompt([{
                type: 'list',
                name: 'command',
                message: 'Select Command',
                choices: Object.values(menuItem)
            }])

        try {
            switch (answer.command) {
                case menuItem.Transaction:
                    await this._transaction.main(this.mainMenu.bind(this))
                    break
                case menuItem.ERC20:
                    await this._erc20.main(this.mainMenu.bind(this))
                    break
                case menuItem.ERC721:
                    await this._erc721.main(this.mainMenu.bind(this))
                    break
                case menuItem.Wallet:
                    await this._wallet.main(this.mainMenu.bind(this))
                    break
                case menuItem.Exit:
                    console.log("Exit")
                    break
                default:
                    console.log(`NOT IMPLEMENTED: ${answer.command}`)
                    await this.mainMenu()
                    break
            }
        } catch (err) {
            await Common.checkAndRestart(err, this.mainMenu.bind(this))
        }
    }
}
