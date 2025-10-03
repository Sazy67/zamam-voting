// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ZamaVotingSimple {
    
    address public owner;
    uint256 public nextVotingId;
    
    struct Voting {
        string proposal;
        bool active;
        bool resultsRevealed;
        uint32 yesVotes;              // Şimdilik normal sayaçlar
        uint32 noVotes;               // Gelecekte şifrelenecek
        uint32 finalYesVotes;         
        uint32 finalNoVotes;          
        uint256 createdAt;
        uint256 endTime;              
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true = evet, false = hayır
        address[] voters;
    }
    
    mapping(uint256 => Voting) public votings;
    uint256[] public votingIds;
    
    // Events
    event VotingCreated(uint256 indexed votingId, string proposal, uint256 endTime);
    event VotingStarted(uint256 indexed votingId);
    event VotingEnded(uint256 indexed votingId);
    event VoteCast(uint256 indexed votingId, address indexed voter, bool voteChoice);
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
        newVoting.yesVotes = 0;
        newVoting.noVotes = 0;
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
    
    // Oy ver (şimdilik açık, gelecekte şifrelenecek)
    function vote(uint256 votingId, bool voteChoice) external 
        votingExists(votingId) 
        votingIsActive(votingId) 
        hasNotVoted(votingId) 
    {
        // Oy sayaçlarını güncelle
        if (voteChoice) {
            votings[votingId].yesVotes += 1;
        } else {
            votings[votingId].noVotes += 1;
        }
        
        votings[votingId].hasVoted[msg.sender] = true;
        votings[votingId].voteChoice[msg.sender] = voteChoice;
        votings[votingId].voters.push(msg.sender);
        
        emit VoteCast(votingId, msg.sender, voteChoice);
        
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
        
        // Sonuçları final hale getir
        votings[votingId].finalYesVotes = votings[votingId].yesVotes;
        votings[votingId].finalNoVotes = votings[votingId].noVotes;
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
    
    // Anlık oy durumunu getir (sadece owner, sonuçlar açıklanmadan önce)
    function getCurrentVotes(uint256 votingId) external view onlyOwner returns (uint32, uint32) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return (votings[votingId].yesVotes, votings[votingId].noVotes);
    }
    
    // Oylama detaylarını getir
    function getVotingDetails(uint256 votingId) external view returns (
        string memory proposal,
        bool active,
        bool resultsRevealed,
        uint32 yesVotes,
        uint32 noVotes,
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
            voting.yesVotes,
            voting.noVotes,
            voting.finalYesVotes,
            voting.finalNoVotes,
            voting.createdAt,
            voting.endTime,
            voting.voters.length
        );
    }
    
    // Belirli bir adresin oyunu getir
    function getVoteChoice(uint256 votingId, address voter) external view returns (bool) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].hasVoted[voter], "Bu adres oy vermemis");
        return votings[votingId].voteChoice[voter];
    }
    
    // Owner değiştir
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Gecersiz adres");
        owner = newOwner;
    }
}