import React, { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xYourContractAddress";
const CHAIN_ID = 1;

const CONTRACT_ABI = [
  // contract ABI here
];

const VoteApp = () => {
  const [account, setAccount] = useState(null);
  const [candidateId, setCandidateId] = useState("");
  const [nonce, setNonce] = useState(0);
  const [voteHash, setVoteHash] = useState("");
  const [signature, setSignature] = useState("");

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } else {
      alert("Please install MetaMask.");
    }
  }

  function getVoteHash(voter, candidateId, nonce) {
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [voter, candidateId, nonce]));
  }

  async function commitVote() {
    const hash = getVoteHash(account, candidateId, nonce);
    setVoteHash(hash);

    await fetch("http://localhost:3001/api/commitVote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: account, voteHash: hash }),
    });

    alert("Vote committed!");
  }

  async function signVote() {
    if (!account) return alert("Connect wallet first!");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const domain = {
      name: "GaslessVoting",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: CONTRACT_ADDRESS,
    };

    const types = {
      Vote: [
        { name: "voter", type: "address" },
        { name: "candidateId", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      voter: account,
      candidateId: parseInt(candidateId),
      nonce,
    };

    const signedMessage = await signer._signTypedData(domain, types, value);
    setSignature(signedMessage);

    alert("Vote signed!");
  }

  async function revealVote() {
    await fetch("http://localhost:3001/api/revealVote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: account, candidateId, nonce, signature }),
    });

    alert("Vote revealed!");
  }

  return (
    <div>
      <h1>Gasless Voting</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected as: {account}</p>
          <input type="number" placeholder="Candidate ID" onChange={(e) => setCandidateId(e.target.value)} />
          <button onClick={commitVote}>Commit Vote</button>
          <button onClick={signVote}>Sign Vote</button>
          <button onClick={revealVote}>Reveal Vote</button>
        </>
      )}
    </div>
  );
};

export default VoteApp;
