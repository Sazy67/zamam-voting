const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Sepolia testnet'e SimpleVoting contract deploy ediliyor...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer adresi:", deployer.address);
    
    // Balance kontrolü
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️  Uyarı: Balance düşük. Sepolia ETH gerekebilir.");
        console.log("🔗 Sepolia faucet: https://sepoliafaucet.com/");
    }
    
    try {
        // Contract deploy et
        const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
        console.log("Contract factory hazırlandı...");
        
        const contract = await SimpleVoting.deploy();
        console.log("Deploy transaction gönderildi...");
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log("✅ Contract başarıyla deploy edildi!");
        console.log("📍 Contract adresi:", contractAddress);
        console.log("👤 Owner adresi:", deployer.address);
        console.log("🌐 Network: Sepolia Testnet");
        console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
        
        // Contract bilgilerini doğrula
        console.log("\n🔍 Contract doğrulanıyor...");
        const owner = await contract.owner();
        const votingCount = await contract.getVotingCount();
        
        console.log("Contract owner:", owner);
        console.log("Voting count:", votingCount.toString());
        console.log("Owner doğru mu:", owner.toLowerCase() === deployer.address.toLowerCase());
        
        // .env.local dosyasını güncelle
        console.log("\n📝 .env.local dosyası güncelleniyor...");
        console.log("Yeni contract adresi .env.local dosyasına eklenecek:");
        console.log(`NEXT_PUBLIC_ZAMA_CONTRACT_ADDRESS="${contractAddress}"`);
        
        return {
            contractAddress,
            owner: deployer.address,
            network: "sepolia"
        };
        
    } catch (error) {
        console.error("❌ Deploy hatası:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Çözüm önerileri:");
            console.log("1. Sepolia ETH alın: https://sepoliafaucet.com/");
            console.log("2. Alchemy Sepolia faucet: https://sepoliafaucet.com/");
            console.log("3. Chainlink faucet: https://faucets.chain.link/sepolia");
        }
        
        throw error;
    }
}

main()
    .then((result) => {
        console.log("\n🎉 Deploy tamamlandı!");
        console.log("Contract adresi:", result.contractAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deploy başarısız:", error);
        process.exit(1);
    });