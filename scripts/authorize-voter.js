const { ethers } = require("hardhat");

async function main() {
    console.log("🔑 Kullanıcıya oy verme yetkisi veriliyor...");
    
    const contractAddress = "0xE2DAE8F0F9Cfa1726B21097c71c9EA9a76E1714f";
    const [signer] = await ethers.getSigners();
    console.log("📝 Signer adresi:", signer.address);
    
    // Yetki verilecek adres (kendi adresin)
    const voterAddress = "0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5";
    
    try {
        const contract = await ethers.getContractAt("SimpleVoting", contractAddress);
        
        console.log("🔍 Mevcut yetki durumu kontrol ediliyor...");
        const canVote = await contract.canVoteInVoting(0, voterAddress);
        console.log("Şu anki oy verme yetkisi:", canVote);
        
        if (!canVote) {
            console.log("⚡ Yetki veriliyor...");
            const tx = await contract.authorizeVoter(voterAddress);
            await tx.wait();
            console.log("✅ Yetki verildi!");
            
            // Tekrar kontrol et
            const newCanVote = await contract.canVoteInVoting(0, voterAddress);
            console.log("Yeni oy verme yetkisi:", newCanVote);
        } else {
            console.log("✅ Kullanıcı zaten yetkili!");
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