import dotenv from "dotenv";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter"
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

dotenv.config();

const chainIds = {
  hardhat: 31337,
  ganache: 1337,
  mainnet: 1,
  rinkeby: 4,
  goerli: 5,
  polygon: 137,
  mumbai: 80001,
  greenchain: 5314,
};

// Ensure that we have all the environment variables we need.
const privateKey: string = process.env.PRIVATE_KEY || "";
const infuraKey: string = process.env.INFURA_KEY || "";

function createNetworkConfig(network: keyof typeof chainIds): NetworkUserConfig {
  if (!infuraKey) {
    throw new Error("Missing INFURA_KEY");
  }

  if(network == 'greenchain'){
    // const gasPrice = 800000000;
    // console.info('gasPrice:', gasPrice)
    return {
      chainId: chainIds['greenchain'],
      url: 'https://rpc.gtech-cn.co/',
      accounts: [`${privateKey}`],
      gasMultiplier: 1.2,
      gasPrice: 1000000007,
      initialBaseFeePerGas: 1000000000,
    }
  }
  let nodeUrl;
  switch (network) {
    case "mainnet":
      nodeUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
      break;
    case "rinkeby":
      nodeUrl = `https://rinkeby.infura.io/v3/${infuraKey}`;
      break;
    case "goerli":
      nodeUrl = `https://goerli.infura.io/v3/${infuraKey}`;
      break;
    case "polygon":
      nodeUrl = `https://polygon-mainnet.infura.io/v3/${infuraKey}`;
      break;
    case "mumbai":
      nodeUrl = `https://polygon-mumbai.infura.io/v3/${infuraKey}`;
      break;
  }

  return {
    chainId: chainIds[network],
    url: nodeUrl,
    accounts: [`${privateKey}`],
  };
}

const config: HardhatUserConfig = {
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.12",
    settings: {
      metadata: {
        bytecodeHash: "ipfs",
      },
      // You should disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 590,
      },
    },
  },
  abiExporter: {
    flat: true,
  },
  mocha: {
    parallel: false
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_KEY || '',
      rinkeby: process.env.ETHERSCAN_KEY || '',
      goerli: process.env.ETHERSCAN_KEY || '',
      polygon: process.env.POLYGONSCAN_KEY || '',
      polygonMumbai: process.env.POLYGONSCAN_KEY || '',
      greenchain: "-",
    },
    customChains: [
      {
        network: 'greenchain',
        chainId: chainIds['greenchain'],
        urls: {
          apiURL: "https://explorer.gtech-cn.co/api",
          browserURL: "https://explorer.gtech-cn.co/"
        }
      }
    ]
  },
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_KEY,
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
  },
};

if (privateKey) {
  config.networks = {
    mainnet: createNetworkConfig("mainnet"),
    goerli: createNetworkConfig("goerli"),
    rinkeby: createNetworkConfig("rinkeby"),
    polygon: createNetworkConfig("polygon"),
    mumbai: createNetworkConfig("mumbai"),
    greenchain: createNetworkConfig("greenchain")
  };
}

config.networks = {
  ...config.networks,
  hardhat: {
    chainId: 1337,
  },
};

export default config;