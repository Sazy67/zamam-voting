const { ethers } = require("hardhat");
const contractInfo = require('../contract-info.json');

async function main() {
  console.log("Oylama başlatılıyor...");
  
  // Kontrat ABI - ZamaGizliOy için güncellenmiş
  const abi = [
    "function startVoting() external",
    "function votingActive() view returns (bool)",
    "function proposal() view returns (string)",
    "function owner() view returns (address)",
    "function resultsRevealed() view returns (bool)"
  ];
  
  // Signer'ı al
  const [signer] = await ethers.getSigners();
  console.log("Signer adresi:", signer.address);
  
  // Kontrata bağlan
  const contract = new ethers.Contract(contractInfo.address, abi, signer);
  
  try {
    // Kontrat bilgilerini kontrol et
    const proposal = await contract.proposal();
    const owner = await contract.owner();
    const votingActive = await contract.votingActive();
    
    console.log("📋 Proposal:", proposal);
    console.log("👑 Owner:", owner);
    console.log("🗳️ Oylama aktif mi:", votingActive);
    
    if (votingActive) {
      console.log("✅ Oylama zaten aktif!");
      return;
    }
    
    // Oylamayı başlat
    console.log("🚀 Oylama başlatılıyor...");
    const tx = await contract.startVoting();
    console.log("📤 Transaction hash:", tx.hash);
    
    // Transaction'ın onaylanmasını bekle
    await tx.wait();
    console.log("✅ Oylama başarıyla başlatıldı!");
    
    // Durumu kontrol et
    const newVotingStatus = await contract.votingActive();
    console.log("🔄 Yeni oylama durumu:", newVotingStatus);
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
    
    if (error.message.includes("Sadece owner")) {
      console.log("💡 Bu işlemi sadece kontrat sahibi yapabilir.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });