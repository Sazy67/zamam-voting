const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Hardhat Test Hesapları:");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);
  console.log("RPC URL:", network.config.url);
  
  const accounts = await ethers.getSigners();
  
  for (let i = 0; i < Math.min(accounts.length, 10); i++) {
    const account = accounts[i];
    const balance = await ethers.provider.getBalance(account.address);
    console.log(`\n${i + 1}. Hesap:`);
    console.log(`   Adres: ${account.address}`);
    console.log(`   Bakiye: ${ethers.formatEther(balance)} ETH`);
    
    if (i === 0) {
      console.log(`   👑 Bu hesap contract owner'ı`);
    }
  }
  
  console.log("\n📋 MetaMask'e eklemek için:");
  console.log("Network Name: Localhost");
  console.log("RPC URL: http://127.0.0.1:8545");
  console.log("Chain ID: 31337");
  console.log("Currency Symbol: ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });