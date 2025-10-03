const { ethers } = require("hardhat");
const contractInfo = require("../contract-info.json");

async function main() {
  console.log("🔍 Contract durumu kontrol ediliyor...");
  
  const [signer] = await ethers.getSigners();
  console.log("Signer adresi:", signer.address);
  
  // Contract'a bağlan
  const contract = await ethers.getContractAt("GizliOySistemi", contractInfo.address);
  
  try {
    // Temel bilgileri oku
    const proposal = await contract.proposal();
    const owner = await contract.owner();
    const votingActive = await contract.votingActive();
    const resultsRevealed = await contract.resultsRevealed();
    
    console.log("\n📋 Contract Bilgileri:");
    console.log("Adres:", contractInfo.address);
    console.log("Proposal:", proposal);
    console.log("Owner:", owner);
    console.log("Voting Active:", votingActive);
    console.log("Results Revealed:", resultsRevealed);
    console.log("Signer is Owner:", signer.address.toLowerCase() === owner.toLowerCase());
    
    // Eğer oylama aktif değilse başlat
    if (!votingActive && !resultsRevealed) {
      console.log("\n🚀 Oylama başlatılıyor...");
      const tx = await contract.startVoting();
      await tx.wait();
      console.log("✅ Oylama başlatıldı!");
      
      // Tekrar kontrol et
      const newVotingActive = await contract.votingActive();
      console.log("Yeni voting active durumu:", newVotingActive);
    }
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });