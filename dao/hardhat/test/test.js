const { network, ethers } = require("hardhat");

async function moveBlocks(number) {
    for (let index = 0; index < number; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
    }
    console.log(`Moved ${number} blocks`)
}

async function moveTime(number) {
    await network.provider.send("evm_increaseTime", [number])
    console.log(`Moved forward in time ${number} seconds`)
}

describe("DAO Contract Testing Flow", function () {
    it("Proposal to Executed Flow", async function () {

        /* ------------ Get Deployer's Address/Identity -------------*/
        const [deployer] = await ethers.getSigners();

        /* ------------ Deployment -------------*/
        const GovToken = await ethers.deployContract("GovToken", [deployer]);

        const TimeLock = await ethers.deployContract("TimeLock", [0,
            [deployer.address],
            [deployer.address],
            deployer.address]);

        const Cert = await ethers.deployContract("Cert", [TimeLock.target]);

        const MyGovernor = await ethers.deployContract("MyGovernor", [GovToken.target, TimeLock.target]);

        console.log("TimeLock: ", TimeLock.target)
        console.log("Cert: ", Cert.target)
        console.log("MyGovernor: ", MyGovernor.target)
        console.log("GovToken: ", GovToken.target)

        /* ------------ Balance and Voting Power -------------*/ 
        // Mint (only admin) - Transfer (MetaMask) - Delegate = GovToken

        const balance = await GovToken.balanceOf(deployer.address);
        console.log(`Deployer's balance: ${balance}`);

        let votes = await GovToken.getVotes(deployer.address);
        console.log(`Votes for available before deligation: ${votes}`);

        const transactionResponse = await GovToken.delegate(deployer)
        await transactionResponse.wait(1)

        votes = await GovToken.getVotes(deployer.address);
        console.log(`Votes for available after deligation: ${votes}`);


        /* ------------ Assign Roles to Governer Contract -------------*/
        // Get Roles, GrantRole - TimeLock (only admin) 

        // Get the role identifiers
        const PROPOSER_ROLE = await TimeLock.PROPOSER_ROLE();
        const EXECUTOR_ROLE = await TimeLock.EXECUTOR_ROLE();

        // Grant roles (assuming the deployer has the TIMELOCK_ADMIN_ROLE)
        await TimeLock.connect(deployer).grantRole(PROPOSER_ROLE, MyGovernor.target);
        await TimeLock.connect(deployer).grantRole(EXECUTOR_ROLE, MyGovernor.target);

        /* ------------ Proposal -------------*/
        // propose, ProposalCreated(event) for propoalid (store the proposalid) - MyGovernor
            // Issue with parameters => calldata - Cert - data for propose - no func, just data

        const transferCalldata = Cert.interface.encodeFunctionData("issue", [101, "An", "EDP", "A", "25th June"]);

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

        /* ------------ #0 Pending -------------*/
        // know proposal $state - MyGovernor

        let proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        await moveBlocks(100 + 1)

        /* ------------ #1 Active = Voting -------------*/
        // castVoteWithReason (retrive proposalid), proposalVotes - MyGovernor

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        let voteTx = await MyGovernor.castVoteWithReason(proposalId, 1, "jff")
        await voteTx.wait(1)

        const proposalVotes = await MyGovernor.proposalVotes(proposalId);
        console.log("Against Votes:", proposalVotes.againstVotes.toString());
        console.log("For Votes:", proposalVotes.forVotes.toString());
        console.log("Abstain Votes:", proposalVotes.abstainVotes.toString());


        await moveBlocks(100 + 1)

        /* ------------ #4 Succeeded -------------*/
        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        /* ------------ #5 Queued -------------*/
        // queue (id (perp the values)) - MyGovernor
        const descriptionHash = ethers.id("Proposal #1: Issue certificate");

        
        const queueTx = await MyGovernor.connect(deployer).queue([Cert.target], [0], [transferCalldata], descriptionHash)
        await queueTx.wait(1)

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        await moveTime(40)
        await moveBlocks(1)

        /* ------------ #7 Execute -------------*/ 
        // execute (prep the values) - MyGovernor

        const executeTx = await MyGovernor.connect(deployer).execute([Cert.target], [0], [transferCalldata], descriptionHash)
        await executeTx.wait(1)

        proposalState = await MyGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        
        /* ------------ Verify -------------*/
        // Certificates,issued (event)  - Cert

        console.log(await Cert.Certificates(101))
    });
});
