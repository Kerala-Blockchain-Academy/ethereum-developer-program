// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const CertModule = buildModule('CertModule', (m) => {
  const cert = m.contract('Cert')

  return { cert }
})

export default CertModule
