const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Zama Advanced Contract durumu kontrol ediliyor...");
    
    const CONTRACT_ADDRESS = "0x56fa223eA0B5EcA089E4E7fDb304302162Cb8FF0";
    
    try {
        const [signer] = await ethers.getSigners();
        console.log("📝 Signer adresi:", signer.address);
        
        // Network bilgisi
        const network = await signer.provider.getNetwork();
        console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
        
        // Contract'a bağlan
        const contract = await ethers.getContractAt("ZamaAdvancedVoting", CONTRACT_ADDRESS);
        
        // Temel bilgileri al
        console.log("\n📋 Contract Bilgileri:");
        console.log("📍 Contract Adresi:", CONTRACT_ADDRESS);
        
        const owner = await contract.owner();
        console.log("👑 Owner:", owner);
        
        const votingCount = await contract.getVotingCount();
        console.log("🗳️ Toplam Oylama Sayısı:", votingCount.toString());
        
        if (votingCount > 0) {
            console.log("\n📊 Mevcut Oylamalar:");
            const votingIds = await contract.getAllVotingIds();
            
            for (let i = 0; i < Math.min(votingIds.length, 3); i++) {
                const votingId = votingIds[i];
                const info = await contract.getVotingInfo(votingId);
                
                console.log(`\n🗳️ Oylama ${votingId}:`);
                console.log("  📝 Başlık:", info[0]);
                console.log("  🔄 Aktif:", info[2]);
                console.log("  📊 Sonuç Açıklandı:", info[3]);
                console.log("  👥 Toplam Oy:", info[7].toString());
            }
        }
        
        // Owner kontrolü
        const expectedOwner = "0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5";
        if (owner.toLowerCase() === expectedOwner.toLowerCase()) {
            console.log("\n✅ Owner doğru!");
        } else {
            console.log("\n⚠️ Owner farklı! Beklenen:", expectedOwner);
        }
        
        console.log("\n🎉 Contract başarıyla kontrol edildi!");
        
    } catch (error) {
        console.error("❌ Hata:", error.message);
        
        if (error.message.includes("call revert exception")) {
            console.log("💡 Contract bu network'te bulunamadı veya ABI uyumsuz");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Beklenmeyen hata:", error);
        process.exit(1);
    });