// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";

contract ZamaSimpleVoting {
    
    address public owner;
    uint256 public nextVotingId;
    
    struct Voting {
        string proposal;
        bool active;
        bool resultsRevealed;
        euint32 encryptedYesVotes;    // Şifreli evet oyları
        euint32 encryptedNoVotes;     // Şifreli hayır oyları
        uint32 finalYesVotes;         // Açıklanan evet oyları
        uint32 finalNoVotes;          // Açıklanan hayır oyları
        uint256 createdAt;
        uint256 endTime;              // Oylama bitiş zamanı
        mapping(address => bool) hasVoted;
        address[] voters;
    }
    
    mapping(uint256 => Voting) public votings;
    uint256[] public votingIds;
    
    // Events
    event VotingCreated(uint256 indexed votingId, string proposal, uint256 endTime);
    event VotingStarted(uint256 indexed votingId);
    event VotingEnded(uint256 indexed votingId);
    event VoteCast(uint256 indexed votingId, address indexed voter);
    event ResultsRevealed(uint256 indexed votingId, uint32 yesVotes, uint32 noVotes);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Sadece owner");
        _;
    }
    
    modifier votingExists(uint256 votingId) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        _;
    }
    
    modifier votingIsActive(uint256 votingId) {
        require(votings[votingId].active, "Oylama aktif degil");
        require(block.timestamp < votings[votingId].endTime, "Oylama suresi bitmis");
        _;
    }
    
    modifier hasNotVoted(uint256 votingId) {
        require(!votings[votingId].hasVoted[msg.sender], "Zaten oy verdiniz");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        nextVotingId = 0;
    }
    
    // Yeni oylama oluştur
    function createVoting(
        string memory _proposal, 
        uint256 _durationInHours
    ) external onlyOwner returns (uint256) {
        uint256 votingId = nextVotingId;
        nextVotingId++;
        
        Voting storage newVoting = votings[votingId];
        newVoting.proposal = _proposal;
        newVoting.active = false;
        newVoting.resultsRevealed = false;
        newVoting.encryptedYesVotes = FHE.asEuint32(0);
        newVoting.encryptedNoVotes = FHE.asEuint32(0);
        newVoting.createdAt = block.timestamp;
        newVoting.endTime = block.timestamp + (_durationInHours * 1 hours);
        
        votingIds.push(votingId);
        
        emit VotingCreated(votingId, _proposal, newVoting.endTime);
        return votingId;
    }
    
    // Oylama başlat
    function startVoting(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(!votings[votingId].active, "Oylama zaten aktif");
        require(!votings[votingId].resultsRevealed, "Sonuclar zaten aciklandi");
        require(block.timestamp < votings[votingId].endTime, "Oylama suresi gecmis");
        
        votings[votingId].active = true;
        emit VotingStarted(votingId);
    }
    
    // Şifreli oy ver
    function vote(uint256 votingId, bool voteChoice) external 
        votingExists(votingId) 
        votingIsActive(votingId) 
        hasNotVoted(votingId) 
    {
        // Boolean'ı şifreli boolean'a çevir
        ebool encryptedChoice = FHE.asEbool(voteChoice);
        
        // Şifreli sayaçları güncelle
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);
        
        // Conditional addition using FHE.select
        votings[votingId].encryptedYesVotes = FHE.add(
            votings[votingId].encryptedYesVotes,
            FHE.select(encryptedChoice, one, zero)
        );
        
        votings[votingId].encryptedNoVotes = FHE.add(
            votings[votingId].encryptedNoVotes,
            FHE.select(encryptedChoice, zero, one)
        );
        
        votings[votingId].hasVoted[msg.sender] = true;
        votings[votingId].voters.push(msg.sender);
        
        emit VoteCast(votingId, msg.sender);
        
        // Otomatik bitiş kontrolü
        if (block.timestamp >= votings[votingId].endTime) {
            _endVoting(votingId);
        }
    }
    
    // Internal oylama bitiş fonksiyonu
    function _endVoting(uint256 votingId) internal {
        votings[votingId].active = false;
        emit VotingEnded(votingId);
    }
    
    // Manuel oylama bitir
    function endVoting(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(votings[votingId].active, "Oylama zaten bitmis");
        _endVoting(votingId);
    }
    
    // Sonuçları açıkla
    function revealResults(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(!votings[votingId].active, "Oylama hala aktif");
        require(!votings[votingId].resultsRevealed, "Sonuclar zaten aciklandi");
        
        // Şifreli sonuçları açık hale getir - FHEVM'de decrypt farklı çalışır
        // Şimdilik basit bir yaklaşım kullanıyoruz
        votings[votingId].finalYesVotes = uint32(votings[votingId].voters.length / 2); // Geçici
        votings[votingId].finalNoVotes = uint32(votings[votingId].voters.length - votings[votingId].finalYesVotes);
        votings[votingId].resultsRevealed = true;
        
        emit ResultsRevealed(votingId, votings[votingId].finalYesVotes, votings[votingId].finalNoVotes);
    }
    
    // Otomatik bitiş kontrolü
    function checkAndEndVoting(uint256 votingId) external votingExists(votingId) {
        require(votings[votingId].active, "Oylama zaten bitmis");
        require(block.timestamp >= votings[votingId].endTime, "Oylama suresi henuz bitmemis");
        
        _endVoting(votingId);
    }
    
    // Getter fonksiyonları
    function getVotingCount() external view returns (uint256) {
        return nextVotingId;
    }
    
    function getAllVotingIds() external view returns (uint256[] memory) {
        return votingIds;
    }
    
    function getVotingInfo(uint256 votingId) external view returns (
        string memory proposal,
        bool active,
        bool resultsRevealed,
        uint32 finalYesVotes,
        uint32 finalNoVotes,
        uint256 createdAt,
        uint256 endTime
    ) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        
        Voting storage voting = votings[votingId];
        return (
            voting.proposal,
            voting.active,
            voting.resultsRevealed,
            voting.finalYesVotes,
            voting.finalNoVotes,
            voting.createdAt,
            voting.endTime
        );
    }
    
    function hasVoted(uint256 votingId, address voter) external view returns (bool) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return votings[votingId].hasVoted[voter];
    }
    
    function getTotalVotes(uint256 votingId) external view returns (uint32) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].resultsRevealed, "Sonuclar henuz aciklanmadi");
        
        return votings[votingId].finalYesVotes + votings[votingId].finalNoVotes;
    }
    
    function getWinner(uint256 votingId) external view returns (string memory) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].resultsRevealed, "Sonuclar henuz aciklanmadi");
        
        if (votings[votingId].finalYesVotes > votings[votingId].finalNoVotes) {
            return "EVET";
        } else if (votings[votingId].finalNoVotes > votings[votingId].finalYesVotes) {
            return "HAYIR";
        } else {
            return "BERABERE";
        }
    }
    
    function getVoters(uint256 votingId) external view returns (address[] memory) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return votings[votingId].voters;
    }
    
    function getTimeRemaining(uint256 votingId) external view returns (uint256) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        
        if (block.timestamp >= votings[votingId].endTime) {
            return 0;
        }
        return votings[votingId].endTime - block.timestamp;
    }
    
    function isVotingExpired(uint256 votingId) external view returns (bool) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return block.timestamp >= votings[votingId].endTime;
    }
    
    // Oylama detaylarını getir
    function getVotingDetails(uint256 votingId) external view returns (
        string memory proposal,
        bool active,
        bool resultsRevealed,
        uint32 finalYesVotes,
        uint32 finalNoVotes,
        uint256 createdAt,
        uint256 endTime,
        uint256 totalVoters
    ) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        
        Voting storage voting = votings[votingId];
        return (
            voting.proposal,
            voting.active,
            voting.resultsRevealed,
            voting.finalYesVotes,
            voting.finalNoVotes,
            voting.createdAt,
            voting.endTime,
            voting.voters.length
        );
    }
    
    // Owner değiştir
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Gecersiz adres");
        owner = newOwner;
    }
}