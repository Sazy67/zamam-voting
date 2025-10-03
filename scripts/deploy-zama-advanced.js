const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Zama Advanced FHEVM Voting System deploy ediliyor...");
  
  // Deploy eden hesabı al
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploy eden adres:", deployer.address);
  
  // Bakiye kontrol et
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Bakiye:", ethers.formatEther(balance), "ETH");
  
  // Contract'ı deploy et
  console.log("⏳ Kontrat deploy ediliyor...");
  const ZamaAdvancedVoting = await ethers.getContractFactory("ZamaAdvancedVoting");
  
  console.log("⏳ Deploy transaction gönderildi, onay bekleniyor...");
  const contract = await ZamaAdvancedVoting.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ ZamaAdvancedVoting kontratı başarıyla deploy edildi!");
  console.log("📍 Kontrat Adresi:", contractAddress);
  console.log("👑 Owner:", deployer.address);
  console.log("🌐 Network:", network.name);
  
  // Contract bilgilerini kaydet
  const contractInfo = {
    address: contractAddress,
    owner: deployer.address,
    network: network.name,
    deployedAt: new Date().toISOString(),
    contractName: "ZamaAdvancedVoting",
    features: [
      "Şifreli oylar (FHEVM)",
      "Otomatik süre kontrolü", 
      "Otomatik sonuç açıklama",
      "Basit ve gelişmiş oy verme",
      "Acil durum fonksiyonları"
    ],
    explorerUrl: network.name === 'zama' ? `https://main.explorer.zama.ai/address/${contractAddress}` : 
                 network.name === 'localhost' ? 'http://localhost:8545 (local network)' :
                 `https://${network.name}.etherscan.io/address/${contractAddress}`
  };
  
  // JSON dosyasına kaydet
  const fs = require('fs');
  fs.writeFileSync('zama-advanced-contract-info.json', JSON.stringify(contractInfo, null, 2));
  console.log("📄 Kontrat bilgileri zama-advanced-contract-info.json dosyasına kaydedildi");
  
  console.log("🔍 Explorer:", contractInfo.explorerUrl);
  
  console.log("\n🎯 Yeni Özellikler:");
  console.log("✅ Şifreli oylar (FHEVM ile tam gizlilik)");
  console.log("⏰ Otomatik süre kontrolü (saat bazında)");
  console.log("🤖 Otomatik sonuç açıklama seçeneği");
  console.log("🔄 Basit (boolean) ve gelişmiş (şifreli) oy verme");
  console.log("🚨 Acil durum pause/reveal fonksiyonları");
  console.log("⏳ Geriye kalan süre kontrolü");
  
  console.log("\n🎯 Sonraki adımlar:");
  console.log("1. Frontend'i yeni contract'a bağla");
  console.log("2. Süre kontrolü ile oylama oluştur");
  console.log("3. Şifreli oy verme test et");
  console.log("4. Otomatik bitiş özelliğini dene");
  console.log("5. Sonuçları görüntüle");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy hatası:", error);
    process.exit(1);
  });