const { ethers } = require("ethers");

// Configuration
const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL");
const privateKey = "YOUR_PRIVATE_KEY"; // Relayer's private key
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0xYourContractAddress";
const abi = [...]; // Replace with your contract's ABI
const contract = new ethers.Contract(contractAddress, abi, wallet);

app.post("/api/votes", async (req, res) => {
  const { voter, candidateId, nonce, signature } = req.body;

  try {
    // Verify signature using the contract's `verifyVote` method
    const isValid = await contract.verifyVote({ voter, candidateId, nonce, signature });
    if (!isValid) {
      return res.status(400).send("Invalid signature");
    }

    // Submit vote to the blockchain
    const tx = await contract.castVote({ voter, candidateId, nonce, signature });
    await tx.wait();

    res.status(200).send("Vote submitted successfully!");
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).send("Failed to submit vote");
  }
});
