import { readFileSync } from 'fs'
import solc from 'solc'
import { JsonRpcProvider, ContractFactory } from 'ethers'

const provider = new JsonRpcProvider('http://127.0.0.1:8545')

const signer = await provider.getSigner()
console.log('Address:', signer.address)

const balance = await provider.getBalance(signer.address)
console.log('Balance:', balance)

const network = await provider.getNetwork()
console.log('Chain ID:', network.chainId)

let latestBlock = await provider.getBlockNumber()
console.log('Current Block:', latestBlock)

const CONTRACT_FILE = './../contracts/Storage/Storage.sol'

const content = readFileSync(CONTRACT_FILE).toString()

const input = {
  language: 'Solidity',
  sources: {
    [CONTRACT_FILE]: {
      content: content,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
}

const compiled = solc.compile(JSON.stringify(input))
const output = JSON.parse(compiled)

const abi = output.contracts[CONTRACT_FILE].Storage.abi
const bytecode = output.contracts[CONTRACT_FILE].Storage.evm.bytecode.object

const factory = new ContractFactory(abi, bytecode, signer)
const contract = await factory.deploy()

const deployTrx = contract.deploymentTransaction()
console.log('Deployment Tx Hash:', deployTrx.hash)

const trx = await contract.store('This message is stored using ethers.')
console.log('Storage Tx Hash:', trx.hash)

const message = await contract.retrieve()
console.log('Message:', message)

latestBlock = await provider.getBlockNumber()
console.log('Latest Block:', latestBlock)
