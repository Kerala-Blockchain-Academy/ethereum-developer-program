import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: 'localhost',
  networks:{
    localhost: {
      url: 'http://localhost:8545'
    },
  },
};

export default config;
