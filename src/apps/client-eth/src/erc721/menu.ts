import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import inquirer, { Answers } from "inquirer";
import { WalletManager } from "../wallet/wallet";
import { ERC721 } from "./erc721";
import { GetTokenAddress } from "./erc721-addresses";

const menuItem = {
    OwnerOf: 'OwnerOf',
    Approve: 'Approve',
    Transfer: 'Transfer',
    Allowance: 'Allowance',
    CreateApproveTxString: 'Create Approve Transaction String',
    ShowBalancesBySymbol: 'Show ERC721 balances By Symbol',
    ShowBalancesByAddress: 'Show ERC721 balances By Address',
    TransferTxString: 'TransferTxString',
    Back: 'Back'
}

export class Erc721Menu {
    private readonly _wm: WalletManager
    private readonly _provider: Provider
    private prevMenu?: () => void

    private savedCollectionName: string = "spaceboo" //테스트 NFT 콜렉션
    private savedToAddr: string = "0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097" //테스트 hardhat 계정
    private savedOwner: string = "0xf3550ff051d49d49104357dcf3f6b748f734f2f2c4af5371ec75eb30328054a3" // NFT있는 어드레스 키
    private savedSpender: string = "0xdB3d0Da4981C56810e17bef9fE524A2C5C6b80C0"
    private savedContractAddress: string = "0xf8d4fef9af82de6e57f6aabafd49ff9730242d75" // 스페이스 부 컨트랙 어드레스
    private tokenId: string = "6204" //테스트 토큰 아이디

    constructor(wm: WalletManager) {
        this._wm = wm
        this._provider = wm.provider
    }

    async main(prevMenu: () => void) {
        this.prevMenu = prevMenu
        await this.menu()
    }

    private async menu() {
        const answer = await inquirer
            .prompt([{
                type: 'list',
                pageSize: 10,
                name: 'command',
                message: 'Select Command',
                choices: Object.values(menuItem)
            }])

        switch (answer.command) {
            case menuItem.Approve:
                await this.approve()
                await this.menu()
                break
            case menuItem.Transfer:
                await this.transfer()
                await this.menu()
                break
            case menuItem.TransferTxString:
                await this.transferTxString()
                await this.menu()
                break
            case menuItem.CreateApproveTxString:
                await this.createApproveTxString()
                await this.menu()
                break
            case menuItem.OwnerOf:
                await this.ownerOf()
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

    private async createApproveTxString() {
        const question = approveErc721Question(this.savedCollectionName, this.savedOwner, this.savedSpender, this.tokenId)
        const answers = await inquirer.prompt(question)

        const signer = await this._wm.getSigner(answers.owner)
        const erc721 = await Erc721Menu.createErc721(signer, answers.collectionName)
        const data = await erc721.approveTx(this._wm.getAddress(answers.spender), answers.tokenId)

        console.log(data)
        this.saveVariables(answers)
    }

    private static async createErc721(signer: Signer, collectionName: string) {
        const contractAddress = GetTokenAddress(collectionName)
        return new ERC721(contractAddress, signer)
    }

    private async ownerOf() {
        const question = basicErc721OwnerOfQuestion(this.savedCollectionName, this.tokenId)
        const answers = await inquirer.prompt(question)
        const signer = await this._wm.getSigner("")
        const erc721 = await Erc721Menu.createErc721(signer, answers.collectionName)
        const result = await erc721.ownerOf(answers.tokenId)
        console.log("ownerOf =", result)
    }

    private async approve() {
        const question = approveErc721Question(this.savedCollectionName, this.savedOwner, this.savedSpender, this.tokenId)
        const answers = await inquirer.prompt(question)

        const signer = await this._wm.getSigner(answers.owner)
        const erc721 = await Erc721Menu.createErc721(signer, answers.collectionName)
        const result = await erc721.approve(this._wm.getAddress(answers.spender), answers.tokenId)

        console.log(result)
        this.saveVariables(answers)
    }

    private async transfer() {
        const question = transferQuestion(this.savedCollectionName, this.savedOwner, this.savedSpender, this.savedToAddr, this.tokenId)
        const answers = await inquirer.prompt(question)

        const signer = await this._wm.getSigner(answers.owner)
        const erc721 = await Erc721Menu.createErc721(signer, answers.collectionName)
        const result = await erc721.transfer(this._wm.getAddress(answers.spender), answers.toAddr, answers.tokenId)

        console.log(result)
        this.saveVariables(answers)
    }

    private async transferTxString() {
        const question = transferQuestion(this.savedCollectionName, this.savedOwner, this.savedSpender, this.savedToAddr, this.tokenId)
        const answers = await inquirer.prompt(question)

        const signer = await this._wm.getSigner(answers.owner)
        const erc721 = await Erc721Menu.createErc721(signer, answers.collectionName)
        const result = await erc721.transferTx(this._wm.getAddress(answers.spender), answers.toAddr, answers.tokenId)

        console.log(result)
        this.saveVariables(answers)
    }

    private saveVariables(answers: Answers) {
        if (answers.owner != null)   { this.savedOwner = answers.owner }
        if (answers.spender != null) { this.savedSpender = answers.spender }
        if (answers.address != null) { this.savedSpender = answers.address }
        if (answers.contractAddress != null) { this.savedContractAddress = answers.contractAddress }
    }
}

export function basicErc721OwnerOfQuestion(collectionName: string, tokenId: string, ...rest: Object[]) {
    return [
        {
            name: 'collectionName',
            message: 'ERC721 collection name (e.g., spaceboo, ...)',
            default: collectionName
        },
        {
            name: 'tokenId',
            message: 'tokenId',
            default: tokenId
        },
        ...rest
    ]
}

export function transferQuestion(collectionName: string, owner: string, spender: string, toAddr: string, tokenId: string, ...rest: Object[]) {
    return [
        {
            name: 'collectionName',
            message: 'ERC721 collection name (e.g., spaceboo, ...)',
            default: collectionName
        },
        {
            name: 'owner',
            message: 'ownerIndex or privateKey of owner (w/ 0x prefix)',
            default: owner
        },
        {
            name: 'spender',
            message: 'fromAddr (w/ 0x prefix)',
            default: spender
        },
        {
            name: 'toAddr',
            message: 'toAddr (w/ 0x prefix)',
            default: toAddr
        },
        {
            name: 'tokenId',
            message: 'tokenId',
            default: tokenId
        },
        ...rest
    ]
}

export function basicErc721Question(collectionName: string, owner: string, spender: string, tokenId: string, ...rest: Object[]) {
    return [
        {
            name: 'collectionName',
            message: 'ERC721 collection name (e.g., spaceboo, ...)',
            default: collectionName
        },
        {
            name: 'owner',
            message: 'ownerIndex or privateKey of owner (w/ 0x prefix)',
            default: owner
        },
        {
            name: 'spender',
            message: 'toAddr (w/ 0x prefix)',
            default: spender
        },
        {
            name: 'tokenId',
            message: 'tokenId',
            default: tokenId
        },
        ...rest
    ]
}

export function approveErc721Question(collectionName: string, owner: string, spender: string, tokenId: string) {
    return basicErc721Question(collectionName, owner, spender, tokenId, {
        name: 'tokenId',
    })
}
