const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Simple Voting Deploy Başlıyor...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deployer adresi:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Deployer bakiyesi:", ethers.formatEther(balance), "ETH");
    
    const network = await deployer.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
    
    try {
        console.log("\n📦 SimpleVoting contract'ı deploy ediliyor...");
        const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
        const simpleVoting = await SimpleVoting.deploy();
        
        await simpleVoting.waitForDeployment();
        const contractAddress = await simpleVoting.getAddress();
        
        console.log("✅ SimpleVoting deploy edildi!");
        console.log("📍 Contract adresi:", contractAddress);
        
        // Contract bilgilerini doğrula
        console.log("\n🔍 Contract doğrulaması yapılıyor...");
        const owner = await simpleVoting.owner();
        const votingCount = await simpleVoting.getVotingCount();
        
        console.log("✅ Owner:", owner);
        console.log("✅ Voting Count:", votingCount.toString());
        
        // Test oylaması oluştur
        console.log("\n🗳️ Test oylaması oluşturuluyor...");
        const proposal = "Test Oylaması: Blockchain teknolojisi gelecekte yaygınlaşacak mı?";
        const options = ["Evet", "Hayır", "Kararsızım"];
        const duration = 24; // 24 saat
        
        const tx = await simpleVoting.createVoting(proposal, options, duration);
        await tx.wait();
        
        console.log("✅ Test oylaması oluşturuldu!");
        
        // Oylama bilgilerini kontrol et
        const newVotingCount = await simpleVoting.getVotingCount();
        console.log("📊 Yeni voting count:", newVotingCount.toString());
        
        if (newVotingCount > 0) {
            const votingInfo = await simpleVoting.getVotingInfo(0);
            console.log("\n🗳️ Oluşturulan Oylama:");
            console.log("ID: 0");
            console.log("Başlık:", votingInfo[0]);
            console.log("Seçenekler:", votingInfo[1]);
            console.log("Aktif:", votingInfo[2]);
            console.log("Bitiş zamanı:", new Date(Number(votingInfo[6]) * 1000).toLocaleString());
        }
        
        console.log("\n🎉 Deploy ve test başarılı!");
        console.log("📋 Contract Bilgileri:");
        console.log("Adres:", contractAddress);
        console.log("Owner:", owner);
        console.log("Network:", network.name);
        
    } catch (error) {
        console.error("❌ Deploy hatası:", error.message);
        console.log("\n💥 Deploy başarısız!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });