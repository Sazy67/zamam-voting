const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Zama Advanced Voting contract durumu kontrol ediliyor...");
    
    const contractAddress = "0xE2DAE8F0F9Cfa1726B21097c71c9EA9a76E1714f";
    const [signer] = await ethers.getSigners();
    console.log("Signer adresi:", signer.address);
    
    try {
        // Contract'a bağlan
        const contract = await ethers.getContractAt("SimpleVoting", contractAddress);
        
        // Temel bilgileri oku
        const owner = await contract.owner();
        const votingCount = await contract.getVotingCount();
        
        console.log("\n📋 Contract Bilgileri:");
        console.log("Adres:", contractAddress);
        console.log("Owner:", owner);
        console.log("Voting Count:", votingCount.toString());
        console.log("Signer is Owner:", signer.address.toLowerCase() === owner.toLowerCase());
        
        // Tüm oylamaları listele
        if (votingCount > 0) {
            console.log("\n🗳️ Mevcut Oylamalar:");
            for (let i = 0; i < votingCount; i++) {
                const votingInfo = await contract.getVotingInfo(i);
                const timeRemaining = await contract.getTimeRemaining(i);
                
                console.log(`\n--- Oylama ${i} ---`);
                console.log("Başlık:", votingInfo[0]);
                console.log("Seçenekler:", votingInfo[1]);
                console.log("Aktif:", votingInfo[2]);
                console.log("Sonuç açıklandı:", votingInfo[3]);
                console.log("Oluşturulma:", new Date(Number(votingInfo[5]) * 1000).toLocaleString());
                console.log("Bitiş zamanı:", new Date(Number(votingInfo[6]) * 1000).toLocaleString());
                console.log("Toplam oy:", votingInfo[7].toString());
                console.log("Kalan süre (saniye):", timeRemaining.toString());
                
                if (Number(timeRemaining) > 0) {
                    console.log("Kalan süre (saat):", Math.floor(Number(timeRemaining) / 3600));
                }
            }
        }
        
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