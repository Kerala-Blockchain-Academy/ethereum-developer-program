import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'

describe('Cert', function () {
  async function deployCertFixture() {
    const [admin, other] = await hre.ethers.getSigners()

    const Cert = await hre.ethers.getContractFactory('Cert')
    const cert = await Cert.deploy()

    return { cert, admin, other }
  }

  it('Should set the right admin', async function () {
    const { cert, admin } = await loadFixture(deployCertFixture)

    expect(cert.deploymentTransaction()!.from).to.equal(admin.address)
  })

  it('Should issue the certificate', async function () {
    const { cert } = await loadFixture(deployCertFixture)

    await expect(cert.issue(1024, 'Deren', 'EDP', 'S', '16-05-2024'))
      .to.emit(cert, 'Issued')
      .withArgs('EDP', 1024, 'S')
  })

  it('Should read the certificate', async function () {
    const { cert } = await loadFixture(deployCertFixture)

    await cert.issue(1024, 'Shalom', 'EDP', 'S', '16-05-2024')

    const certificate = await cert.Certificates(1024)

    expect(certificate[0]).to.equal('Shalom')
    expect(certificate[1]).to.equal('EDP')
    expect(certificate[2]).to.equal('S')
    expect(certificate[3]).to.equal('16-05-2024')
  })

  it('Should revert the issuing', async function () {
    const { cert, other } = await loadFixture(deployCertFixture)

    await expect(
      cert.connect(other).issue(1024, 'Yao', 'EDP', 'S', '16-05-2024')
    ).to.be.revertedWith('Access Denied')
  })
})
