import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import '@openzeppelin/hardhat-upgrades';

// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const HardHatPK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1096,
            },
        },
    },

    defaultNetwork: process.env.NETWORK || "eth_local",

    networks: {
        hardhat: {
            allowUnlimitedContractSize: false,
            forking: {
                url: process.env.FORKING_URL || "https://mainnet.infura.io/v3/c85f083904f34bb9a37e1b20df9533bc"
            },
            chainId: Number(process.env.FORKING_CHAIN_ID || 1),
            blockGasLimit: 150000000,
        },

        ////////////////////////////////////////////////////////////////////////////////
        eth_local: {
            url: "http://127.0.0.1:8545",
            accounts: [process.env.PK ?? HardHatPK]
        },
        eth_sepolia_local: {
            url: "http://172.20.20.64:18545",
            accounts: [process.env.PK ?? HardHatPK]
        },
        eth_sepolia: {
            url: "https://eth-sepolia.g.alchemy.com/v2/HScPYdzA0rnkjVlhirpV-0Bsh3SlUkvX",
            accounts: [process.env.PK ?? HardHatPK]
        },
        matic_local: {
            url: "http://127.0.0.1:8546",
            accounts: [process.env.PK ?? HardHatPK]
        },
        matic_mumbai: {
            url: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
            accounts: [process.env.PK ?? HardHatPK]
        },
        klay_baobab: {
            url: "https://public-node-api.klaytnapi.com/v1/baobab",
            accounts: [process.env.PK ?? HardHatPK]
        }
    },

    mocha: {
        timeout: 30000
    }
};

export default config;
