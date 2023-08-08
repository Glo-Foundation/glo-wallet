export const getBaseURL = () => {
  switch (process.env.E2E_ENV) {
    case "production": {
      return "https://app.glodollar.org";
    }
    case "test": {
      return "https://testnet.glodollar.org";
    }
    default: {
      return "http://localhost:3000";
    }
  }
};

export const CONSTANTS = {
  authModalText: "Welcome to the Glo App",
  gloAddress: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
};
