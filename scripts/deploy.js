const { ethers } = require("hardhat");

async function main() {
  console.log("Gizli Oy Sistemi deploy ediliyor...");

  // Kontrat factory'yi al
  const GizliOySistemi = await ethers.getContractFactory("GizliOySistemi");
  
  // İlginç oy konusu
  const proposal = "2030 yılına kadar yapay zeka, yazılım geliştirme işlerinin %50'sini devralacak mı?";
  
  // Kontratı deploy et
  const gizliOySistemi = await GizliOySistemi.deploy(proposal);
  
  await gizliOySistemi.waitForDeployment();
  
  const contractAddress = await gizliOySistemi.getAddress();
  
  console.log("✅ GizliOySistemi kontratı deploy edildi!");
  console.log("📍 Adres:", contractAddress);
  console.log("📝 Proposal:", proposal);
  
  // Kontrat bilgilerini kaydet
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    proposal: proposal,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('contract-info.json', JSON.stringify(contractInfo, null, 2));
  console.log("📄 Kontrat bilgileri contract-info.json dosyasına kaydedildi");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy hatası:", error);
    process.exit(1);
  });