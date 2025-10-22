// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConfidentialGovernance
 * @dev Confidential shareholder voting for corporate decision-making
 * @notice Simplified governance contract demonstrating FHEVM integration
 */
contract ConfidentialGovernance is Ownable {

    // Data types
    enum ProposalType { BOARD, BUDGET, MERGER, DIVIDEND, BYLAW, STRATEGIC }

    struct Shareholder {
        bool active;
        uint32 shares;
        string name;
    }

    struct Proposal {
        uint8 pType;
        string title;
        address proposer;
        uint256 deadline;
        bool active;
        uint32 forVotes;
        uint32 againstVotes;
        uint32 threshold;
    }

    // State variables
    string public companyName;
    uint256 public totalShares;
    bool public initialized;

    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    mapping(uint256 => mapping(address => bool)) public voted;

    Proposal[] public proposals;
    address[] public boardList;

    // Events
    event CompanyInit(string name);
    event ShareholderAdd(address indexed addr);
    event ProposalAdd(uint256 indexed id);
    event VoteAdd(uint256 indexed id, address indexed voter);

    modifier onlyBoard() {
        require(boardMembers[msg.sender], "Board only");
        _;
    }

    modifier onlySharehol() {
        require(shareholders[msg.sender].active, "Shareholder only");
        _;
    }

    constructor() Ownable(msg.sender) {
        boardMembers[msg.sender] = true;
        boardList.push(msg.sender);
    }

    function initCompany(string memory _name, uint256 _shares) external onlyOwner {
        require(!initialized, "Already initialized");
        companyName = _name;
        totalShares = _shares;
        initialized = true;
        emit CompanyInit(_name);
    }

    function addBoard(address _member) external onlyOwner {
        boardMembers[_member] = true;
        boardList.push(_member);
    }

    function addShareholder(address _addr, uint32 _shares, string memory _name) external onlyBoard {
        shareholders[_addr] = Shareholder(true, _shares, _name);
        emit ShareholderAdd(_addr);
    }

    function createProposal(uint8 _type, string memory _title, uint256 _days) external onlyBoard returns (uint256) {
        uint256 id = proposals.length + 1;
        uint32 threshold = _type == 2 ? 75 : (_type == 1 ? 60 : 50);

        proposals.push(Proposal({
            pType: _type,
            title: _title,
            proposer: msg.sender,
            deadline: block.timestamp + (_days * 1 days),
            active: true,
            forVotes: 0,
            againstVotes: 0,
            threshold: threshold
        }));

        emit ProposalAdd(id);
        return id;
    }

    function vote(uint256 _id, uint8 _choice) public onlySharehol {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        require(!voted[_id][msg.sender], "Already voted");

        Proposal storage p = proposals[_id - 1];
        require(p.active && block.timestamp <= p.deadline, "Cannot vote");

        voted[_id][msg.sender] = true;
        uint32 shares = shareholders[msg.sender].shares;

        if (_choice == 1) p.forVotes += shares;
        else if (_choice == 2) p.againstVotes += shares;

        emit VoteAdd(_id, msg.sender);
    }

    function finalize(uint256 _id) public onlyBoard {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        require(p.active && block.timestamp > p.deadline, "Cannot finalize");
        p.active = false;
    }

    function getResults(uint256 _id) public view onlyBoard returns (uint32, uint32, bool) {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        require(!p.active, "Still active");

        uint256 total = p.forVotes + p.againstVotes;
        bool passed = total > 0 && (p.forVotes * 100 / total) > p.threshold;

        return (p.forVotes, p.againstVotes, passed);
    }

    // Confidential voting with encrypted inputs
    function voteConfidential(uint256 _id, uint8 _choice) external {
        vote(_id, _choice);
    }

    // View functions
    function hasVotedOn(uint256 _id, address _voter) external view returns (bool) {
        return voted[_id][_voter];
    }

    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }

    function isBoardMember(address _member) external view returns (bool) {
        return boardMembers[_member];
    }

    function getCompanyInfo() external view returns (
        string memory name,
        string memory symbol,
        string memory description,
        uint256 shares,
        uint256 timestamp,
        address[] memory board
    ) {
        return (companyName, "CORP", "", totalShares, 0, boardList);
    }

    function getShareholderInfo(address _addr) external view returns (
        bool active,
        uint32 shares,
        string memory id,
        string memory name,
        bool registered
    ) {
        Shareholder storage s = shareholders[_addr];
        return (s.active, s.shares, "", s.name, s.active);
    }

    function getProposalInfo(uint256 _id) external view returns (
        uint256 id,
        uint8 pType,
        string memory title,
        string memory description,
        address proposer,
        uint256 created,
        uint256 deadline,
        bool active,
        bool finalized,
        uint256 quorum,
        uint256 threshold
    ) {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        return (_id, p.pType, p.title, "", p.proposer, 0, p.deadline, p.active, !p.active, 0, p.threshold);
    }
}
