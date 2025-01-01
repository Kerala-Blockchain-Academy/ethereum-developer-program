import { Contract, JsonRpcProvider, Wallet } from 'ethers'
import details from './deployed_addresses.json'
import Cert from './Cert.json'

export const provider = new JsonRpcProvider(process.env.HTTP_URL)
const wallet = new Wallet(process.env.PRIVATE_KEY!, provider)
export const instance = new Contract(details.contract, Cert.abi, wallet)
