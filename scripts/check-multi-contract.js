const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 MultiVotingSystem contract durumu kontrol ediliyor...");
  
  const [signer] = await ethers.getSigners();
  console.log("Signer adresi:", signer.address);
  
  // Contract adresi
  const contractAddress = "0xd571Ef424422BD0F843E8026d7Fa5808879B1B81";
  console.log("Contract adresi:", contractAddress);
  
  try {
    // Contract'a bağlan
    const contract = await ethers.getContractAt("MultiVotingSystem", contractAddress);
    
    // Temel bilgileri oku
    const owner = await contract.owner();
    const votingCount = await contract.getVotingCount();
    const allVotingIds = await contract.getAllVotingIds();
    
    console.log("\n📋 Contract Bilgileri:");
    console.log("Owner:", owner);
    console.log("Voting Count:", votingCount.toString());
    console.log("All Voting IDs:", allVotingIds.map(id => id.toString()));
    console.log("Signer is Owner:", signer.address.toLowerCase() === owner.toLowerCase());
    
    // Network bilgisi
    console.log("Network:", network.name);
    
    // Contract code kontrol et
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Contract deployed:", code !== "0x");
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error("Stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });