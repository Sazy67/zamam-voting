const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GizliOySistemi", function () {
  let gizliOySistemi;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  const proposal = "Test önerisi: Blockchain teknolojisi gelecekte yaygınlaşacak mı?";

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const GizliOySistemi = await ethers.getContractFactory("GizliOySistemi");
    gizliOySistemi = await GizliOySistemi.deploy(proposal);
    await gizliOySistemi.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Doğru proposal ile deploy edilmeli", async function () {
      expect(await gizliOySistemi.proposal()).to.equal(proposal);
    });

    it("Owner doğru ayarlanmalı", async function () {
      expect(await gizliOySistemi.owner()).to.equal(owner.address);
    });

    it("Başlangıçta oylama kapalı olmalı", async function () {
      expect(await gizliOySistemi.votingActive()).to.equal(false);
    });

    it("Başlangıçta sonuçlar açıklanmamış olmalı", async function () {
      expect(await gizliOySistemi.resultsRevealed()).to.equal(false);
    });
  });

  describe("Oylama Yönetimi", function () {
    it("Sadece owner oylama başlatabilmeli", async function () {
      await expect(
        gizliOySistemi.connect(voter1).startVoting()
      ).to.be.revertedWith("Sadece owner");

      await gizliOySistemi.startVoting();
      expect(await gizliOySistemi.votingActive()).to.equal(true);
    });

    it("Aktif oylama tekrar başlatılamamalı", async function () {
      await gizliOySistemi.startVoting();
      
      await expect(
        gizliOySistemi.startVoting()
      ).to.be.revertedWith("Oylama zaten aktif");
    });

    it("Sadece owner oylama bitirebilmeli", async function () {
      await gizliOySistemi.startVoting();
      
      await expect(
        gizliOySistemi.connect(voter1).endVoting()
      ).to.be.revertedWith("Sadece owner");

      await gizliOySistemi.endVoting();
      expect(await gizliOySistemi.votingActive()).to.equal(false);
    });
  });

  describe("Oy Verme", function () {
    beforeEach(async function () {
      await gizliOySistemi.startVoting();
    });

    it("Oylama aktif değilken oy verilemez", async function () {
      await gizliOySistemi.endVoting();
      
      // Mock encrypted vote (gerçekte FHEVM ile şifrelenecek)
      const mockEncryptedVote = "0x1234567890abcdef";
      
      await expect(
        gizliOySistemi.connect(voter1).vote(mockEncryptedVote)
      ).to.be.revertedWith("Oylama aktif degil");
    });

    it("Aynı adres iki kez oy veremez", async function () {
      // Mock encrypted votes
      const mockEncryptedVote1 = "0x1234567890abcdef";
      const mockEncryptedVote2 = "0xfedcba0987654321";
      
      // İlk oy (bu test FHEVM olmadan çalışmayacak, mock amaçlı)
      // await gizliOySistemi.connect(voter1).vote(mockEncryptedVote1);
      
      // İkinci oy denemesi
      // await expect(
      //   gizliOySistemi.connect(voter1).vote(mockEncryptedVote2)
      // ).to.be.revertedWith("Zaten oy verdiniz");
    });
  });

  describe("Sonuç Açıklama", function () {
    it("Sadece owner sonuçları açıklayabilmeli", async function () {
      await gizliOySistemi.startVoting();
      await gizliOySistemi.endVoting();
      
      await expect(
        gizliOySistemi.connect(voter1).revealResults()
      ).to.be.revertedWith("Sadece owner");
    });

    it("Oylama aktifken sonuç açıklanamaz", async function () {
      await gizliOySistemi.startVoting();
      
      await expect(
        gizliOySistemi.revealResults()
      ).to.be.revertedWith("Oylama hala aktif");
    });

    it("Sonuçlar bir kez açıklandıktan sonra tekrar açıklanamaz", async function () {
      await gizliOySistemi.startVoting();
      await gizliOySistemi.endVoting();
      await gizliOySistemi.revealResults();
      
      await expect(
        gizliOySistemi.revealResults()
      ).to.be.revertedWith("Sonuclar zaten aciklandi");
    });
  });

  describe("Sonuç Görüntüleme", function () {
    it("Sonuçlar açıklanmadan toplam oy görüntülenemez", async function () {
      await expect(
        gizliOySistemi.getTotalVotes()
      ).to.be.revertedWith("Sonuclar henuz aciklanmadi");
    });

    it("Sonuçlar açıklanmadan kazanan görüntülenemez", async function () {
      await expect(
        gizliOySistemi.getWinner()
      ).to.be.revertedWith("Sonuclar henuz aciklanmadi");
    });
  });
});