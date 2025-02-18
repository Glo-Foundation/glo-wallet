const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());


const provider = new ethers.providers.JsonRpcProvider("RPC_URL");
const privateKey = "RELAYER_PRIVATE_KEY"; 
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = "0xYourContractAddress";
const abi = [ ];
const contract = new ethers.Contract(contractAddress, abi, wallet);


const voteCommits = {};

app.post("/api/commitVote", async (req, res) => {
    try {
        const { voter, voteHash } = req.body;
        voteCommits[voter] = voteHash;

        const tx = await contract.commitVote(voteHash);
        await tx.wait();

        res.json({ message: "Vote committed successfully!" });
    } catch (error) {
        console.error("Commit error:", error);
        res.status(500).send("Failed to commit vote");
    }
});

app.post("/api/revealVote", async (req, res) => {
    try {
        const { voter, candidateId, nonce, signature } = req.body;

        const tx = await contract.revealVote({ voter, candidateId, nonce }, signature);
        await tx.wait();

        res.json({ message: "Vote revealed successfully!" });
    } catch (error) {
        console.error("Reveal error:", error);
        res.status(500).send("Failed to reveal vote");
    }
});

app.listen(3001, () => console.log("Server running on port 3001"));
