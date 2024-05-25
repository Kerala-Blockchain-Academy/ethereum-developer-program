import axios from "axios";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import oracleV1 from "./artifacts/contracts/OracleV1.sol/OracleV1.json" assert { type: "json" };
import details from "./ignition/deployments/chain-31337/deployed_addresses.json" assert { type: "json" };

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);
const instance = new Contract(
  details["OracleModule#OracleV1"],
  oracleV1.abi,
  wallet
);

(async () => {
  while (true) {
    let data = await axios.get(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
    );

    let usd = JSON.stringify(data.data.USD);
    console.log(`Read data from truth point. USD rate is $${usd}`);

    let txReceipt = await instance.setPriceData(usd);

    console.log(`Tx: ${txReceipt.hash}`);
    console.log("Updated on-chain Oracle contract!!");

    await timer(30000);
  }
})();
