const {
    loadFixture,
  } = require('@nomicfoundation/hardhat-toolbox/network-helpers')
  const { expect } = require('chai')
  
  describe('Cert Test', function () {
    async function deployCertFixture() {
      const [admin, other] = await ethers.getSigners()
  
      const Cert = await ethers.getContractFactory('Cert')
      const cert = await Cert.deploy(admin.address)
  
      return { cert, admin, other }
    }
  
    it('Should set the right admin', async function () {
      const { cert, admin } = await loadFixture(deployCertFixture)
  
      expect(cert.deploymentTransaction().from).to.equal(admin.address)
    })
  
    it('Should issue the certificate', async function () {
      const { cert } = await loadFixture(deployCertFixture)
  
      await expect(cert.issue(1024, 'Deren', 'CED', 'S', '24-04-2024'))
        .to.emit(cert, 'issued')
        .withArgs(1024, '24-04-2024')
    })
  
    it('Should read the certificate', async function () {
      const { cert } = await loadFixture(deployCertFixture)
  
      await cert.issue(1024, 'Deren', 'CED', 'S', '24-04-2024')
  
      const certificate = await cert.Certificates(1024)
  
      expect(certificate[0]).to.equal('Deren')
      expect(certificate[1]).to.equal('CED')
      expect(certificate[2]).to.equal('S')
      expect(certificate[3]).to.equal('24-04-2024')
    })
  
    it('Should revert the issuing', async function () {
      const { cert, other } = await loadFixture(deployCertFixture)
  
      await expect(
        cert.connect(other).issue(1024, 'Shalom', 'CBR', 'S', '23-03-2023')
      ).to.be.reverted;
    })
  })