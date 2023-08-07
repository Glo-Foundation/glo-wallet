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

export const common = {
  authModalText: "Welcome to the Glo App",
};
