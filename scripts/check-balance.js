const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Bakiye kontrol ediliyor...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Adres:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Bakiye:", ethers.formatEther(balance), "ETH");
  console.log("🌐 Network:", network.name);
  
  if (balance === 0n) {
    console.log("❌ Bakiye yetersiz! Test ETH'si gerekiyor.");
    if (network.name === 'sepolia') {
      console.log("🔗 Sepolia Faucet: https://sepoliafaucet.com");
      console.log("🔗 Alchemy Faucet: https://sepoliafaucet.com");
    } else if (network.name === 'zama') {
      console.log("🔗 Zama Faucet: https://faucet.zama.ai");
    }
  } else {
    console.log("✅ Bakiye yeterli, deploy işlemine devam edilebilir!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });