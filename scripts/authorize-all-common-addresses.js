const { ethers } = require("hardhat");

async function main() {
    console.log("🔑 Yaygın kullanılan adreslere oy verme yetkisi veriliyor...");
    
    const contractAddress = "0xE2DAE8F0F9Cfa1726B21097c71c9EA9a76E1714f";
    const [signer] = await ethers.getSigners();
    console.log("📝 Signer adresi:", signer.address);
    
    // Yaygın test adresleri
    const addresses = [
        "0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5", // Mevcut owner
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat default #0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat default #1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat default #2
    ];
    
    try {
        const contract = await ethers.getContractAt("SimpleVoting", contractAddress);
        
        for (const address of addresses) {
            try {
                console.log(`\n🔍 ${address} için kontrol ediliyor...`);
                const canVote = await contract.canVoteInVoting(0, address);
                console.log(`Mevcut yetki: ${canVote}`);
                
                if (!canVote) {
                    console.log("⚡ Yetki veriliyor...");
                    const tx = await contract.authorizeVoter(address);
                    await tx.wait();
                    console.log("✅ Yetki verildi!");
                } else {
                    console.log("✅ Zaten yetkili!");
                }
            } catch (error) {
                console.log(`❌ ${address} için hata:`, error.message);
            }
        }
        
        console.log("\n🎉 Tüm adresler kontrol edildi!");
        
    } catch (error) {
        console.error("❌ Genel hata:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });