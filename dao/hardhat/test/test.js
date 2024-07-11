const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const keccak256 = require('keccak256');
const Web3 = require('web3');


async function moveBlocks(number) {
    console.log("Moving blocks...")
    for (let index = 0; index < number; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
    }
    console.log(`Moved ${number} blocks`)
}

async function moveTime(number) {
    console.log("Moving blocks...")
    await network.provider.send("evm_increaseTime", [number])

    console.log(`Moved forward in time ${number} seconds`)
}

describe("DAO contract", function () {
    it("Testing Flow", async function () {
        const [deployer] = await ethers.getSigners();

        const GovToken = await ethers.deployContract("GovToken", [deployer]);

        const balance = await GovToken.balanceOf(deployer.address);
        console.log(`Deployer's balance: ${balance}`);

        let votes = await GovToken.getVotes(deployer.address);
        console.log(`Votes for otherguy: ${votes}`);

        const TimeLock = await ethers.deployContract("TimeLock", [0,
            [deployer.address],
            [deployer.address],
            deployer.address]);

        const Cert = await ethers.deployContract("Cert", [TimeLock.target]);

        const MyGovernor = await ethers.deployContract("MyGovernor", [GovToken.target, TimeLock.target]);

        await moveBlocks(10 + 1)

        const transactionResponse = await GovToken.delegate(deployer)
        await transactionResponse.wait(1)

        votes = await GovToken.getVotes(deployer.address);
        console.log(`Votes for otherguy: ${votes}`);

        console.log("Timeloc", TimeLock.target)
        console.log("Cert", Cert.target)
        console.log("MyGovernor", MyGovernor.target)
        console.log("Token", GovToken.target)

        // Get the role identifiers
        const PROPOSER_ROLE = await TimeLock.PROPOSER_ROLE();
        const EXECUTOR_ROLE = await TimeLock.EXECUTOR_ROLE();

        // Grant roles (assuming the deployer has the TIMELOCK_ADMIN_ROLE)
        await TimeLock.connect(deployer).grantRole(PROPOSER_ROLE, MyGovernor.target);
        await TimeLock.connect(deployer).grantRole(EXECUTOR_ROLE, MyGovernor.target);

        const Certobj = await ethers.getContractAt("Cert", Cert.target);

        const transferCalldata = Certobj.interface.encodeFunctionData("issue", [101, "An", "EDP", "A", "25th June"]);

        // await expect(await MyGovernor.propose(
        //     [Cert.target],
        //     [0],
        //     [transferCalldata],
        //     "Proposal #1: Give grant to team"
        //   )).to.emit(MyGovernor, 'ProposalCreated')

        proposeTx = await MyGovernor.propose(
            [Cert.target],
            [0],
            [transferCalldata],
            "Proposal #1: Issue certificate"
        );
        await proposeTx.wait();
        const filter = MyGovernor.filters.ProposalCreated();

        const events = await MyGovernor.queryFilter(filter, proposeTx.blockNumber, proposeTx.blockNumber);

        let proposalId = events[0].args.proposalId;

        console.log(`Proposal ID Genrated: ${proposalId}`)

        let proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        await moveBlocks(100 + 1)

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        let voteTx = await MyGovernor.castVoteWithReason(proposalId, 1, "jff")
        await voteTx.wait(1)

        const proposalVotes = await MyGovernor.proposalVotes(proposalId);
        console.log("Against Votes:", proposalVotes.againstVotes.toString());
        console.log("For Votes:", proposalVotes.forVotes.toString());
        console.log("Abstain Votes:", proposalVotes.abstainVotes.toString());

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        await moveBlocks(100 + 1)

        const descriptionHash = ethers.id("Proposal #1: Issue certificate");

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        const queueTx = await MyGovernor.connect(deployer).queue([Cert.target], [0], [transferCalldata], descriptionHash)
        await queueTx.wait(1)
        await moveTime(36 + 1)
        await moveBlocks(1)


        let filter1 = MyGovernor.filters.ProposalCreated();

        let events1 = await MyGovernor.queryFilter(filter1, 0, queueTx.blockNumber);

        let propslssl = events1[0].args.proposalId;
        let propslssld = events1[0].args.description;
        

        console.log("All:", propslssl, propslssld)

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        const executeTx = await MyGovernor.connect(deployer).execute([Cert.target], [0], [transferCalldata], descriptionHash)
        await executeTx.wait(1)

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        console.log(await Certobj.Certificates(101))
    });
});