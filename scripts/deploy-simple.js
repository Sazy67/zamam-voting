const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleVoting...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
  const contract = await SimpleVoting.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);
  
  // Auto-start voting
  console.log("🚀 Starting voting...");
  await contract.startVoting();
  console.log("✅ Voting started!");
  
  // Save contract info
  const fs = require('fs');
  const info = {
    address: address,
    proposal: "AI will take over 50% of software jobs by 2030?",
    owner: deployer.address,
    network: "localhost"
  };
  
  fs.writeFileSync('contract-info.json', JSON.stringify(info, null, 2));
  console.log("📄 Contract info saved!");
  
  console.log("\n🎯 Next steps:");
  console.log("1. Switch MetaMask to Localhost network");
  console.log("2. Import this account:", deployer.address);
  console.log("3. Refresh the frontend");
  console.log("4. Start voting!");
}

main().catch(console.error);