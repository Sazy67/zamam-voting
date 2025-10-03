const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Zama FHEVM Voting System deploy ediliyor...");
  
  // Deploy eden hesabı al
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploy eden adres:", deployer.address);
  
  // Bakiye kontrol et
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Bakiye:", ethers.formatEther(balance), "ETH");
  
  // Contract'ı deploy et
  console.log("⏳ Kontrat deploy ediliyor...");
  const ZamaVotingSystem = await ethers.getContractFactory("ZamaVotingSystem");
  
  console.log("⏳ Deploy transaction gönderildi, onay bekleniyor...");
  const contract = await ZamaVotingSystem.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ ZamaVotingSystem kontratı başarıyla deploy edildi!");
  console.log("📍 Kontrat Adresi:", contractAddress);
  console.log("👑 Owner:", deployer.address);
  console.log("🌐 Network:", network.name);
  
  // Contract bilgilerini kaydet
  const contractInfo = {
    address: contractAddress,
    owner: deployer.address,
    network: network.name,
    deployedAt: new Date().toISOString(),
    explorerUrl: network.name === 'zama' ? `https://main.explorer.zama.ai/address/${contractAddress}` : 
                 network.name === 'localhost' ? 'http://localhost:8545 (local network)' :
                 `https://${network.name}.etherscan.io/address/${contractAddress}`
  };
  
  // JSON dosyasına kaydet
  const fs = require('fs');
  fs.writeFileSync('zama-contract-info.json', JSON.stringify(contractInfo, null, 2));
  console.log("📄 Kontrat bilgileri zama-contract-info.json dosyasına kaydedildi");
  
  console.log("🔍 Explorer:", contractInfo.explorerUrl);
  
  console.log("\n🎯 Sonraki adımlar:");
  console.log("1. Frontend'i Zama network'üne bağla");
  console.log("2. Şifreli oy verme fonksiyonunu test et");
  console.log("3. /admin sayfasından oylamalar oluştur");
  console.log("4. Şifreli oyları ver");
  console.log("5. Sonuçları açıkla ve gör");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy hatası:", error);
    process.exit(1);
  });