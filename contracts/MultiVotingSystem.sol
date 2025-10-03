// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MultiVotingSystem {
    
    address public owner;
    uint256 public nextVotingId;
    
    struct Voting {
        string proposal;
        bool active;
        bool resultsRevealed;
        uint32 yesVotes;
        uint32 noVotes;
        uint32 finalYesVotes;
        uint32 finalNoVotes;
        uint256 createdAt;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true = evet, false = hayır
        address[] voters; // oy veren adreslerin listesi
    }
    
    mapping(uint256 => Voting) public votings;
    uint256[] public votingIds;
    
    event VotingCreated(uint256 indexed votingId, string proposal);
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
    function createVoting(string memory _proposal) external onlyOwner returns (uint256) {
        uint256 votingId = nextVotingId;
        nextVotingId++;
        
        Voting storage newVoting = votings[votingId];
        newVoting.proposal = _proposal;
        newVoting.active = false;
        newVoting.resultsRevealed = false;
        newVoting.yesVotes = 0;
        newVoting.noVotes = 0;
        newVoting.createdAt = block.timestamp;
        
        votingIds.push(votingId);
        
        emit VotingCreated(votingId, _proposal);
        return votingId;
    }
    
    // Oylama başlat
    function startVoting(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(!votings[votingId].active, "Oylama zaten aktif");
        require(!votings[votingId].resultsRevealed, "Sonuclar zaten aciklandi");
        
        votings[votingId].active = true;
        emit VotingStarted(votingId);
    }
    
    // Oy ver
    function vote(uint256 votingId, bool voteChoice) external 
        votingExists(votingId) 
        votingIsActive(votingId) 
        hasNotVoted(votingId) 
    {
        if (voteChoice) {
            votings[votingId].yesVotes += 1;
        } else {
            votings[votingId].noVotes += 1;
        }
        
        votings[votingId].hasVoted[msg.sender] = true;
        votings[votingId].voteChoice[msg.sender] = voteChoice;
        votings[votingId].voters.push(msg.sender);
        
        emit VoteCast(votingId, msg.sender);
    }
    
    // Oylama bitir
    function endVoting(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(votings[votingId].active, "Oylama zaten bitmis");
        
        votings[votingId].active = false;
        emit VotingEnded(votingId);
    }
    
    // Sonuçları açıkla
    function revealResults(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(!votings[votingId].active, "Oylama hala aktif");
        require(!votings[votingId].resultsRevealed, "Sonuclar zaten aciklandi");
        
        votings[votingId].finalYesVotes = votings[votingId].yesVotes;
        votings[votingId].finalNoVotes = votings[votingId].noVotes;
        votings[votingId].resultsRevealed = true;
        
        emit ResultsRevealed(votingId, votings[votingId].finalYesVotes, votings[votingId].finalNoVotes);
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
        uint256 createdAt
    ) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        
        Voting storage voting = votings[votingId];
        return (
            voting.proposal,
            voting.active,
            voting.resultsRevealed,
            voting.finalYesVotes,
            voting.finalNoVotes,
            voting.createdAt
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
    
    // Oy veren adresleri getir
    function getVoters(uint256 votingId) external view returns (address[] memory) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return votings[votingId].voters;
    }
    
    // Belirli bir adresin oyunu getir
    function getVoteChoice(uint256 votingId, address voter) external view returns (bool) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].hasVoted[voter], "Bu adres oy vermemis");
        return votings[votingId].voteChoice[voter];
    }
    
    // Oylama detaylarını getir (admin için)
    function getVotingDetails(uint256 votingId) external view returns (
        string memory proposal,
        bool active,
        bool resultsRevealed,
        uint32 yesVotes,
        uint32 noVotes,
        uint32 finalYesVotes,
        uint32 finalNoVotes,
        uint256 createdAt,
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
            voting.voters.length
        );
    }
}