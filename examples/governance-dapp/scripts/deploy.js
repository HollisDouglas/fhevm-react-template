const hre = require("hardhat");

async function main() {
  console.log("==========================================");
  console.log("Confidential Governance Contract Deployment");
  console.log("==========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy contract
  console.log("Deploying ConfidentialGovernance contract...");
  const ConfidentialGovernance = await hre.ethers.getContractFactory("ConfidentialGovernance");
  const governance = await ConfidentialGovernance.deploy();

  await governance.waitForDeployment();
  const address = await governance.getAddress();

  console.log("✓ Contract deployed successfully!");
  console.log("Contract Address:", address, "\n");

  // Initialize the company
  console.log("Initializing company configuration...");
  const tx = await governance.initCompany("Tech Innovations Corp", 1000000);
  await tx.wait();
  console.log("✓ Company initialized\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("==========================================");
  console.log("Deployment Summary:");
  console.log("==========================================");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✓ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
