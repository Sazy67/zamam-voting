const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Zama Voting Systems", function () {
  let zamaAdvanced;
  let zamaSimple;
  let multiVoting;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  const proposal = "Test önerisi: Blockchain teknolojisi gelecekte yaygınlaşacak mı?";
  const options = ["Evet", "Hayır", "Kararsızım"];

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy ZamaAdvancedVoting
    const ZamaAdvanced = await ethers.getContractFactory("ZamaAdvancedVoting");
    zamaAdvanced = await ZamaAdvanced.deploy();
    await zamaAdvanced.waitForDeployment();

    // Deploy ZamaSimpleVoting  
    const ZamaSimple = await ethers.getContractFactory("ZamaSimpleVoting");
    zamaSimple = await ZamaSimple.deploy();
    await zamaSimple.waitForDeployment();

    // Deploy MultiVotingSystem
    const MultiVoting = await ethers.getContractFactory("MultiVotingSystem");
    multiVoting = await MultiVoting.deploy();
    await multiVoting.waitForDeployment();
  });

  describe("ZamaAdvancedVoting - Deployment", function () {
    it("Owner doğru ayarlanmalı", async function () {
      expect(await zamaAdvanced.owner()).to.equal(owner.address);
    });

    it("Başlangıçta oylama sayısı 0 olmalı", async function () {
      expect(await zamaAdvanced.getVotingCount()).to.equal(0);
    });

    it("Owner otomatik olarak yetkili seçmen olmalı", async function () {
      expect(await zamaAdvanced.authorizedVoters(owner.address)).to.equal(true);
    });
  });

  describe("MultiVotingSystem - Deployment", function () {
    it("Owner doğru ayarlanmalı", async function () {
      expect(await multiVoting.owner()).to.equal(owner.address);
    });

    it("Başlangıçta oylama sayısı 0 olmalı", async function () {
      expect(await multiVoting.getVotingCount()).to.equal(0);
    });
  });

  describe("ZamaAdvancedVoting - Oylama Oluşturma", function () {
    it("Gelişmiş oylama oluşturulabilmeli", async function () {
      const tx = await zamaAdvanced.createAdvancedVoting(
        proposal,
        options,
        24, // 24 saat
        0,  // Min votes
        false, // Requires min votes
        true   // Allow revote
      );
      
      await tx.wait();
      expect(await zamaAdvanced.getVotingCount()).to.equal(1);
    });

    it("Basit oylama oluşturulabilmeli", async function () {
      const tx = await zamaAdvanced.createSimpleVoting(proposal, 12);
      await tx.wait();
      
      expect(await zamaAdvanced.getVotingCount()).to.equal(1);
      
      const votingInfo = await zamaAdvanced.getVotingInfo(0);
      expect(votingInfo[0]).to.equal(proposal); // proposal
      expect(votingInfo[1]).to.deep.equal(["EVET", "HAYIR"]); // options
    });

    it("Sadece owner oylama oluşturabilmeli", async function () {
      await expect(
        zamaAdvanced.connect(voter1).createSimpleVoting(proposal, 24)
      ).to.be.revertedWith("Sadece owner");
    });

    it("Geçersiz seçenek sayısı reddedilmeli", async function () {
      await expect(
        zamaAdvanced.createAdvancedVoting(proposal, ["Tek seçenek"], 24, 0, false, false)
      ).to.be.revertedWith("En az 2 secenek gerekli");
      
      const tooManyOptions = Array(11).fill().map((_, i) => `Seçenek ${i + 1}`);
      await expect(
        zamaAdvanced.createAdvancedVoting(proposal, tooManyOptions, 24, 0, false, false)
      ).to.be.revertedWith("En fazla 10 secenek");
    });
  });

  describe("ZamaAdvancedVoting - Seçmen Yönetimi", function () {
    it("Owner seçmen yetkilendirebilmeli", async function () {
      await zamaAdvanced.authorizeVoter(voter1.address);
      expect(await zamaAdvanced.authorizedVoters(voter1.address)).to.equal(true);
    });

    it("Toplu seçmen yetkilendirme çalışmalı", async function () {
      const voters = [voter1.address, voter2.address, voter3.address];
      await zamaAdvanced.authorizeMultipleVoters(voters);
      
      for (const voter of voters) {
        expect(await zamaAdvanced.authorizedVoters(voter)).to.equal(true);
      }
    });

    it("Sadece owner seçmen yetkilendirebilmeli", async function () {
      await expect(
        zamaAdvanced.connect(voter1).authorizeVoter(voter2.address)
      ).to.be.revertedWith("Sadece owner");
    });

    it("Seçmen yetkisi iptal edilebilmeli", async function () {
      await zamaAdvanced.authorizeVoter(voter1.address);
      expect(await zamaAdvanced.authorizedVoters(voter1.address)).to.equal(true);
      
      await zamaAdvanced.revokeVoter(voter1.address);
      expect(await zamaAdvanced.authorizedVoters(voter1.address)).to.equal(false);
    });
  });

  describe("ZamaAdvancedVoting - Oylama Yönetimi", function () {
    let votingId;
    
    beforeEach(async function () {
      const tx = await zamaAdvanced.createSimpleVoting(proposal, 24);
      await tx.wait();
      votingId = 0;
      
      // Seçmenleri yetkilendir
      await zamaAdvanced.authorizeVoter(voter1.address);
      await zamaAdvanced.authorizeVoter(voter2.address);
    });

    it("Sadece owner oylama başlatabilmeli", async function () {
      await expect(
        zamaAdvanced.connect(voter1).startVoting(votingId)
      ).to.be.revertedWith("Sadece owner");

      await zamaAdvanced.startVoting(votingId);
      const votingInfo = await zamaAdvanced.getVotingInfo(votingId);
      expect(votingInfo[2]).to.equal(true); // active
    });

    it("Aktif oylama tekrar başlatılamamalı", async function () {
      await zamaAdvanced.startVoting(votingId);
      
      await expect(
        zamaAdvanced.startVoting(votingId)
      ).to.be.revertedWith("Oylama zaten aktif");
    });

    it("Sadece owner oylama bitirebilmeli", async function () {
      await zamaAdvanced.startVoting(votingId);
      
      await expect(
        zamaAdvanced.connect(voter1).endVoting(votingId)
      ).to.be.revertedWith("Sadece owner");

      await zamaAdvanced.endVoting(votingId);
      const votingInfo = await zamaAdvanced.getVotingInfo(votingId);
      expect(votingInfo[2]).to.equal(false); // active
    });
  });

  describe("ZamaAdvancedVoting - Sonuç Yönetimi", function () {
    let votingId;
    
    beforeEach(async function () {
      const tx = await zamaAdvanced.createSimpleVoting(proposal, 24);
      await tx.wait();
      votingId = 0;
      
      await zamaAdvanced.authorizeVoter(voter1.address);
      await zamaAdvanced.startVoting(votingId);
    });

    it("Sadece owner sonuçları açıklayabilmeli", async function () {
      await zamaAdvanced.endVoting(votingId);
      
      await expect(
        zamaAdvanced.connect(voter1).revealResults(votingId)
      ).to.be.revertedWith("Sadece owner");
    });

    it("Oylama aktifken sonuç açıklanamaz", async function () {
      await expect(
        zamaAdvanced.revealResults(votingId)
      ).to.be.revertedWith("Oylama hala aktif");
    });

    it("Sonuçlar bir kez açıklandıktan sonra tekrar açıklanamaz", async function () {
      await zamaAdvanced.endVoting(votingId);
      await zamaAdvanced.revealResults(votingId);
      
      await expect(
        zamaAdvanced.revealResults(votingId)
      ).to.be.revertedWith("Sonuclar zaten aciklandi");
    });
  });

  describe("MultiVotingSystem - Temel Fonksiyonlar", function () {
    it("Oylama oluşturulabilmeli", async function () {
      const tx = await multiVoting.createVoting(proposal);
      await tx.wait();
      
      expect(await multiVoting.getVotingCount()).to.equal(1);
    });

    it("Sadece owner oylama oluşturabilmeli", async function () {
      await expect(
        multiVoting.connect(voter1).createVoting(proposal)
      ).to.be.revertedWith("Sadece owner");
    });
  });

  describe("Utility Functions", function () {
    it("Zaman hesaplamaları doğru çalışmalı", async function () {
      const tx = await zamaAdvanced.createSimpleVoting(proposal, 24);
      await tx.wait();
      
      const timeRemaining = await zamaAdvanced.getTimeRemaining(0);
      expect(Number(timeRemaining)).to.be.greaterThan(0);
      
      const isExpired = await zamaAdvanced.isVotingExpired(0);
      expect(isExpired).to.equal(false);
    });

    it("Oylama bilgileri doğru döndürülmeli", async function () {
      const tx = await zamaAdvanced.createAdvancedVoting(
        proposal,
        options,
        24,
        0,
        false,
        true
      );
      await tx.wait();
      
      const votingOptions = await zamaAdvanced.getVotingOptions(0);
      expect(votingOptions).to.deep.equal(options);
      
      const votingInfo = await zamaAdvanced.getVotingInfo(0);
      expect(votingInfo[0]).to.equal(proposal);
      expect(votingInfo[1]).to.deep.equal(options);
    });
  });
});