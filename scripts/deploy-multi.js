const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Multi Voting System deploy ediliyor...");
  
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
    
    console.log("\n🎯 Sonraki adımlar:");
    console.log("1. Frontend'i başlat: npm run dev");
    console.log("2. /admin sayfasına git");
    console.log("3. Yeni oylamalar oluştur");
    console.log("4. Oylamaları başlat/bitir");
    console.log("5. Sonuçları görüntüle");
    
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