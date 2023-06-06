import { ETHAuth } from "@0xsequence/ethauth";
import { NextRequest } from "next/server";

const ethAuth = new ETHAuth();

export const isAuthenticated = async (req: NextRequest) => {
  const authorization = req.headers.get("authorization");
  const address = req.headers.get("glo-pub-address");

  if (!authorization || !address) {
    return false;
  }

  const proofString = authorization.split(" ")[1];

  console.log({ address, proofString });

  if (!ethAuth.provider) {
    console.log(
      "procvider",
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
    );
    // await ethAuth.configJsonRpcProvider(
    //   `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
    // );
  }

  const decodedProof = await ethAuth.decodeProof(proofString!, true);

  return address?.toLowerCase() === decodedProof.address.toLowerCase();
};
