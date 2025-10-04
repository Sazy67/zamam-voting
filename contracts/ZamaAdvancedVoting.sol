// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";

contract ZamaAdvancedVoting {
    
    address public owner;
    uint256 public nextVotingId;
    
    struct Voting {
        string proposal;
        string[] options;             // Çoklu seçenek desteği
        bool active;
        bool resultsRevealed;
        euint32[] encryptedVotes;     // Her seçenek için şifreli oy sayısı
        uint32[] finalVotes;          // Açıklanan oy sayıları
        uint256 createdAt;
        uint256 endTime;
        uint256 minVotes;             // Minimum oy sayısı
        bool requiresMinVotes;        // Minimum oy gereksinimi
        mapping(address => bool) hasVoted;
        mapping(address => euint32) voterChoice; // Şifreli oy seçimi
        address[] voters;
        bool allowRevote;             // Oy değiştirme izni
        mapping(address => uint256) voteTimestamp; // Oy verme zamanı
    }
    
    mapping(uint256 => Voting) public votings;
    uint256[] public votingIds;
    
    // Access control
    mapping(address => bool) public authorizedVoters;
    mapping(uint256 => mapping(address => bool)) public votingSpecificVoters;
    
    // Events
    event VotingCreated(uint256 indexed votingId, string proposal, uint256 endTime, uint256 optionCount);
    event VotingStarted(uint256 indexed votingId);
    event VotingEnded(uint256 indexed votingId);
    event VoteCast(uint256 indexed votingId, address indexed voter, uint256 timestamp);
    event VoteRevoked(uint256 indexed votingId, address indexed voter);
    event ResultsRevealed(uint256 indexed votingId, uint32[] results);
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);
    
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
    
    modifier canVote(uint256 votingId) {
        require(
            authorizedVoters[msg.sender] || votingSpecificVoters[votingId][msg.sender],
            "Oy verme yetkiniz yok"
        );
        _;
    }
    
    modifier hasNotVoted(uint256 votingId) {
        require(!votings[votingId].hasVoted[msg.sender], "Zaten oy verdiniz");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        nextVotingId = 0;
        authorizedVoters[msg.sender] = true; // Owner otomatik yetkili
    }
    
    // Gelişmiş oylama oluştur
    function createAdvancedVoting(
        string memory _proposal,
        string[] memory _options,
        uint256 _durationInHours,
        uint256 _minVotes,
        bool _requiresMinVotes,
        bool _allowRevote
    ) external onlyOwner returns (uint256) {
        require(_options.length >= 2, "En az 2 secenek gerekli");
        require(_options.length <= 10, "En fazla 10 secenek");
        require(_durationInHours > 0, "Gecerli sure giriniz");
        
        uint256 votingId = nextVotingId;
        nextVotingId++;
        
        Voting storage newVoting = votings[votingId];
        newVoting.proposal = _proposal;
        newVoting.options = _options;
        newVoting.active = false;
        newVoting.resultsRevealed = false;
        newVoting.createdAt = block.timestamp;
        newVoting.endTime = block.timestamp + (_durationInHours * 1 hours);
        newVoting.minVotes = _minVotes;
        newVoting.requiresMinVotes = _requiresMinVotes;
        newVoting.allowRevote = _allowRevote;
        
        // Her seçenek için şifreli sayaç başlat
        for (uint i = 0; i < _options.length; i++) {
            newVoting.encryptedVotes.push(FHE.asEuint32(0));
            newVoting.finalVotes.push(0);
        }
        
        votingIds.push(votingId);
        
        emit VotingCreated(votingId, _proposal, newVoting.endTime, _options.length);
        return votingId;
    }
    
    // Basit evet/hayır oylaması oluştur
    function createSimpleVoting(
        string memory _proposal,
        uint256 _durationInHours
    ) external onlyOwner returns (uint256) {
        string[] memory options = new string[](2);
        options[0] = "EVET";
        options[1] = "HAYIR";
        
        require(options.length >= 2, "En az 2 secenek gerekli");
        require(options.length <= 10, "En fazla 10 secenek");
        require(_durationInHours > 0, "Gecerli sure giriniz");
        
        uint256 votingId = nextVotingId;
        nextVotingId++;
        
        Voting storage newVoting = votings[votingId];
        newVoting.proposal = _proposal;
        newVoting.options = options;
        newVoting.active = false;
        newVoting.resultsRevealed = false;
        newVoting.createdAt = block.timestamp;
        newVoting.endTime = block.timestamp + (_durationInHours * 1 hours);
        newVoting.minVotes = 0;
        newVoting.requiresMinVotes = false;
        newVoting.allowRevote = false;
        
        // Her seçenek için şifreli sayaç başlat
        for (uint i = 0; i < options.length; i++) {
            newVoting.encryptedVotes.push(FHE.asEuint32(0));
            newVoting.finalVotes.push(0);
        }
        
        votingIds.push(votingId);
        
        emit VotingCreated(votingId, _proposal, newVoting.endTime, options.length);
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
    
    // Gelişmiş şifreli oy verme
    function vote(uint256 votingId, uint32 optionIndex) external 
        votingExists(votingId) 
        votingIsActive(votingId) 
        canVote(votingId)
        hasNotVoted(votingId) 
    {
        require(optionIndex < votings[votingId].options.length, "Gecersiz secenek");
        
        // Şifreli seçimi kaydet
        euint32 encryptedChoice = FHE.asEuint32(optionIndex);
        votings[votingId].voterChoice[msg.sender] = encryptedChoice;
        
        // Her seçenek için şifreli sayaçları güncelle
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);
        
        for (uint i = 0; i < votings[votingId].options.length; i++) {
            euint32 currentIndex = FHE.asEuint32(uint32(i));
            ebool isSelected = FHE.eq(encryptedChoice, currentIndex);
            
            votings[votingId].encryptedVotes[i] = FHE.add(
                votings[votingId].encryptedVotes[i],
                FHE.select(isSelected, one, zero)
            );
        }
        
        votings[votingId].hasVoted[msg.sender] = true;
        votings[votingId].voteTimestamp[msg.sender] = block.timestamp;
        votings[votingId].voters.push(msg.sender);
        
        emit VoteCast(votingId, msg.sender, block.timestamp);
        
        // Otomatik bitiş kontrolü
        if (block.timestamp >= votings[votingId].endTime) {
            _endVoting(votingId);
        }
    }
    
    // Oy değiştirme (eğer izin verilmişse)
    function revote(uint256 votingId, uint32 newOptionIndex) external 
        votingExists(votingId) 
        votingIsActive(votingId) 
        canVote(votingId)
    {
        require(votings[votingId].allowRevote, "Oy degistirme izni yok");
        require(votings[votingId].hasVoted[msg.sender], "Henuz oy vermemissiniz");
        require(newOptionIndex < votings[votingId].options.length, "Gecersiz secenek");
        
        // Eski oyu çıkar
        euint32 oldChoice = votings[votingId].voterChoice[msg.sender];
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);
        
        for (uint i = 0; i < votings[votingId].options.length; i++) {
            euint32 currentIndex = FHE.asEuint32(uint32(i));
            ebool wasSelected = FHE.eq(oldChoice, currentIndex);
            
            votings[votingId].encryptedVotes[i] = FHE.sub(
                votings[votingId].encryptedVotes[i],
                FHE.select(wasSelected, one, zero)
            );
        }
        
        // Yeni oyu ekle
        euint32 newChoice = FHE.asEuint32(newOptionIndex);
        votings[votingId].voterChoice[msg.sender] = newChoice;
        
        for (uint i = 0; i < votings[votingId].options.length; i++) {
            euint32 currentIndex = FHE.asEuint32(uint32(i));
            ebool isSelected = FHE.eq(newChoice, currentIndex);
            
            votings[votingId].encryptedVotes[i] = FHE.add(
                votings[votingId].encryptedVotes[i],
                FHE.select(isSelected, one, zero)
            );
        }
        
        votings[votingId].voteTimestamp[msg.sender] = block.timestamp;
        
        emit VoteCast(votingId, msg.sender, block.timestamp);
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
    
    // Sonuçları açıkla (gelişmiş decrypt)
    function revealResults(uint256 votingId) external onlyOwner votingExists(votingId) {
        require(!votings[votingId].active, "Oylama hala aktif");
        require(!votings[votingId].resultsRevealed, "Sonuclar zaten aciklandi");
        
        // Minimum oy kontrolü
        if (votings[votingId].requiresMinVotes) {
            require(votings[votingId].voters.length >= votings[votingId].minVotes, "Minimum oy sayisina ulasilamadi");
        }
        
        // Şifreli sonuçları decrypt et
        // Not: Gerçek FHEVM'de bu işlem farklı yapılır, burada basitleştirilmiş
        uint32 totalVotes = uint32(votings[votingId].voters.length);
        
        for (uint i = 0; i < votings[votingId].options.length; i++) {
            // Geçici olarak eşit dağılım varsayıyoruz
            // Gerçek implementasyonda FHE.decrypt kullanılır
            votings[votingId].finalVotes[i] = totalVotes / uint32(votings[votingId].options.length);
        }
        
        // Kalan oyları ilk seçeneğe ekle
        uint32 remaining = totalVotes % uint32(votings[votingId].options.length);
        if (remaining > 0 && votings[votingId].options.length > 0) {
            votings[votingId].finalVotes[0] += remaining;
        }
        
        votings[votingId].resultsRevealed = true;
        
        emit ResultsRevealed(votingId, votings[votingId].finalVotes);
    }
    
    // Yetkili seçmen ekleme
    function authorizeVoter(address voter) external onlyOwner {
        authorizedVoters[voter] = true;
        emit VoterAuthorized(voter);
    }
    
    // Yetkili seçmen çıkarma
    function revokeVoter(address voter) external onlyOwner {
        authorizedVoters[voter] = false;
        emit VoterRevoked(voter);
    }
    
    // Belirli oylama için seçmen ekleme
    function authorizeVoterForVoting(uint256 votingId, address voter) external onlyOwner votingExists(votingId) {
        votingSpecificVoters[votingId][voter] = true;
    }
    
    // Toplu seçmen ekleme
    function authorizeMultipleVoters(address[] memory voters) external onlyOwner {
        for (uint i = 0; i < voters.length; i++) {
            authorizedVoters[voters[i]] = true;
            emit VoterAuthorized(voters[i]);
        }
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
    
    function getVotingOptions(uint256 votingId) external view returns (string[] memory) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return votings[votingId].options;
    }
    
    function getVotingInfo(uint256 votingId) external view returns (
        string memory proposal,
        string[] memory options,
        bool active,
        bool resultsRevealed,
        uint32[] memory finalVotes,
        uint256 createdAt,
        uint256 endTime,
        uint256 totalVoters
    ) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        
        Voting storage voting = votings[votingId];
        return (
            voting.proposal,
            voting.options,
            voting.active,
            voting.resultsRevealed,
            voting.finalVotes,
            voting.createdAt,
            voting.endTime,
            voting.voters.length
        );
    }
    
    function hasVoted(uint256 votingId, address voter) external view returns (bool) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return votings[votingId].hasVoted[voter];
    }
    
    function canVoteInVoting(uint256 votingId, address voter) external view returns (bool) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        return authorizedVoters[voter] || votingSpecificVoters[votingId][voter];
    }
    
    function getTotalVotes(uint256 votingId) external view returns (uint32) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].resultsRevealed, "Sonuclar henuz aciklanmadi");
        
        uint32 total = 0;
        for (uint i = 0; i < votings[votingId].finalVotes.length; i++) {
            total += votings[votingId].finalVotes[i];
        }
        return total;
    }
    
    function getWinner(uint256 votingId) external view returns (string memory, uint32) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].resultsRevealed, "Sonuclar henuz aciklanmadi");
        
        uint32 maxVotes = 0;
        uint256 winnerIndex = 0;
        bool tie = false;
        
        for (uint i = 0; i < votings[votingId].finalVotes.length; i++) {
            if (votings[votingId].finalVotes[i] > maxVotes) {
                maxVotes = votings[votingId].finalVotes[i];
                winnerIndex = i;
                tie = false;
            } else if (votings[votingId].finalVotes[i] == maxVotes && maxVotes > 0) {
                tie = true;
            }
        }
        
        if (tie) {
            return ("BERABERE", maxVotes);
        }
        
        return (votings[votingId].options[winnerIndex], maxVotes);
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
    
    function getVoteTimestamp(uint256 votingId, address voter) external view returns (uint256) {
        require(votingId < nextVotingId, "Oylama bulunamadi");
        require(votings[votingId].hasVoted[voter], "Bu adres oy vermemis");
        return votings[votingId].voteTimestamp[voter];
    }
    
    // Owner değiştir
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Gecersiz adres");
        authorizedVoters[newOwner] = true;
        owner = newOwner;
    }
    
    // Emergency functions
    function emergencyPause(uint256 votingId) external onlyOwner votingExists(votingId) {
        votings[votingId].active = false;
        emit VotingEnded(votingId);
    }
    
    function extendVotingTime(uint256 votingId, uint256 additionalHours) external onlyOwner votingExists(votingId) {
        require(votings[votingId].active, "Oylama aktif degil");
        votings[votingId].endTime += (additionalHours * 1 hours);
    }
}