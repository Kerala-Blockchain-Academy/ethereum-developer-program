import { Contract, JsonRpcProvider } from "ethers";
import details from "./deployed_addresses.json" assert { type: "json" };
import Cert from "./Cert.json" assert { type: "json" };

export const provider = new JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner();
export const instance = new Contract(
  details["CertModule#Cert"],
  Cert.abi,
  signer,
);
