import axios from "axios";
import { Contract, Wallet, WebSocketProvider } from "ethers";
import oracleV2 from "./artifacts/contracts/OracleV2.sol/OracleV2.json";
import details from "./ignition/deployments/chain-31337/deployed_addresses.json";

const wsprovider = new WebSocketProvider("ws://127.0.0.1:8545");
const wallet = new Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  wsprovider
);
const instance = new Contract(
  details["OracleModule#OracleV2"],
  oracleV2.abi,
  wallet
);

(() => {
  console.log("Listening for events...");
  instance.on("PriceDataRequest", async (event) => {
    console.log(`${event.filter} occured!!`);

    let data = await axios.get(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
    );

    let usd = JSON.stringify(data.data.USD);
    console.log(`Read data from truth point. USD rate is $${usd}`);

    let txReceipt = await instance.updatePriceData(usd);

    console.log(`Tx: ${txReceipt.hash}`);
    console.log("Updated on-chain Oracle contract!!");
  });
})();
