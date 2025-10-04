const { ethers } = require("hardhat");

async function main() {
    console.log("🗳️ Test oylaması oluşturuluyor...");
    
    const CONTRACT_ADDRESS = "0x56fa223eA0B5EcA089E4E7fDb304302162Cb8FF0";
    
    try {
        const [signer] = await ethers.getSigners();
        console.log("📝 Signer adresi:", signer.address);
        
        // Contract'a bağlan
        const contract = await ethers.getContractAt("ZamaAdvancedVoting", CONTRACT_ADDRESS);
        
        // Test oylaması parametreleri
        const proposal = "Test Oylaması: Blockchain teknolojisi gelecekte yaygınlaşacak mı?";
        const options = ["Evet", "Hayır", "Kararsızım"];
        const duration = 24; // 24 saat
        const minVotes = 0;
        const requiresMinVotes = false;
        const allowRevote = true;
        
        console.log("\n📋 Oylama Parametreleri:");
        console.log("Başlık:", proposal);
        console.log("Seçenekler:", options);
        console.log("Süre:", duration, "saat");
        console.log("Oy değiştirme:", allowRevote ? "İzinli" : "Yasak");
        
        // Gas estimate
        console.log("\n⛽ Gas estimate hesaplanıyor...");
        const gasEstimate = await contract.createAdvancedVoting.estimateGas(
            proposal,
            options,
            duration,
            minVotes,
            requiresMinVotes,
            allowRevote
        );
        
        console.log("Gas estimate:", gasEstimate.toString());
        
        // Oylama oluştur
        console.log("\n🚀 Oylama oluşturuluyor...");
        const tx = await contract.createAdvancedVoting(
            proposal,
            options,
            duration,
            minVotes,
            requiresMinVotes,
            allowRevote,
            {
                gasLimit: gasEstimate * 120n / 100n // %20 fazla gas
            }
        );
        
        console.log("📤 Transaction hash:", tx.hash);
        console.log("⏳ Transaction bekleniyor...");
        
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Yeni durumu kontrol et
        const votingCount = await contract.getVotingCount();
        console.log("\n📊 Güncel oylama sayısı:", votingCount.toString());
        
        if (votingCount > 0) {
            const votingInfo = await contract.getVotingInfo(0);
            console.log("\n🗳️ Oluşturulan Oylama:");
            console.log("ID: 0");
            console.log("Başlık:", votingInfo[0]);
            console.log("Seçenekler:", votingInfo[1]);
            console.log("Aktif:", votingInfo[2]);
            console.log("Sonuç açıklandı:", votingInfo[3]);
        }
        
        console.log("\n🎉 Test oylaması başarıyla oluşturuldu!");
        
    } catch (error) {
        console.error("❌ Hata:", error);
        
        if (error.reason) {
            console.error("Sebep:", error.reason);
        }
        
        if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            console.error("💡 Gas limit hesaplanamadı - contract parametrelerini kontrol edin");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Beklenmeyen hata:", error);
        process.exit(1);
    });