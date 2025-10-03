const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Zama Simple Voting System deploy ediliyor...");
  
  // Deploy eden hesabı al
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploy eden adres:", deployer.address);
  
  // Bakiye kontrol et
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Bakiye:", ethers.formatEther(balance), "ETH");
  
  // Contract'ı deploy et
  console.log("⏳ Kontrat deploy ediliyor...");
  const ZamaVotingSimple = await ethers.getContractFactory("ZamaVotingSimple");
  
  console.log("⏳ Deploy transaction gönderildi, onay bekleniyor...");
  const contract = await ZamaVotingSimple.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ ZamaVotingSimple kontratı başarıyla deploy edildi!");
  console.log("📍 Kontrat Adresi:", contractAddress);
  console.log("👑 Owner:", deployer.address);
  console.log("🌐 Network:", network.name);
  
  // Contract bilgilerini kaydet
  const contractInfo = {
    address: contractAddress,
    owner: deployer.address,
    network: network.name,
    deployedAt: new Date().toISOString(),
    contractName: "ZamaVotingSimple",
    features: [
      "Süre kontrolü (saat bazında)",
      "Otomatik bitiş",
      "Anlık oy takibi", 
      "Detaylı admin paneli",
      "Gelecekte FHEVM entegrasyonu hazır"
    ],
    explorerUrl: network.name === 'zama' ? `https://main.explorer.zama.ai/address/${contractAddress}` : 
                 network.name === 'localhost' ? 'http://localhost:8545 (local network)' :
                 `https://${network.name}.etherscan.io/address/${contractAddress}`
  };
  
  // JSON dosyasına kaydet
  const fs = require('fs');
  fs.writeFileSync('zama-simple-contract-info.json', JSON.stringify(contractInfo, null, 2));
  console.log("📄 Kontrat bilgileri zama-simple-contract-info.json dosyasına kaydedildi");
  
  console.log("🔍 Explorer:", contractInfo.explorerUrl);
  
  console.log("\n🎯 Özellikler:");
  console.log("⏰ Süre kontrolü (saat bazında oylama süresi)");
  console.log("🤖 Otomatik bitiş (süre dolduğunda)");
  console.log("📊 Anlık oy takibi (admin için)");
  console.log("🔍 Detaylı admin paneli");
  console.log("🔮 Gelecekte FHEVM şifreleme hazır");
  
  console.log("\n🎯 Sonraki adımlar:");
  console.log("1. Frontend'i yeni contract'a bağla");
  console.log("2. Admin panelinde süre ile oylama oluştur");
  console.log("3. Oy verme test et");
  console.log("4. Otomatik bitiş özelliğini dene");
  console.log("5. Sonuçları görüntüle");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy hatası:", error);
    process.exit(1);
  });