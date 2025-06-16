import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'

interface BalanceResponse {
  block: {
    hash: string
    account: {
      balance: string
    }
  }
}

const LATEST_BLOCK = gql`
  query block {
    block {
      hash
      number
      transactionsRoot
      transactionCount
      stateRoot
      receiptsRoot
      gasLimit
      gasUsed
      baseFeePerGas
      nextBaseFeePerGas
      extraData
      nonce
      timestamp
      blobGasUsed
      excessBlobGas
      raw
      rawHeader
    }
  }
`

function App() {
  const client = useApolloClient()
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [balanceError, setBalanceError] = useState('')
  const [balanceLoading, setBalanceLoading] = useState(false)

  const { loading, error, data } = useQuery(LATEST_BLOCK)

  if (loading) return <span></span>
  if (error) return <p>Error : {error.message}</p>

  const timestamp = new Date(
    parseInt(data.block.timestamp, 16) * 1000
  ).toLocaleString()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBalanceLoading(true)
    setBalanceError('')
    setBalance(null)

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setBalanceError('Invalid address')
      setBalanceLoading(false)
      return
    }

    const query = gql`
      query balance {
        block {
          account(address: "${address}") {
              balance
          }
          hash
        }
      }
    `

    try {
      const { data } = await client.query({ query })
      setBalance(data)
    } catch (err) {
      setBalanceError(String(err))
    } finally {
      setBalanceLoading(false)
    }
  }

  return (
    <>
      <form
        className="max-w-screen-md mx-auto m-6 p-6 bg-white border border-gray-200 rounded-lg shadow"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl m-4 text-center">Ethereum GraphQL Client</h1>
        <label className="block mb-2 text-l font-medium text-gray-900">
          Latest Block Details
        </label>
        <div className="my-2">
          <p className="text-l">Block Hash: {data.block.hash}</p>
          <p className="text-l">
            Block Number: {parseInt(data.block.number, 16)}
          </p>
          <p className="text-l">
            No. of Transactions: {parseInt(data.block.transactionCount, 16)}
          </p>
          <p className="text-l">Timestamp: {timestamp}</p>
        </div>
        <label className="block mb-2 text-l font-medium text-gray-900">
          Ethereum Address
        </label>
        <input
          type="text"
          id="address"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full my-4 p-4"
          placeholder="0x..."
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          type="submit"
          className="text-gray-200 bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2"
        >
          <svg
            className="w-4 h-4 me-2 -ms-1 text-gray-500"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="ethereum"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path
              fill="currentColor"
              d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"
            ></path>
          </svg>
          Get Balance
        </button>
        {balanceLoading && <p>Loading...</p>}
        {balanceError && <p>Error: {balanceError}</p>}
        {balance?.block?.account?.balance && (
          <p>Balance: {parseInt(balance.block.account.balance, 16)}</p>
        )}
      </form>
    </>
  )
}

export default App
