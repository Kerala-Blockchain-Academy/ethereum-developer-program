import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { useAppKit, useAppKitProvider } from '@reown/appkit/react'
import type { Provider } from '@reown/appkit-adapter-ethers'
import { BrowserProvider } from 'ethers'

function App() {
  const { open } = useAppKit()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  async function onSignMessage() {
    const provider = new BrowserProvider(walletProvider)
    const signer = await provider.getSigner()
    const signature = await signer?.signMessage(
      'Welcome to Certificate DApp. Kindly sign this message for verification.'
    )
    alert('Signed successfully!!')
    console.log('Signature: ', signature)
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WalletConnect Example</h1>
      <div className="card">
        <div>
          <button onClick={() => open()}>Connect</button>
        </div>
        <br />
        <div>
          <button onClick={() => onSignMessage()}>Sign</button>
        </div>
      </div>
    </>
  )
}

export default App
