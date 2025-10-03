const { ethers } = require("hardhat");

async function main() {
  console.log("👑 Contract sahibi kontrol ediliyor...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploy eden adres:", deployer.address);
  console.log("🌐 Network:", network.name);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Bakiye:", ethers.formatEther(balance), "ETH");
  
  // Bu adres senin MetaMask adresin olmalı
  console.log("\n🔍 Bu adres senin MetaMask adresin mi?");
  console.log("✅ Eğer evet ise, contract'ın sahibi sen olacaksın");
  console.log("❌ Eğer hayır ise, .env dosyasındaki PRIVATE_KEY'i güncelle");
  
  if (balance === 0n && network.name !== 'localhost') {
    console.log("\n💸 Test ETH'si gerekiyor!");
    if (network.name === 'sepolia') {
      console.log("🔗 Sepolia Faucet: https://sepoliafaucet.com");
    } else if (network.name === 'zama') {
      console.log("🔗 Zama Faucet: https://faucet.zama.ai");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });