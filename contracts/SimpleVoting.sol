// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleVoting {
    address public owner;
    uint256 public votingCount;
    
    struct Voting {
        string proposal;
        string[] options;
        bool active;
        bool resultsRevealed;
        uint32[] finalVotes;
        uint256 createdAt;
        uint256 endTime;
        uint256 totalVoters;
        mapping(address => bool) hasVoted;
        mapping(address => uint32) voterChoice;
        address[] voters;
    }
    
    mapping(uint256 => Voting) public votings;
    mapping(address => bool) public authorizedVoters;
    mapping(uint256 => bool) public deletedVotings; // Track deleted votings
    
    event VotingCreated(uint256 indexed votingId, string proposal, string[] options);
    event VoteCast(uint256 indexed votingId, address indexed voter, uint32 choice);
    event VotingStarted(uint256 indexed votingId);
    event VotingEnded(uint256 indexed votingId);
    event ResultsRevealed(uint256 indexed votingId, uint32[] results);
    event VotingDeleted(uint256 indexed votingId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier votingExists(uint256 _votingId) {
        require(_votingId < votingCount, "Voting does not exist");
        require(!deletedVotings[_votingId], "Voting has been deleted");
        _;
    }
    
    modifier votingActive(uint256 _votingId) {
        require(votings[_votingId].active, "Voting is not active");
        require(block.timestamp < votings[_votingId].endTime, "Voting period ended");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedVoters[msg.sender] = true;
    }
    
    function createVoting(
        string memory _proposal,
        string[] memory _options,
        uint256 _duration
    ) public onlyOwner returns (uint256) {
        require(bytes(_proposal).length > 0, "Proposal cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_duration > 0, "Duration must be positive");
        
        uint256 votingId = votingCount;
        votingCount++;
        
        Voting storage newVoting = votings[votingId];
        newVoting.proposal = _proposal;
        newVoting.options = _options;
        newVoting.active = false;
        newVoting.resultsRevealed = false;
        newVoting.createdAt = block.timestamp;
        newVoting.endTime = block.timestamp + (_duration * 1 hours);
        newVoting.totalVoters = 0;
        
        // Initialize vote counts
        for (uint i = 0; i < _options.length; i++) {
            newVoting.finalVotes.push(0);
        }
        
        emit VotingCreated(votingId, _proposal, _options);
        return votingId;
    }
    
    function startVoting(uint256 _votingId) public onlyOwner votingExists(_votingId) {
        require(!votings[_votingId].active, "Voting already active");
        require(!votings[_votingId].resultsRevealed, "Results already revealed");
        require(block.timestamp < votings[_votingId].endTime, "Voting period expired");
        
        votings[_votingId].active = true;
        emit VotingStarted(_votingId);
    }
    
    function vote(uint256 _votingId, uint32 _choice) public votingExists(_votingId) votingActive(_votingId) {
        require(!votings[_votingId].hasVoted[msg.sender], "Already voted");
        require(_choice < votings[_votingId].options.length, "Invalid choice");
        
        votings[_votingId].hasVoted[msg.sender] = true;
        votings[_votingId].voterChoice[msg.sender] = _choice;
        votings[_votingId].voters.push(msg.sender);
        votings[_votingId].finalVotes[_choice]++;
        votings[_votingId].totalVoters++;
        
        emit VoteCast(_votingId, msg.sender, _choice);
    }
    
    function endVoting(uint256 _votingId) public onlyOwner votingExists(_votingId) {
        require(votings[_votingId].active, "Voting not active");
        // Owner can end voting at any time - no time restriction
        
        votings[_votingId].active = false;
        emit VotingEnded(_votingId);
    }
    
    function revealResults(uint256 _votingId) public onlyOwner votingExists(_votingId) {
        require(!votings[_votingId].active, "Voting still active");
        require(!votings[_votingId].resultsRevealed, "Results already revealed");
        
        votings[_votingId].resultsRevealed = true;
        emit ResultsRevealed(_votingId, votings[_votingId].finalVotes);
    }
    
    function authorizeVoter(address _voter) public onlyOwner {
        authorizedVoters[_voter] = true;
    }
    
    function removeVoterAuthorization(address _voter) public onlyOwner {
        authorizedVoters[_voter] = false;
    }
    
    function deleteVoting(uint256 _votingId) public onlyOwner {
        require(_votingId < votingCount, "Voting does not exist");
        require(!deletedVotings[_votingId], "Voting already deleted");
        
        deletedVotings[_votingId] = true;
        emit VotingDeleted(_votingId);
    }
    
    // View functions
    function getVotingCount() public view returns (uint256) {
        return votingCount;
    }
    
    function getVotingInfo(uint256 _votingId) public view returns (
        string memory proposal,
        string[] memory options,
        bool active,
        bool resultsRevealed,
        uint32[] memory finalVotes,
        uint256 createdAt,
        uint256 endTime,
        uint256 totalVoters
    ) {
        require(_votingId < votingCount, "Voting does not exist");
        
        if (deletedVotings[_votingId]) {
            // Return empty data for deleted votings
            string[] memory emptyOptions;
            uint32[] memory emptyVotes;
            return ("", emptyOptions, false, false, emptyVotes, 0, 0, 0);
        }
        
        Voting storage voting = votings[_votingId];
        return (
            voting.proposal,
            voting.options,
            voting.active,
            voting.resultsRevealed,
            voting.finalVotes,
            voting.createdAt,
            voting.endTime,
            voting.totalVoters
        );
    }
    
    function isVotingDeleted(uint256 _votingId) public view returns (bool) {
        require(_votingId < votingCount, "Voting does not exist");
        return deletedVotings[_votingId];
    }
    
    function hasVotedInVoting(uint256 _votingId, address _voter) public view returns (bool) {
        return votings[_votingId].hasVoted[_voter];
    }
    
    function canVoteInVoting(uint256 _votingId, address _voter) public view returns (bool) {
        return !votings[_votingId].hasVoted[_voter];
    }
    
    function getTimeRemaining(uint256 _votingId) public view votingExists(_votingId) returns (uint256) {
        if (!votings[_votingId].active || block.timestamp >= votings[_votingId].endTime) {
            return 0;
        }
        return votings[_votingId].endTime - block.timestamp;
    }
    
    function getWinner(uint256 _votingId) public view votingExists(_votingId) returns (string memory, uint32) {
        require(votings[_votingId].resultsRevealed, "Results not revealed yet");
        
        uint32 maxVotes = 0;
        uint256 winnerIndex = 0;
        
        for (uint256 i = 0; i < votings[_votingId].finalVotes.length; i++) {
            if (votings[_votingId].finalVotes[i] > maxVotes) {
                maxVotes = votings[_votingId].finalVotes[i];
                winnerIndex = i;
            }
        }
        
        return (votings[_votingId].options[winnerIndex], maxVotes);
    }
    
    function getVoters(uint256 _votingId) public view votingExists(_votingId) returns (address[] memory) {
        return votings[_votingId].voters;
    }
}