import { createTestClient, http, publicActions, walletActions } from 'viem'
import { hardhat } from 'viem/chains'
import { readFileSync } from 'fs'
import solc from 'solc'

const client = createTestClient({
  chain: hardhat,
  mode: 'hardhat',
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)

const [account] = await client.getAddresses()
console.log('Address:', account)

console.log('Balance:', await client.getBalance({ address: account }))

console.log('Chain ID:', client.chain.id)

console.log('Current Block:', await client.getBlockNumber())

const CONTRACT_FILE = './../common/contracts/Storage.sol'

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

let hash = await client.deployContract({ abi, account, bytecode, args: [] })
console.log('Deployment Tx Hash:', hash)

const receipt = await client.getTransactionReceipt({
  hash,
})

const { request } = await client.simulateContract({
  abi,
  account,
  address: receipt.contractAddress!,
  functionName: 'store',
  args: ['This message is stored using viem.'],
})

hash = await client.writeContract(request)
console.log('Storage Tx Hash:', hash)

const message = await client.readContract({
  abi,
  address: receipt.contractAddress!,
  functionName: 'retrieve',
  args: [],
})
console.log('Message:', message)

console.log('Latest Block:', await client.getBlockNumber())
