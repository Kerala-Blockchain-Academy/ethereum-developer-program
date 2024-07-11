// deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");


async function main() {
    // Get the deployer's account
    const [deployer] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // Deploy the GovToken contract
    const govToken = await ethers.deployContract("GovToken", [deployer.address]);
    await govToken.waitForDeployment();

    console.log(`GovToken deployed to: ${govToken.target}`);

    // Check the deployer's balance
    const balance = await govToken.balanceOf(deployer.address);
    console.log(`Deployer's balance: ${balance.toString()}`);

    // Get the votes for the deployer
    let votes = await govToken.getVotes(deployer.address);
    console.log(`Votes for deployer: ${votes.toString()}`);

    // Deploy the TimeLock contract
    const timeLock = await ethers.deployContract("TimeLock", [0, [deployer.address], [deployer.address], deployer.address]);
    await timeLock.waitForDeployment();

    console.log(`TimeLock deployed to: ${timeLock.target}`);

    // Deploy the Cert contract
    const cert = await ethers.deployContract("Cert", [timeLock.target]);
    await cert.waitForDeployment();

    console.log(`Cert deployed to: ${cert.target}`);

    // Deploy the MyGovernor contract
    const myGovernor = await ethers.deployContract("MyGovernor", [govToken.target, timeLock.target]);
    await myGovernor.waitForDeployment();

    console.log(`MyGovernor deployed to: ${myGovernor.target}`);

    // Delegate votes to the deployer
    const transactionResponse = await govToken.delegate(deployer.address);
    await transactionResponse.wait(1);

    // Get the updated votes for the deployer
    votes = await govToken.getVotes(deployer.address);
    console.log(`Votes for deployer: ${votes.toString()}`);

    // Get the role identifiers
    const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timeLock.EXECUTOR_ROLE();

    // Grant roles (assuming the deployer has the TIMELOCK_ADMIN_ROLE)
    await timeLock.connect(deployer).grantRole(PROPOSER_ROLE, myGovernor.target);
    await timeLock.connect(deployer).grantRole(EXECUTOR_ROLE, myGovernor.target);

    // Log the contract addresses
    console.log("TimeLock address:", timeLock.target);
    console.log("Cert address:", cert.target);
    console.log("MyGovernor address:", myGovernor.target);
    console.log("GovToken address:", govToken.target);

    // Save the contract addresses to a JSON file
    saveAddresses({
        GovToken: govToken.target,
        TimeLock: timeLock.target,
        Cert: cert.target,
        MyGovernor: myGovernor.target
    });
}

function saveAddresses(addresses) {
    const filePath = './deployedAddresses.json';
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
    console.log(`Contract addresses saved to ${filePath}`);
}

// Execute the main function
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
