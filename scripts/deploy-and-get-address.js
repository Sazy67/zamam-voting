const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 MultiVotingSystem deploy ediliyor (ownership transfer için)...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploy eden adres:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Bakiye:", ethers.formatEther(balance), "ETH");
  
  console.log("⏳ Kontrat deploy ediliyor...");
  
  try {
    const MultiVotingSystem = await ethers.getContractFactory("MultiVotingSystem");
    
    console.log("⏳ Deploy transaction gönderildi, onay bekleniyor...");
    const contract = await MultiVotingSystem.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log("✅ MultiVotingSystem kontratı başarıyla deploy edildi!");
    console.log("📍 Kontrat Adresi:", contractAddress);
    console.log("👑 Owner:", deployer.address);
    console.log("🌐 Network:", network.name);
    
    // Contract bilgilerini kaydet
    const contractInfo = {
      address: contractAddress,
      owner: deployer.address,
      network: network.name,
      deployedAt: new Date().toISOString(),
      explorerUrl: network.name === 'localhost' ? 
        'http://localhost:8545 (local network)' : 
        `https://${network.name}.etherscan.io/address/${contractAddress}`
    };
    
    fs.writeFileSync('multi-contract-info.json', JSON.stringify(contractInfo, null, 2));
    console.log("📄 Kontrat bilgileri multi-contract-info.json dosyasına kaydedildi");
    console.log("🔍 Explorer:", contractInfo.explorerUrl);
    
    console.log("\n🎯 Sonraki adım:");
    console.log("Manuel olarak transferOwnership fonksiyonunu çağırın:");
    console.log(`Contract: ${contractAddress}`);
    console.log("Function: transferOwnership");
    console.log("Yeni Owner: [Senin cüzdan adresin]");
    
  } catch (error) {
    console.error("❌ Deploy hatası:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });