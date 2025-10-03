const { ethers } = require("hardhat");

async function main() {
  console.log("👑 Contract ownership transfer ediliyor...");
  
  // Mevcut owner (deployer)
  const [currentOwner] = await ethers.getSigners();
  console.log("📝 Mevcut owner:", currentOwner.address);
  
  // Yeni owner adresini al (kullanıcıdan)
  const newOwnerAddress = "0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5"; // Şu anki cüzdan adresiniz
  console.log("🎯 Yeni owner:", newOwnerAddress);
  
  // Contract adresini al
  const contractAddress = "0x0D9ac45Cd4582ae467C2dB9c77f0B3B11B991413";
  console.log("📍 Contract adresi:", contractAddress);
  
  // Contract'a bağlan
  const MultiVotingSystem = await ethers.getContractFactory("MultiVotingSystem");
  const contract = MultiVotingSystem.attach(contractAddress);
  
  // Mevcut owner'ı kontrol et
  const currentContractOwner = await contract.owner();
  console.log("🔍 Contract'taki mevcut owner:", currentContractOwner);
  
  if (currentContractOwner.toLowerCase() !== currentOwner.address.toLowerCase()) {
    console.log("❌ Bu script'i sadece mevcut owner çalıştırabilir!");
    console.log("Mevcut owner:", currentContractOwner);
    console.log("Script çalıştıran:", currentOwner.address);
    return;
  }
  
  // Ownership transfer fonksiyonu yok, bu yüzden yeni contract deploy edelim
  console.log("⚠️  MultiVotingSystem contract'ında transferOwnership fonksiyonu yok.");
  console.log("🔄 Yeni contract deploy edip ownership'i doğru adrese verelim...");
  
  // Yeni contract deploy et
  console.log("⏳ Yeni MultiVotingSystem deploy ediliyor...");
  const newContract = await MultiVotingSystem.deploy();
  await newContract.waitForDeployment();
  
  const newContractAddress = await newContract.getAddress();
  console.log("✅ Yeni contract deploy edildi!");
  console.log("📍 Yeni contract adresi:", newContractAddress);
  console.log("👑 Owner:", currentOwner.address);
  
  // Contract bilgilerini güncelle
  const fs = require('fs');
  const contractInfo = {
    address: newContractAddress,
    owner: currentOwner.address,
    network: network.name,
    deployedAt: new Date().toISOString(),
    explorerUrl: network.name === 'localhost' ? 
      'http://localhost:8545 (local network)' : 
      `https://${network.name}.etherscan.io/address/${newContractAddress}`
  };
  
  fs.writeFileSync('multi-contract-info.json', JSON.stringify(contractInfo, null, 2));
  console.log("📄 Contract bilgileri güncellendi");
  
  console.log("\n🎯 Sonraki adımlar:");
  console.log("1. .env dosyasındaki contract adresini güncelle");
  console.log("2. Frontend'i yeniden başlat");
  console.log("3. Admin sayfasına git ve test et");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });