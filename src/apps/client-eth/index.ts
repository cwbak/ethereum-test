#!/usr/bin/env node

import 'dotenv/config'

import { Command, Option } from 'commander'
import { readFileSync } from "fs";
import { Cli } from "./src/cli/cli";
import { Config } from "./src/config/config";

const program = new Command()

program
    .version('0.0.1')
    .description("An test CLI for raw transaction")
    .addOption(new Option('-c, --config <string>', 'Config file path'))
    .option('-i, --interactive', "Interactive")

program.action(options => {
    const configPath = options.config ?? "./config.json"
    const buffer = readFileSync(configPath)
    const config = JSON.parse(buffer.toString())

    if (options.interactive) {
        const cli = new Cli(config)
        cli.mainMenu().then()
        return
    }

    console.log("DO command")
})

program.parse(process.argv)



/*
import { WalletManager } from "./src/wallet"
import { Transaction } from "./src/transaction"

(async function(){

    const WALLET_PHRASE = process.env.WALLET_PHRASE
    const PROVIDER_URL = process.env.PROVIDER_URL

    const wm = new WalletManager(WALLET_PHRASE, PROVIDER_URL)
    const signer = wm.getSigner()

    const tx = new Transaction(signer)
    //await tx.createRawTxType2("0x5e6021e1e5D5546048592DcB3662857Ef6152d89", "0.001")
    await tx.createRawTx("0x5e6021e1e5D5546048592DcB3662857Ef6152d89", "0.001")

    console.log(`${tx.info}`)

    console.log(`Before: ${await wm.getBalanceOfSigner(signer)}`)

    const receipt = await tx.send()
    console.log(receipt.transactionHash)

    console.log(`After: ${await wm.getBalanceOfSigner(signer)}`)

    console.log("Hello")
})()
*/
