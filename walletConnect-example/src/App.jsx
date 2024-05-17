import { useWeb3Modal } from '@web3modal/ethers/react'
import { BrowserProvider } from 'ethers'
import { useWeb3ModalProvider } from '@web3modal/ethers/react'

function App() {
  const { open } = useWeb3Modal()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignMessage() {
    const provider = new BrowserProvider(walletProvider)
    const signer = await provider.getSigner()
    const signature = await signer?.signMessage(
      'Welcome to Certificate DApp. Kindly sign this message for verification.'
    )
    console.log('Signature: ', signature)
  }

  return (
    <div>
      <div>
        <button onClick={() => open()}>Connect</button>
      </div>
      <div>
        <button onClick={() => onSignMessage()}>Sign</button>
      </div>
    </div>
  )
}

export default App
