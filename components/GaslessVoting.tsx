type SignedVote = {
    voter: string;
    candidateId: number;
    nonce: number;
    signature: string;
  };
  
  const CONFIG = {
    CHAIN_ID: 1,
    VERIFYING_CONTRACT: "0x1234567890abcdef",
  };
  
  function getDomain() {
    return {
      name: "GaslessVoting",
      version: "1",
      chainId: CONFIG.CHAIN_ID,
      verifyingContract: CONFIG.VERIFYING_CONTRACT,
    };
  }
  
  function getTypes() {
    return {
      Vote: [
        { name: "voter", type: "address" },
        { name: "candidateId", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };
  }
  
  async function getNonce(voter: string): Promise<number> {
    const response = await fetch(`/api/nonce/${voter}`);
    if (!response.ok) throw new Error("Failed to fetch nonce");
    const data = await response.json();
    return data.nonce;
  }
  
  async function signData(voter: string, candidateId: number, nonce: number): Promise<string> {
    return wallet._signTypedData(getDomain(), getTypes(), { voter, candidateId, nonce });
  }
  
  async function sendSignedVote(data: SignedVote): Promise<void> {
    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit the vote");
  }
  
  async function signVote(candidateId: number): Promise<void> {
    try {
      const voter = getVoterAddress();
      const nonce = await getNonce(voter);
      const signature = await signData(voter, candidateId, nonce);
      await sendSignedVote({ voter, candidateId, nonce, signature });
      console.log("Vote submitted successfully!");
    } catch (error) {
      console.error("Error during the voting process:", error);
      alert("An error occurred. Please try again.");
    }
  }
  