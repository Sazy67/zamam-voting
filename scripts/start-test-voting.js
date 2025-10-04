const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Test oylamasını başlatıyor...");
    
    // Contract'a bağlan
    const contractAddress = "0xE6432abd94c497BE6bD546801A4bfAa0e26B1c51";
    const contract = await ethers.getContractAt("SimpleVoting", contractAddress);
    
    // Signer bilgisi
    const [signer] = await ethers.getSigners();
    console.log("📝 Signer adresi:", signer.address);
    
    try {
        // Test oylamasını başlat (ID: 0)
        console.log("\n⏰ Oylama başlatılıyor...");
        const tx = await contract.startVoting(0);
        
        console.log("📤 Transaction hash:", tx.hash);
        console.log("⏳ Transaction bekleniyor...");
        
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Oylama bilgilerini kontrol et
        console.log("\n📊 Güncellenmiş oylama bilgileri:");
        const votingInfo = await contract.getVotingInfo(0);
        console.log("Başlık:", votingInfo[0]);
        console.log("Seçenekler:", votingInfo[1]);
        console.log("Aktif:", votingInfo[2]);
        console.log("Bitiş zamanı:", new Date(Number(votingInfo[6]) * 1000).toLocaleString());
        
        // Kalan süre
        const timeRemaining = await contract.getTimeRemaining(0);
        console.log("Kalan süre (saniye):", timeRemaining.toString());
        console.log("Kalan süre (saat):", Math.floor(Number(timeRemaining) / 3600));
        
        console.log("\n🎉 Test oylaması başarıyla başlatıldı!");
        console.log("🗳️ Artık oy verilebilir!");
        
    } catch (error) {
        console.error("❌ Hata:", error.message);
        if (error.reason) {
            console.error("💡 Sebep:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });