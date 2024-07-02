const {
    loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers')
const { expect } = require('chai')


describe('DAOToken Test', function () {
    async function deployCertFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const GovToken = await ethers.getContractFactory('GovToken')
        const govToken = await GovToken.deploy(owner.address)

        return { govToken, owner, addr1, addr2 }
    }
    // const { govToken, owner, addr1, addr2 } = await loadFixture(deployCertFixture)


    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { govToken, owner } = await loadFixture(deployCertFixture)
            expect(await govToken.owner()).to.equal(owner.address);
        });

        it("Should assign the initial supply of tokens to the owner", async function () {
            const { govToken, owner, addr1, addr2 } = await loadFixture(deployCertFixture)
            const ownerBalance = await govToken.balanceOf(owner.address);
            expect(await govToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    it("Should transfer tokens between accounts", async function () {

        const { govToken, owner, addr1, addr2 } = await loadFixture(deployCertFixture)

        // Transfer 50 tokens from owner to addr1
        await govToken.transfer(addr1.address, 50);
        const addr1Balance = await govToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(50);

        // Transfer 50 tokens from addr1 to addr2
        await govToken.connect(addr1).transfer(addr2.address, 50);
        const addr2Balance = await govToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
    });

    describe("Voting", function () {
        it("Should track votes correctly", async function () {

            const { govToken, owner, addr1 } = await loadFixture(deployCertFixture)

            await govToken.delegate(owner.address);
            await govToken.transfer(addr1.address, 100);
            await govToken.connect(addr1).delegate(addr1.address);

            expect(await govToken.getVotes(owner.address)).to.equal(999999999999999999900n);
            expect(await govToken.getVotes(addr1.address)).to.equal(100);
        });
    });
})