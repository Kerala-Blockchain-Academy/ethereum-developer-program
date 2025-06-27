import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { getCreateAddress, keccak256, toHex } from 'viem'

describe('Cert', () => {
  async function deployCertFixture() {
    const [admin, other] = await hre.viem.getWalletClients()
    const cert = await hre.viem.deployContract('Cert')
    const client = await hre.viem.getPublicClient()

    return { cert, admin, other, client }
  }

  it('Should set the right admin', async () => {
    const { cert, admin } = await loadFixture(deployCertFixture)

    const contractAddress = getCreateAddress({
      from: admin.account.address,
      nonce: 0n,
    })

    expect(cert.address).to.equal(contractAddress.toLowerCase())
  })

  it('Should issue the certificate', async () => {
    const { cert, client } = await loadFixture(deployCertFixture)

    const hash = await cert.write.issue([
      14n,
      'Deren',
      'MBCC',
      'S',
      '30-05-2025',
    ])
    await client.waitForTransactionReceipt({ hash })

    const event = await cert.getEvents.Issued()

    expect(event).to.have.lengthOf(1)
    expect(event[0].args.course).to.equal(keccak256(toHex('MBCC')))
    expect(event[0].args.id).to.equal(14n)
    expect(event[0].args.grade).to.equal('S')
  })

  it('Should read the certificate', async () => {
    const { cert, client } = await loadFixture(deployCertFixture)

    const hash = await cert.write.issue([
      885n,
      'Shawn',
      'MBCC',
      'A',
      '28-05-2025',
    ])
    await client.waitForTransactionReceipt({ hash })

    const certificate = await cert.read.Certificates([885n])

    expect(certificate[0]).to.equal('Shawn')
    expect(certificate[1]).to.equal('MBCC')
    expect(certificate[2]).to.equal('A')
    expect(certificate[3]).to.equal('28-05-2025')
  })

  it('Should revert the issuing', async () => {
    const { cert, other } = await loadFixture(deployCertFixture)

    const certWithOther = await hre.viem.getContractAt('Cert', cert.address, {
      client: { wallet: other },
    })

    await expect(
      certWithOther.write.issue([355n, 'Lisa', 'MBCC', 'B', '31-05-2025'])
    ).to.be.rejectedWith('Access Denied')
  })
})
