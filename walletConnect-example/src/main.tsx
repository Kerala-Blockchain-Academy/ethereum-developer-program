import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createAppKit } from '@reown/appkit/react'
import { arbitrum, mainnet } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

const projectId = '<-your-project-id->'

const metadata = {
  name: 'Certificate DApp',
  description: 'DApp for issuing certificates in blockchain',
  url: 'https://certificate.dapp', // origin must match your domain & subdomain
  icons: ['https://icons.certificate.dapp/'],
}

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, arbitrum],
  metadata,
  projectId,
  features: {
    analytics: true,
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
