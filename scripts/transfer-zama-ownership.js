const { ethers } = require("hardhat");

async function main() {
  console.log("👑 Zama Contract ownership transfer ediliyor...");
  
  // Mevcut owner (deployer)
  const [currentOwner] = await ethers.getSigners();
  console.log("📝 Mevcut owner:", currentOwner.address);
  
  // Yeni owner adresini al (sizin cüzdan adresiniz)
  const newOwnerAddress = "0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5"; // Buraya sizin cüzdan adresinizi yazın
  console.log("🎯 Yeni owner:", newOwnerAddress);
  
  // Contract adresini al
  const contractAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
  console.log("📍 Contract adresi:", contractAddress);
  
  // Contract'a bağlan
  const ZamaVotingSimple = await ethers.getContractFactory("ZamaVotingSimple");
  const contract = ZamaVotingSimple.attach(contractAddress);
  
  // Mevcut owner'ı kontrol et
  const currentContractOwner = await contract.owner();
  console.log("🔍 Contract'taki mevcut owner:", currentContractOwner);
  
  if (currentContractOwner.toLowerCase() !== currentOwner.address.toLowerCase()) {
    console.log("❌ Bu script'i sadece mevcut owner çalıştırabilir!");
    console.log("Mevcut owner:", currentContractOwner);
    console.log("Script çalıştıran:", currentOwner.address);
    return;
  }
  
  // Ownership transfer et
  console.log("⏳ Ownership transfer ediliyor...");
  const tx = await contract.transferOwnership(newOwnerAddress);
  await tx.wait();
  
  console.log("✅ Ownership başarıyla transfer edildi!");
  
  // Yeni owner'ı kontrol et
  const newContractOwner = await contract.owner();
  console.log("🔍 Yeni contract owner:", newContractOwner);
  
  // Contract bilgilerini güncelle
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    owner: newOwnerAddress,
    network: "localhost",
    deployedAt: new Date().toISOString(),
    contractName: "ZamaVotingSimple",
    features: [
      "Süre kontrolü (saat bazında)",
      "Otomatik bitiş",
      "Anlık oy takibi",
      "Detaylı admin paneli",
      "Gelecekte FHEVM entegrasyonu hazır"
    ],
    explorerUrl: "http://localhost:8545 (local network)"
  };
  
  fs.writeFileSync('zama-simple-contract-info.json', JSON.stringify(contractInfo, null, 2));
  console.log("📄 Contract bilgileri güncellendi");
  
  console.log("\n🎯 Sonraki adımlar:");
  console.log("1. Admin sayfasına git ve test et");
  console.log("2. Artık sizin cüzdanınızla admin işlemleri yapabilirsiniz");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });