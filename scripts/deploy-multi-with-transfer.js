const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 MultiVotingSystem (with ownership transfer) deploy ediliyor...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploy eden adres:", deployer.address);
  
  // Yeni owner adresi (mevcut cüzdanın adresi) - Debug'dan alınan tam adres
  const newOwnerAddress = "0xfcd2f7baf6e0C807f0B8f45de7F6bd864bA5"; // Senin mevcut cüzdan adresin
  console.log("🎯 Yeni owner olacak adres:", newOwnerAddress);
  
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
    console.log("👑 İlk Owner:", deployer.address);
    
    // Ownership'i transfer et
    console.log("🔄 Ownership transfer ediliyor...");
    const transferTx = await contract.transferOwnership(newOwnerAddress);
    await transferTx.wait();
    
    console.log("✅ Ownership başarıyla transfer edildi!");
    console.log("👑 Yeni Owner:", newOwnerAddress);
    console.log("🌐 Network:", network.name);
    
    // Contract bilgilerini kaydet
    const contractInfo = {
      address: contractAddress,
      owner: newOwnerAddress, // Yeni owner
      previousOwner: deployer.address, // Eski owner
      network: network.name,
      deployedAt: new Date().toISOString(),
      transferredAt: new Date().toISOString(),
      explorerUrl: network.name === 'localhost' ? 
        'http://localhost:8545 (local network)' : 
        `https://${network.name}.etherscan.io/address/${contractAddress}`
    };
    
    fs.writeFileSync('multi-contract-info.json', JSON.stringify(contractInfo, null, 2));
    console.log("📄 Kontrat bilgileri multi-contract-info.json dosyasına kaydedildi");
    console.log("🔍 Explorer:", contractInfo.explorerUrl);
    
    console.log("\n🎯 Sonraki adımlar:");
    console.log("1. .env dosyasındaki contract adresini güncelle");
    console.log("2. Frontend'i yeniden deploy et");
    console.log("3. Yeni owner ile admin sayfasına git");
    console.log("4. Oylamalar oluştur ve test et");
    
    console.log("\n✅ Ownership Transfer Başarılı!");
    console.log(`👑 Artık ${newOwnerAddress} adresi contract owner'ı!`);
    
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