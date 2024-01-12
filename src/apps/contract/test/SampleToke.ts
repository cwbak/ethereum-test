require('dotenv').config()

import hre, { viem } from "hardhat";
import { Hex } from 'viem'

describe("Pizza", function () {
    this.timeout(300000);

    async function load() {
        const token = await hre.viem.deployContract("SampleToken", ["My Token", "SMT"])
        const publicClient = await viem.getPublicClient()
        return {
            publicClient,
            token,
        }
    }

    it("Name Symbol", async function () {
        const { token } = await load()
        const name = await token.read.name()
        console.log("name=", name)

        const symbol = await token.read.symbol()
        console.log("symbol=", symbol)
    });
});
