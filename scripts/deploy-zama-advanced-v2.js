const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Zama Advanced Voting V2 Deploy Başlıyor...");
    
    // Deployer hesabını al
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deployer adresi:", deployer.address);
    console.log("👑 Expected owner:", "0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5");
    
    // Bakiye kontrolü
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Deployer bakiyesi:", ethers.formatEther(balance), "ZAMA");
    
    // Network kontrolü
    const network = await deployer.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
    
    try {
        // Contract'ı deploy et
        console.log("\n📦 ZamaAdvancedVoting contract'ı deploy ediliyor...");
        const ZamaAdvancedVoting = await ethers.getContractFactory("ZamaAdvancedVoting");
        const zamaAdvanced = await ZamaAdvancedVoting.deploy();
        
        await zamaAdvanced.waitForDeployment();
        const contractAddress = await zamaAdvanced.getAddress();
        
        console.log("✅ ZamaAdvancedVoting deploy edildi!");
        console.log("📍 Contract adresi:", contractAddress);
        console.log("👑 Owner:", deployer.address);
        
        // Contract bilgilerini doğrula
        console.log("\n🔍 Contract doğrulaması yapılıyor...");
        const owner = await zamaAdvanced.owner();
        const votingCount = await zamaAdvanced.getVotingCount();
        
        console.log("✅ Owner doğrulandı:", owner);
        console.log("✅ Başlangıç oylama sayısı:", votingCount.toString());
        
        // Test oylaması oluştur
        console.log("\n🗳️ Test oylaması oluşturuluyor...");
        const options = ["Seçenek A", "Seçenek B", "Seçenek C"];
        const createTx = await zamaAdvanced.createAdvancedVoting(
            "Test Çoklu Seçenek Oylaması",
            options,
            24, // 24 saat
            0,  // Min votes
            false, // Requires min votes
            true   // Allow revote
        );
        
        await createTx.wait();
        console.log("✅ Test oylaması oluşturuldu!");
        
        // Basit oylama da oluştur
        const simpleTx = await zamaAdvanced.createSimpleVoting(
            "Basit Evet/Hayır Oylaması",
            12 // 12 saat
        );
        
        await simpleTx.wait();
        console.log("✅ Basit oylama oluşturuldu!");
        
        // Final durum
        const finalVotingCount = await zamaAdvanced.getVotingCount();
        console.log("📊 Toplam oylama sayısı:", finalVotingCount.toString());
        
        // Deployment bilgilerini kaydet
        const deploymentInfo = {
            contractName: "ZamaAdvancedVoting",
            contractAddress: contractAddress,
            owner: deployer.address,
            network: "localhost",
            deployedAt: new Date().toISOString(),
            votingCount: finalVotingCount.toString(),
            features: [
                "Çoklu seçenek desteği",
                "Şifreli oylama (FHEVM)",
                "Oy değiştirme",
                "Yetkili seçmen sistemi",
                "Otomatik bitiş",
                "Minimum oy kontrolü"
            ]
        };
        
        console.log("\n📋 Deployment Özeti:");
        console.log("==================");
        console.log("Contract:", deploymentInfo.contractName);
        console.log("Adres:", deploymentInfo.contractAddress);
        console.log("Owner:", deploymentInfo.owner);
        console.log("Network:", deploymentInfo.network);
        console.log("Özellikler:", deploymentInfo.features.join(", "));
        
        // Environment dosyası için bilgi
        console.log("\n🔧 .env dosyasına eklenecek:");
        console.log(`NEXT_PUBLIC_ZAMA_ADVANCED_CONTRACT_ADDRESS=${contractAddress}`);
        
        return {
            success: true,
            contractAddress,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("❌ Deploy hatası:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Script'i çalıştır
if (require.main === module) {
    main()
        .then((result) => {
            if (result.success) {
                console.log("\n🎉 Deploy başarıyla tamamlandı!");
                process.exit(0);
            } else {
                console.log("\n💥 Deploy başarısız!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("💥 Beklenmeyen hata:", error);
            process.exit(1);
        });
}

module.exports = main;