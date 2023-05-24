import * as jose from "jose";
import { NextRequest } from "next/server";

export const isAuthenticated = async (req: NextRequest) => {
  const idToken = req.headers.get("authorization")?.split(" ")[1];
  const appPubKey = req.headers.get("glo-app-pub-key");
  const address = req.headers.get("glo-pub-address");

  if (!idToken || !address) {
    return false;
  }

  if (appPubKey) {
    // https://web3auth.io/docs/pnp/features/server-side-verification/social-login-users
    const wallet = await decode(idToken, "https://api.openlogin.com/jwks");

    if (wallet.public_key == appPubKey) {
      return true;
    }
  } else {
    // https://web3auth.io/docs/pnp/features/server-side-verification/external-wallets
    const wallet = await decode(idToken, "https://authjs.web3auth.io/jwks");

    if (wallet.address.toLowerCase() === address.toLowerCase()) {
      return true;
    }
  }

  return false;
};

const decode = async (idToken: string, url: string) => {
  const jwks = jose.createRemoteJWKSet(new URL(url));

  const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    algorithms: ["ES256"],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwtDecoded.payload as any).wallets[0] as {
    address: string;
    public_key: string;
  };
};
