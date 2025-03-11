// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract GaslessVoting is Ownable, EIP712 {
    using ECDSA for bytes32;

    struct Vote {
        address voter;
        uint256 candidateId;
        uint256 nonce;
    }

    mapping(address => uint256) public nonces;
    mapping(uint256 => uint256) public votes;
    mapping(address => bytes32) public voteCommits; // Stores vote hashes for commit-reveal

    event VoteCommitted(address indexed voter, bytes32 voteHash);
    event VoteCast(address indexed voter, uint256 candidateId, uint256 indexed nonce);
    
    address public trustedRelayer;

    constructor(address _trustedRelayer) EIP712("GaslessVoting", "1") {
        trustedRelayer = _trustedRelayer;
    }

    modifier onlyRelayer() {
        require(msg.sender == trustedRelayer, "Only relayer can submit votes");
        _;
    }

    function setTrustedRelayer(address _trustedRelayer) external onlyOwner {
        trustedRelayer = _trustedRelayer;
    }

    function getVoteHash(address voter, uint256 candidateId, uint256 nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(voter, candidateId, nonce));
    }

    function commitVote(bytes32 voteHash) external {
        voteCommits[msg.sender] = voteHash;
        emit VoteCommitted(msg.sender, voteHash);
    }

    function _getVoteDigest(Vote memory vote) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("Vote(address voter,uint256 candidateId,uint256 nonce,uint256 chainId)"),
                    vote.voter,
                    vote.candidateId,
                    vote.nonce,
                    block.chainid  // Prevents cross-chain replay attacks
                )
            )
        );
    }

    function verifyVote(Vote memory vote, bytes memory signature) public view returns (bool) {
        bytes32 digest = _getVoteDigest(vote);
        address signer = digest.recover(signature);
        return signer == vote.voter && vote.nonce == nonces[vote.voter];
    }

    function revealVote(Vote memory vote, bytes memory signature) external {
        require(verifyVote(vote, signature), "Invalid signature or nonce");
        require(voteCommits[vote.voter] == getVoteHash(vote.voter, vote.candidateId, vote.nonce), "Vote commit mismatch");

        nonces[vote.voter]++;
        votes[vote.candidateId]++;
        emit VoteCast(vote.voter, vote.candidateId, vote.nonce);
    }
}
